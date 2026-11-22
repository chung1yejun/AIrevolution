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

/** 할 일 목록. 체크박스는 Y9에서 PATCH /api/tasks/[id]와 연결해요(지금은 표시만). */
export default function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ul className="border-t border-border">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-start gap-1 border-b border-border py-3">
          <Checkbox
            label={<span className="sr-only">{task.title} 완료</span>}
            checked={task.done}
            readOnly
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
