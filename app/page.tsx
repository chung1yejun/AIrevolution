import Link from "next/link";
import { redirect } from "next/navigation";
import { Chrysanthemum } from "@/components/ui";
import { getUser } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";
import LandingMenu from "./LandingMenu";
import LoginButton from "./LoginButton";
import "./landing.css";

const STEPS = [
  { name: "사망신고", when: "알게 된 날부터 1개월 안" },
  { name: "상속포기·한정승인 결정", when: "알게 된 날부터 3개월 안" },
  { name: "상속세 신고", when: "상속이 시작된 달의 말일부터 6개월 안" },
];

// 로그인 여부를 먼저 확인하고 바로 이동시키므로, 첫 화면은 요청마다 서버에서 그려요.
export const instant = false;

/** 로그인한 사람이면 갈 곳(답이 있으면 /home, 없으면 /onboarding), 아니면 null */
async function getNextPath(): Promise<"/home" | "/onboarding" | null> {
  try {
    const user = await getUser();
    if (!user) return null;

    const supabase = await createClient();
    const { data: answer } = await supabase
      .from("answers")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    return answer ? "/home" : "/onboarding";
  } catch {
    // Supabase 연결 값이 없거나 확인에 실패하면 첫 화면을 그대로 보여줘요.
    return null;
  }
}

export default async function Page({ searchParams }: PageProps<"/">) {
  const next = await getNextPath();
  if (next) redirect(next);

  const { error } = await searchParams;

  return (
    <main className="mobile-frame lp-frame">
      <header className="lp-header">
        <span className="lp-wordmark font-serif">
          <Chrysanthemum className="w-5 shrink-0" />
          남김
        </span>
        <LandingMenu />
      </header>

      <section className="lp-hero">
        <h1 className="lp-title font-serif">
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
        <LoginButton initialError={error === "login"} />
        <nav className="lp-links">
          <Link href="/about" className="lp-link">
            이용 안내
          </Link>
        </nav>
      </div>
    </main>
  );
}
