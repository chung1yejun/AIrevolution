// 껍데기(H4): 실제 버전은 H7에서 구현합니다.
import { ok } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import type { InstitutionsResponse } from "@/lib/types";

export async function GET() {
  const { response } = await requireUser();
  if (response) return response;

  return ok<InstitutionsResponse>({
    institutions: [
      { id: "i-haneul", name: "하늘은행", type: "bank", isSample: true },
      { id: "i-dundun", name: "든든생명", type: "insurance", isSample: true },
      { id: "i-baro", name: "바로텔레콤", type: "telecom", isSample: true },
      { id: "i-hanbit", name: "한빛은행", type: "bank", isSample: true },
      { id: "i-purun", name: "푸른화재", type: "insurance", isSample: true },
      { id: "i-nuri", name: "누리모바일", type: "telecom", isSample: true },
    ],
  });
}
