> 이 파일은 Codex(GPT) 등 다른 AI 코딩 도구용이며, 아래 내용은 CLAUDE.md와 같다.

# 남김 (AIrevolution) — AI 작업 규칙서

> Claude Code는 이 파일(CLAUDE.md)을, Codex(GPT)는 AGENTS.md를 읽는다. 두 파일의 내용은 같다. 하나를 고치면 다른 하나도 똑같이 고친다.

## 1. 프로젝트 한 줄 요약
장례 이후 유족이 해야 하는 해지·명의변경·상속 업무를 한곳에서 처리하게 돕는 모바일 웹 서비스 '남김'.
한양대 'AI혁명' 수업 팀 과제이며, 최종 사업기획안의 8개 기능만 만든다. 교수님과 청중이 배포 주소로 들어와 실제로 사용한다.
저장소: https://github.com/chung1yejun/AIrevolution

## 2. "오늘 할 일 해줘"라고 하면
사용자가 "CLAUDE.md 읽고 오늘 할 일 해줘"처럼 말하면 아래 순서로 진행한다.
1. 오늘 날짜를 한국 시간으로 확인한다(`date`).
2. 사용자가 누구인지 확인한다. `git config user.name`, `git config user.email`, GitHub 아이디를 `tasks/README.md`의 팀원 표와 비교하고, 확실하지 않으면 이름을 묻는다.
3. `tasks/README.md`의 날짜별 작업표에서 오늘이 속한 구간의 내 작업을 찾는다.
4. 이미 끝난 작업인지 확인한다: `git fetch origin` 후 `git log origin/main --oneline | grep "(작업번호)"`. 이전 구간에 끝나지 않은 내 작업이 있으면 그것부터 한다.
5. 작업 안내서의 '먼저 필요' 작업이 main에 merge되지 않았으면 바로 시작하지 말고 사용자에게 알린다. 껍데기 데이터로 먼저 할 수 있는 Step이 있으면 그것부터 제안하고, 없으면 단톡방에 알리라고 안내한다.
6. "오늘 할 작업은 S2(공통 UI 부품)입니다. tasks/S2.md의 Step 1부터 진행할까요?"라고 확인을 받는다.
7. 9장의 Git 순서대로 브랜치를 만든 뒤, 작업 안내서의 Step 1만 진행한다.

## 3. 작업 전에 읽을 것
1. 이 파일
2. 이번 작업 안내서 `tasks/작업번호.md`
3. 작업 안내서가 가리키는 specs: `specs/product.md`(기능), `specs/screens.md`(화면), `specs/design.md`(디자인), `specs/db.md`(DB), `specs/api.md`(API), `specs/mock-data.md`(샘플 데이터)

## 4. 일하는 방식 (가장 중요)
- 작업 안내서의 **Step 하나만** 진행하고 멈춘다. 끝나면 ① 바꾼 파일 목록 ② 사용자가 확인하는 방법(어떤 주소를 열고 무엇을 보면 되는지)을 쉬운 말로 알려 준다. 사용자가 확인했다고 하면 commit하고 다음 Step으로 간다.
- 사용자 대부분은 개발이 처음이다. 용어는 짧게 풀어서 설명하고, 명령어는 복사해서 쓸 수 있게 준다. 사용자가 해야 하는 일(브라우저에서 확인, GitHub에서 PR 열기 등)은 번호를 붙여 알려 준다.
- 작업 안내서와 specs에 없는 기능, 화면, 패키지를 마음대로 추가하지 않는다. 필요해 보이면 먼저 제안하고 답을 기다린다.
- 다른 사람이 담당하는 파일(5장)은 고치지 않는다. 꼭 필요하면 "누구 담당의 어떤 파일을 이렇게 바꿔야 한다"고 알리고 멈춘다.
- 모르는 값(API 응답 모양, 테이블 칸 이름 등)은 지어내지 말고 specs에서 찾는다. 없으면 사용자에게 묻는다. specs와 다르게 만들어야 하면 그 이유를 PR 본문에 적고 specs도 같은 PR에서 고친다.
- 에러가 나면 원인을 쉬운 말로 먼저 설명하고 고친다.

