import Link from "next/link";

const NOTES = [
  "무료로 쓸 수 있어요",
  "진행 상황이 저장돼요",
  "주민등록번호와 조회 결과 원문은 저장하지 않아요",
  "AI 기능이 포함돼 있어요",
];

export default function Page() {
  return (
    <main className="mobile-frame flex flex-col py-8">
      <div className="flex-1">
        {/* 하늘상조 로고 자리 */}
        <div className="flex items-center gap-2">
          <div
            aria-hidden
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-[18px] font-bold text-primary"
          >
            하
          </div>
          <span className="text-[16px] font-bold text-text-sub">하늘상조</span>
        </div>

        <h1 className="mt-10 text-[22px] font-bold text-primary">남김</h1>
        <p className="mt-3 break-keep text-[18px] font-bold leading-snug">
          장례 이후 해야 할 해지·명의변경·상속 일을 한곳에서 정리해요
        </p>
        <p className="mt-2 break-keep text-[14px] text-text-sub">
          천천히 하나씩, 놓치는 일 없이 도와드릴게요.
        </p>

        <ul className="mt-8 space-y-3">
          {NOTES.map((note) => (
            <li
              key={note}
              className="flex gap-3 rounded-2xl border border-border bg-surface p-4 text-[16px]"
            >
              <span
                aria-hidden
                className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary"
              />
              <span className="break-keep">{note}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        {/* 임시 버튼: S2 공통 Button이 main에 들어오면 Y7에서 교체하고 로그인을 연결해요 */}
        <button
          type="button"
          className="min-h-12 w-full rounded-xl bg-primary px-4 text-[16px] font-bold text-white"
        >
          Google 계정으로 시작하기
        </button>
        <nav className="mt-4 flex justify-center gap-6 text-[14px] text-text-sub">
          <Link href="/about" className="inline-flex min-h-11 items-center underline">
            이용 안내
          </Link>
          <Link href="/partner" className="inline-flex min-h-11 items-center underline">
            파트너용 화면
          </Link>
        </nav>
      </div>
    </main>
  );
}
