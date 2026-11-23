import fontkit from "@pdf-lib/fontkit";
import { PageSizes, PDFDocument, rgb, type PDFFont } from "pdf-lib";

import type { InstitutionDetailResponse } from "@/lib/types";

export type RequestFormKey = NonNullable<InstitutionDetailResponse["formKey"]>;

export type RequestPdfValues = {
  applicantName: string;
  applicantPhone: string;
  deceasedName: string;
  relationship: string;
  deathDate: string;
  requestContent: string;
  institutionName: string;
  documents: Pick<InstitutionDetailResponse["documents"][number], "name" | "copies">[];
};

const titles: Record<RequestFormKey, string> = {
  bank: "예금 상속 및 계좌 해지 요청서",
  insurance: "사망보험금 청구 요청서",
  telecom: "통신 서비스 해지 및 명의변경 요청서",
};

const [pageWidth, pageHeight] = PageSizes.A4;
const margin = 46;
const width = pageWidth - 2 * margin;
const labelWidth = 104;
const padding = 11;
const bodyTop = pageHeight - 118;
const bodyBottom = 145;
const ink = rgb(0.09, 0.16, 0.28);
const muted = rgb(0.33, 0.38, 0.45);
const border = rgb(0.78, 0.82, 0.87);
const labelBackground = rgb(0.94, 0.96, 0.98);

function wrapText(value: string, font: PDFFont, size: number, maxWidth: number): string[] {
  value = value.normalize("NFC");
  const lines: string[] = [];
  for (const paragraph of value.replace(/\r\n?/g, "\n").replace(/\t/g, "    ").split("\n")) {
    let line = "";
    for (const token of paragraph.match(/\s+|\S+/gu) ?? []) {
      const next = line + token;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) {
        line = next;
        continue;
      }

      if (line) lines.push(line.trimEnd());
      line = "";
      if (!token.trim()) continue;

      for (const character of token) {
        if (line && font.widthOfTextAtSize(line + character, size) > maxWidth) {
          lines.push(line);
          line = "";
        }
        line += character;
      }
    }
    lines.push(line.trimEnd());
  }
  return lines;
}

function getLayout(rows: [string, string][], attachments: string[], request: string, font: PDFFont, size: number) {
  const lineHeight = size * 1.5;
  const table = rows.map(([label, value]) => ({
    label,
    lines: wrapText(value || "-", font, size, width - labelWidth - 2 * padding),
  }));
  const content = wrapText(request || "-", font, size, width - 2 * padding);
  const documents = attachments.flatMap((attachment) => wrapText(attachment, font, size, width));
  const tableHeight = table.reduce((height, row) => height + row.lines.length * lineHeight + 16, 0);

  return {
    table, content, documents, size, lineHeight,
    height: tableHeight + 84 + (content.length + documents.length) * lineHeight,
  };
}

/** Builds a PDF in the browser. Only the static font is loaded over the network. */
export async function makeRequestPdf(
  formKey: RequestFormKey,
  values: RequestPdfValues,
): Promise<Uint8Array> {
  // Static weight 400 from Google Fonts; even glyph offsets keep fontkit subsets valid.
  const fontResponse = await fetch("/fonts/NotoSansKR-Regular.ttf");
  if (!fontResponse.ok) throw new Error("PDF에 사용할 한글 글꼴을 불러오지 못했어요.");

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(await fontResponse.arrayBuffer(), { subset: true });
  const title = titles[formKey];
  const rows: [string, string][] = [
    ["수신 기관", values.institutionName],
    ["신청인 성명", values.applicantName],
    ["연락처", values.applicantPhone],
    ["고인 성명", values.deceasedName],
    ["고인과의 관계", values.relationship],
    ["별세일", values.deathDate],
  ];
  const request = values.requestContent;
  const attachments = values.documents.length > 0
    ? values.documents.map(({ name, copies }, index) => `${index + 1}. ${name.trim().normalize("NFC")} (${copies}부)`)
    : ["해당 없음"];

  const characters = new Set(font.getCharacterSet());
  const input = [...rows.map(([, value]) => value), request, ...attachments].join("\n").normalize("NFC");
  if ([...input].some((character) => !/\s/u.test(character) && !characters.has(character.codePointAt(0)!))) {
    throw new Error("PDF 글꼴이 지원하지 않는 문자가 있어요. 입력 내용을 확인해 주세요.");
  }

  let layout = getLayout(rows, attachments, request, font, 11);
  for (const size of [10, 9]) {
    if (layout.height <= bodyTop - bodyBottom) break;
    layout = getLayout(rows, attachments, request, font, size);
  }
  if (layout.height > bodyTop - bodyBottom) {
    throw new Error("한 페이지에 담기에는 내용이 길어요. 요청 내용이나 첨부 서류를 줄여 주세요.");
  }

  const page = pdf.addPage(PageSizes.A4);
  pdf.setTitle(title);
  const drawText = (text: string, x: number, y: number, size = layout.size, color = ink) => {
    if (text) page.drawText(text, { x, y, size, font, color });
  };

  drawText(title, margin, pageHeight - 79, 24);
  page.drawLine({
    start: { x: margin, y: bodyTop + 16 },
    end: { x: pageWidth - margin, y: bodyTop + 16 },
    thickness: 1.5,
    color: ink,
  });

  let y = bodyTop;
  for (const { label, lines } of layout.table) {
    const rowHeight = lines.length * layout.lineHeight + 16;
    page.drawRectangle({ x: margin, y: y - rowHeight, width, height: rowHeight, borderColor: border, borderWidth: 0.6 });
    page.drawRectangle({
      x: margin, y: y - rowHeight, width: labelWidth, height: rowHeight,
      color: labelBackground, borderColor: border, borderWidth: 0.6,
    });
    drawText(label, margin + padding, y - 8 - layout.size);
    lines.forEach((line, index) => {
      drawText(line, margin + labelWidth + padding, y - 8 - layout.size - index * layout.lineHeight);
    });
    y -= rowHeight;
  }

  const drawHeading = (label: string) => {
    y -= 24;
    drawText(label, margin, y, 12);
    y -= 10;
  };

  drawHeading("요청 내용");
  const requestHeight = layout.content.length * layout.lineHeight + 16;
  page.drawRectangle({ x: margin, y: y - requestHeight, width, height: requestHeight, borderColor: border, borderWidth: 0.6 });
  layout.content.forEach((line, index) => {
    drawText(line, margin + padding, y - 8 - layout.size - index * layout.lineHeight);
  });
  y -= requestHeight;

  drawHeading("첨부 서류");
  for (const line of layout.documents) {
    drawText(line, margin, y - layout.size);
    y -= layout.lineHeight;
  }

  const date = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric",
  }).format(new Date());
  drawText("작성일  " + date, margin, 113, 11);
  drawText("신청인 서명", pageWidth - margin - 164, 113, 11);
  page.drawLine({
    start: { x: pageWidth - margin - 98, y: 111 },
    end: { x: pageWidth - margin, y: 111 },
    thickness: 0.6,
    color: muted,
  });
  drawText("[샘플] 남김에서 만든 양식입니다", margin, 48, 10, muted);

  return pdf.save();
}

export function downloadPdf(bytes: Uint8Array, fileName: string): void {
  const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
