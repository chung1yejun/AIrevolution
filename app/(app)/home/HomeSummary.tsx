import { Card, ProgressBar, Tag } from "@/components/ui";
import type { Progress, UrgentTask } from "@/lib/types";
import { dDayLabel, dateLabel, isUrgent } from "./format";

/** 가장 급한 기한 카드와 진행률 */
export default function HomeSummary({ urgent, progress }: { urgent: UrgentTask | null; progress: Progress }) {
  return (
    <section aria-label="요약" className="grid gap-6">
      {urgent && (
        <Card>
          <div className="flex items-start justify-between gap-3">
            <p className="text-[14px] font-semibold">가장 급한 기한</p>
            {isUrgent(urgent.dDay) && <Tag variant="urgent" />}
          </div>
          <p className="mt-2 break-keep text-[18px] leading-[1.4] font-bold">{urgent.title}</p>
          <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[30px] leading-none font-bold tabular-nums">{dDayLabel(urgent.dDay)}</span>
            <span className="text-[15px] font-semibold tabular-nums">{dateLabel(urgent.dueDate)}까지</span>
          </p>
          <p className="mt-3 text-[13px]">별세일 기준 예상 기한이에요</p>
        </Card>
      )}

      <div className="grid gap-2">
        <p className="text-[15px] font-semibold tabular-nums">
          {progress.total}개 중 {progress.done}개 완료
        </p>
        <ProgressBar value={progress.percent} label={`${progress.percent}%`} />
      </div>
    </section>
  );
}
