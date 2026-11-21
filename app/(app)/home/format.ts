// 홈 화면에서 쓰는 기한 표시 (dDay는 API가 한국 시간 오늘 기준으로 계산해 줘요)

/** 82 → "D-82", 0 → "D-Day", 음수 → "기한 지남" */
export function dDayLabel(dDay: number): string {
  if (dDay > 0) return `D-${dDay}`;
  if (dDay === 0) return "D-Day";
  return "기한 지남";
}

/** 30일 이내(지난 것 포함)면 기한 임박 */
export function isUrgent(dDay: number | null): boolean {
  return dDay !== null && dDay <= 30;
}

/** "2027-02-10" → "2027년 2월 10일" */
export function dateLabel(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  return `${y}년 ${m}월 ${d}일`;
}
