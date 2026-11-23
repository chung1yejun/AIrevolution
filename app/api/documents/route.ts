import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";
import type { DocumentsResponse } from "@/lib/types";

type DocumentRequirement = {
  copies: number;
  institution: { name: string };
  document: { id: string; name: string | null; issuer: string | null };
};

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  const db = await createClient();
  const { data: tasks, error: taskError } = await db
    .from("user_tasks")
    .select("institution_id")
    .eq("user_id", user.id)
    .not("institution_id", "is", null);

  if (taskError) return fail(500, "SERVER_ERROR", "할 일을 불러오지 못했어요.");

  const institutionIds = [...new Set(tasks.map((task) => task.institution_id))];
  if (institutionIds.length === 0) return ok<DocumentsResponse>({ documents: [] });

  const { data: requirements, error: requirementError } = await db
    .from("institution_documents")
    .select("copies, institution:institutions!inner(name), document:documents!inner(id, name, issuer)")
    .in("institution_id", institutionIds)
    .overrideTypes<DocumentRequirement[], { merge: false }>();

  if (requirementError) return fail(500, "SERVER_ERROR", "필요한 서류를 불러오지 못했어요.");
  if (requirements.length === 0) return ok<DocumentsResponse>({ documents: [] });

  const documents = new Map<string, DocumentsResponse["documents"][number]>();

  for (const { document, institution, copies } of requirements) {
    const existing = documents.get(document.id);
    if (existing) {
      existing.copies += copies;
      if (!existing.usedBy.includes(institution.name)) existing.usedBy.push(institution.name);
      continue;
    }

    documents.set(document.id, {
      id: document.id,
      name: document.name ?? "",
      issuer: document.issuer ?? "",
      copies,
      usedBy: [institution.name],
      checked: false,
    });
  }

  const { data: checks, error: checkError } = await db
    .from("doc_checks")
    .select("document_id")
    .eq("user_id", user.id)
    .in("document_id", [...documents.keys()]);

  if (checkError) return fail(500, "SERVER_ERROR", "서류 확인 상태를 불러오지 못했어요.");

  const checkedIds = new Set(checks.map((check) => check.document_id));
  return ok<DocumentsResponse>({
    documents: [...documents.values()].map((document) => ({
      ...document,
      usedBy: document.usedBy.sort((first, second) => first.localeCompare(second, "ko")),
      checked: checkedIds.has(document.id),
    })).sort((first, second) => first.name.localeCompare(second.name, "ko")),
  });
}
