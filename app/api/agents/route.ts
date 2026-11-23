// 껍데기(H4): 실제 버전은 H7에서 구현합니다.
import { ok } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import type { AgentsResponse } from "@/lib/types";

const agents: AgentsResponse["agents"] = [
  { id: "a-1", name: "김도윤 행정사", region: "대구", cases: 132, fee: "건당 15만 원부터", isSample: true },
  { id: "a-2", name: "이서진 행정사", region: "대구", cases: 87, fee: "건당 12만 원부터", isSample: true },
  { id: "a-3", name: "박하은 행정사", region: "서울", cases: 210, fee: "건당 18만 원부터", isSample: true },
  { id: "a-4", name: "최민준 행정사", region: "경기", cases: 64, fee: "건당 13만 원부터", isSample: true },
  { id: "a-5", name: "정유나 행정사", region: "부산", cases: 95, fee: "건당 14만 원부터", isSample: true },
];

export async function GET(request: Request) {
  const { response } = await requireUser();
  if (response) return response;

  const region = new URL(request.url).searchParams.get("region");
  const matches = agents.filter((agent) => agent.region === region);

  return ok<AgentsResponse>({ agents: matches.length > 0 ? matches : agents });
}
