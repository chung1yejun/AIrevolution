// 껍데기(K4): 실제 버전은 K7에서 구현합니다.
import { ok } from "@/lib/api";
import type { HomeResponse } from "@/lib/types";

export async function GET() {
  return ok<HomeResponse>({
    hasAnswers: true,
    answers: { relation: "child", deathDate: "2026-11-10", region: "대구", heirCount: "1", will: "no" },
    urgent: { taskId: "t-2", title: "상속포기·한정승인 여부 결정", dueDate: "2027-02-10", dDay: 85 },
    progress: { done: 1, total: 5, percent: 20 },
    tasks: [
      { id: "t-1", title: "사망신고", institutionId: "i-community", institutionName: "고인 주소지 주민센터(대구)", dueDate: "2026-12-10", dDay: 23, done: true, source: "rule", needsExpert: false },
      { id: "t-2", title: "상속포기·한정승인 여부 결정", institutionId: "i-court", institutionName: "가정법원", dueDate: "2027-02-10", dDay: 85, done: false, source: "rule", needsExpert: true },
      { id: "t-3", title: "상속세 신고·납부", institutionId: "i-tax", institutionName: "세무서·홈택스", dueDate: "2027-05-31", dDay: 195, done: false, source: "rule", needsExpert: true },
      { id: "t-4", title: "안심상속 원스톱 서비스 신청 (재산 조회)", institutionId: "i-community", institutionName: "주민센터·정부24", dueDate: null, dDay: null, done: false, source: "rule", needsExpert: false },
      { id: "t-5", title: "건강보험·국민연금 정지 확인", institutionId: "i-nhis", institutionName: "국민건강보험공단·국민연금공단", dueDate: null, dDay: null, done: false, source: "rule", needsExpert: false }
    ]
  });
}
