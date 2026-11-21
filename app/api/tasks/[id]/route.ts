// 껍데기(K4): 실제 버전은 K7에서 구현합니다.
import { fail, ok } from "@/lib/api";
import type { TaskUpdateResponse } from "@/lib/types";

export async function PATCH(request: Request, context: RouteContext<"/api/tasks/[id]">) {
  const body: unknown = await request.json().catch(() => undefined);
  if (!body || typeof body !== "object" || !("done" in body) || typeof body.done !== "boolean") {
    return fail(400, "BAD_INPUT", "완료 여부를 보내 주세요.");
  }

  const { id } = await context.params;
  const { done } = body;

  return ok<TaskUpdateResponse>({
    id,
    done,
    doneAt: done ? "2026-11-21T10:00:00+09:00" : null,
    progress: { done: done ? 2 : 1, total: 5, percent: done ? 40 : 20 },
  });
}
