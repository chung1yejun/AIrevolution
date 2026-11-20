import styles from "./theme";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

// <Checkbox label="서류를 준비했어요" defaultChecked />
type CheckboxProps = Omit<ComponentPropsWithoutRef<"input">, "type" | "children"> & {
  label: ReactNode;
};

export function Checkbox({ label, className = "", disabled, ...props }: CheckboxProps) {
  return (
    <label className={`flex min-h-11 w-fit max-w-full items-center gap-3 py-2 has-disabled:opacity-60 ${className}`}>
      <input
        {...props}
        type="checkbox"
        disabled={disabled}
        className={`size-6 shrink-0 ${styles.checkbox}`}
      />
      <span className="min-w-0 wrap-anywhere">{label}</span>
    </label>
  );
}
