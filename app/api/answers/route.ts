import { QUESTIONS, todayKst } from "@/app/onboarding/questions";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import { addMonths, buildRuleTasks } from "@/lib/rules";
import { createClient } from "@/lib/supabase/server";
import type { Answers, AnswersResponse } from "@/lib/types";

function isAnswers(body: unknown): body is Answers {
  if (!body || typeof body !== "object") return false;

  const values: Record<string, unknown> = { ...body };
  const { deathDate } = values;
  if (typeof deathDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(deathDate)) {
    return false;
  }

  const date = new Date(deathDate);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== deathDate) {
    return false;
  }

  const today = todayKst();
  if (deathDate > today || deathDate < addMonths(today, -12)) return false;

  return QUESTIONS.every(
    (question) =>
      question.type === "date" ||
      question.options.some((option) => option.value === values[question.key]),
  );
}

export async function POST(request: Request) {
  const { response } = await requireUser();
  if (response) return response;

  const body: unknown = await request.json().catch(() => undefined);
  if (!isAnswers(body)) {
    return fail(400, "BAD_INPUT", "답변과 별세일을 다시 확인해 주세요.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("save_onboarding_answers", {
    p_answers: {
      relation: body.relation,
      deathDate: body.deathDate,
      region: body.region,
      heirCount: body.heirCount,
      will: body.will,
    },
    p_rule_tasks: buildRuleTasks(body),
  });
  if (error || data?.ok !== true || typeof data.taskCount !== "number") {
    return fail(500, "SERVER_ERROR", "답변과 할 일을 저장하지 못했어요. 다시 시도해 주세요.");
  }

  return ok<AnswersResponse>({ ok: true, taskCount: data.taskCount });
}
