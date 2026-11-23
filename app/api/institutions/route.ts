import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";
import type { InstitutionsResponse, InstitutionType } from "@/lib/types";

type InstitutionRow = { id: string; name: string; type: InstitutionType | null; is_sample: boolean | null };

export async function GET() {
  const { response } = await requireUser();
  if (response) return response;

  const db = await createClient();
  const { data, error } = await db
    .from("institutions")
    .select("id, name, type, is_sample")
    .eq("selectable", true)
    .order("type")
    .order("name")
    .overrideTypes<InstitutionRow[], { merge: false }>();

  if (error) return fail(500, "SERVER_ERROR", "기관 목록을 불러오지 못했어요.");

  const institutions: InstitutionsResponse["institutions"] = [];
  for (const { id, name, type, is_sample } of data) {
    if (!type) return fail(500, "SERVER_ERROR", "기관 종류를 불러오지 못했어요.");
    institutions.push({ id, name, type, isSample: is_sample ?? true });
  }
  return ok<InstitutionsResponse>({ institutions });
}
