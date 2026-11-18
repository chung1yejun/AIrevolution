import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "이용 안내와 개인정보처리방침 | 남김",
  description:
    "남김의 서비스 설명, AI 사용 안내, 개인정보처리방침(국외 이전 고지 포함), 샘플 데이터 안내, 탈퇴 방법",
};

const CONTACT_URL = "https://github.com/chung1yejun/AIrevolution/issues";
const EFFECTIVE_DATE = "2026-11-18";

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-4 rounded-2xl border border-border bg-surface p-4"
    >
      <h2 className="text-[18px] font-bold">{title}</h2>
      <div className="mt-3 space-y-3 break-words text-[16px] leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function SubTitle({ children }: { children: ReactNode }) {
  return <h3 className="pt-1 text-[16px] font-bold text-primary">{children}</h3>;
}

function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function Page() {
  return (
    <main className="mobile-frame pb-12">
      <header className="flex h-14 items-center gap-2">
        <Link
          href="/"
          aria-label="첫 화면으로 돌아가기"
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-xl text-[22px] text-primary"
        >
          ←
        </Link>
        <h1 className="text-[22px] font-bold">이용 안내</h1>
      </header>

      <div className="space-y-4">
        <Section title="남김은 어떤 서비스인가요">
          <p>
            남김은 장례 이후 유족이 해야 하는 해지, 명의변경, 상속 업무를 한곳에서
            챙기도록 돕는 모바일 웹 서비스예요. 몇 가지 질문에 답하면 해야 할 일과
            기한을 정리해 드려요.
          </p>
          <p>유족은 무료로 쓸 수 있어요. 법률·세무 판단은 하지 않아요.</p>
        </Section>

        <Section title="AI는 이렇게 써요">
          <SubTitle>AI가 하는 일</SubTitle>
          <p>
            AI(Claude)는 이름과 주민등록번호를 가린 조회 결과에서 기관 이름, 종류,
            건수만 뽑아 줘요.
          </p>
          <SubTitle>AI가 하지 않는 일</SubTitle>
          <List
            items={[
              "할 일과 기한은 AI가 아니라 정해진 규칙으로 계산해요.",
              "요청서 문장은 AI가 쓰지 않아요. 입력한 값을 양식에 채워요.",
              "법적 판단이나 상속 상담은 하지 않아요.",
            ]}
          />
          <p>
            AI 결과에는 &lsquo;AI 생성&rsquo; 표시가 붙어요. 빠진 곳이나 틀린 곳이
            있을 수 있으니 원본과 꼭 비교해 보세요.
          </p>
        </Section>

        <Section id="privacy" title="개인정보처리방침">
          <p className="text-sm text-text-sub">시행일 {EFFECTIVE_DATE}</p>
          <p>
            남김(이하 &lsquo;서비스&rsquo;)은 한양대학교 &lsquo;AI혁명&rsquo; 수업 팀
            과제로 만든 서비스예요. 이용자의 개인정보를 아래와 같이 처리해요.
          </p>

          <SubTitle>1. 수집하는 정보</SubTitle>
          <List
            items={[
              <>
                <b>Google 로그인 정보</b>: 이메일 주소, 이름, 프로필 사진 등 Google
                계정의 기본 정보(email, profile 범위). 로그인과 계정 구분에만 써요.
              </>,
              "이용자가 입력한 답변: 고인과의 관계, 별세일, 고인의 거주 지역, 상속인 수, 유언장 유무",
              "할 일과 체크 상태, AI가 뽑은 기관 이름·종류·건수, 서류 발급 체크",
              "행정사 연계 신청 내역(샘플), AI 분석 호출 횟수",
              "로그인 상태를 유지하기 위한 쿠키",
            ]}
          />

          <SubTitle>2. 저장하지 않는 정보</SubTitle>
          <List
            items={[
              "주민등록번호",
              "조회 결과 원문(이름과 주민등록번호를 가린 뒤에만 서버로 보내요)",
              "요청서 PDF를 만들 때 입력한 이름과 연락처(이용자의 브라우저에서만 쓰고 서버로 보내지 않아요)",
              "Google 계정 비밀번호(서비스는 비밀번호를 받지 않아요)",
            ]}
          />

          <SubTitle>3. 이용 목적</SubTitle>
          <List
            items={[
              "로그인과 이용자 구분",
              "답변에 맞는 할 일과 기한 안내, 진행 상황 저장",
              "AI 분석 기능 제공과 하루 이용 횟수 관리",
              "서비스 이용 현황 집계(개인을 알아볼 수 없는 숫자로만 표시)",
            ]}
          />
          <p>
            Google 계정 정보는 위 목적 외에 광고, 판매, 이용자 프로파일링에 쓰지
            않아요.
          </p>

          <SubTitle>4. 보관과 삭제</SubTitle>
          <p>
            정보는 탈퇴할 때까지 보관해요. 내 정보 화면에서 탈퇴하면 계정과 모든
            기록이 바로 지워지고 되돌릴 수 없어요.
          </p>

          <SubTitle>5. 처리를 맡기는 곳과 국외 이전</SubTitle>
          <p>서비스 운영을 위해 아래 업체를 이용해요.</p>
          <List
            items={[
              <>
                <b>Supabase</b>: 로그인(Google 인증)과 데이터베이스 저장
              </>,
              <>
                <b>Vercel</b>: 웹사이트 운영
              </>,
              <>
                <b>Anthropic(Claude API)</b>: 가린 조회 결과에서 기관 이름·종류·건수
                추출
              </>,
            ]}
          />
          <p>
            AI 분석을 쓰면 이름과 주민등록번호를 가린 조회 결과가 미국에 있는
            Anthropic 서버로 전송돼요. 이전 항목은 가린 조회 결과 한 가지이고, 이전
            시점은 &lsquo;분석하기&rsquo;를 누를 때예요. 이전을 원하지 않으면 AI
            분석을 쓰지 않으면 되고, 다른 기능은 그대로 쓸 수 있어요. 위 업체의
            서버는 해외에 있을 수 있어요.
          </p>
          <p>
            그 밖에는 법령에 따른 요청이 있는 경우를 빼고 이용자의 정보를 제3자에게
            제공하지 않아요.
          </p>

          <SubTitle>6. 이용자의 권리</SubTitle>
          <p>
            이용자는 언제든 홈에서 답변을 고치고, 내 정보에서 탈퇴해 정보를 지울 수
            있어요. 문의와 요청은 아래 주소로 남겨 주세요.
          </p>

          <SubTitle>7. 문의</SubTitle>
          <p>
            <a
              href={CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-primary underline"
            >
              {CONTACT_URL}
            </a>
          </p>
          <p className="text-sm text-text-sub">
            방침이 바뀌면 이 페이지에 시행일과 함께 알려요.
          </p>
        </Section>

        <Section title="샘플 데이터 안내">
          <p>
            이 서비스는 수업 과제용 시연이에요. 아래는 실제가 아니라 샘플이고,
            &lsquo;샘플&rsquo; 표시가 붙어요.
          </p>
          <List
            items={[
              "AI 분석에 쓰는 조회 결과",
              "기관별 요청서 양식",
              "행정사 목록과 신청(실제 행정사에게 전달되지 않아요)",
            ]}
          />
        </Section>

        <Section title="탈퇴하는 방법">
          <p>
            로그인한 뒤 홈 오른쪽 위의 내 정보에서 &lsquo;탈퇴&rsquo;를 누르면 돼요.
            확인창에서 한 번 더 확인하면 계정과 모든 기록이 지워져요.
          </p>
        </Section>
      </div>
    </main>
  );
}
