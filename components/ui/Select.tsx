import styles from "./theme";
import { useId, type ComponentPropsWithoutRef } from "react";

// <Select label="기관 종류"><option value="bank">은행</option></Select>
type SelectProps = ComponentPropsWithoutRef<"select"> & { label: string; error?: string };

export function Select({
  label,
  error,
  id,
  className = "",
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;

  return (
    <div className="grid min-w-0 gap-2">
      <label htmlFor={selectId} className="font-semibold">{label}</label>
      <select
        {...props}
        id={selectId}
        aria-invalid={error ? true : invalid}
        aria-describedby={[describedBy, error && errorId].filter(Boolean).join(" ") || undefined}
        className={`h-14 w-full min-w-0 rounded-2xl px-4 ${styles.field} ${className}`}
      />
      {error && <p id={errorId} className={`text-sm ${styles.error}`}>{error}</p>}
    </div>
  );
}
