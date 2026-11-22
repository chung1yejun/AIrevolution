// 껍데기(H4): 실제 버전은 H6에서 구현합니다.
import { ok } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import type { DocumentsResponse } from "@/lib/types";

export async function GET() {
  const { response } = await requireUser();
  if (response) return response;

  return ok<DocumentsResponse>({
    documents: [
      {
        id: "d-family", name: "가족관계증명서(고인 기준)", issuer: "주민센터·정부24",
        copies: 4, usedBy: ["하늘은행", "든든생명", "가정법원", "세무서"], checked: false,
      },
      {
        id: "d-death", name: "사망진단서(또는 시체검안서)", issuer: "병원",
        copies: 2, usedBy: ["든든생명", "주민센터"], checked: true,
      },
    ],
  });
}
