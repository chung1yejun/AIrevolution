// 임시 부품(Y8): 김수아 S3(PR #16)의 Loading, ErrorState, EmptyState와 같은 사용법이에요.
// S3가 main에 합쳐지면 이 파일을 지우고 `@/components/ui`에서 가져와요.
import Link from "next/link";
import { Button, Chrysanthemum } from "@/components/ui";

export function Loading() {
  return (
    <div role="status" className="grid min-h-48 place-content-center justify-items-center gap-3 rounded-2xl bg-surface p-5 text-center">
      <span aria-hidden="true" className="size-7 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin" />
      <p>불러오는 중이에요</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-48 flex-col rounded-2xl bg-surface p-5">
      <div role="alert" className="mb-4 grow wrap-anywhere">
        <p className="text-lg font-semibold">문제가 생겼어요</p>
        <p className="mt-1">{message}</p>
      </div>
      <Button onClick={onRetry}>다시 시도</Button>
    </div>
  );
}

export function EmptyState({ message, actionLabel, onAction }: { message: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="flex min-h-48 flex-col rounded-2xl bg-surface p-5">
      <Chrysanthemum className="mb-3 w-8" />
      <p className="mb-4 grow break-keep text-lg font-semibold wrap-anywhere">{message}</p>
      <Button onClick={onAction}>{actionLabel}</Button>
    </div>
  );
}

/** 상단 바: S3의 (app) 레이아웃에 같은 바가 들어 있어서, S3 merge 후 지워요. */
export function HomeTopBar() {
  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-border py-2">
      <p className="flex items-center gap-2 font-serif text-[22px] font-bold">
        <Chrysanthemum className="w-6 shrink-0" />
        남김
      </p>
      <Link href="/me" className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold hover:bg-surface">
        내 정보
      </Link>
    </header>
  );
}
