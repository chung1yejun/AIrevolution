export const INQUIRY_RESULT_SAMPLE_3 = `[샘플] 안심상속 원스톱서비스 조회 결과 통지

신청인 성명: 차온유   주민등록번호: 981432-2000000
사망자 성명: 신미루   주민등록번호: 571432-1000000
사망일: 2026-11-12   주소: 부산광역시 동래구 (샘플)

1. 금융거래 조회 결과
 - 조회 내역 없음
2. 자동차 조회 결과
 - 승용차 2대 (등록지: 부산)
3. 국세·지방세 조회 결과
 - 체납 없음
4. 통신 조회 결과
 - 바로텔레콤: 회선 1건
 - 누리모바일: 회선 2건`;

export const INQUIRY_RESULT_SAMPLE_3_ITEMS = [
  { name: "차량등록사업소", type: "car" as const, count: 2 },
  { name: "바로텔레콤", type: "telecom" as const, count: 1 },
  { name: "누리모바일", type: "telecom" as const, count: 2 },
];
