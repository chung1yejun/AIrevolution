"use client";

import { useState } from "react";

import { Button } from "@/components/ui";
import type { RequestFormKey, RequestPdfValues } from "@/lib/pdf";

const examples = [
  { key: "bank", label: "은행", institutionName: "하늘은행" },
  { key: "insurance", label: "보험", institutionName: "든든생명" },
  { key: "telecom", label: "통신", institutionName: "바로텔레콤" },
] as const;

const sample: Omit<RequestPdfValues, "institutionName"> = {
  applicantName: "김가람",
  applicantPhone: "010-0000-0000",
  deceasedName: "이하늘",
  relationship: "자녀",
  deathDate: "2026-11-10",
  requestContent: "아래 서류를 첨부하여 처리를 요청합니다.\n처리 결과는 연락처로 안내해 주세요.",
  documents: [{ name: "가족관계증명서(고인 기준)", copies: 1 }],
};

export function PdfExamples() {
  const [active, setActive] = useState<RequestFormKey | null>(null);
  const [error, setError] = useState("");

  async function download(example: (typeof examples)[number]) {
    setActive(example.key);
    setError("");

    try {
      const { makeRequestPdf, downloadPdf } = await import("@/lib/pdf");
      const bytes = await makeRequestPdf(example.key, {
        ...sample,
        institutionName: example.institutionName,
        applicantName: example.key === "telecom" ? "김가람하늘바다누리별빛햇살".repeat(5) : sample.applicantName,
      });
      downloadPdf(bytes, `남김-${example.label}-요청서-샘플.pdf`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "PDF를 내려받지 못했어요.");
    } finally {
      setActive(null);
    }
  }

  return (
    <section className="space-y-3" aria-labelledby="pdf-examples">
      <h2 id="pdf-examples" className="text-lg font-bold">PDF 시험</h2>
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <Button
            key={example.key}
            variant="secondary"
            disabled={active !== null}
            loading={active === example.key}
            onClick={() => void download(example)}
          >
            {example.label} 요청서 PDF
          </Button>
        ))}
      </div>
      {error && <p role="alert" className="text-sm">{error}</p>}
    </section>
  );
}
