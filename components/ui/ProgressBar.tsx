import styles from "./theme";
// <ProgressBar value={33} label="3/9 완료" />
export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const percentage = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;

  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-label="완료 진행률"
        aria-valuenow={percentage}
        aria-valuetext={label}
        className={`h-2 min-w-0 flex-1 rounded-full ${styles.track}`}
      >
        <div className={`h-full rounded-full ${styles.fill}`} style={{ width: `${percentage}%` }} />
      </div>
      <span aria-hidden="true" className="text-sm font-semibold">{label ?? `${percentage}%`}</span>
    </div>
  );
}
