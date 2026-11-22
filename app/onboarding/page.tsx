import OnboardingFlow from "./OnboardingFlow";

export default function Page() {
  // 남색 배경에서 공통 부품(Input)의 오류 글자를 밝은 색으로 보여줘요.
  return (
    <main className="mobile-frame [--namgim-error-text:var(--namgim-error-light)]">
      <OnboardingFlow />
    </main>
  );
}
