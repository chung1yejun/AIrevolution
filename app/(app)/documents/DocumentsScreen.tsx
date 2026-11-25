"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Card, Checkbox, ErrorState, Loading, ProgressBar } from "@/components/ui";
import type { AnalysisApplyResponse, DocumentsResponse, DocumentUpdateResponse } from "@/lib/types";
import { InstitutionPicker } from "./InstitutionPicker";
import { jsonRequest, requestJson } from "./documents-api";

type DocumentItem = DocumentsResponse["documents"][number];
type ListState =
  | { status: "loading" | "error" }
  | { status: "ready"; documents: DocumentItem[] };

function DocumentCard({
  document,
  saving,
  failedValue,
  onCheck,
}: {
  document: DocumentItem;
  saving: boolean;
  failedValue: boolean | undefined;
  onCheck: (checked: boolean) => void;
}) {
  const { name, issuer, copies, usedBy, checked } = document;

  return (
    <Card className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg leading-tight font-bold">{name}</h2>
        <span className="shrink-0 rounded-full bg-[var(--namgim-field)] px-3 py-1 text-sm font-semibold">{copies}부</span>
      </div>
      <dl className="grow space-y-3 text-sm">
        <div>
          <dt className="font-semibold">발급처</dt>
          <dd className="mt-1">{issuer || "발급처를 확인해 주세요."}</dd>
        </div>
        {usedBy.length > 0 && (
          <div>
            <dt className="font-semibold">쓰이는 기관</dt>
            <dd className="mt-1">
              {usedBy.slice(0, 3).join(" · ")}
              {usedBy.length > 3 && (
                <details className="mt-1">
                  <summary className="cursor-pointer py-2 underline underline-offset-4">
                    기관 {usedBy.length - 3}곳 더 보기
                  </summary>
                  <p>{usedBy.slice(3).join(" · ")}</p>
                </details>
              )}
            </dd>
          </div>
        )}
      </dl>
      <div className="border-t border-[var(--namgim-muted)] pt-2">
        <Checkbox
          label="발급했어요"
          aria-label={`${name} 발급 체크`}
          checked={checked}
          disabled={saving}
          onChange={(event) => onCheck(event.currentTarget.checked)}
        />
        {saving && <p role="status" className="text-sm">저장하는 중이에요.</p>}
        {failedValue !== undefined && (
          <div className="space-y-2 text-sm">
            <p role="alert">발급 체크를 저장하지 못했어요.</p>
            <Button variant="secondary" onClick={() => onCheck(failedValue)}>다시 시도</Button>
          </div>
        )}
      </div>
    </Card>
  );
}

export function DocumentsScreen() {
  const [list, setList] = useState<ListState>({ status: "loading" });
  const [version, setVersion] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saved, setSaved] = useState<AnalysisApplyResponse>();
  const [saving, setSaving] = useState<Set<string>>(() => new Set());
  const [failed, setFailed] = useState<Partial<Record<string, boolean>>>({});

  useEffect(() => {
    const controller = new AbortController();

    void requestJson<DocumentsResponse>("/api/documents", { signal: controller.signal })
      .then(({ documents }) => {
        if (!controller.signal.aborted) setList({ status: "ready", documents });
      })
      .catch(() => {
        if (!controller.signal.aborted) setList({ status: "error" });
      });

    return () => controller.abort();
  }, [version]);

  function reload() {
    setList({ status: "loading" });
    setFailed({});
    setVersion((value) => value + 1);
  }

  async function updateCheck(id: string, checked: boolean) {
    if (saving.has(id)) return;
    setSaving((current) => new Set(current).add(id));
    setFailed((current) => ({ ...current, [id]: undefined }));

    try {
      const result = await requestJson<DocumentUpdateResponse>(
        `/api/documents/${encodeURIComponent(id)}`,
        jsonRequest("PATCH", { checked }),
      );
      setList((current) => current.status === "ready" ? {
        status: "ready",
        documents: current.documents.map((document) => document.id === result.id
          ? { ...document, checked: result.checked }
          : document),
      } : current);
    } catch {
      setFailed((current) => ({ ...current, [id]: checked }));
    } finally {
      setSaving((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }

  if (pickerOpen) {
    return (
      <InstitutionPicker
        onBack={() => setPickerOpen(false)}
        onAdded={(result) => {
          setSaved(result);
          setPickerOpen(false);
          reload();
        }}
      />
    );
  }

  const documents = list.status === "ready" ? list.documents : [];
  const checked = documents.filter((document) => document.checked).length;

  return (
    <main className="space-y-6 py-6 min-[1280px]:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-[28px] leading-tight font-bold tracking-[-0.02em]">준비 서류</h1>
          <p className="text-[var(--namgim-muted)] break-keep">필요한 서류와 발급 여부를 한곳에서 확인해요.</p>
        </div>
        <Button variant="secondary" className="min-[1280px]:w-auto" disabled={saving.size > 0} onClick={() => {
          setSaved(undefined);
          setPickerOpen(true);
        }}>
          기관 직접 추가
        </Button>
      </header>

      {saved && (
        <p role="status" className="rounded-2xl bg-[var(--namgim-secondary)] p-4">
          {saved.added}개 추가, {saved.skipped}개는 이미 있어요.
        </p>
      )}

      {list.status === "loading" && <Loading />}
      {list.status === "error" && <ErrorState message="준비 서류를 불러오지 못했어요." onRetry={reload} />}

      {list.status === "ready" && (
        <>
          <div className="space-y-3 rounded-2xl bg-[var(--namgim-secondary)] p-5">
            <p className="text-lg font-semibold">서류 {documents.length}종 중 {checked}종 준비</p>
            {documents.length > 0 && <ProgressBar value={checked / documents.length * 100} label={`${checked}/${documents.length} 완료`} />}
          </div>
          {documents.length === 0 ? (
            <Card className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-bold">아직 준비할 서류가 없어요</h2>
                <p>질문에 답하거나 AI로 기관을 찾아보세요.</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Link href="/onboarding" className="namgim-secondary inline-flex min-h-14 items-center justify-center rounded-2xl px-4 font-semibold">질문에 답하기</Link>
                <Link href="/analysis" className="namgim-secondary inline-flex min-h-14 items-center justify-center rounded-2xl px-4 font-semibold">AI로 기관 찾기</Link>
              </div>
            </Card>
          ) : (
            <ul className="grid gap-3 min-[1280px]:grid-cols-2">
              {documents.map((document) => (
                <li key={document.id} className="min-w-0">
                  <DocumentCard
                    document={document}
                    saving={saving.has(document.id)}
                    failedValue={failed[document.id]}
                    onCheck={(value) => void updateCheck(document.id, value)}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
