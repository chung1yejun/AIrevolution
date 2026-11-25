// 베타 테스트 로그인 (CLAUDE.md 7장 9번): 내 컴퓨터의 `npm run dev`에서만 동작해요.
// AI 코딩 도구가 구글 로그인 없이 로그인 후 화면을 확인할 때 써요. 운영·미리보기 주소에서는 항상 404예요.
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { fail } from "@/lib/api";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
const DEFAULT_EMAIL = "beta-tester@namgim.test";

/** 켜져 있고, 개발 서버이고, 내 컴퓨터 주소일 때만 true */
function isAllowed(request: Request): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.TEST_LOGIN_ENABLED === "true" &&
    LOCAL_HOSTS.has(new URL(request.url).hostname)
  );
}

/** 로그인 뒤 갈 주소. 우리 사이트 안의 주소만 허용해요. */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/home";
  return value;
}

export async function GET(request: Request) {
  if (!isAllowed(request)) return fail(404, "NOT_FOUND", "찾을 수 없어요.");

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return fail(500, "SERVER_ERROR", ".env.local에 SUPABASE_SERVICE_ROLE_KEY가 없어요.");
  }

  const { url } = getSupabaseConfig();
  const email = process.env.TEST_LOGIN_EMAIL || DEFAULT_EMAIL;
  const admin = createAdminClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 테스트 계정이 없으면 만들어요(이미 있으면 오류가 나도 그대로 진행해요).
  await admin.auth.admin.createUser({ email, email_confirm: true });

  // 비밀번호 없이 한 번 쓰는 로그인 토큰을 만들고, 바로 그 토큰으로 로그인해 쿠키를 저장해요.
  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !data.properties?.hashed_token) {
    return fail(500, "SERVER_ERROR", "테스트 로그인 토큰을 만들지 못했어요.");
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: data.properties.hashed_token,
  });
  if (verifyError) {
    return fail(500, "SERVER_ERROR", "테스트 계정으로 로그인하지 못했어요.");
  }

  const next = safeNext(new URL(request.url).searchParams.get("next"));
  return NextResponse.redirect(new URL(next, request.url));
}
