import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseConfig } from "@/lib/supabase/config";

const publicPaths = new Set(["/", "/about", "/partner", "/auth/callback", "/dev-ui"]);
const cacheHeaders = ["cache-control", "expires", "pragma"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublic = publicPaths.has(pathname) || pathname === "/api" || pathname.startsWith("/api/");
  const hasSessionCookie = request.cookies.getAll().some(({ name }) => /^sb-.+-auth-token(?:\.\d+)?$/.test(name));
  if (!hasSessionCookie) {
    return isPublic ? NextResponse.next() : NextResponse.redirect(new URL("/", request.url));
  }

  let response = NextResponse.next({ request });
  const { url, key } = getSupabaseConfig();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [name, value] of Object.entries(headers ?? {})) response.headers.set(name, value);
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  if (isPublic || data?.claims) return response;

  const redirect = NextResponse.redirect(new URL("/", request.url));
  for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
  for (const name of cacheHeaders) {
    const value = response.headers.get(name);
    if (value) redirect.headers.set(name, value);
  }
  return redirect;
}

export const config = {
  matcher: ["/((?!_next/|favicon\\.ico$|robots\\.txt$|sitemap\\.xml$|fonts/).*)"],
};
