"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, EmptyState, ErrorState, Loading, Tag, TopBar } from "@/components/ui";
import type { InstitutionDetailResponse, InstitutionType } from "@/lib/types";
import { RequestForm } from "./RequestForm";

const typeLabels: Record<InstitutionType, string> = {
  bank: "은행",
  insurance: "보험",
  telecom: "통신",
  car: "자동차",
  public: "공공",
};

type DetailState =
  | { status: "loading" | "error" | "missing" }
  | { status: "ready"; institution: InstitutionDetailResponse };

export function InstitutionScreen({ id }: { id: string }) {
  const router = useRouter();
  const [state, setState] = useState<DetailState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(`/api/institutions/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        });
        if (response.status === 404) {
          if (!controller.signal.aborted) setState({ status: "missing" });
          return;
        }
        if (!response.ok) throw new Error("Institution request failed");
        const institution: InstitutionDetailResponse = await response.json();
        if (!controller.signal.aborted) setState({ status: "ready", institution });
      } catch {
        if (!controller.signal.aborted) setState({ status: "error" });
      }
    }

    void load();
    return () => controller.abort();
  }, [id, attempt]);

  const institution = state.status === "ready" ? state.institution : undefined;

  return (
    <main aria-label="기관 상세" className="space-y-6 py-6 min-[1280px]:py-10">
      <TopBar title={institution?.name ?? "기관 상세"} backHref="/home" />
      {state.status === "loading" && <Loading />}
      {state.status === "error" && (
        <ErrorState message="기관 정보를 불러오지 못했어요." onRetry={() => {
          setState({ status: "loading" });
          setAttempt((value) => value + 1);
        }} />
      )}
      {state.status === "missing" && (
        <EmptyState message="기관을 찾을 수 없어요." actionLabel="홈으로 가기" onAction={() => router.push("/home")} />
      )}
      {institution && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-1 text-sm font-semibold text-[var(--namgim-muted)]">{typeLabels[institution.type]}</p>
            {institution.isSample && <Tag variant="sample" />}
            {institution.needsExpert && <Tag variant="review" />}
          </div>
          <div className="grid items-start gap-5">
            <div className="space-y-4">
              <Card className="space-y-3">
                <h2 className="text-lg font-bold">해야 할 일</h2>
                {institution.tasks.length === 0 ? <p className="text-sm">이 기관에 등록된 할 일이 없어요.</p> : (
                  <>
                    <ul className="divide-y divide-[var(--namgim-muted)]">
                      {institution.tasks.map((task) => (
                        <li key={task.id} className="flex items-start gap-3 py-3">
                          <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border border-[var(--namgim-navy)]">
                            {task.done ? "✓" : ""}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold">{task.title}</p>
                            <p className="text-sm">{task.done ? "완료" : "미완료"}{task.dueDate ? ` · 기한 ${task.dueDate}` : ""}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <Link href="/home" className="text-sm font-semibold underline underline-offset-4">홈에서 할 일 확인하기</Link>
                  </>
                )}
              </Card>
              <Card className="space-y-3">
                <h2 className="text-lg font-bold">필요 서류</h2>
                {institution.documents.length === 0 ? <p className="text-sm">안내할 서류가 아직 없어요.</p> : (
                  <ul className="divide-y divide-[var(--namgim-muted)]">
                    {institution.documents.map((document, index) => (
                      <li key={`${document.name}-${index}`} className="flex items-start justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="font-semibold">{document.name}</p>
                          <p className="text-sm">발급처 · {document.issuer || "확인 필요"}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-[var(--namgim-field)] px-3 py-1 text-sm font-semibold">
                          {document.copies}부
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              <Card className="space-y-2">
                <h2 className="text-lg font-bold">신청 방법</h2>
                <p className="whitespace-pre-line break-keep">{institution.howToApply || "등록된 신청 방법이 없어요."}</p>
                {!institution.formKey && <p className="text-sm font-semibold">이 기관은 방문 신청이에요.</p>}
              </Card>
            </div>
            {institution.formKey && <RequestForm formKey={institution.formKey} />}
          </div>
        </>
      )}
    </main>
  );
}
