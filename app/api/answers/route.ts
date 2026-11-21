// 껍데기(K4): 실제 버전은 K6에서 구현합니다.
import { fail, ok } from "@/lib/api";
import type { AnswersResponse } from "@/lib/types";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => undefined);
  if (body === undefined) {
    return fail(400, "BAD_INPUT", "올바른 JSON을 보내 주세요.");
  }

  return ok<AnswersResponse>({ ok: true, taskCount: 5 });
}
