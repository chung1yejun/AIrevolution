"use client";

import { ErrorState } from "@/components/ui";

/** 화면을 그리다 문제가 생기면 Next.js 기본 오류 화면 대신 공통 오류 화면을 보여줘요. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mobile-frame py-6">
      <ErrorState message="화면을 불러오지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요." onRetry={reset} />
    </main>
  );
}
