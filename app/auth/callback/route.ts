import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const { data: answer } = await supabase
        .from("answers")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      return NextResponse.redirect(new URL(answer ? "/home" : "/onboarding", request.url));
    }
  }

  return NextResponse.redirect(new URL("/?error=login", request.url));
}
