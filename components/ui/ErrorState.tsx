import { Button } from "./Button";

// <ErrorState message="목록을 불러오지 못했어요." onRetry={reload} />
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-48 flex-col rounded-2xl bg-[var(--namgim-secondary)] p-5 text-[var(--namgim-ivory)]">
      <div role="alert" className="mb-4 grow wrap-anywhere">
        <p className="text-lg font-semibold">문제가 생겼어요</p>
        <p className="mt-1">{message}</p>
      </div>
      <Button onClick={onRetry}>다시 시도</Button>
    </div>
  );
}
