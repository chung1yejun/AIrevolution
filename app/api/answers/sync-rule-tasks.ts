import type { RuleTask } from "@/lib/rules";
import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function syncRuleTasks(
  supabase: SupabaseClient,
  userId: string,
  tasks: RuleTask[],
) {
  const institutionKeys = [
    ...new Set(tasks.flatMap(({ institutionKey }) => institutionKey ? [institutionKey] : [])),
  ];
  const { data: institutions, error: institutionError } = await supabase
    .from("institutions")
    .select("id, key")
    .in("key", institutionKeys);
  if (institutionError) return institutionError;

  const institutionIds = new Map(institutions.map(({ key, id }) => [key, id]));

  for (const task of tasks) {
    const values = {
      title: task.title,
      institution_id: institutionIds.get(task.institutionKey) ?? null,
      institution_name: task.institutionName,
      due_date: task.dueDate,
      needs_expert: task.needsExpert,
    };
    const update = () => supabase
      .from("user_tasks")
      .update(values)
      .eq("user_id", userId)
      .eq("source", "rule")
      .eq("rule_key", task.ruleKey)
      .select("id")
      .maybeSingle();

    const { data: existing, error: updateError } = await update();
    if (updateError) return updateError;
    if (existing) continue;

    const { error: insertError } = await supabase.from("user_tasks").insert({
      ...values,
      user_id: userId,
      source: "rule",
      rule_key: task.ruleKey,
    });
    if (insertError?.code === "23505") {
      // A concurrent request may have inserted this rule after the update.
      const { data: concurrent, error } = await update();
      if (error || !concurrent) return error ?? insertError;
    } else if (insertError) {
      return insertError;
    }
  }

  const activeKeys = tasks.map(({ ruleKey }) => ruleKey).join(",");
  const { error } = await supabase
    .from("user_tasks")
    .delete()
    .eq("user_id", userId)
    .eq("source", "rule")
    .not("rule_key", "is", null)
    .not("rule_key", "in", `(${activeKeys})`);
  return error;
}
