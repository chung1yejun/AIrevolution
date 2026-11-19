import Link from "next/link";

const NOTES = [
  "무료로 쓸 수 있어요",
  "진행 상황이 저장돼요",
  "주민등록번호와 조회 결과 원문은 저장하지 않아요",
  "AI 기능이 포함돼 있어요",
];

function Check() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className="mt-[3px] h-4 w-4 shrink-0 text-primary"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}

export default function Page() {
  return (
    <main className="mobile-frame flex flex-col pb-6 pt-5">
      {/* 하늘상조 로고 자리 */}
      <div className="flex items-center gap-2">
        <div
          aria-hidden
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-[15px] font-bold text-white"
        >
          하
        </div>
        <span className="text-[15px] font-bold">하늘상조</span>
      </div>

      <div className="flex-1 pt-20">
        <p className="text-[16px] font-bold text-primary">남김</p>
        <h1 className="mt-3 break-keep text-[28px] font-bold leading-[1.35] tracking-[-0.02em]">
          장례 이후 챙겨야 할 일,
          <br />
          한곳에서 정리해요
        </h1>
        <p className="mt-4 break-keep text-[16px] text-text-sub">
          해지·명의변경·상속 업무를 질문 몇 개로 정리해 드려요.
          <br />
          천천히, 하나씩 도와드릴게요.
        </p>
      </div>

      <div>
        <ul className="space-y-2 pb-6">
          {NOTES.map((note) => (
            <li
              key={note}
              className="flex gap-2 text-[14px] leading-snug text-text-sub"
            >
              <Check />
              <span className="break-keep">{note}</span>
            </li>
          ))}
        </ul>

        {/* 임시 버튼: S2 공통 Button이 main에 들어오면 Y7에서 교체하고 로그인을 연결해요 */}
        <button
          type="button"
          className="h-14 w-full rounded-2xl bg-primary px-4 text-[17px] font-bold text-white"
        >
          Google 계정으로 시작하기
        </button>
        <nav className="mt-2 flex justify-center gap-6 text-[14px] text-text-sub">
          <Link href="/about" className="inline-flex min-h-11 items-center">
            이용 안내
          </Link>
          <Link href="/partner" className="inline-flex min-h-11 items-center">
            파트너용 화면
          </Link>
        </nav>
      </div>
    </main>
  );
}
