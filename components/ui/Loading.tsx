// <Loading /> — show while a screen is fetching data.
export function Loading() {
  return (
    <div role="status" className="grid min-h-48 place-content-center justify-items-center gap-3 rounded-2xl bg-[var(--namgim-secondary)] p-5 text-center text-[var(--namgim-ivory)]">
      <span aria-hidden="true" className="size-7 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin" />
      <p>불러오는 중이에요</p>
    </div>
  );
}
