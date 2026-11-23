// 껍데기(H4): 실제 버전은 H9에서 구현합니다.
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import type { DelegationResponse, DelegationsResponse } from "@/lib/types";

const sample = { id: "dl-1", status: "신청됨", createdAt: "2026-11-27T20:00:00+09:00" } satisfies DelegationResponse;

export async function POST(request: Request) {
  const { response } = await requireUser();
  if (response) return response;

  const body: unknown = await request.json().catch(() => undefined);
  if (!body || typeof body !== "object" || !("agreed" in body) || body.agreed !== true) {
    return fail(400, "BAD_INPUT", "신청 안내에 동의해 주세요.");
  }

  if (
    !("agentId" in body) || typeof body.agentId !== "string" || !body.agentId.trim() ||
    !("taskIds" in body) || !Array.isArray(body.taskIds) || body.taskIds.length === 0 ||
    !body.taskIds.every((id: unknown) => typeof id === "string" && id.trim().length > 0)
  ) {
    return fail(400, "BAD_INPUT", "행정사와 맡길 할 일을 선택해 주세요.");
  }

  return ok<DelegationResponse>(sample);
}

export async function GET() {
  const { response } = await requireUser();
  if (response) return response;

  return ok<DelegationsResponse>({
    delegations: [{
      ...sample,
      agentName: "김도윤 행정사",
      tasks: ["사망신고", "하늘은행 계좌 해지·예금 상속 신청"],
    }],
  });
}
