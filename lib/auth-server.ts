import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function getUser() {
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  return error ? null : data.user;
}

export async function requireUser() {
  const user = await getUser();
  if (user) return { user, response: null } as const;

  return {
    user: null,
    response: NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요해요." } },
      { status: 401 },
    ),
  } as const;
}
