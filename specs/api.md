# API 명세 (api.md)

담당: 정예준 작성 · 구현: 강주원(answers, home, tasks, analysis, me), 황겸(documents, institutions, agents, delegations, partner)
화면 담당은 이 문서의 JSON 모양만 보고 화면을 만든다. 껍데기(K4, H4)는 아래 '응답 예시'를 그대로 돌려준다.

## 0. 공통 규칙
- 주소는 모두 `app/api/.../route.ts`. 요청·응답은 JSON.
- **로그인**: `/api/partner/stats`와 베타 테스트 로그인 `/api/dev-login`(4장)을 뺀 모든 API는 로그인 필요. 로그인 안 했으면 `401 { "error": { "code": "UNAUTHORIZED", "message": "로그인이 필요해요." } }`.
- **오류 형식**: `{ "error": { "code": "...", "message": "한국어 설명" } }`
  - 400 BAD_INPUT(입력이 잘못됨), 401 UNAUTHORIZED, 404 NOT_FOUND, 500 SERVER_ERROR
- 날짜 `YYYY-MM-DD`, 시각 ISO 문자열. `dDay`는 한국 시간 오늘 기준 남은 일수(오늘이면 0, 지났으면 음수).
- 기관 종류 `type`: `bank` | `insurance` | `telecom` | `car` | `public`
- 할 일 만든 방식 `source`: `rule` | `ai` | `manual`
- 예시의 id(`t-1`, `i-haneul`, `d-family`, `a-1` 등)는 읽기 쉽게 쓴 것이다. 실제 API는 DB의 uuid를 돌려준다. 화면은 id를 그대로 주소·요청에 쓰기만 한다.

## 1. 한눈에 보기
| 주소 | 하는 일 | 담당 | 껍데기 | 실제 |
|---|---|---|---|---|
| POST /api/answers | 답 저장, 규칙으로 할 일 다시 만들기 | 강주원 | K4 묶음1 | K6 묶음2 |
| GET /api/home | 답 유무, 가장 급한 기한, 진행률, 할 일 목록 | 강주원 | K4 | K7 묶음3 |
| PATCH /api/tasks/[id] | 할 일 완료 체크·해제 | 강주원 | K4 | K7 |
| POST /api/analysis | 가린 조회 결과에서 기관·건수 추출 | 강주원 | K4 | K9 묶음4 |
| POST /api/analysis/apply | 확인한 기관(AI 결과 또는 직접 선택)을 할 일로 추가 | 강주원 | K4 | K10 묶음4 |
| DELETE /api/me | 탈퇴(계정과 기록 전체 삭제) | 강주원 | K4 | K11 묶음5 |
| GET /api/documents | 필요 서류 합계와 체크 상태 | 황겸 | H4 묶음2 | H6 묶음3 |
| PATCH /api/documents/[id] | 서류 발급 체크·해제 | 황겸 | H4 | H6 |
| GET /api/institutions | 직접 추가할 수 있는 기관 목록 | 황겸 | H4 | H7 묶음3 |
| GET /api/institutions/[id] | 기관 상세(할 일, 서류, 신청 방법) | 황겸 | H4 | H7 |
| GET /api/agents | 샘플 행정사 목록 | 황겸 | H4 | H7 |
| POST·GET /api/delegations | 행정사 신청 저장, 내 신청 내역 | 황겸 | H4 | H9 묶음5 |
| GET /api/partner/stats | 파트너 대시보드 집계(로그인 불필요) | 황겸 | H4 | H10 묶음6 |
| GET /api/dev-login | 베타 테스트 로그인(내 컴퓨터 개발 서버에서만, 12/7 삭제) | 정예준 | - | Y-answer2 |

## 2. 강주원 담당

### POST /api/answers
요청
```json
{ "relation": "child", "deathDate": "2026-11-10", "region": "대구", "heirCount": "1", "will": "no" }
```
- 값의 범위는 specs/screens.md 4장. 별세일은 오늘 이후·1년 전보다 오래된 날짜 불가 → 400.
응답 200
```json
{ "ok": true, "taskCount": 5 }
```
- 동작: answers 저장(있으면 덮어씀) → `lib/rules.ts`로 규칙 할 일 다시 만들기(specs/product.md 부록 A).

