import type { ComponentPropsWithoutRef } from "react";

// <Button variant="secondary" loading={saving}>저장해요</Button>
type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
};

const variants = {
  primary: "bg-primary text-white",
  secondary: "bg-surface text-primary",
  ghost: "bg-transparent text-primary",
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
      className={`inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-4 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-surface disabled:text-text-sub ${variants[variant]} ${className}`}
    >
      {loading && (
        <span aria-hidden="true" className="size-4 shrink-0 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin" />
      )}
      {children}
    </button>
  );
}
