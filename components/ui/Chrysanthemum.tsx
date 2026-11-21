import styles from "./theme";

const sidePetals = [
  "M32 40C25 36 22 26 23 16L25 10 29 13C33 19 33 29 32 40Z",
  "M32 40C23 38 17 29 16 21L17 12 21 14C27 19 29 32 32 40Z",
  "M32 40C21 41 12 33 10 25L10 18 14 19C21 24 23 36 32 40Z",
  "M32 40C21 43 10 40 6 33L4 28 9 29C17 32 23 39 32 40Z",
  "M32 40C23 45 11 46 5 41L1 38 6 36C16 36 23 42 32 40Z",
  "M32 40C24 37 18 29 19 21L22 17 26 20C29 25 31 35 32 40Z",
  "M32 40C25 36 23 25 25 19L28 15 32 20C34 27 33 35 32 40Z",
];

// <Chrysanthemum className="w-14" /> — decorative mark next to the service name.
export function Chrysanthemum({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 64 84" className={className}>
      <g className={styles.stem}>
        <path d="M30.8 39H33L33.4 81H31.3Z" />
        <path d="M32 66L26 61 16 57 8 49 15 49 23 52 29 58Z" />
        <path d="M32 66L38 61 48 57 56 49 49 49 41 52 35 58Z" />
      </g>
      <g className={styles.flower} stroke="var(--namgim-navy)" strokeWidth="0.95" strokeLinejoin="round">
        <path d="M32 40C27 34 25 26 25 18L27 11.5 32 9 37 11.5 39 18C39 26 37 34 32 40Z" />
        {sidePetals.map((path) => (
          <g key={path}>
            <path d={path} />
            <path d={path} transform="translate(64 0) scale(-1 1)" />
          </g>
        ))}
        <path d="M32 40C27 35 24 26 27 20L30 16 32 15 34 16 37 20C40 26 37 35 32 40Z" />
      </g>
    </svg>
  );
}
