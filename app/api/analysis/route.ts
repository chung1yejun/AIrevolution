import { todayKst } from "@/app/onboarding/questions";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import { FALLBACK_ANALYSIS } from "@/lib/samples/fallback-analysis";
import { createClient } from "@/lib/supabase/server";
import type { AnalysisResponse } from "@/lib/types";

const dailyLimit = 5;
const maxTextLength = 20_000;
const residentNumber = /(?<!\d)(?:\d{6}[^\S\r\n]*-[^\S\r\n]*\d{7}|\d{13})(?!\d)/;

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const body: unknown = await request.json().catch(() => null);
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
  const { data: usage, error } = await supabase
    .from("ai_usage")
    .select("count")
    .eq("user_id", user.id)
    .eq("day", todayKst())
    .maybeSingle();

  if (error) return fail(500, "SERVER_ERROR", "오늘 사용 횟수를 확인하지 못했어요.");

  const used = usage?.count ?? 0;
  if (used >= dailyLimit) {
    return ok<AnalysisResponse>({
      source: "fallback",
      reason: "limit",
      items: FALLBACK_ANALYSIS.items,
      remaining: 0,
    });
  }

  // Step 2 connects the real model call and records attempts.
  return ok<AnalysisResponse>({
    source: "ai",
    reason: null,
    items: [
      { name: "하늘은행", type: "bank", count: 2, institutionId: "i-haneul" },
      { name: "든든생명", type: "insurance", count: 1, institutionId: "i-dundun" },
      { name: "차량등록사업소", type: "car", count: 1, institutionId: "i-car" }
    ],
    remaining: dailyLimit - used
  });
}
