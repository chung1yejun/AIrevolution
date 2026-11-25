"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Checkbox, EmptyState, ErrorState, Loading, Tag } from "@/components/ui";
import type { AgentsResponse, DelegationResponse, DelegationsResponse, HomeResponse, Task } from "@/lib/types";

type ScreenData = {
  tasks: Task[];
  agents: AgentsResponse["agents"];
  history: DelegationsResponse["delegations"];
};

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...options });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message ?? "요청을 처리하지 못했어요.");
  return body;
}

async function loadData(signal: AbortSignal): Promise<ScreenData> {
  const [home, history] = await Promise.all([
    api<HomeResponse>("/api/home", { signal }),
    api<DelegationsResponse>("/api/delegations", { signal }),
  ]);
  const tasks = home.tasks.filter(task => !task.done);
  const region = home.answers?.region ?? "";
  const { agents } = tasks.length
    ? await api<AgentsResponse>(`/api/agents?region=${encodeURIComponent(region)}`, { signal })
    : { agents: [] };
  return { tasks, agents, history: history.delegations };
}

const dateFormat = new Intl.DateTimeFormat("ko-KR", { dateStyle: "long", timeZone: "Asia/Seoul" });

export default function DelegatePage() {
  const router = useRouter();
  const [data, setData] = useState<ScreenData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const [agentId, setAgentId] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal).then(result => {
      if (!controller.signal.aborted) setData(result);
    }).catch(error => {
      if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : "목록을 불러오지 못했어요.");
    });
    return () => controller.abort();
  }, [attempt]);

  async function submit() {
    const agent = data?.agents.find(item => item.id === agentId);
    if (!data || !agent || !taskIds.length || !agreed || saving) return;
    setSaving(true);
    setSubmitError("");
    setNotice("");
    try {
      const result = await api<DelegationResponse>("/api/delegations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, taskIds, agreed }),
      });
      const titles = new Map(data.tasks.map(task => [task.id, task.title]));
      const entry = { ...result, agentName: agent.name, tasks: taskIds.map(id => titles.get(id)!) };
      setData({ ...data, history: [entry, ...data.history] });
      setTaskIds([]);
      setAgentId("");
      setAgreed(false);
      setNotice("샘플 신청을 저장했어요.");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "신청 내역을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-[480px] space-y-10 py-10 break-keep wrap-anywhere">
      <header>
        <h1 className="font-serif text-3xl font-bold">행정사에게 맡기기</h1>
        <p className="mt-4 text-text-sub">도움이 필요한 할 일과 행정사를 선택해 주세요.</p>
      </header>
      {loadError ? <ErrorState message={loadError} onRetry={() => { setLoadError(""); setAttempt(n => n + 1); }} />
        : !data ? <Loading /> : <>
          {!data.tasks.length ? (
            <EmptyState message="맡길 수 있는 미완료 할 일이 없어요." actionLabel="질문으로 가기" onAction={() => router.push("/onboarding")} />
          ) : (
            <form onSubmit={event => { event.preventDefault(); void submit(); }}>
              <fieldset disabled={saving} className="min-w-0 space-y-8">
                <fieldset>
                  <legend className="mb-3 text-lg font-bold">맡길 할 일</legend>
                  {data.tasks.map(task => <Checkbox key={task.id} label={task.title} checked={taskIds.includes(task.id)}
                    onChange={event => {
                      const checked = event.target.checked;
                      setTaskIds(ids => checked ? [...ids, task.id] : ids.filter(id => id !== task.id));
                    }} />)}
                </fieldset>
                <fieldset>
                  <legend className="mb-3 text-lg font-bold">행정사 선택</legend>
                  {!data.agents.length && <p>지금 선택할 수 있는 행정사가 없어요.</p>}
                  {data.agents.map(agent => (
                    <label key={agent.id} className="flex cursor-pointer items-start gap-3 border-b border-border py-4">
                      <input className="mt-1 size-5 shrink-0" type="radio" name="agent" checked={agentId === agent.id} onChange={() => setAgentId(agent.id)} />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2 font-semibold">{agent.name} {agent.isSample && <Tag variant="sample" />}</span>
                        <span className="mt-1 block text-sm text-text-sub">{agent.region}에서 처리한 실적 {agent.cases}건</span>
                        <span className="block text-sm text-text-sub">보수 {agent.fee}</span>
                      </span>
                    </label>
                  ))}
                </fieldset>
                <div>
                  <p>샘플 서비스로 실제 신청이 접수되지 않아요. 실제 위임은 행정사와 직접 계약해야 해요.</p>
                  <Checkbox label="안내를 확인했어요" checked={agreed} onChange={event => setAgreed(event.target.checked)} />
                </div>
                <Button type="submit" loading={saving} disabled={!agreed || !agentId || !taskIds.length}>신청하기</Button>
              </fieldset>
              {submitError && <p role="alert" className="mt-3 text-warn">{submitError}</p>}
            </form>
          )}
          <section>
            <h2 className="mb-4 text-lg font-bold">내 신청 내역</h2>
            <p role="status">{notice}</p>
            {!data.history.length && <p className="text-text-sub">아직 신청한 내역이 없어요.</p>}
            <ul className="divide-y divide-border">
              {data.history.map(entry => (
                <li key={entry.id} className="space-y-1 py-4">
                  <p className="font-semibold">{entry.agentName} · {entry.status}</p>
                  <p>{entry.tasks.join(", ")}</p>
                  <time className="text-sm text-text-sub" dateTime={entry.createdAt}>{dateFormat.format(new Date(entry.createdAt))}</time>
                </li>
              ))}
            </ul>
          </section>
        </>}
    </main>
  );
}
