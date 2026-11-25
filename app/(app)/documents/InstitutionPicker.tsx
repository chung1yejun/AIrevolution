"use client";

import { useEffect, useState } from "react";
import { Button, Card, Checkbox, EmptyState, ErrorState, Loading, Tag } from "@/components/ui";
import type { AnalysisApplyRequest, AnalysisApplyResponse, InstitutionsResponse, InstitutionType } from "@/lib/types";
import { jsonRequest, requestJson } from "./documents-api";

const groups: { type: InstitutionType; label: string }[] = [
  { type: "bank", label: "은행" },
  { type: "insurance", label: "보험" },
  { type: "telecom", label: "통신" },
  { type: "car", label: "자동차" },
  { type: "public", label: "공공" },
];

type PickerState =
  | { status: "loading" | "error" }
  | { status: "ready"; institutions: InstitutionsResponse["institutions"] };

export function InstitutionPicker({
  onBack,
  onAdded,
}: {
  onBack: () => void;
  onAdded: (result: AnalysisApplyResponse) => void;
}) {
  const [list, setList] = useState<PickerState>({ status: "loading" });
  const [version, setVersion] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void requestJson<InstitutionsResponse>("/api/institutions", { signal: controller.signal })
      .then(({ institutions }) => {
        if (!controller.signal.aborted) setList({ status: "ready", institutions });
      })
      .catch(() => {
        if (!controller.signal.aborted) setList({ status: "error" });
      });
    return () => controller.abort();
  }, [version]);

  async function submit() {
    if (list.status !== "ready" || submitting || selected.size === 0) return;
    setSubmitting(true);
    setSubmitFailed(false);

    const request: AnalysisApplyRequest = {
      source: "manual",
      items: list.institutions
        .filter(({ id }) => selected.has(id))
        .map(({ id, name, type }) => ({ institutionId: id, name, type })),
    };

    try {
      onAdded(await requestJson<AnalysisApplyResponse>("/api/analysis/apply", jsonRequest("POST", request)));
    } catch {
      setSubmitFailed(true);
      setSubmitting(false);
    }
  }

  return (
    <main className="space-y-6 py-6 min-[1280px]:py-10">
      <header className="space-y-2">
        <Button variant="ghost" className="w-auto px-0" onClick={onBack} disabled={submitting}>← 준비 서류로 돌아가기</Button>
        <h1 className="text-[28px] leading-tight font-bold tracking-[-0.02em]">기관 직접 추가</h1>
        <p className="text-[var(--namgim-muted)]">확인할 기관을 여러 곳 골라 할 일에 추가해요.</p>
      </header>
      {list.status === "loading" && <Loading />}
      {list.status === "error" && (
        <ErrorState message="기관 목록을 불러오지 못했어요." onRetry={() => {
          setList({ status: "loading" });
          setVersion((value) => value + 1);
        }} />
      )}
      {list.status === "ready" && (list.institutions.length === 0 ? (
        <EmptyState message="추가할 수 있는 기관이 아직 없어요." actionLabel="준비 서류로 돌아가기" onAction={onBack} />
      ) : (
        <>
          <div className="grid items-start gap-3 min-[1280px]:grid-cols-2">
            {groups.map(({ type, label }) => {
              const entries = list.institutions.filter((institution) => institution.type === type);
              if (entries.length === 0) return null;
              return (
                <Card key={type}>
                  <h2 className="mb-2 text-lg font-bold">{label}</h2>
                  <ul className="divide-y divide-[var(--namgim-muted)]">
                    {entries.map(({ id, name, isSample }) => (
                      <li key={id} className="flex items-center justify-between gap-2">
                        <Checkbox
                          label={name}
                          checked={selected.has(id)}
                          disabled={submitting}
                          onChange={(event) => {
                            const checked = event.currentTarget.checked;
                            setSelected((current) => {
                              const next = new Set(current);
                              if (checked) next.add(id);
                              else next.delete(id);
                              return next;
                            });
                          }}
                        />
                        {isSample && <Tag variant="sample" />}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
          {submitFailed && <p role="alert">기관을 추가하지 못했어요. 다시 시도해 주세요.</p>}
          <Button
            className="min-[1280px]:max-w-xs"
            disabled={selected.size === 0}
            loading={submitting}
            onClick={submit}
          >
            {selected.size > 0 ? `${selected.size}개 기관 추가` : "기관 추가"}
          </Button>
        </>
      ))}
    </main>
  );
}
