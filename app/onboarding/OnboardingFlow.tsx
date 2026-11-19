"use client";

import { useState } from "react";
import AnswerSummary from "./AnswerSummary";
import QuestionField from "./QuestionField";
import { QUESTIONS, isAnswered, type Answers } from "./questions";

const TOTAL_STEPS = QUESTIONS.length;

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);

  const question = QUESTIONS[step - 1];
  const percent = (step / TOTAL_STEPS) * 100;
  const canNext = isAnswered(question, answers);

  if (done) {
    return <AnswerSummary answers={answers} onBack={() => setDone(false)} />;
  }

  return (
    <div className="flex min-h-dvh flex-col py-6">
      <header>
        <p className="text-[14px] font-bold text-primary">
          {step}/{TOTAL_STEPS}
        </p>
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-valuenow={step}
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${percent}%` }}
          />
        </div>
      </header>

      <section className="flex-1 py-8">
        <h1 className="break-keep text-[22px] font-bold">{question.title}</h1>
        <div className="mt-6">
          <QuestionField
            key={question.key}
            question={question}
            value={answers[question.key]}
            onChange={(v) =>
              setAnswers((prev) => ({ ...prev, [question.key]: v }))
            }
          />
        </div>
      </section>

      <footer className="flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="min-h-12 flex-1 rounded-xl border border-primary bg-surface px-4 text-[16px] font-bold text-primary"
          >
            이전
          </button>
        )}
        <button
          type="button"
          disabled={!canNext}
          onClick={() =>
            step < TOTAL_STEPS ? setStep((s) => s + 1) : setDone(true)
          }
          className="min-h-12 flex-1 rounded-xl bg-primary px-4 text-[16px] font-bold text-white disabled:bg-border disabled:text-text-sub"
        >
          {step < TOTAL_STEPS ? "다음" : "할 일 만들기"}
        </button>
      </footer>
    </div>
  );
}
