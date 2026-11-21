"use client";

import { createClient } from "@/lib/supabase/client";

export async function signInWithGoogle() {
  return createClient().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: new URL("/auth/callback", window.location.origin).href },
  });
}

export async function signOut() {
  return createClient().auth.signOut();
}
