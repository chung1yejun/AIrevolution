import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";
import type { InstitutionDetailResponse, InstitutionType } from "@/lib/types";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type InstitutionRow = {
  id: string;
  name: string;
  type: InstitutionType | null;
  is_sample: boolean | null;
  how_to_apply: string;
  needs_expert: boolean | null;
  form_key: InstitutionDetailResponse["formKey"];
};

type DocumentRequirement = {
  copies: number;
  document: { name: string | null; issuer: string | null };
};

export async function GET(_request: Request, context: RouteContext<"/api/institutions/[id]">) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { id } = await context.params;
  if (!uuidPattern.test(id)) return fail(404, "NOT_FOUND", "기관을 찾을 수 없어요.");

  const db = await createClient();
  const { data: institution, error } = await db
    .from("institutions")
    .select("id, name, type, is_sample, how_to_apply, needs_expert, form_key")
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<InstitutionRow | null, { merge: false }>();

  if (error) return fail(500, "SERVER_ERROR", "기관 정보를 불러오지 못했어요.");
  if (!institution) return fail(404, "NOT_FOUND", "기관을 찾을 수 없어요.");
  if (!institution.type) return fail(500, "SERVER_ERROR", "기관 종류를 불러오지 못했어요.");

  const [tasks, requirements] = await Promise.all([
    db.from("user_tasks")
      .select("id, title, due_date, done")
      .eq("user_id", user.id)
      .eq("institution_id", id),
    db.from("institution_documents")
      .select("copies, document:documents!inner(name, issuer)")
      .eq("institution_id", id)
      .overrideTypes<DocumentRequirement[], { merge: false }>(),
  ]);

  if (tasks.error || requirements.error) {
    return fail(500, "SERVER_ERROR", "기관의 할 일과 서류를 불러오지 못했어요.");
  }

  return ok<InstitutionDetailResponse>({
    id: institution.id,
    name: institution.name,
    type: institution.type,
    isSample: institution.is_sample ?? true,
    howToApply: institution.how_to_apply,
    needsExpert: institution.needs_expert ?? false,
    formKey: institution.form_key,
    tasks: tasks.data.map((task) => ({
      id: task.id, title: task.title, dueDate: task.due_date, done: task.done,
    })),
    documents: requirements.data.map(({ document, copies }) => ({
      name: document.name ?? "", issuer: document.issuer ?? "", copies,
    })),
  });
}
