import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";
import type { AgentsResponse } from "@/lib/types";

export async function GET(request: Request) {
  const { response } = await requireUser();
  if (response) return response;

  const db = await createClient();
  const listAgents = () => db
    .from("agents")
    .select("id, name, region, cases, fee, is_sample")
    .order("cases", { ascending: false, nullsFirst: false })
    .order("name");

  const region = new URL(request.url).searchParams.get("region")?.trim();
  let result = region ? await listAgents().eq("region", region) : await listAgents();

  if (region && !result.error && result.data.length === 0) result = await listAgents();
  if (result.error) return fail(500, "SERVER_ERROR", "행정사 목록을 불러오지 못했어요.");

  return ok<AgentsResponse>({
    agents: result.data.map((agent) => ({
      id: agent.id,
      name: agent.name ?? "",
      region: agent.region ?? "",
      cases: agent.cases ?? 0,
      fee: agent.fee ?? "",
      isSample: agent.is_sample ?? true,
    })),
  });
}
