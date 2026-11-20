import styles from "./theme";
import type { ComponentPropsWithoutRef } from "react";

// <Button variant="secondary" loading={saving}>저장해요</Button>
type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  type = "button",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-4 py-2 border border-transparent font-semibold disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    >
      {loading && (
        <span aria-hidden="true" className="size-4 shrink-0 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin" />
      )}
      {children}
    </button>
  );
}
