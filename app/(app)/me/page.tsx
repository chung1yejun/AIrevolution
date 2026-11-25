import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Card } from "@/components/ui";
import { getUser } from "@/lib/auth-server";
import MeActions from "./MeActions";

/** 로그인한 구글 이메일. 로그인 정보를 읽는 동안 화면의 나머지는 먼저 보여줘요. */
async function Email() {
  // 로그인 정보는 요청마다 달라서, 미리 그려 두지 않고 요청 때 읽어요.
  await connection();
  const user = await getUser().catch(() => null);
  return <>{user?.email || "이메일을 불러오지 못했어요"}</>;
}

export default function Page() {
  return (
    <main className="pt-6 pb-10">
      <h1 className="font-serif text-[24px] font-bold">내 정보</h1>

      <Card className="mt-5">
        <p className="text-sm font-semibold">로그인한 구글 계정</p>
        <p className="mt-1 text-lg font-bold wrap-anywhere">
          <Suspense fallback={<span className="text-base font-normal">불러오는 중이에요…</span>}>
            <Email />
          </Suspense>
        </p>
      </Card>

      <MeActions />

      <nav className="mt-8 border-t border-[var(--namgim-secondary)] pt-4">
        <Link
          href="/about"
          className="inline-flex min-h-11 items-center text-[var(--namgim-muted)] underline underline-offset-4"
        >
          이용 안내 보기
        </Link>
      </nav>
    </main>
  );
}
