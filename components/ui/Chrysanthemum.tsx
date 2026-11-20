import styles from "./theme";

// <Chrysanthemum className="w-14" /> — decorative mark next to the service name.
export function Chrysanthemum({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 64 84" className={className}>
      <path className={styles.stem} d="M31 39h2l1 42h-2l-1-17-7-9-10-4-7-10 12 2 7 5 6 12-1-2 7-10 7-5 12-2-8 10-10 4-6 9z" />
      <g className={styles.flower} stroke="var(--namgim-navy)" strokeWidth="1.1" strokeLinejoin="round">
        <path d="M32 42 18 44 8 41 2 35l11 1 9 2L8 33l-4-8 9 4-3-10 8 5-1-12 8 7 7-15 7 15 8-7-1 12 8-5-3 10 9-4-4 8-14 5 9-2 11-1-6 6-10 3z" />
        <path d="M32 42 20 38 13 29 11 19l9 7 5 7-6-13 2-9 8 9 3 11 3-11 8-9 2 9-6 13 5-7 9-7-2 10-7 9z" />
        <path d="m32 42-8-8-4-11 3-10 7 8 2 12 2-12 7-8 3 10-4 11z" />
        <path d="m32 42-5-10-2-11 3-9 4-5 4 5 3 9-2 11z" />
        <path d="m32 42-2-10 2-15 2 15z" fill="var(--namgim-field)" />
      </g>
    </svg>
  );
}
