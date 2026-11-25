import type { Progress } from "@/lib/types";

export function getTaskProgress(tasks: readonly { done: boolean }[]): Progress {
  const total = tasks.length;
  const done = tasks.filter((task) => task.done).length;

  return { done, total, percent: total === 0 ? 0 : Math.round(done / total * 100) };
}
