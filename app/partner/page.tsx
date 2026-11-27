"use client";

import { useEffect, useState } from "react";
import { Card, ErrorState, Loading } from "@/components/ui";
import styles from "@/components/ui/theme";
import type { PartnerStatsResponse } from "@/lib/types";

const format = new Intl.NumberFormat("ko-KR");

function Dashboard({ stats }: { stats: PartnerStatsResponse }) {
  const peak = Math.max(1, ...stats.daily.map(day => day.count));
  const metrics = [
    ["이번 달 이용 가정", stats.families, "가정"],
    ["청구 예정액", stats.billing, "원"],
    ["평균 진행률", stats.avgProgress, "%"],
    ["정리 완료 가정", stats.completed, "가정"],
  ] as const;
  return <>
    <section aria-label="주요 지표">
      <p className="mb-3 text-sm text-text-sub">{stats.month.replace("-", "년 ")}월 기준</p>
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(([name, value, unit]) => <Card key={name}>
          <dt className="text-sm font-semibold">{name}</dt>
          <dd className="mt-3 text-3xl font-bold tabular-nums">{format.format(value)}<span className="ml-1 text-lg">{unit}</span></dd>
        </Card>)}
      </dl>
    </section>
    <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
      <section className="min-w-0">
        <h2 className="mb-6 text-lg font-bold">최근 14일 신규 이용 가정</h2>
        <ol className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1">
          {stats.daily.map(({ date, count }, index) => <li key={date} className="text-center tabular-nums">
            <span className="sr-only">{date} 가입 {count}가정</span>
            <div aria-hidden="true" className="flex h-40 flex-col justify-end border-b border-text-sub">
              <span className="text-xs">{format.format(count)}</span>
              <div className="mx-auto w-2/3 rounded-t bg-primary" style={{ height: (count / peak) * 124 }} />
            </div>
            <span aria-hidden="true" className="mt-2 block text-xs text-text-sub">
              <span className={index % 3 && index !== 13 ? "hidden sm:inline" : ""}>{date.slice(8)}일</span>
            </span>
          </li>)}
        </ol>
        <p className="mt-3 text-sm text-text-sub">{stats.daily[0]?.date} ~ {stats.daily.at(-1)?.date}</p>
      </section>
      <section>
        <h2 className="mb-4 text-lg font-bold">진행 단계별 가정 수</h2>
        <table className="w-full text-left">
          <thead className="text-sm text-text-sub"><tr><th scope="col">진행 단계</th><th scope="col" className="text-right">가정 수</th></tr></thead>
          <tbody>{stats.stages.map(({ stage, count }) => <tr key={stage} className="border-b border-border">
            <th scope="row" className="py-3 font-normal">{stage}</th><td className="text-right font-bold tabular-nums">{format.format(count)}</td>
          </tr>)}</tbody>
        </table>
      </section>
    </div>
  </>;
}

export default function PartnerPage() {
  const [stats, setStats] = useState<PartnerStatsResponse | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/partner/stats", { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error();
        const result: PartnerStatsResponse = await response.json();
        if (!controller.signal.aborted) setStats(result);
      } catch {
        if (!controller.signal.aborted) setError(true);
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt]);
  return <main className={`${styles.theme} mx-auto min-h-dvh max-w-[1200px] space-y-10 px-4 py-10 sm:px-8`}>
    <header><h1 className="font-serif text-3xl font-bold">하늘상조 파트너 대시보드</h1>
      <p className="mt-3 text-text-sub">개인 정보 없이 집계 숫자만 보여요.</p></header>
    {error ? <ErrorState message="파트너 통계를 불러오지 못했어요." onRetry={() => { setError(false); setAttempt(n => n + 1); }} />
      : stats ? <Dashboard stats={stats} /> : <Loading />}
  </main>;
}
