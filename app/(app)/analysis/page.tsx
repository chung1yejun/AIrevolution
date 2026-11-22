import { AnalysisFlow } from "./AnalysisFlow";

export default function AnalysisPage() {
  return (
    <main className="space-y-6 py-6 min-[1280px]:py-10">
      <header className="space-y-2">
        <h1 className="text-[28px] leading-tight font-bold tracking-[-0.02em]">AI 분석</h1>
        <p className="text-[var(--namgim-muted)] break-keep">
          조회 결과에서 확인할 기관을 찾아 할 일에 추가해요.
        </p>
      </header>
      <AnalysisFlow />
    </main>
  );
}
