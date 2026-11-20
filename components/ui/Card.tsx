import type { ComponentPropsWithoutRef } from "react";

// <Card>안내 내용을 보여줘요.</Card>
export function Card({ className = "", ...props }: ComponentPropsWithoutRef<"div">) {
  return <div {...props} className={`min-w-0 rounded-2xl bg-surface p-4 wrap-anywhere ${className}`} />;
}
