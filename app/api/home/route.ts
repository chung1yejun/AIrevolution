import { fail, ok, withApiErrors } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import { dDay } from "@/lib/rules";
import { createClient } from "@/lib/supabase/server";
import type { Answers, HomeResponse, Task } from "@/lib/types";

import { getTaskProgress } from "../tasks/progress";

type AnswerRow = Pick<Answers, "relation" | "region" | "will"> & {
  death_date: string;
  heir_count: Answers["heirCount"];
};

type TaskRow = Pick<Task, "id" | "title" | "done" | "source"> & {
  institution_id: string | null;
  institution_name: string;
  due_date: string | null;
  needs_expert: boolean;
};

export const GET = withApiErrors(async () => {
  const { user, response } = await requireUser();
  if (response) return response;

  const supabase = await createClient();
  const { data: answer, error: answerError } = await supabase
    .from("answers")
    .select("relation, death_date, region, heir_count, will")
    .eq("user_id", user.id)
    .maybeSingle()
    .overrideTypes<AnswerRow, { merge: false }>();

  if (answerError) return fail(500, "SERVER_ERROR", "답변을 불러오지 못했어요.");

  if (!answer) {
    return ok<HomeResponse>({
      hasAnswers: false,
      answers: null,
      urgent: null,
      progress: getTaskProgress([]),
      tasks: [],
    });
  }

  const { data: rows, error: tasksError } = await supabase
    .from("user_tasks")
    .select("id, title, institution_id, institution_name, due_date, done, source, needs_expert")
    .eq("user_id", user.id)
    .order("done", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .overrideTypes<TaskRow[], { merge: false }>();

  if (tasksError) return fail(500, "SERVER_ERROR", "할 일을 불러오지 못했어요.");

  const now = new Date();
  const tasks: Task[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    institutionId: row.institution_id,
    institutionName: row.institution_name,
    dueDate: row.due_date,
    dDay: row.due_date ? dDay(row.due_date, now) : null,
    done: row.done,
    source: row.source,
    needsExpert: row.needs_expert,
  }));

  const firstDueTask = tasks.find((task) => !task.done && task.dueDate !== null);
  const urgent = firstDueTask?.dueDate && firstDueTask.dDay !== null
    ? {
        taskId: firstDueTask.id,
        title: firstDueTask.title,
        dueDate: firstDueTask.dueDate,
        dDay: firstDueTask.dDay,
      }
    : null;

  return ok<HomeResponse>({
    hasAnswers: true,
    answers: {
      relation: answer.relation,
      deathDate: answer.death_date,
      region: answer.region,
      heirCount: answer.heir_count,
      will: answer.will,
    },
    urgent,
    progress: getTaskProgress(tasks),
    tasks,
  });
});
