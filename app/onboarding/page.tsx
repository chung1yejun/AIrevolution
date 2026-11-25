import { Suspense } from "react";
import { Loading } from "@/components/ui";
import OnboardingFlow from "./OnboardingFlow";

/** 홈의 '답변 수정'으로 들어오면(?edit=1) 기존 답을 채워서 보여줘요. */
async function Flow({ searchParams }: Pick<PageProps<"/onboarding">, "searchParams">) {
  const { edit } = await searchParams;
  return <OnboardingFlow edit={edit === "1"} />;
}

export default function Page({ searchParams }: PageProps<"/onboarding">) {
  // 남색 배경에서 공통 부품(Input)의 오류 글자를 밝은 색으로 보여줘요.
  return (
    <main className="mobile-frame [--namgim-error-text:var(--namgim-error-light)]">
      <Suspense
        fallback={
          <div className="py-6">
            <Loading />
          </div>
        }
      >
        <Flow searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
