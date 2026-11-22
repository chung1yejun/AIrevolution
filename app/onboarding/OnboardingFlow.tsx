"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ProgressBar } from "@/components/ui";
import QuestionField from "./QuestionField";
import { QUESTIONS, isAnswered, type Answers } from "./questions";

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

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
      // 이동하는 동안에는 버튼을 계속 로딩으로 둬요.
      router.push("/home");
    } catch {
      setSaveError("인터넷 연결을 확인하고 다시 시도해 주세요.");
      setSaving(false);
    }
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
            onChange={(v) => setAnswers((prev) => ({ ...prev, [question.key]: v }))}
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
            <Button variant="secondary" className="flex-1" disabled={saving} onClick={() => setStep((s) => s - 1)}>
              이전
            </Button>
          )}
          <Button
            className="flex-1 font-bold"
            disabled={!canNext}
            loading={saving}
            onClick={() => (isLast ? save() : setStep((s) => s + 1))}
          >
            {!isLast ? "다음" : saveError ? "다시 시도" : "할 일 만들기"}
          </Button>
        </div>
      </footer>
    </div>
  );
}
