import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";
import type { DelegationResponse, DelegationsResponse } from "@/lib/types";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isId(value: unknown): value is string {
  return typeof value === "string" && uuid.test(value);
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const body = await request.json().catch(() => null);
  if (body?.agreed !== true) return fail(400, "BAD_INPUT", "샘플 신청 안내를 확인해 주세요.");
  if (!isId(body.agentId) || !Array.isArray(body.taskIds) || !body.taskIds.length || !body.taskIds.every(isId)) {
    return fail(400, "BAD_INPUT", "행정사와 맡길 할 일을 선택해 주세요.");
  }
  const taskIds = [...new Set<string>(body.taskIds.map((id: string) => id.toLowerCase()))];
  const db = await createClient();
  const [agent, tasks] = await Promise.all([
    db.from("agents").select("id").eq("id", body.agentId).maybeSingle(),
    db.from("user_tasks").select("id").eq("user_id", user.id).eq("done", false).in("id", taskIds),
  ]);
  if (agent.error || tasks.error) return fail(500, "SERVER_ERROR", "신청 정보를 확인하지 못했어요.");
  if (!agent.data || tasks.data.length !== taskIds.length) {
    return fail(400, "BAD_INPUT", "행정사와 내 미완료 할 일을 다시 확인해 주세요.");
  }

  const { data, error } = await db.from("delegations").insert({
    id: crypto.randomUUID(), user_id: user.id, agent_id: agent.data.id, task_ids: taskIds,
  }).select("id, status, created_at").single();
  if (error) return fail(500, "SERVER_ERROR", "신청을 저장하지 못했어요.");
  return ok<DelegationResponse>({ id: data.id, status: data.status, createdAt: data.created_at });
}

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  const db = await createClient();
  const { data, error } = await db.from("delegations")
    .select("id, status, created_at, task_ids, agent:agents(name)")
    .eq("user_id", user.id).order("created_at", { ascending: false }).order("id")
    .overrideTypes<{
      id: string; status: DelegationResponse["status"]; created_at: string;
      task_ids: string[]; agent: { name: string } | null;
    }[], { merge: false }>();
  if (error) return fail(500, "SERVER_ERROR", "신청 내역을 불러오지 못했어요.");
  if (!data.length) return ok<DelegationsResponse>({ delegations: [] });

  const { data: tasks, error: taskError } = await db.from("user_tasks")
    .select("id, title").eq("user_id", user.id);
  if (taskError) return fail(500, "SERVER_ERROR", "맡긴 할 일을 불러오지 못했어요.");
  const titles = new Map(tasks.map(task => [task.id, task.title]));
  return ok<DelegationsResponse>({ delegations: data.map(row => ({
    id: row.id, status: row.status, createdAt: row.created_at,
    agentName: row.agent?.name ?? "행정사 정보 없음",
    tasks: row.task_ids.map(id => titles.get(id) ?? "삭제된 할 일"),
  })) });
}
