"use client";

import { useState } from "react";

const TOTAL_STEPS = 5;

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);

  const percent = (step / TOTAL_STEPS) * 100;

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
        {/* Step 2에서 질문 5개가 들어와요 */}
        <h1 className="text-[22px] font-bold">질문 {step}</h1>
        <p className="mt-2 text-[14px] text-text-sub">
          질문 내용은 다음 단계에서 채워요.
        </p>
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
        {step < TOTAL_STEPS && (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="min-h-12 flex-1 rounded-xl bg-primary px-4 text-[16px] font-bold text-white"
          >
            다음
          </button>
        )}
      </footer>
    </div>
  );
}
