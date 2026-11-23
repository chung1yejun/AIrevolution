"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button, EmptyState, ErrorState, Loading } from "@/components/ui";
import type { HomeResponse, Progress, TaskUpdateResponse } from "@/lib/types";
import HomeSummary from "./HomeSummary";
import TaskList from "./TaskList";
import { countProgress, findUrgent, setDone, sortTasks } from "./tasks";

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
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [saveError, setSaveError] = useState("");

  const load = useCallback(async () => {
    // 다른 화면에 다녀와도 화면 상태가 남아 있어서, 새로 불러올 때 지난 저장 오류를 지워요.
    setSaveError("");
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/home", { cache: "no-store" });
      if (res.status === 401) {
        // 로그인이 풀렸으면 첫 화면으로 보내요.
        router.replace("/");
        return;
      }
      const body: unknown = await res.json().catch(() => null);
      if (!res.ok || body === null) {
        setState({ status: "error", message: errorMessage(body) });
        return;
      }
      setState({ status: "ready", data: body as HomeResponse });
    } catch {
      setState({ status: "error", message: "인터넷 연결을 확인하고 다시 시도해 주세요." });
    }
  }, [router]);

  /** 할 일 목록을 바꾸고, 진행률을 따로 받지 않았으면 목록으로 다시 계산해요. */
  const updateTasks = useCallback((id: string, done: boolean, progress?: Progress) => {
    setState((prev) => {
      if (prev.status !== "ready" || !prev.data.hasAnswers) return prev;
      const tasks = setDone(prev.data.tasks, id, done);
      return {
        status: "ready",
        data: { ...prev.data, tasks, urgent: findUrgent(tasks), progress: progress ?? countProgress(tasks) },
      };
    });
  }, []);

  /** 체크하면 화면을 먼저 바꾸고 저장해요. 저장에 실패하면 원래대로 되돌려요. */
  const toggleTask = useCallback(
    async (id: string, done: boolean) => {
      setSaveError("");
      setSavingIds((ids) => [...ids, id]);
      updateTasks(id, done);
      try {
        const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ done }),
        });
        if (res.status === 401) {
          router.replace("/");
          return;
        }
        const body: unknown = await res.json().catch(() => null);
        if (!res.ok || body === null) throw new Error("save failed");
        const saved = body as TaskUpdateResponse;
        updateTasks(saved.id, saved.done, saved.progress);
      } catch {
        updateTasks(id, !done);
        setSaveError("저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
      } finally {
        setSavingIds((ids) => ids.filter((savingId) => savingId !== id));
      }
    },
    [router, updateTasks],
  );

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
        {saveError && (
          <p role="alert" className="mb-3 rounded-xl bg-surface px-4 py-3 text-[15px] font-semibold text-warn">
            {saveError}
          </p>
        )}
        {data.tasks.length > 0 ? (
          <TaskList tasks={sortTasks(data.tasks)} savingIds={savingIds} onToggle={toggleTask} />
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
        <Button variant="secondary" onClick={() => router.push("/onboarding?edit=1")}>
          답변 수정
        </Button>
      </div>
    </div>
  );
}
