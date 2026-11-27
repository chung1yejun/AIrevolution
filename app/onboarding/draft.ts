// 답하는 중인 내용을 이 브라우저 탭에만(sessionStorage) 잠깐 저장해요.
// 뒤로가기·새로고침을 해도 답이 사라지지 않게 하고, '할 일 만들기'에 성공하면 지워요.
// 탭을 닫으면 브라우저가 알아서 지워요. 서버로는 보내지 않아요.
import { QUESTIONS, type AnswerKey, type Answers } from "./questions";

const STORAGE_KEY = "namgim-onboarding-draft";

export type Draft = { edit: boolean; step: number; answers: Answers };

/** 질문에 있는 값만 남겨요(저장된 값이 망가졌어도 화면이 멈추지 않게). */
function cleanAnswers(raw: unknown): Answers {
  if (typeof raw !== "object" || raw === null) return {};
  const answers: Answers = {};
  for (const q of QUESTIONS) {
    const v: unknown = (raw as Record<string, unknown>)[q.key];
    if (typeof v !== "string") continue;
    if (q.type === "date" ? /^\d{4}-\d{2}-\d{2}$/.test(v) : q.options.some((o) => o.value === v)) {
      answers[q.key as AnswerKey] = v;
    }
  }
  return answers;
}

/** 같은 방식(처음 답하기 / 답변 수정)으로 저장한 중간 답이 있으면 돌려줘요. */
export function loadDraft(edit: boolean): Draft | null {
  try {
    const raw: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
    if (typeof raw !== "object" || raw === null) return null;
    const { edit: savedEdit, step } = raw as Record<string, unknown>;
    if (savedEdit !== edit || typeof step !== "number" || !Number.isInteger(step)) return null;
    if (step < 1 || step > QUESTIONS.length) return null;
    return { edit, step, answers: cleanAnswers((raw as Record<string, unknown>).answers) };
  } catch {
    return null;
  }
}

export function saveDraft(draft: Draft): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // 저장 공간을 쓸 수 없어도(사생활 보호 모드 등) 질문은 계속할 수 있어요.
  }
}

export function clearDraft(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // 위와 같아요.
  }
}
