// 껍데기(H4): 실제 버전은 H10에서 구현합니다.
import { ok } from "@/lib/api";
import type { PartnerStatsResponse } from "@/lib/types";

export function GET() {
  return ok<PartnerStatsResponse>({
    partner: "하늘상조", month: "2026-11",
    families: 12, billing: 360000, avgProgress: 41, completed: 2,
    daily: [{ date: "2026-11-17", count: 1 }, { date: "2026-11-18", count: 3 }],
    stages: [
      { stage: "질문 전", count: 1 },
      { stage: "0~33%", count: 5 },
      { stage: "34~66%", count: 3 },
      { stage: "67~99%", count: 1 },
      { stage: "완료", count: 2 },
    ],
  });
}