## 5. 폴더 구조와 담당
| 위치 | 내용 | 담당 |
|---|---|---|
| `CLAUDE.md`, `AGENTS.md`, `specs/`, `tasks/`, `docs/` | 규칙서, 설계 문서, 작업 안내서 | 정예준 |
| `app/page.tsx`, `app/about`, `app/onboarding`, `app/(app)/home`, `app/(app)/me`, `app/layout.tsx` | 첫 화면, 이용 안내, 질문, 홈, 내 정보, 전체 틀 | 정예준 |
| `components/ui/`, `app/(app)/layout.tsx`, `lib/mask.ts` | 공통 부품, 하단 탭 틀, 주민번호 가리기 | 김수아 |
| `app/(app)/analysis`, `app/(app)/documents`, `app/(app)/institutions` | AI 분석, 준비 서류, 기관 상세 화면 | 김수아 |
| `lib/supabase/`, `lib/auth.ts`, `lib/rules.ts`, `lib/claude.ts`, `lib/api.ts`, `proxy.ts`(또는 `middleware.ts`), `app/auth/callback` | 로그인, 할 일 규칙, Claude 호출, API 공통 함수 | 강주원 |
| `app/api/answers`, `home`, `tasks`, `analysis`, `me` | 강주원 API | 강주원 |
| `supabase/`, `lib/samples/`, `lib/pdf.ts`, `public/fonts/` | SQL, 샘플 데이터, 요청서 PDF | 황겸 |
| `app/api/documents`, `institutions`, `agents`, `delegations`, `partner` | 황겸 API | 황겸 |
| `app/(app)/delegate`, `app/partner` | 행정사 연계, 파트너 대시보드 화면 | 황겸 |

로그인 후 하단 탭이 있는 화면은 `app/(app)/` 아래에 둔다. 주소에는 `(app)`이 나오지 않는다(`app/(app)/home/page.tsx` → `/home`).

## 6. 기술 스택
- Next.js 최신 버전 (App Router, TypeScript, Tailwind CSS, ESLint). `src/` 폴더 없이 루트에 `app/`. import 별칭 `@/*`.
- Supabase: Google 로그인(Supabase Auth), PostgreSQL, 행 단위 보안 규칙(RLS). 패키지 `@supabase/supabase-js`, `@supabase/ssr`.
- Claude API: `@anthropic-ai/sdk`. 서버(`app/api/`, `lib/claude.ts`)에서만 호출.
- 요청서 PDF: 브라우저에서 `pdf-lib` + `@pdf-lib/fontkit`, 한글 글꼴 `public/fonts/`.
- 배포: Vercel(정예준 계정). PR마다 미리보기 주소, main에 합쳐지면 운영 주소에 반영.
- 새 패키지는 작업 안내서에 적힌 것만 설치한다.

## 7. 반드시 지킬 규칙
1. **비밀 키**: 키는 `.env.local`(내 컴퓨터)과 Vercel 설정에만 둔다. 코드, 커밋, PR, 채팅에 키 값을 쓰지 않는다. `.env.example`에는 이름만 적는다. `.env.local`은 절대 commit하지 않는다.
   - 화면에서 써도 되는 값: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - 서버 전용: `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY` → `'use client'` 파일, `NEXT_PUBLIC_` 이름, 화면 코드에 절대 쓰지 않는다.
2. **개인정보**: 주민등록번호, 조회 결과 원문, 요청서에 입력한 이름·연락처는 서버로 보내거나 저장하지 않는다. 조회 결과는 브라우저에서 `lib/mask.ts`로 가린 뒤에만 서버로 보낸다. 테스트에도 진짜 개인정보를 쓰지 않는다.
3. **AI의 역할**: Claude는 조회 결과에서 기관명·종류·건수만 JSON으로 추출한다. 할 일과 기한은 `lib/rules.ts`의 규칙으로 계산한다. 요청서 문장은 AI가 쓰지 않고 양식에 입력값을 채운다.
4. **화면 → 서버 구조**: 화면은 DB나 Claude를 직접 부르지 않고 `app/api/`의 우리 API만 부른다. 예외: 로그인·로그아웃은 `lib/auth.ts`(Supabase Auth)를 쓴다.
5. **모바일 우선**: 이용자 화면은 폭 375px 휴대폰 기준으로 먼저 만든다. 넓은 화면에서는 최대 480px 폭으로 가운데 정렬. `/partner`만 PC 우선.
6. **상태 처리**: 데이터를 불러오는 화면은 로딩, 오류, 빈 상태를 모두 보여준다(`components/ui`의 Loading, ErrorState, EmptyState). 빈칸이나 아주 긴 입력에도 멈추지 않는다.
7. **샘플 표시**: 샘플 조회 결과, 기관 양식, 행정사 목록이 나오는 곳에는 '샘플' 태그를 붙인다.
8. **로그인 보호**: `/`, `/about`, `/partner`, `/auth/callback`, `/api/partner/stats`를 뺀 화면과 API는 로그인한 사람만 쓴다.

