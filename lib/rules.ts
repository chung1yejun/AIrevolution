import type { Answers } from "./types";

export type RuleTask = {
  ruleKey: string;
  title: string;
  institutionKey: string | null;
  institutionName: string;
  dueDate: string | null;
  needsExpert: boolean;
};

const dayInMilliseconds = 86_400_000;
const seoulDateFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function startOfTargetMonth(date: Date, months: number): Date {
  const target = new Date(date);
  target.setUTCDate(1);
  target.setUTCMonth(target.getUTCMonth() + months);
  return target;
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addMonths(date: string, months: number): string {
  const original = new Date(date);
  const target = startOfTargetMonth(original, months);
  const lastDay = startOfTargetMonth(target, 1);
  lastDay.setUTCDate(0);
  target.setUTCDate(Math.min(original.getUTCDate(), lastDay.getUTCDate()));
  return toDateString(target);
}

export function endOfMonthPlusMonths(date: string, months: number): string {
  const target = startOfTargetMonth(new Date(date), months + 1);
  target.setUTCDate(0);
  return toDateString(target);
}

export function dDay(dueDate: string, now = new Date()): number {
  const today = seoulDateFormatter.format(now);
  return (Date.parse(dueDate) - Date.parse(today)) / dayInMilliseconds;
}

export function carDueDate(deathDate: string): string {
  return endOfMonthPlusMonths(deathDate, 6);
}

export function buildRuleTasks(answers: Answers): RuleTask[] {
  const { deathDate, region, will, heirCount } = answers;
  const taxDueDate = endOfMonthPlusMonths(deathDate, 6);
  const tasks: RuleTask[] = [
    {
      ruleKey: "death_report",
      title: "사망신고",
      institutionKey: "community_center",
      institutionName: `고인 주소지 주민센터(${region})`,
      dueDate: addMonths(deathDate, 1),
      needsExpert: false,
    },
    {
      ruleKey: "safe_inheritance",
      title: "안심상속 원스톱 서비스 신청 (재산 조회)",
      institutionKey: "community_center",
      institutionName: "주민센터·정부24",
      dueDate: null,
      needsExpert: false,
    },
    {
      ruleKey: "renounce_decision",
      title: "상속포기·한정승인 여부 결정",
      institutionKey: "family_court",
      institutionName: "가정법원",
      dueDate: addMonths(deathDate, 3),
      needsExpert: true,
    },
    {
      ruleKey: "inheritance_tax",
      title: "상속세 신고·납부",
      institutionKey: "tax_office",
      institutionName: "세무서·홈택스",
      dueDate: taxDueDate,
      needsExpert: true,
    },
    {
      ruleKey: "health_pension",
      title: "건강보험·국민연금 정지 확인",
      institutionKey: "nhis_nps",
      institutionName: "국민건강보험공단·국민연금공단",
      dueDate: null,
      needsExpert: false,
    },
  ];

  if (will === "unknown") {
    tasks.push({
      ruleKey: "find_will",
      title: "유언장 있는지 확인",
      institutionKey: null,
      institutionName: "가족",
      dueDate: null,
      needsExpert: false,
    });
  }

  if (will === "yes") {
    tasks.push({
      ruleKey: "will_probate",
      title: "유언장 검인 신청",
      institutionKey: "family_court",
      institutionName: "가정법원",
      dueDate: null,
      needsExpert: true,
    });
  }

  if (heirCount !== "1") {
    tasks.push({
      ruleKey: "heir_agreement",
      title: "상속인끼리 재산 분할 협의 (상속재산분할협의서)",
      institutionKey: null,
      institutionName: "상속인",
      dueDate: taxDueDate,
      needsExpert: true,
    });
  }

  return tasks;
}
