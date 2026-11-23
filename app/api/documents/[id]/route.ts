import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";
import type { DocumentUpdateResponse } from "@/lib/types";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, context: RouteContext<"/api/documents/[id]">) {
  const { user, response } = await requireUser();
  if (response) return response;

  const body: unknown = await request.json().catch(() => undefined);
  if (!body || typeof body !== "object" || !("checked" in body) || typeof body.checked !== "boolean") {
    return fail(400, "BAD_INPUT", "서류 확인 여부를 보내 주세요.");
  }

  const { id } = await context.params;
  if (!uuidPattern.test(id)) return fail(404, "NOT_FOUND", "서류를 찾을 수 없어요.");

  const db = await createClient();
  const { data: document, error: lookupError } = await db
    .from("documents")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (lookupError) return fail(500, "SERVER_ERROR", "서류를 불러오지 못했어요.");
  if (!document) return fail(404, "NOT_FOUND", "서류를 찾을 수 없어요.");

  const { checked } = body;
  const checks = db.from("doc_checks");
  const { error } = checked
    ? await checks.upsert(
        { user_id: user.id, document_id: document.id },
        { onConflict: "user_id,document_id", ignoreDuplicates: true },
      )
    : await checks.delete().eq("user_id", user.id).eq("document_id", document.id);

  if (error) return fail(500, "SERVER_ERROR", "서류 확인 상태를 저장하지 못했어요.");
  return ok<DocumentUpdateResponse>({ id, checked });
}
