import { QUESTIONS, type Answers } from "./questions";

type Props = {
  answers: Answers;
  onBack: () => void;
};

/** 답 요약 (Y6: 저장하지 않고 보여주기만 해요. 저장은 Y7에서 POST /api/answers로 연결) */
export default function AnswerSummary({ answers, onBack }: Props) {
  return (
    <div className="flex min-h-dvh flex-col py-6">
      <section className="flex-1 py-8">
        <h1 className="break-keep font-serif text-[24px] leading-[1.4] font-bold">답을 확인해요</h1>
        <p className="mt-2 break-keep text-[14px] text-text-sub">
          아직 저장하지 않아요. 저장은 다음 작업에서 연결해요.
        </p>

        <dl className="mt-6">
          {QUESTIONS.map((q) => {
            const value = answers[q.key];
            const label =
              q.type === "date"
                ? value
                : q.options.find((o) => o.value === value)?.label;
            return (
              <div
                key={q.key}
                className="border-b border-border py-4"
              >
                <dt className="break-keep text-[14px] text-text-sub">
                  {q.title}
                </dt>
                <dd className="mt-1 break-words text-[16px] font-bold">
                  {label ?? "-"}
                </dd>
              </div>
            );
          })}
        </dl>

        <p className="mt-6 text-[12px] text-text-sub">보낼 값(API 모양)</p>
        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-surface p-3 text-[12px]">
          {JSON.stringify(answers, null, 2)}
        </pre>
      </section>

      <footer>
        <button
          type="button"
          onClick={onBack}
          className="min-h-14 w-full rounded-2xl border border-primary bg-transparent px-4 text-[16px] font-bold text-primary"
        >
          답 고치기
        </button>
      </footer>
    </div>
  );
}