### GET /api/home
응답 200 (답이 있을 때)
```json
{
  "hasAnswers": true,
  "answers": { "relation": "child", "deathDate": "2026-11-10", "region": "대구", "heirCount": "1", "will": "no" },
  "urgent": { "taskId": "t-2", "title": "상속포기·한정승인 여부 결정", "dueDate": "2027-02-10", "dDay": 85 },
  "progress": { "done": 1, "total": 5, "percent": 20 },
  "tasks": [
    { "id": "t-1", "title": "사망신고", "institutionId": "i-community", "institutionName": "고인 주소지 주민센터(대구)", "dueDate": "2026-12-10", "dDay": 23, "done": true, "source": "rule", "needsExpert": false },
    { "id": "t-2", "title": "상속포기·한정승인 여부 결정", "institutionId": "i-court", "institutionName": "가정법원", "dueDate": "2027-02-10", "dDay": 85, "done": false, "source": "rule", "needsExpert": true },
    { "id": "t-3", "title": "상속세 신고·납부", "institutionId": "i-tax", "institutionName": "세무서·홈택스", "dueDate": "2027-05-31", "dDay": 195, "done": false, "source": "rule", "needsExpert": true },
    { "id": "t-4", "title": "안심상속 원스톱 서비스 신청 (재산 조회)", "institutionId": "i-community", "institutionName": "주민센터·정부24", "dueDate": null, "dDay": null, "done": false, "source": "rule", "needsExpert": false },
    { "id": "t-5", "title": "건강보험·국민연금 정지 확인", "institutionId": "i-nhis", "institutionName": "국민건강보험공단·국민연금공단", "dueDate": null, "dDay": null, "done": false, "source": "rule", "needsExpert": false }
  ]
}
```
- 답이 없으면 `{ "hasAnswers": false, "answers": null, "urgent": null, "progress": { "done": 0, "total": 0, "percent": 0 }, "tasks": [] }`
- tasks 정렬: 완료 안 된 것 먼저, 그 안에서 기한 가까운 순(기한 없는 것은 뒤).
- `urgent`: 완료 안 됐고 기한이 있는 할 일 중 가장 가까운 것. 없으면 null.

### PATCH /api/tasks/[id]
요청 `{ "done": true }` → 응답 200
```json
{ "id": "t-2", "done": true, "doneAt": "2026-11-21T10:00:00+09:00", "progress": { "done": 2, "total": 5, "percent": 40 } }
```
- 다른 사람의 할 일이면 404.

### POST /api/analysis
요청 (브라우저에서 이미 가린 텍스트, 최대 20,000자)
```json
{ "maskedText": "[샘플] 안심상속 원스톱서비스 조회 결과 통지\n신청인 성명: 박** 주민등록번호: ******-*******\n..." }
```
응답 200
```json
{
  "source": "ai",
  "reason": null,
  "items": [
    { "name": "하늘은행", "type": "bank", "count": 2, "institutionId": "i-haneul" },
    { "name": "든든생명", "type": "insurance", "count": 1, "institutionId": "i-dundun" },
    { "name": "차량등록사업소", "type": "car", "count": 1, "institutionId": "i-car" }
  ],
  "remaining": 4
}
```
- `source`: `ai`(Claude 결과) 또는 `fallback`(예비 결과, specs/mock-data.md 5장).
- `reason`(fallback일 때): `timeout`(20초 초과) | `invalid`(형식 오류) | `limit`(하루 5회 초과) | `no_key`(키 없음, 로컬) | `error`. ai면 null.
- **돈이 드는 호출**: 이 API만 Claude(유료)를 부른다. AI 코딩 도구는 이 API나 `lib/claude.ts`로 실제 Claude를 부르는 테스트를 하기 전에 사용자에게 먼저 묻는다(CLAUDE.md 7장 10번).
- 실패해도 항상 200과 예비 결과를 돌려준다(화면이 멈추지 않게). 빈 텍스트만 400.
- `institutionId`: institutions의 name과 같으면 그 id, 없으면 null.
- 저장: analyses에 items와 used_fallback만(원문 저장 금지). ai_usage 1 증가(limit일 때는 증가 안 함).

### POST /api/analysis/apply
요청 (AI 결과에서 확인한 것 또는 '기관 직접 추가'에서 고른 것)
```json
{ "source": "ai", "items": [ { "institutionId": "i-haneul", "name": "하늘은행", "type": "bank", "count": 2 } ] }
```
```json
{ "source": "manual", "items": [ { "institutionId": "i-baro", "name": "바로텔레콤", "type": "telecom" } ] }
```
응답 200 `{ "added": 1, "skipped": 0 }`
- 할 일 제목: bank → "{name} 계좌 해지·예금 상속 신청", insurance → "{name} 보험금 청구·계약 해지", telecom → "{name} 휴대폰 해지·명의변경", car → "자동차 상속 이전등록"(기한: 별세일이 속한 달의 말일 + 6개월), public → "{name} 처리".
- 같은 기관 할 일이 이미 있으면 건너뛰고 skipped에 센다.

