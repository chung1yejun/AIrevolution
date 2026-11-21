// 껍데기(K4): 실제 버전은 K11에서 구현합니다.
import { ok } from "@/lib/api";
import type { DeleteMeResponse } from "@/lib/types";

export function DELETE() {
  return ok<DeleteMeResponse>({ ok: true });
}
