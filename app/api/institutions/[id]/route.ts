// 껍데기(H4): 실제 버전은 H7에서 구현합니다.
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import type { InstitutionDetailResponse } from "@/lib/types";

export async function GET(_request: Request, context: RouteContext<"/api/institutions/[id]">) {
  const { response } = await requireUser();
  if (response) return response;

  const { id } = await context.params;
  if (id !== "i-haneul") return fail(404, "NOT_FOUND", "기관 상세 정보를 찾을 수 없어요.");

  return ok<InstitutionDetailResponse>({
    id, name: "하늘은행", type: "bank", isSample: true,
    howToApply: "가까운 지점 방문 또는 상속인 금융거래 조회 후 방문. 상속인 신분증, 아래 서류 지참",
    needsExpert: false, formKey: "bank",
    tasks: [{ id: "t-6", title: "하늘은행 계좌 해지·예금 상속 신청", dueDate: null, done: false }],
    documents: [{ name: "가족관계증명서(고인 기준)", issuer: "주민센터·정부24", copies: 1 }],
  });
}