### DELETE /api/me
응답 200 `{ "ok": true }` → 화면은 로그아웃하고 `/`로 이동.
- service role 키로 auth 사용자 삭제 → 모든 기록 연쇄 삭제(db.md).

## 3. 황겸 담당

### GET /api/documents
응답 200
```json
{
  "documents": [
    { "id": "d-family", "name": "가족관계증명서(고인 기준)", "issuer": "주민센터·정부24", "copies": 4, "usedBy": ["하늘은행", "든든생명", "가정법원", "세무서"], "checked": false },
    { "id": "d-death", "name": "사망진단서(또는 시체검안서)", "issuer": "병원", "copies": 2, "usedBy": ["든든생명", "주민센터"], "checked": true }
  ]
}
```
- 내 할 일들의 기관(institution_id)에 필요한 서류를 합친다. copies는 기관별 부수의 합. 할 일이 없으면 `documents: []`.

### PATCH /api/documents/[id]
요청 `{ "checked": true }` → 응답 200 `{ "id": "d-family", "checked": true }`

### GET /api/institutions
응답 200 (selectable = true인 기관)
```json
{ "institutions": [ { "id": "i-haneul", "name": "하늘은행", "type": "bank", "isSample": true }, { "id": "i-baro", "name": "바로텔레콤", "type": "telecom", "isSample": true } ] }
```

### GET /api/institutions/[id]
응답 200
```json
{
  "id": "i-haneul", "name": "하늘은행", "type": "bank", "isSample": true,
  "howToApply": "가까운 지점 방문 또는 ...", "needsExpert": false, "formKey": "bank",
  "tasks": [ { "id": "t-6", "title": "하늘은행 계좌 해지·예금 상속 신청", "dueDate": null, "done": false } ],
  "documents": [ { "name": "가족관계증명서(고인 기준)", "issuer": "주민센터·정부24", "copies": 1 } ]
}
```
- `formKey`가 있으면 요청서 PDF를 만들 수 있다(bank | insurance | telecom). 없는 기관이면 404.

### GET /api/agents?region=대구
응답 200
```json
{ "agents": [ { "id": "a-1", "name": "김도윤 행정사", "region": "대구", "cases": 132, "fee": "건당 15만 원부터", "isSample": true } ] }
```
- region에 맞는 행정사가 없거나 region이 없으면 전체 목록.

### POST /api/delegations
요청 `{ "agentId": "a-1", "taskIds": ["t-1", "t-6"], "agreed": true }`
- agreed(고지 확인)가 true가 아니면 400. 응답 200 `{ "id": "dl-1", "status": "신청됨", "createdAt": "2026-11-27T20:00:00+09:00" }`

### GET /api/delegations
응답 200
```json
{ "delegations": [ { "id": "dl-1", "agentName": "김도윤 행정사", "tasks": ["사망신고", "하늘은행 계좌 해지·예금 상속 신청"], "status": "신청됨", "createdAt": "2026-11-27T20:00:00+09:00" } ] }
```

### GET /api/partner/stats (로그인 불필요)
응답 200 (DB 함수 `partner_stats()` 결과를 그대로)
```json
{
  "partner": "하늘상조", "month": "2026-11",
  "families": 12, "billing": 360000, "avgProgress": 41, "completed": 2,
  "daily": [ { "date": "2026-11-17", "count": 1 }, { "date": "2026-11-18", "count": 3 } ],
  "stages": [ { "stage": "질문 전", "count": 1 }, { "stage": "0~33%", "count": 5 }, { "stage": "34~66%", "count": 3 }, { "stage": "67~99%", "count": 1 }, { "stage": "완료", "count": 2 } ]
}
```
- daily는 최근 14일 모두(가입 0인 날도 0으로).

## 4. 베타 테스트 전용 (정예준)

### GET /api/dev-login?next=/home
- AI 코딩 도구가 로그인 후 화면을 확인하려고 쓰는 테스트 로그인(CLAUDE.md 7장 9번).
- 조건: `npm run dev` + `.env.local`의 `TEST_LOGIN_ENABLED=true` + localhost 주소 + 서버에 `SUPABASE_SERVICE_ROLE_KEY`. 하나라도 아니면 `404 NOT_FOUND`(운영·미리보기 주소는 항상 404).
- 테스트 계정(`TEST_LOGIN_EMAIL`, 없으면 `beta-tester@namgim.test`)이 없으면 만들고, 비밀번호 없이 로그인 쿠키를 저장한 뒤 `next`(우리 사이트 안 주소만, 기본 `/home`)로 이동(302).
- 서비스 키가 없거나 로그인에 실패하면 `500 SERVER_ERROR`(message에 이유).
- 12/7 코드 동결 때 삭제.
