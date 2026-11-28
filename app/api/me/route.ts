import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DeleteMeResponse } from "@/lib/types";

export async function DELETE() {
  try {
    const { user, response } = await requireUser();
    if (response) return response;

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;

    return ok<DeleteMeResponse>({ ok: true });
  } catch {
    return fail(500, "SERVER_ERROR", "탈퇴를 처리하지 못했어요. 다시 시도해 주세요.");
  }
}
