"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** 첫 화면 오른쪽 위 메뉴 버튼(햄버거). 누르면 메뉴 목록이 열려요. */
export default function LandingMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lp-menu">
      <button
        type="button"
        className="lp-menu-button"
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={open}
        aria-controls="lp-menu-list"
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <>
          {/* 바깥을 누르면 닫혀요 */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            className="lp-menu-backdrop"
            onClick={() => setOpen(false)}
          />
          <ul id="lp-menu-list" className="lp-menu-list">
            <li>
              <Link
                href="/partner"
                className="lp-menu-item"
                onClick={() => setOpen(false)}
              >
                파트너용 화면
              </Link>
            </li>
          </ul>
        </>
      )}
    </div>
  );
}
