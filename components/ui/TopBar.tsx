import Link from "next/link";
import type { ReactNode } from "react";

// <TopBar title="기관 상세" backHref="/documents" right={<Link href="/me">내 정보</Link>} />
export function TopBar({
  title,
  backHref,
  right,
}: {
  title: string;
  backHref?: string;
  right?: ReactNode;
}) {
  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-[var(--namgim-secondary)] py-2">
      <div className="flex min-w-0 items-center gap-2">
        {backHref && (
          <Link href={backHref} aria-label="뒤로 가기" className="grid size-11 shrink-0 place-items-center rounded-xl hover:bg-[var(--namgim-secondary)]">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 5-7 7 7 7" />
            </svg>
          </Link>
        )}
        <p className="text-[22px] font-bold wrap-anywhere">{title}</p>
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </header>
  );
}
