// 홈 할 일 목록을 화면에서 다시 정리하는 함수들 (체크한 뒤 바로 화면에 반영할 때 써요)
import type { Progress, Task, UrgentTask } from "@/lib/types";

/**
 * 끝내지 않은 할 일 먼저, 그 안에서 기한 가까운 순(기한 없는 것은 뒤)으로 정렬해요.
 * 기한이 같으면 API가 준 순서를 지켜요. (specs/api.md GET /api/home 정렬 규칙)
 */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return Number(a.done) - Number(b.done);
    if (a.dueDate === b.dueDate) return 0;
    if (a.dueDate === null) return 1;
    if (b.dueDate === null) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  });
}

/** 끝낸 개수 / 전체 개수로 진행률을 계산해요. */
export function countProgress(tasks: Task[]): Progress {
  const total = tasks.length;
  const done = tasks.filter((task) => task.done).length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

/** 끝내지 않았고 기한이 있는 할 일 중 가장 가까운 것. 없으면 null. */
export function findUrgent(tasks: Task[]): UrgentTask | null {
  let urgent: UrgentTask | null = null;
  for (const task of tasks) {
    if (task.done || task.dueDate === null || task.dDay === null) continue;
    if (urgent === null || task.dDay < urgent.dDay) {
      urgent = { taskId: task.id, title: task.title, dueDate: task.dueDate, dDay: task.dDay };
    }
  }
  return urgent;
}

/** id가 같은 할 일의 완료 여부를 바꾼 새 목록을 돌려줘요. */
export function setDone(tasks: Task[], id: string, done: boolean): Task[] {
  return tasks.map((task) => (task.id === id ? { ...task, done } : task));
}
