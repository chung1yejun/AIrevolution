import Link from "next/link";
import { Suspense } from "react";
import { BottomTab } from "@/components/ui/BottomTab";
import { Chrysanthemum } from "@/components/ui";
import { TopBar } from "@/components/ui/TopBar";
import styles from "@/components/ui/theme";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${styles.theme} min-h-dvh [--color-text-sub:var(--namgim-muted)]`}>
      <div className="mx-auto w-full max-w-[480px] px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] min-[1280px]:max-w-[1120px] min-[1280px]:px-8">
        <TopBar
          title="남김"
          right={
            <>
              <Link href="/me" className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold hover:bg-[var(--namgim-secondary)]">
                내 정보
              </Link>
              <Chrysanthemum className="w-8 shrink-0" />
            </>
          }
        />
        {children}
      </div>
      <Suspense fallback={null}>
        <BottomTab />
      </Suspense>
    </div>
  );
}
