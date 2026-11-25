import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
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

export async function POST(request: Request) {
  const { response } = await requireUser();
  if (response) return response;

  const input = parseInput(await request.json().catch(() => null));
  if (!input) return fail(400, "BAD_INPUT", "추가할 기관을 1개부터 20개까지 선택해 주세요.");

  try {
    const client = await createClient();
    const resolved = await resolveInstitutions(client, input.items);
    // Step 2 replaces the sample response with actual task insertion.
    return ok<AnalysisApplyResponse>({ added: resolved.length, skipped: 0 });
  } catch {
    return fail(500, "SERVER_ERROR", "기관 정보를 확인하지 못했어요. 다시 시도해 주세요.");
  }
}
