// 질문 5개와 답 코드 (specs/screens.md 4장, specs/api.md POST /api/answers)

export type AnswerKey = "relation" | "deathDate" | "region" | "heirCount" | "will";
export type Answers = Partial<Record<AnswerKey, string>>;

export type Option = { value: string; label: string };

export type Question =
  | { key: AnswerKey; title: string; type: "choice"; options: Option[] }
  | { key: AnswerKey; title: string; type: "date"; hint: string }
  | { key: AnswerKey; title: string; type: "select"; options: Option[] };

const UNKNOWN: Option = { value: "unknown", label: "잘 모르겠어요" };

const REGIONS = [
  "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "경기",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

export const QUESTIONS: Question[] = [
  {
    key: "relation",
    title: "고인과 어떤 관계세요?",
    type: "choice",
    options: [
      { value: "spouse", label: "배우자" },
      { value: "child", label: "자녀" },
      { value: "parent", label: "부모" },
      { value: "sibling", label: "형제자매" },
      { value: "other", label: "기타" },
      UNKNOWN,
    ],
  },
  {
    key: "deathDate",
    title: "별세일이 언제예요?",
    type: "date",
    hint: "오늘부터 1년 전까지의 날짜를 고를 수 있어요.",
  },
  {
    key: "region",
    title: "고인이 사시던 지역은 어디예요?",
    type: "select",
    options: REGIONS.map((r) => ({ value: r, label: r })),
  },
  {
    key: "heirCount",
    title: "상속인은 모두 몇 명이에요?",
    type: "choice",
    options: [
      { value: "1", label: "1명" },
      { value: "2", label: "2명" },
      { value: "3", label: "3명" },
      { value: "4+", label: "4명 이상" },
      UNKNOWN,
    ],
  },
  {
    key: "will",
    title: "유언장이 있나요?",
    type: "choice",
    options: [
      { value: "yes", label: "있어요" },
      { value: "no", label: "없어요" },
      UNKNOWN,
    ],
  },
];

/** 한국 시간(Asia/Seoul) 기준 오늘 날짜 YYYY-MM-DD */
export function todayKst(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(
    new Date(),
  );
}

/** 오늘로부터 1년 전 날짜 YYYY-MM-DD */
export function oneYearAgoKst(): string {
  const d = new Date(`${todayKst()}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() - 1);
  return d.toISOString().slice(0, 10);
}

/** 별세일 검사: 문제가 있으면 안내 문구, 괜찮으면 null */
export function validateDeathDate(value: string | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "날짜를 골라 주세요.";
  }
  if (Number.isNaN(new Date(`${value}T00:00:00Z`).getTime())) {
    return "올바른 날짜를 골라 주세요.";
  }
  if (value > todayKst()) {
    return "오늘 이후 날짜는 고를 수 없어요.";
  }
  if (value < oneYearAgoKst()) {
    return "1년보다 오래된 날짜는 고를 수 없어요.";
  }
  return null;
}

/** 이 질문에 답이 충분한지 */
export function isAnswered(q: Question, answers: Answers): boolean {
  const v = answers[q.key];
  if (!v) return false;
  if (q.key === "deathDate") return validateDeathDate(v) === null;
  return true;
}
