"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card, Checkbox, EmptyState, ErrorState, Loading, ProgressBar, Tag } from "@/components/ui";
import type { AnalysisApplyRequest, AnalysisApplyResponse, AnalysisResponse, InstitutionType } from "@/lib/types";

const sample = [
  "안심상속 조회 결과 예시",
  "신청인: 예시인 · 식별번호: 예시 전용",
  "하늘은행 2건 · 든든생명 1건",
  "차량등록사업소 1건",
];

const maskedSample = [
  sample[0],
  "신청인: *** · 식별번호: ******-*******",
  sample[2],
  sample[3],
];

const typeLabels: Record<InstitutionType, string> = {
  bank: "은행",
  insurance: "보험",
  telecom: "통신",
  car: "자동차",
  public: "공공",
};

type Stage = "sample" | "preview" | "analyzing" | "results" | "done";
type Failure = "analysis" | "apply";

async function post<T>(path: string, body: object, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) throw new Error("Request failed");
  return response.json();
}

function SampleCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Tag variant="sample" />
      </div>
      <p className="text-sm leading-7 whitespace-pre-line">{lines.join("\n")}</p>
    </Card>
  );
}

export function AnalysisFlow() {
  const [stage, setStage] = useState<Stage>("sample");
  const [result, setResult] = useState<AnalysisResponse>();
  const [selected, setSelected] = useState<boolean[]>([]);
  const [failure, setFailure] = useState<Failure>();
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState<AnalysisApplyResponse>();

  const step = stage === "sample" ? 1 : stage === "preview" || stage === "analyzing" ? 2 : 3;
  const selectedCount = selected.filter(Boolean).length;

  async function analyze() {
    setFailure(undefined);
    setStage("analyzing");
    try {
      const data = await post<AnalysisResponse>(
        "/api/analysis",
        { maskedText: maskedSample.join("\n") },
        AbortSignal.timeout(20_000),
      );
      setResult(data);
      setSelected(data.items.map(() => true));
      setStage("results");
    } catch {
      setFailure("analysis");
      setStage("preview");
    }
  }

  async function apply() {
    if (!result || applying || selectedCount === 0) return;
    setFailure(undefined);
    setApplying(true);
    try {
      const request: AnalysisApplyRequest = {
        source: "ai",
        items: result.items.filter((_, index) => selected[index]),
      };
      setApplied(await post<AnalysisApplyResponse>("/api/analysis/apply", request));
      setStage("done");
    } catch {
      setFailure("apply");
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="space-y-6">
      <ProgressBar value={(step / 3) * 100} label={`${step}/3 단계`} />

      {stage === "sample" && (
        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">샘플 조회 결과</h2>
              <Tag variant="sample" />
            </div>
            <p className="break-keep">실제 개인정보 없이 분석 흐름을 살펴볼 수 있어요.</p>
          </Card>
          <Button className="min-[1280px]:max-w-xs" onClick={() => setStage("preview")}>
            샘플 조회 결과 불러오기
          </Button>
        </div>
      )}

      {(stage === "preview" || stage === "analyzing") && (
        <section className="space-y-4" aria-labelledby="analysis-preview">
          <div className="space-y-1">
            <h2 id="analysis-preview" className="text-lg font-semibold">가린 결과를 확인해요</h2>
            <p className="text-sm text-[var(--namgim-muted)] break-keep">
              분석에는 가린 내용만 보내요. 이 화면에서는 예시 문구를 사용해요.
            </p>
          </div>
          <div className="grid gap-3 min-[1280px]:grid-cols-2">
            <SampleCard title="원문 미리보기" lines={sample} />
            <SampleCard title="가린 결과 미리보기" lines={maskedSample} />
          </div>
          {stage === "analyzing" ? (
            <div className="space-y-2">
              <Loading />
              <p className="text-sm text-[var(--namgim-muted)]">분석은 최대 20초 걸려요.</p>
            </div>
          ) : failure === "analysis" ? (
            <ErrorState message="분석 결과를 불러오지 못했어요." onRetry={analyze} />
          ) : (
            <Button className="min-[1280px]:max-w-xs" onClick={analyze}>분석하기</Button>
          )}
        </section>
      )}

      {stage === "results" && result && (
        <section className="space-y-4" aria-labelledby="analysis-results">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="analysis-results" className="text-lg font-semibold">분석 결과</h2>
              <div className="flex flex-wrap gap-2">
                <Tag variant="sample" />
                {result.source === "ai" && <Tag variant="ai" />}
              </div>
            </div>
            <p className="text-sm text-[var(--namgim-muted)]">
              원본과 꼭 대조해 주세요. 오늘 남은 분석 횟수 {result.remaining}회
            </p>
            {result.source === "fallback" && (
              <p role="status">
                {result.reason === "limit" ? "오늘 AI 분석 5회를 모두 썼어요. " : ""}
                예비 결과를 보여드려요.
              </p>
            )}
          </div>
          {result.items.length === 0 ? (
            <EmptyState
              message="조회 결과에서 찾은 기관이 없어요."
              actionLabel="샘플 다시 보기"
              onAction={() => setStage("preview")}
            />
          ) : (
            <>
              <div className="grid gap-3 min-[1280px]:grid-cols-3">
                {result.items.map((item, index) => (
                  <Card key={`${item.type}-${item.name}-${index}`}>
                    <Checkbox
                      label={
                        <span className="block">
                          <span className="block font-semibold">{item.name}</span>
                          <span className="block text-sm">{typeLabels[item.type]} · {item.count}건</span>
                        </span>
                      }
                      checked={selected[index]}
                      disabled={applying}
                      onChange={(event) => {
                        const checked = event.currentTarget.checked;
                        setSelected((current) => current.map((value, i) => i === index ? checked : value));
                      }}
                    />
                  </Card>
                ))}
              </div>
              {failure === "apply" && selectedCount > 0 ? (
                <ErrorState message="선택한 기관을 추가하지 못했어요." onRetry={apply} />
              ) : (
                <Button className="min-[1280px]:max-w-xs" onClick={apply} disabled={selectedCount === 0} loading={applying}>
                  할 일에 추가{selectedCount > 0 ? ` (${selectedCount}개)` : ""}
                </Button>
              )}
            </>
          )}
        </section>
      )}

      {stage === "done" && applied && (
        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-semibold">{applied.added}개를 추가했어요</h2>
            {applied.skipped > 0 && <p className="mt-2">이미 추가한 {applied.skipped}개는 건너뛰었어요.</p>}
            <p className="mt-2 text-sm">샘플 화면에서는 실제 할 일에 저장되지 않아요.</p>
          </Card>
          <Link href="/home" className="namgim-primary inline-flex min-h-14 w-full items-center justify-center rounded-2xl px-4 font-semibold min-[1280px]:max-w-xs">
            홈으로 가기
          </Link>
        </div>
      )}
    </div>
  );
}
