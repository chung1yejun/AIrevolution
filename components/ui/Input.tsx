import styles from "./theme";
import { useId, type ComponentPropsWithoutRef } from "react";

// <Input label="기관 이름" error="기관 이름을 입력해 주세요." />
type InputProps = ComponentPropsWithoutRef<"input"> & { label: string; error?: string };

export function Input({
  label,
  error,
  id,
  className = "",
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="grid min-w-0 gap-2">
      <label htmlFor={inputId} className="font-semibold">{label}</label>
      <input
        {...props}
        id={inputId}
        aria-invalid={error ? true : invalid}
        aria-describedby={[describedBy, error && errorId].filter(Boolean).join(" ") || undefined}
        className={`h-14 w-full min-w-0 rounded-2xl px-4 ${styles.field} ${className}`}
      />
      {error && <p id={errorId} className={`text-sm ${styles.error}`}>{error}</p>}
    </div>
  );
}
