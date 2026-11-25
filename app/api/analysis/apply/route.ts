import { createHash } from "node:crypto";

import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import { carDueDate } from "@/lib/rules";
import { createClient } from "@/lib/supabase/server";
import type { AnalysisApplyResponse, InstitutionType } from "@/lib/types";

type ApplyItem = {
  name: string;
  type: InstitutionType;
  institutionId: string | null;
};

type ApplyInput = {
  source: "ai" | "manual";
  items: ApplyItem[];
};

type Institution = {
  id: string;
  name: string;
  type: InstitutionType | null;
  needs_expert: boolean | null;
};

const taskTitles: Record<InstitutionType, (name: string) => string> = {
  bank: (name) => `${name} 계좌 해지·예금 상속 신청`,
  insurance: (name) => `${name} 보험금 청구·계약 해지`,
  telecom: (name) => `${name} 휴대폰 해지·명의변경`,
  car: () => "자동차 상속 이전등록",
  public: (name) => `${name} 처리`,
};

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const institutionFields = "id, name, type, needs_expert";

function isInstitutionType(value: unknown): value is InstitutionType {
  return value === "bank" || value === "insurance" || value === "telecom" ||
    value === "car" || value === "public";
}

function parseInput(body: unknown): ApplyInput | null {
  if (!body || typeof body !== "object" || !("source" in body) || !("items" in body)) {
    return null;
  }
  const { source, items } = body;
  if ((source !== "ai" && source !== "manual") || !Array.isArray(items) ||
    items.length < 1 || items.length > 20) {
    return null;
  }

  const parsed: ApplyItem[] = [];
  for (const item of items as unknown[]) {
    if (!item || typeof item !== "object" || !("name" in item) || !("type" in item) ||
      typeof item.name !== "string" || !isInstitutionType(item.type)) {
      return null;
    }
    const name = item.name.trim();
    if (!name || Array.from(name).length > 50) return null;

    const id = "institutionId" in item ? item.institutionId : null;
    const institutionId = typeof id === "string" && uuid.test(id) ? id.toLowerCase() : null;
    parsed.push({ name, type: item.type, institutionId });
  }
  return { source, items: parsed };
}

async function resolveInstitutions(
  client: Awaited<ReturnType<typeof createClient>>,
  items: ApplyItem[],
) {
  const ids = [...new Set(items.flatMap(({ institutionId }) => institutionId ? [institutionId] : []))];
  const byId = new Map<string, Institution>();
  if (ids.length) {
    const { data, error } = await client
      .from("institutions")
      .select(institutionFields)
      .in("id", ids)
      .overrideTypes<Institution[], { merge: false }>();
    if (error) throw error;
    for (const item of data) byId.set(item.id, item);
  }

  const names = [...new Set(items
    .filter(({ institutionId }) => !institutionId || !byId.has(institutionId))
    .map(({ name }) => name))];
  const byName = new Map<string, Institution>();
  if (names.length) {
    const { data, error } = await client
      .from("institutions")
      .select(institutionFields)
      .in("name", names)
      .order("id", { ascending: true })
      .overrideTypes<Institution[], { merge: false }>();
    if (error) throw error;
    for (const item of data) {
      if (!byName.has(item.name)) byName.set(item.name, item);
    }
  }

  return items.map((item) => ({
    ...item,
    institution: (item.institutionId ? byId.get(item.institutionId) : undefined)
      ?? byName.get(item.name) ?? null,
  }));
}

type Client = Awaited<ReturnType<typeof createClient>>;

function unlinkedTaskId(userId: string, title: string): string {
  // RFC 9562 UUIDv5 using the user's UUID as the namespace.
  const namespace = Buffer.from(userId.replaceAll("-", ""), "hex");
  const bytes = createHash("sha1").update(namespace).update(title).digest();
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function insertTasks(client: Client, userId: string, input: ApplyInput) {
  const resolved = await resolveInstitutions(client, input.items);
  const candidates = resolved.map(({ name, type, institution }) => {
    const institutionName = institution?.name ?? name;
    const institutionType = institution?.type ?? type;
    return {
      title: taskTitles[institutionType](institutionName),
      institutionId: institution?.id ?? null,
      institutionName,
      institutionType,
      needsExpert: institution?.needs_expert ?? false,
    };
  });

  let carDeadline: string | null = null;
  if (candidates.some(({ institutionType }) => institutionType === "car")) {
    const { data, error } = await client
      .from("answers")
      .select("death_date")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (data) carDeadline = carDueDate(data.death_date);
  }

  let added = 0;
  for (const candidate of candidates) {
    const existing = client.from("user_tasks").select("id").eq("user_id", userId);
    const lookup = candidate.institutionId
      ? existing.eq("institution_id", candidate.institutionId).in("source", ["ai", "manual"])
      : existing.eq("title", candidate.title);
    const { data, error: lookupError } = await lookup.limit(1).maybeSingle();
    if (lookupError) throw lookupError;
    if (data) continue;

    // The DB already enforces uniqueness for linked tasks. A stable ID
    // enforces it for two concurrent inserts of the same unlinked title.
    const { error } = await client.from("user_tasks").insert({
      ...(!candidate.institutionId && { id: unlinkedTaskId(userId, candidate.title) }),
      user_id: userId,
      title: candidate.title,
      institution_id: candidate.institutionId,
      institution_name: candidate.institutionName,
      due_date: candidate.institutionType === "car" ? carDeadline : null,
      source: input.source,
      needs_expert: candidate.needsExpert,
    });
    if (error?.code === "23505") continue;
    if (error) throw error;
    added++;
  }

  return { added, skipped: candidates.length - added };
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const input = parseInput(await request.json().catch(() => null));
  if (!input) return fail(400, "BAD_INPUT", "추가할 기관을 1개부터 20개까지 선택해 주세요.");

  try {
    const client = await createClient();
    return ok<AnalysisApplyResponse>(await insertTasks(client, user.id, input));
  } catch {
    return fail(500, "SERVER_ERROR", "할 일을 추가하지 못했어요. 다시 시도해 주세요.");
  }
}
