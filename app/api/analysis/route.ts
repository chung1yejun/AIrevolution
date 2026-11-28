import { todayKst } from "@/app/onboarding/questions";
import { fail, ok, readJson, withApiErrors } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import { extractInstitutions, InvalidFormatError, NoKeyError } from "@/lib/claude";
import { maskText } from "@/lib/mask";
import { FALLBACK_ANALYSIS } from "@/lib/samples/fallback-analysis";
import { createClient } from "@/lib/supabase/server";
import type { AnalysisFallbackReason, AnalysisResponse } from "@/lib/types";

import { dailyLimit, getUsage, reserveUsage } from "./usage";

const maxTextLength = 20_000;
const timeoutMs = 20_000;
const residentNumber = /(?<!\d)(?:\d{6}[^\S\r\n]*-[^\S\r\n]*\d{7}|\d{13})(?!\d)/;

function fallback(reason: AnalysisFallbackReason, remaining: number): AnalysisResponse {
  return { source: "fallback", reason, items: FALLBACK_ANALYSIS.items, remaining };
}

async function analyze(
  client: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  maskedText: string,
): Promise<AnalysisResponse> {
  const day = todayKst();
  const used = await getUsage(client, userId, day);
  const remaining = Math.max(0, dailyLimit - (used ?? 0));

  if (!remaining) return fallback("limit", 0);
  if (!process.env.ANTHROPIC_API_KEY?.trim()) return fallback("no_key", remaining);
  if (!process.env.ANTHROPIC_MODEL?.trim()) return fallback("error", remaining);

  const reservedRemaining = await reserveUsage(client, userId, day, used);
  if (reservedRemaining === null) return fallback("limit", 0);

  const signal = AbortSignal.timeout(timeoutMs);
  try {
    const items = await extractInstitutions(maskText(maskedText), signal);
    return { source: "ai", reason: null, items, remaining: reservedRemaining };
  } catch (error) {
    if (signal.aborted) return fallback("timeout", reservedRemaining);
    if (error instanceof InvalidFormatError) return fallback("invalid", reservedRemaining);
    if (error instanceof NoKeyError) return fallback("no_key", reservedRemaining);
    return fallback("error", reservedRemaining);
  }
}

export const POST = withApiErrors(
  async (request: Request) => {
    const { user, response } = await requireUser();
    if (response) return response;

    const body: unknown = await readJson(request);
    const maskedText = body && typeof body === "object" && "maskedText" in body
      ? body.maskedText
      : null;

    if (typeof maskedText !== "string" || !maskedText.trim() || maskedText.length > maxTextLength) {
      return fail(400, "BAD_INPUT", "조회 결과를 1자 이상 20,000자 이하로 입력해 주세요.");
    }
    if (residentNumber.test(maskedText)) {
      return fail(400, "BAD_INPUT", "개인정보를 가린 뒤 보내 주세요.");
    }

    const supabase = await createClient();
    const result = await analyze(supabase, user.id, maskedText);
    const names = [...new Set(result.items.map(({ name }) => name))];
    const institutionIds = new Map<string, string>();

    if (names.length) {
      const { data, error } = await supabase
        .from("institutions")
        .select("id, name")
        .in("name", names);
      if (error) throw error;
      for (const { id, name } of data) institutionIds.set(name, id);
    }

    const items = result.items.map((item) => ({
      ...item,
      institutionId: institutionIds.get(item.name) ?? null,
    }));
    const { error } = await supabase.from("analyses").insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      items,
      used_fallback: result.source === "fallback",
    });

    if (error) throw error;
    return ok<AnalysisResponse>({ ...result, items });
  },
  "분석 결과를 처리하지 못했어요. 다시 시도해 주세요.",
);
