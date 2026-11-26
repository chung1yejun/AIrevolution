"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui";
import styles from "@/components/ui/theme";

type Props = {
  deleting: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
};

/** 탈퇴 확인창. 브라우저 confirm() 대신 화면 안에 띄워요. */
export default function WithdrawDialog({ deleting, error, onCancel, onConfirm }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // 실수로 탈퇴하지 않게 '취소'에 먼저 초점을 둬요.
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleting, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        tabIndex={-1}
        aria-label="확인창 닫기"
        className="absolute inset-0 bg-black/60"
        onClick={() => !deleting && onCancel()}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="withdraw-title"
        aria-describedby="withdraw-desc"
        className={`relative w-full max-w-[448px] rounded-2xl p-5 ${styles.card}`}
      >
        <p id="withdraw-title" className="text-lg font-bold">
          정말 탈퇴할까요?
        </p>
        <p id="withdraw-desc" className="mt-2">
          모든 기록이 지워지고 되돌릴 수 없어요.
        </p>
        {error && (
          <p role="alert" className="mt-3 text-sm font-semibold text-[var(--namgim-error-text)] wrap-anywhere">
            {error}
          </p>
        )}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            ref={cancelRef}
            type="button"
            disabled={deleting}
            onClick={onCancel}
            className="min-h-14 rounded-2xl border border-[var(--namgim-navy)] font-semibold disabled:opacity-50"
          >
            취소
          </button>
          <Button loading={deleting} onClick={onConfirm} className="bg-[var(--namgim-error-ink)]! text-[var(--namgim-ivory)]!">
            탈퇴
          </Button>
        </div>
      </div>
    </div>
  );
}
