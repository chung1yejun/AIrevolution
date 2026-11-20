"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/home", label: "홈", path: "M3 10.5 12 3l9 7.5M5 9v11h5v-6h4v6h5V9" },
  { href: "/analysis", label: "AI 분석", path: "M10 3c.8 4.2 2.8 6.2 7 7-4.2.8-6.2 2.8-7 7-.8-4.2-2.8-6.2-7-7 4.2-.8 6.2-2.8 7-7ZM18 13v7m-3.5-3.5h7" },
  { href: "/documents", label: "서류", path: "M13 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9Zm0 0v6h6M8 13h8m-8 4h6" },
  { href: "/delegate", label: "맡기기", path: "M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M4 7h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm-1 5c5 3 13 3 18 0m-9 1v3" },
] as const;

// <BottomTab /> — render once in the authenticated route group.
export function BottomTab() {
  const pathname = usePathname();

  return (
    <nav aria-label="주요 메뉴" className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[480px] rounded-t-2xl border border-b-0 border-[var(--namgim-secondary)] bg-[var(--namgim-navy)] px-2 pb-[env(safe-area-inset-bottom)]">
      <ul className="grid h-16 grid-cols-4 gap-1 py-1">
        {tabs.map(({ href, label, path }) => {
          const active = pathname === href || pathname.startsWith(href + "/");

          return (
            <li key={href} className="min-w-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-0.5 rounded-xl text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--namgim-muted)] ${active ? "bg-[var(--namgim-ivory)] text-[var(--namgim-navy)]" : "text-[var(--namgim-ivory)] hover:bg-[var(--namgim-secondary)]"}`}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d={path} />
                </svg>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
