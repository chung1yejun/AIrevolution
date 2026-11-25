import Link from "next/link";
import { Checkbox, Tag } from "@/components/ui";
import type { Task } from "@/lib/types";
import { dDayLabel, dateLabel, isUrgent } from "./format";

function DueText({ task }: { task: Task }) {
  if (!task.dueDate || task.dDay === null) {
    return <span>기한 없음</span>;
  }
  return (
    <span className={`tabular-nums ${!task.done && isUrgent(task.dDay) ? "text-warn" : ""}`}>
      {dateLabel(task.dueDate)}까지 <b>{dDayLabel(task.dDay)}</b>
    </span>
  );
}

function TaskBody({ task }: { task: Task }) {
  return (
    <>
      <p className={`break-keep text-[17px] leading-[1.4] font-bold ${task.done ? "text-text-sub line-through" : ""}`}>
        {task.title}
      </p>
      {task.institutionName && <p className="mt-1 break-keep text-[15px] text-text-sub">{task.institutionName}</p>}
      <p className="mt-1 text-[15px] text-text-sub">
        <DueText task={task} />
      </p>
      {task.needsExpert && (
        <div className="mt-2">
          <Tag variant="review" />
        </div>
      )}
    </>
  );
}

type TaskListProps = {
  tasks: Task[];
  /** 저장 중인 할 일 id (저장이 끝날 때까지 다시 누를 수 없어요) */
  savingIds: string[];
  onToggle: (id: string, done: boolean) => void;
};

/** 할 일 목록. 체크하면 onToggle로 저장하고, 끝낸 할 일은 흐리게 보여요. */
export default function TaskList({ tasks, savingIds, onToggle }: TaskListProps) {
  return (
    <ul className="border-t border-border">
      {tasks.map((task) => (
        <li
          key={task.id}
          className={`flex items-start gap-1 border-b border-border py-3 transition-opacity ${task.done ? "opacity-50" : ""}`}
        >
          <Checkbox
            label={<span className="sr-only">{task.title} 완료</span>}
            checked={task.done}
            disabled={savingIds.includes(task.id)}
            onChange={(event) => onToggle(task.id, event.target.checked)}
          />
          {task.institutionId ? (
            <Link
              href={`/institutions/${task.institutionId}`}
              className="block min-w-0 flex-1 rounded-xl py-2 pl-1 wrap-anywhere hover:bg-surface"
            >
              <TaskBody task={task} />
            </Link>
          ) : (
            <div className="min-w-0 flex-1 py-2 pl-1 wrap-anywhere">
              <TaskBody task={task} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
