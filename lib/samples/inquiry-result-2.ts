export const INQUIRY_RESULT_SAMPLE_2 = `[샘플] 안심상속 원스톱서비스 조회 결과 통지

신청인 성명: 윤가람   주민등록번호: 991332-2000000
사망자 성명: 문해솔   주민등록번호: 601332-1000000
사망일: 2026-11-11   주소: 서울특별시 마포구 (샘플)

1. 금융거래 조회 결과
 - 한빛은행: 예금 1건
 - 푸른화재: 보험 계약 2건
2. 자동차 조회 결과
 - 등록 차량 없음
3. 국세·지방세 조회 결과
 - 체납 없음`;

export const INQUIRY_RESULT_SAMPLE_2_ITEMS = [
  { name: "한빛은행", type: "bank" as const, count: 1 },
  { name: "푸른화재", type: "insurance" as const, count: 2 },
];
