import { Button } from "./Button";

// <EmptyState message="아직 서류가 없어요." actionLabel="서류 보기" onAction={openList} />
export function EmptyState({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex min-h-48 flex-col rounded-2xl bg-[var(--namgim-secondary)] p-5 text-[var(--namgim-ivory)]">
      <p className="mb-4 grow text-lg font-semibold wrap-anywhere">{message}</p>
      <Button onClick={onAction}>{actionLabel}</Button>
    </div>
  );
}
