"use client";

import {
  oneYearAgoKst,
  todayKst,
  validateDeathDate,
  type Question,
} from "./questions";

type Props = {
  question: Question;
  value: string | undefined;
  onChange: (value: string) => void;
};

export default function QuestionField({ question, value, onChange }: Props) {
  if (question.type === "choice") {
    return (
      <div role="radiogroup" aria-label={question.title} className="space-y-3">
        {question.options.map((o) => {
          const selected = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(o.value)}
              className={`flex min-h-12 w-full items-center rounded-xl border px-4 text-left text-[16px] ${
                selected
                  ? "border-primary bg-primary-soft font-bold text-primary"
                  : "border-border bg-surface"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "select") {
    return (
      <select
        aria-label={question.title}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[16px] focus:border-primary focus:outline-none"
      >
        <option value="" disabled>
          지역을 골라 주세요
        </option>
        {question.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  const error = value ? validateDeathDate(value) : null;
  return (
    <div>
      <input
        type="date"
        aria-label={question.title}
        aria-invalid={error !== null}
        value={value ?? ""}
        min={oneYearAgoKst()}
        max={todayKst()}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[16px] focus:border-primary focus:outline-none"
      />
      {error ? (
        <p role="alert" className="mt-2 text-[14px] text-warn">
          {error}
        </p>
      ) : (
        <p className="mt-2 text-[14px] text-text-sub">{question.hint}</p>
      )}
    </div>
  );
}
