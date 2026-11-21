"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui";
import type { HomeResponse } from "@/lib/types";
import HomeSummary from "./HomeSummary";
import TaskList from "./TaskList";
import { EmptyState, ErrorState, Loading } from "./temp-ui";

const LOAD_ERROR = "할 일을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: HomeResponse };

/** API 오류 응답({ error: { message } })에서 한국어 설명을 꺼내요. */
function errorMessage(body: unknown): string {
  if (typeof body === "object" && body !== null && "error" in body) {
    const { error } = body;
    if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
      return error.message;
    }
  }
  return LOAD_ERROR;
}

export default function HomeView() {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/home", { cache: "no-store" });
      const body: unknown = await res.json().catch(() => null);
      if (!res.ok || body === null) {
        setState({ status: "error", message: errorMessage(body) });
        return;
      }
      setState({ status: "ready", data: body as HomeResponse });
    } catch {
      setState({ status: "error", message: "인터넷 연결을 확인하고 다시 시도해 주세요." });
    }
  }, []);

  useEffect(() => {
    // 화면이 열리면 한 번 불러와요.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (state.status === "loading") return <Loading />;
  if (state.status === "error") return <ErrorState message={state.message} onRetry={load} />;

  const { data } = state;
  if (!data.hasAnswers) {
    return (
      <EmptyState
        message="몇 가지 질문에 답하면 할 일을 만들어 드려요"
        actionLabel="질문에 답하기"
        onAction={() => router.push("/onboarding")}
      />
    );
  }

  return (
    <div className="grid gap-10">
      <HomeSummary urgent={data.urgent} progress={data.progress} />

      <section aria-labelledby="task-title">
        <h2 id="task-title" className="mb-3 text-[18px] font-bold">
          할 일
        </h2>
        {data.tasks.length > 0 ? (
          <TaskList tasks={data.tasks} />
        ) : (
          <EmptyState
            message="아직 할 일이 없어요. AI로 놓친 기관을 찾아볼 수 있어요"
            actionLabel="AI로 놓친 기관 찾기"
            onAction={() => router.push("/analysis")}
          />
        )}
      </section>

      <div className="grid gap-3">
        <Button onClick={() => router.push("/analysis")}>AI로 놓친 기관 찾기</Button>
        <Button variant="secondary" onClick={() => router.push("/onboarding")}>
          답변 수정
        </Button>
      </div>
    </div>
  );
}
