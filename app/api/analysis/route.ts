// 껍데기(K4): 실제 버전은 K9에서 구현합니다.
import { fail, ok } from "@/lib/api";
import type { AnalysisResponse } from "@/lib/types";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => undefined);
  if (body === undefined) {
    return fail(400, "BAD_INPUT", "올바른 JSON을 보내 주세요.");
  }

  return ok<AnalysisResponse>({
    source: "ai",
    reason: null,
    items: [
      { name: "하늘은행", type: "bank", count: 2, institutionId: "i-haneul" },
      { name: "든든생명", type: "insurance", count: 1, institutionId: "i-dundun" },
      { name: "차량등록사업소", type: "car", count: 1, institutionId: "i-car" }
    ],
    remaining: 4
  });
}
