"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button, ErrorState, Loading, ProgressBar } from "@/components/ui";
import { clearDraft, loadDraft, saveDraft } from "./draft";
import QuestionField from "./QuestionField";
import { QUESTIONS, isAnswered, type Answers } from "./questions";
import { loadSavedAnswers } from "./savedAnswers";

const TOTAL_STEPS = QUESTIONS.length;
const SAVE_ERROR = "답을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.";

/** API 오류 응답({ error: { message } })에서 한국어 설명을 꺼내요. */
function errorMessage(body: unknown): string {
  if (typeof body === "object" && body !== null && "error" in body) {
    const { error } = body;
    if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
      return error.message;
    }
  }
  return SAVE_ERROR;
}

export default function OnboardingFlow({ edit = false }: { edit?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // 답변 수정이면 기존 답을 불러오는 동안 기다려요.
  const [prefill, setPrefill] = useState<"loading" | "error" | "ready">(edit ? "loading" : "ready");

  const loadPrefill = useCallback(async () => {
    setPrefill("loading");
    const result = await loadSavedAnswers();
    if (result.status === "logged-out") {
      router.replace("/");
      return;
    }
    if (result.status === "error") {
      setPrefill("error");
      return;
    }
    setAnswers(result.answers);
    setPrefill("ready");
  }, [router]);

  useEffect(() => {
    // 다른 화면에 다녀와도 화면 상태가 남아 있어서, 화면이 보일 때마다 처음 상태를 다시 정해요.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaving(false);
    setSaveError(null);
    // 뒤로가기·새로고침 전에 답하던 내용이 있으면 그 질문부터 이어서 해요.
    const draft = loadDraft(edit);
    if (draft) {
      setStep(draft.step);
      setAnswers(draft.answers);
      setPrefill("ready");
      return;
    }
    setStep(1);
    if (!edit) {
      setAnswers({});
      return;
    }
    // 답변 수정이면 기존 답을 불러와요.
    void loadPrefill();
  }, [edit, loadPrefill]);

  /** 답을 고르거나 단계를 옮길 때마다 이 탭에 중간 답을 저장해요. */
  function update(nextStep: number, nextAnswers: Answers) {
    setStep(nextStep);
    setAnswers(nextAnswers);
    saveDraft({ edit, step: nextStep, answers: nextAnswers });
  }

  const question = QUESTIONS[step - 1];
  const percent = (step / TOTAL_STEPS) * 100;
  const canNext = isAnswered(question, answers);
  const isLast = step === TOTAL_STEPS;

  async function save() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      if (res.status === 401) {
        // 로그인이 풀렸으면 첫 화면으로 보내요.
        router.replace("/");
        return;
      }
      if (!res.ok) {
        setSaveError(errorMessage(await res.json().catch(() => null)));
        setSaving(false);
        return;
      }
      // 저장했으니 중간 답은 지워요. 이동하는 동안에는 버튼을 계속 로딩으로 둬요.
      clearDraft();
      router.push("/home");
    } catch {
      setSaveError("인터넷 연결을 확인하고 다시 시도해 주세요.");
      setSaving(false);
    }
  }

  if (prefill !== "ready") {
    return (
      <div className="py-6">
        {prefill === "loading" ? (
          <Loading />
        ) : (
          <ErrorState message="기존 답을 불러오지 못했어요. 잠시 후 다시 시도해 주세요." onRetry={loadPrefill} />
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col py-6">
      <header>
        <ProgressBar value={percent} label={`${step}/${TOTAL_STEPS}`} />
      </header>

      <section className="flex-1 py-8">
        <h1 className="break-keep font-serif text-[24px] leading-[1.4] font-bold">{question.title}</h1>
        <div className="mt-6">
          <QuestionField
            key={question.key}
            question={question}
            value={answers[question.key]}
            onChange={(v) => update(step, { ...answers, [question.key]: v })}
          />
        </div>
      </section>

      <footer className="grid gap-3">
        {saveError && (
          <p role="alert" className="break-keep text-[14px] text-warn">
            {saveError}
          </p>
        )}
        <div className="flex gap-3">
          {step > 1 && (
            <Button variant="secondary" className="flex-1" disabled={saving} onClick={() => update(step - 1, answers)}>
              이전
            </Button>
          )}
          <Button
            className="flex-1 font-bold"
            disabled={!canNext}
            loading={saving}
            onClick={() => (isLast ? save() : update(step + 1, answers))}
          >
            {!isLast ? "다음" : saveError ? "다시 시도" : "할 일 만들기"}
          </Button>
        </div>
      </footer>
    </div>
  );
}
