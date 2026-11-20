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
        className={`h-14 w-full min-w-0 rounded-2xl bg-surface px-4 focus:outline-2 focus:-outline-offset-2 focus:outline-primary disabled:opacity-60 ${className}`}
      />
      {error && <p id={errorId} className="text-sm text-warn">{error}</p>}
    </div>
  );
}
