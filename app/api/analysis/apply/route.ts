// 껍데기(K4): 실제 버전은 K10에서 구현합니다.
import { fail, ok } from "@/lib/api";
import type { AnalysisApplyResponse } from "@/lib/types";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => undefined);
  if (!body || typeof body !== "object" || !("items" in body) || !Array.isArray(body.items)) {
    return fail(400, "BAD_INPUT", "기관 목록을 보내 주세요.");
  }

  return ok<AnalysisApplyResponse>({ added: body.items.length, skipped: 0 });
}
