import type { createClient } from "@/lib/supabase/server";

type Client = Awaited<ReturnType<typeof createClient>>;

export const dailyLimit = 5;

export async function getUsage(client: Client, userId: string, day: string) {
  const { data, error } = await client
    .from("ai_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("day", day)
    .maybeSingle();

  if (error) throw error;
  return data?.count ?? null;
}

export async function reserveUsage(
  client: Client,
  userId: string,
  day: string,
  initialCount: number | null,
): Promise<number | null> {
  let count = initialCount;

  // In normal use each conflict advances the count toward the five-call cap.
  for (let attempt = 0; attempt <= dailyLimit; attempt++) {
    if (count !== null && count >= dailyLimit) return null;
    if (count === null) {
      const { error } = await client
        .from("ai_usage")
        .insert({ user_id: userId, day, count: 1 });
      if (!error) return dailyLimit - 1;
      if (error.code !== "23505") throw error;
    } else {
      const nextCount = count + 1;
      const { data, error } = await client
        .from("ai_usage")
        .update({ count: nextCount })
        .eq("user_id", userId)
        .eq("day", day)
        .eq("count", count)
        .select("count")
        .maybeSingle();

      if (error) throw error;
      if (data) return dailyLimit - nextCount;
    }
    count = await getUsage(client, userId, day);
  }
  throw new Error("분석 사용량을 갱신하지 못했어요.");
}
