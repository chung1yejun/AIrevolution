// 껍데기(H4): 실제 버전은 H6에서 구현합니다.
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import type { DocumentUpdateResponse } from "@/lib/types";

export async function PATCH(request: Request, context: RouteContext<"/api/documents/[id]">) {
  const { response } = await requireUser();
  if (response) return response;

  const body: unknown = await request.json().catch(() => undefined);
  if (!body || typeof body !== "object" || !("checked" in body) || typeof body.checked !== "boolean") {
    return fail(400, "BAD_INPUT", "서류 확인 여부를 보내 주세요.");
  }

  const { id } = await context.params;
  return ok<DocumentUpdateResponse>({ id, checked: body.checked });
}
