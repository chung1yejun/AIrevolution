import { fail, ok, readJson, withApiErrors } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";
import type { TaskUpdateResponse } from "@/lib/types";

import { getTaskProgress } from "../progress";

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export const PATCH = withApiErrors(async (request: Request, context: RouteContext<"/api/tasks/[id]">) => {
  const { user, response } = await requireUser();
  if (response) return response;

  const body: unknown = await readJson(request);
  if (!body || typeof body !== "object" || !("done" in body) || typeof body.done !== "boolean") {
    return fail(400, "BAD_INPUT", "완료 여부를 보내 주세요.");
  }

  const { id } = await context.params;
  if (!uuid.test(id)) return fail(404, "NOT_FOUND", "할 일을 찾지 못했어요.");

  const supabase = await createClient();
  const { data: task, error: updateError } = await supabase
    .from("user_tasks")
    .update({ done: body.done, done_at: body.done ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, done, done_at")
    .maybeSingle();

  if (updateError) return fail(500, "SERVER_ERROR", "완료 여부를 저장하지 못했어요.");
  if (!task) return fail(404, "NOT_FOUND", "할 일을 찾지 못했어요.");

  const { data: tasks, error: progressError } = await supabase
    .from("user_tasks")
    .select("done")
    .eq("user_id", user.id);

  if (progressError) {
    return fail(500, "SERVER_ERROR", "완료 여부는 저장했지만 진행률을 불러오지 못했어요.");
  }

  return ok<TaskUpdateResponse>({
    id: task.id,
    done: task.done,
    doneAt: task.done_at,
    progress: getTaskProgress(tasks),
  });
});
