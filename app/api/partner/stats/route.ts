import { fail, ok } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import type { PartnerStatsResponse } from "@/lib/types";

export async function GET() {
  const db = await createClient();
  const { data, error } = await db.rpc("partner_stats");
  if (error || !data) return fail(500, "SERVER_ERROR", "파트너 통계를 불러오지 못했어요.");
  return ok<PartnerStatsResponse>(data);
}
