import { Gowun_Batang } from "next/font/google";
import Link from "next/link";
import LandingMenu from "./LandingMenu";
import "./landing.css";

// 제목에만 쓰는 명조 계열 글꼴: 차분하고 무게 있는 분위기
const serif = Gowun_Batang({
  weight: ["400", "700"],
  preload: false,
  display: "swap",
});

const STEPS = [
  { name: "사망신고", when: "알게 된 날부터 1개월 안" },
  { name: "상속포기·한정승인 결정", when: "알게 된 날부터 3개월 안" },
  { name: "상속세 신고", when: "상속이 시작된 달의 말일부터 6개월 안" },
];

export default function Page() {
  return (
    <div className="lp-page">
      <main className="mobile-frame lp-frame">
        <header className="lp-header">
          <span className={`lp-wordmark ${serif.className}`}>남김</span>
          <LandingMenu />
        </header>

        <section className="lp-hero">
          <h1 className={`lp-title ${serif.className}`}>
            장례 이후에 해야 할 일,
            <br />
            기한 순서대로
          </h1>
          <p className="lp-lead">
            질문 몇 개로 해지, 명의변경, 상속 업무를 한곳에서
          </p>

          <ol className="lp-timeline" aria-label="주요 기한">
            {STEPS.map((s) => (
              <li key={s.name} className="lp-step">
                <p className="lp-step-name">{s.name}</p>
                <p className="lp-step-when">{s.when}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="lp-bottom">
          {/* 임시 버튼: S2 공통 Button이 main에 들어오면 Y7에서 교체하고 로그인을 연결해요 */}
          <button type="button" className="lp-cta">
            Google 계정으로 시작하기
          </button>
          <nav className="lp-links">
            <Link href="/about" className="lp-link">
              이용 안내
            </Link>
          </nav>
        </div>
      </main>
    </div>
  );
}
