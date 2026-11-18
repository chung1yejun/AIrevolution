# DB 설계 (db.md)

담당: 정예준 작성 · 구현: 황겸(H2, H3, H10) · Supabase(PostgreSQL)

## 0. 원칙
- **저장하지 않는 것**: 주민등록번호, 조회 결과 원문, 요청서에 입력한 이름·연락처.
- 이용자 기록 테이블은 모두 `user_id uuid not null references auth.users(id) on delete cascade` → 탈퇴(계정 삭제)하면 기록이 함께 지워진다.
- 모든 테이블 RLS를 켠다. 이용자 기록은 본인 행만(`auth.uid() = user_id`), 기준 데이터는 로그인한 사람(authenticated) 읽기만.
- 서버 API는 로그인한 사용자의 세션으로 DB를 부른다(RLS 적용). service role 키는 탈퇴(K11)에서만 쓴다.
- SQL 파일 위치: `supabase/migrations/001_tables.sql`, `002_rls.sql`, `003_triggers.sql`, `004_partner_stats.sql`, `supabase/seed.sql`.

## 1. 이용자 기록
### profiles
| 칸 | 자료형 | 설명 |
|---|---|---|
| id | uuid PK, references auth.users(id) on delete cascade | 계정 id |
| partner | text not null default '하늘상조' | 소속 파트너 |
| created_at | timestamptz not null default now() | 가입일 |

### answers (계정당 1행)
| 칸 | 자료형 | 설명 |
|---|---|---|
| user_id | uuid PK, FK | |
| relation | text not null check in ('spouse','child','parent','sibling','other','unknown') | 고인과의 관계 |
| death_date | date not null | 별세일 |
| region | text not null | 시·도 (screens.md 목록) |
| heir_count | text not null check in ('1','2','3','4+','unknown') | 상속인 수 |
| will | text not null check in ('yes','no','unknown') | 유언장 |
| updated_at | timestamptz not null default now() | |

### user_tasks
| 칸 | 자료형 | 설명 |
|---|---|---|
| id | uuid PK default gen_random_uuid() | |
| user_id | uuid FK | |
| title | text not null | 할 일 제목 |
| institution_id | uuid null references institutions(id) | 연결된 기관(있으면) |
| institution_name | text not null | 화면에 보일 기관 이름 |
| due_date | date null | 기한(없으면 null) |
| done | boolean not null default false | 완료 여부 |
| done_at | timestamptz null | 완료일 |
| source | text not null check in ('rule','ai','manual') | 만든 방식 |
| rule_key | text null | 규칙 할 일 키(product.md 부록 A) |
| needs_expert | boolean not null default false | 전문가 확인 필요 |
| created_at | timestamptz not null default now() | |
- 유일 조건: (user_id, rule_key) where rule_key is not null / (user_id, institution_id) where institution_id is not null and rule_key is null (규칙 할 일은 같은 기관이 여러 개일 수 있음. 예: 사망신고와 안심상속 모두 주민센터).

### analyses
| 칸 | 자료형 | 설명 |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| items | jsonb not null | `[{"name","type","count"}]` 추출 결과만 (원문 저장 금지) |
| used_fallback | boolean not null | 예비 결과를 썼는지 |
| created_at | timestamptz default now() | |

### doc_checks
| 칸 | 자료형 | 설명 |
|---|---|---|
| user_id | uuid FK | |
| document_id | uuid references documents(id) | |
| checked_at | timestamptz default now() | |
- PK (user_id, document_id). 체크 해제는 행 삭제.

### delegations
| 칸 | 자료형 | 설명 |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| agent_id | uuid references agents(id) | |
| task_ids | uuid[] not null | 맡긴 할 일 |
| status | text not null default '신청됨' | 신청됨 (샘플이라 바뀌지 않음) |
| created_at | timestamptz default now() | |

### ai_usage
| 칸 | 자료형 | 설명 |
|---|---|---|
| user_id | uuid FK | |
| day | date | 한국 날짜 |
| count | int not null default 0 | 그날 AI 호출 횟수 |
- PK (user_id, day). 하루 5회 제한에 쓴다.

## 2. 기준 데이터 (누구나 읽기만, 값은 specs/mock-data.md)
### institutions
| 칸 | 자료형 | 설명 |
|---|---|---|
| id | uuid PK | |
| key | text unique not null | 영문 키 (예: haneul_bank) |
| name | text not null | 기관 이름 |
| type | text check in ('bank','insurance','telecom','car','public') | 종류 |
| how_to_apply | text not null | 신청 방법 안내 |
| needs_expert | boolean default false | 전문가 확인 필요 |
| form_key | text null check in ('bank','insurance','telecom') | 요청서 양식(있을 때) |
| selectable | boolean default true | '기관 직접 추가' 목록에 보일지 |
| is_sample | boolean default true | 샘플 여부 |

### documents
| 칸 | 자료형 | 설명 |
|---|---|---|
| id | uuid PK | |
| key | text unique | 영문 키 |
| name | text | 서류 이름 |
| issuer | text | 발급처 |

### institution_documents
| 칸 | 자료형 | 설명 |
|---|---|---|
| institution_id | uuid FK | |
| document_id | uuid FK | |
| copies | int not null default 1 | 필요 부수 |
- PK (institution_id, document_id)

### agents
| 칸 | 자료형 | 설명 |
|---|---|---|
| id | uuid PK | |
| name | text | 행정사 이름(가상) |
| region | text | 활동 지역(시·도) |
| cases | int | 처리 실적(건) |
| fee | text | 보수 안내 (예: "건당 15만 원부터") |
| is_sample | boolean default true | |

## 3. 자동 처리
- `handle_new_user()` 트리거(003): auth.users에 행이 생기면 profiles에 (id, '하늘상조') 행 생성.
- `partner_stats()` 함수(004, H10): `security definer`, 숫자만 반환, `anon`과 `authenticated`에 execute 권한. 반환 JSON은 specs/api.md의 GET /api/partner/stats와 같다.
  - families: 이번 달(한국 시간) 가입한 하늘상조 profiles 수
  - billing: families × 30000
  - avgProgress: 할 일이 있는 계정들의 (완료 수 / 전체 수) 평균, 0~100 정수
  - completed: 할 일이 1개 이상이고 모두 완료한 계정 수
  - daily: 최근 14일 날짜별 가입 수
  - stages: 질문 전(answers 없음) / 0~33% / 34~66% / 67~99% / 완료 별 계정 수