## 8. 코드 규칙
- TypeScript, `any` 금지. 서버 컴포넌트가 기본이고 클릭·입력이 필요한 컴포넌트만 `'use client'`.
- 화면 문구는 한국어 "~해요" 체.
- 버튼·카드 등은 `components/ui/`의 공통 부품을 쓴다. 없는 부품은 임시로 만들고 PR에 적는다.
- API: 성공하면 `specs/api.md`의 JSON 모양 그대로, 실패하면 알맞은 상태 코드와 `{ "error": { "code": "BAD_INPUT", "message": "한국어 설명" } }`.
- 날짜는 `YYYY-MM-DD` 문자열, D-day와 '오늘'은 한국 시간(Asia/Seoul) 기준.
- 파일 하나가 300줄을 넘으면 나눈다.

## 9. Git 규칙 (main 보호 설정이 없으므로 반드시 지킨다)
이 저장소는 GitHub 설정으로 main을 막아 두지 않았다. AI가 아래 규칙을 지키는 것이 유일한 안전장치다.
1. **main에서는 절대 commit·push·merge하지 않는다.** `git push origin main`, `git push --force`, `git reset --hard origin/...`은 금지.
2. 작업 시작: `git checkout main` → `git pull origin main` → `git checkout -b feature/작업번호-영문설명` (예: `feature/S2-ui`). 현재 브랜치가 main이면 작업 전에 반드시 브랜치를 먼저 만든다.
3. 커밋 메시지: `종류(작업번호): 한 일` — 종류는 feat, fix, style, refactor, docs, chore. 예: `feat(S2): 버튼과 카드 부품 추가`
4. push 전에 `git branch --show-current`로 브랜치 이름을 사용자에게 보여 주고, main이면 멈춘다. push는 `git push -u origin 브랜치이름`.
5. PR: 제목 `[작업번호] 이름: 한 일`, 본문은 `.github/pull_request_template.md` 양식. GitHub CLI(`gh`)가 있으면 `gh pr create`로 만들고, 없으면 GitHub에서 여는 방법을 안내한다.
6. **merge는 AI가 하지 않는다.** 정예준이 다음 날 낮 12시까지 리뷰하고 Squash and merge한다. 정예준이 못 하면 PR 작성자가 아닌 다른 팀원이 리뷰 체크리스트로 확인한 뒤 merge한다. 팀원은 자기 PR을 스스로 merge하지 않는다.
   - 정예준(PM)의 PR은 정예준이 직접 merge한다.
7. 버그 수정 브랜치는 `fix/Q-01-설명`, PR 제목은 `[Q-01] 이름: 고친 것`.
8. 팀원의 요청·질문에 답하느라 일정표(tasks/README.md)에 없는 일을 할 때는 작업표를 바꾸지 않고, 브랜치는 `answer/Y-answer1-설명`, PR 제목은 `[Y-answer1] 이름: 한 일`로 올린다. 번호는 이름 머리글자(Y, K, S, H)와 `answer`, 순서(1, 2, …)로 붙인다. 일정표의 작업은 그대로 따로 진행한다.
9. 충돌(conflict)이 나면 마음대로 지우지 말고, 어느 파일의 어느 부분이 왜 충돌했는지 설명하고 사용자와 함께 정한다.

## 10. 작업을 마칠 때
1. `npm run lint`와 `npm run build`가 성공하는지 확인한다.
2. 휴대폰 크기(크롬 F12 → 휴대폰 아이콘, 375px)에서 확인하는 방법을 알려 준다.
3. commit → push → PR까지 도와주고, PR 본문 초안을 양식대로 쓴다.
4. 단톡방(카톡)에 보낼 메시지를 **복사해서 붙여넣기만 하면 되게** 코드 블록(```text)으로 써 준다. 읽기 귀찮지 않게 **짧게, 핵심만** 쓴다: 3줄 이내, 인사말·설명·긴 배경은 넣지 않는다. PR 링크, 작업 번호, 이름, 한 일은 실제 값으로 채우고, 사용자가 채울 곳만 `(  )`로 남긴다. 아래 틀을 쓴다.
   - PR을 올렸을 때:
     ```text
     [작업번호] 이름 PR 올렸어요: (PR 링크)
     한 일: (한 줄) / 확인: (열 주소와 볼 것)
     ```
   - 밀릴 때(마감 전에 알린다):
     ```text
     [작업번호] 이름: 오늘 22:00까지 어려워요. 이유: (한 줄). 다음 구간 첫날 안에 올릴게요.
     ```
   - '먼저 필요' 작업이 merge되지 않아 시작하지 못할 때(2장 5번):
     ```text
     [작업번호] 이름: [먼저 필요 작업번호]가 아직 main에 없어요. (시작 못 했어요 / ~까지 했어요) 확인 부탁드려요.
     ```
5. 스크린샷은 AI가 대신 올릴 수 없으니 "크롬 F12 휴대폰 보기(375px)에서 캡처해 메시지와 함께 올려 주세요"라고 안내한다. merge되면 구글 독스 '팀원' 탭의 내 이름 탭에 체크와 PR 링크를 적으라고 안내한다.
