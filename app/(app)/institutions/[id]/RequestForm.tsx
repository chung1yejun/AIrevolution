"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button, Card, Input, Select, Tag } from "@/components/ui";
import type { InstitutionDetailResponse } from "@/lib/types";

type FormKey = NonNullable<InstitutionDetailResponse["formKey"]>;

const requests: Record<FormKey, readonly string[]> = {
  bank: ["계좌 해지", "예금 상속"],
  insurance: ["보험금 청구", "보험 계약 해지"],
  telecom: ["휴대폰 해지", "명의변경"],
};

const relationships = ["배우자", "자녀", "부모", "형제자매", "기타", "잘 모르겠어요"];

const initialValues = {
  applicantName: "",
  applicantPhone: "",
  deceasedName: "",
  relationship: "",
  deathDate: "",
  requestContent: "",
};

type Field = keyof typeof initialValues;
type Errors = Partial<Record<Field, string>>;

type RequestFormProps = {
  formKey: FormKey;
  institutionName: string;
  documents: InstitutionDetailResponse["documents"];
};

export function RequestForm({ formKey, institutionName, documents }: RequestFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [validated, setValidated] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  function field(name: Field) {
    return {
      value: values[name],
      error: errors[name],
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = event.currentTarget.value;
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: undefined }));
        setValidated(false);
        setDownloadError(false);
      },
    };
  }

  function validate() {
    const next: Errors = {};

    if (!values.applicantName.trim()) next.applicantName = "신청인 이름을 입력해 주세요.";
    const phone = values.applicantPhone.trim();
    if (!phone) next.applicantPhone = "연락처를 입력해 주세요.";
    else if (!/^\+?\d(?:[ -]?\d){8,14}$/.test(phone)) next.applicantPhone = "연락처를 숫자와 하이픈으로 입력해 주세요.";
    if (!values.deceasedName.trim()) next.deceasedName = "고인 이름을 입력해 주세요.";
    if (!relationships.includes(values.relationship)) next.relationship = "고인과의 관계를 골라 주세요.";
    if (!values.deathDate) next.deathDate = "별세일을 입력해 주세요.";
    if (!requests[formKey].includes(values.requestContent)) next.requestContent = "요청 내용을 골라 주세요.";

    setErrors(next);
    const valid = Object.keys(next).length === 0;
    setValidated(valid);
    return valid;
  }

  function confirmInput(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!downloading) validate();
  }

  async function downloadRequest() {
    if (downloading) return;
    setDownloadError(false);
    if (!validate()) return;

    setDownloading(true);
    try {
      const { makeRequestPdf, downloadPdf } = await import("@/lib/pdf");
      const bytes = await makeRequestPdf(formKey, {
        ...values,
        applicantName: values.applicantName.trim(),
        applicantPhone: values.applicantPhone.trim(),
        deceasedName: values.deceasedName.trim(),
        institutionName,
        documents,
      });
      const fileName = institutionName.trim().replace(/[<>:"/\\|?*]/g, "_");
      downloadPdf(bytes, `남김_${fileName}_요청서.pdf`);
    } catch {
      setDownloadError(true);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card className="space-y-4 min-[1280px]:px-9">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">요청서 입력</h2>
        <Tag variant="sample" />
      </div>
      <p className="text-sm break-keep">입력한 내용은 이 화면과 내려받는 PDF에서만 사용해요.</p>
      <form noValidate onSubmit={confirmInput} className="space-y-4">
        <fieldset disabled={downloading} className="min-w-0">
          <div className="grid gap-4">
            <Input label="신청인 이름" autoComplete="off" {...field("applicantName")} />
            <Input label="연락처" type="tel" inputMode="tel" autoComplete="off" {...field("applicantPhone")} />
            <Input label="고인 이름" autoComplete="off" {...field("deceasedName")} />
            <Select label="고인과의 관계" {...field("relationship")}>
              <option value="">골라 주세요</option>
              {relationships.map((label) => <option key={label}>{label}</option>)}
            </Select>
            <Input label="별세일" type="date" {...field("deathDate")} />
            <Select label="요청 내용" {...field("requestContent")}>
              <option value="">골라 주세요</option>
              {requests[formKey].map((label) => <option key={label}>{label}</option>)}
            </Select>
          </div>
        </fieldset>
        {Object.values(errors).some(Boolean) && <p role="alert" className="text-sm">표시된 입력칸을 확인해 주세요.</p>}
        <Button type="submit" variant="secondary" disabled={downloading}>입력 내용 확인</Button>
        {validated && <p role="status" className="text-sm">입력 내용을 확인했어요.</p>}
        <Button loading={downloading} onClick={downloadRequest}>
          {downloading ? "PDF 만드는 중" : "PDF 내려받기"}
        </Button>
        {downloadError && <p role="alert" className="text-sm">PDF를 만들지 못했어요. 다시 시도해 주세요.</p>}
      </form>
    </Card>
  );
}
