"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState, ErrorState, Loading } from "@/components/ui";

export function LayoutExamples() {
  const router = useRouter();
  const [retried, setRetried] = useState(false);

  return (
    <section className="mx-auto w-full max-w-[480px] px-4 pb-12 min-[1280px]:max-w-[1200px] min-[1280px]:px-8" aria-labelledby="layout-examples">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--namgim-secondary)] pt-6">
        <h2 id="layout-examples" className="text-lg font-bold">공통 화면 상태</h2>
        <Link href="/home" className="inline-flex min-h-11 items-center rounded-xl border border-[var(--namgim-ivory)] px-3 text-sm font-semibold hover:bg-[var(--namgim-secondary)]">
          하단 탭 보기
        </Link>
      </div>
      <div className="grid gap-4 min-[1280px]:grid-cols-3">
        <Loading />
        <div>
          <ErrorState
            message="목록을 불러오지 못했어요."
            onRetry={() => setRetried(true)}
          />
          {retried && <p role="status" className="mt-2 text-sm">다시 시도 동작을 확인했어요.</p>}
        </div>
        <EmptyState
          message="아직 준비한 서류가 없어요."
          actionLabel="서류 화면 보기"
          onAction={() => router.push("/documents")}
        />
      </div>
    </section>
  );
}
