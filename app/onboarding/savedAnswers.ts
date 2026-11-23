// 답변 수정: GET /api/home의 answers로 질문 화면을 채워요 (specs/screens.md 4장)
import type { HomeResponse } from "@/lib/types";
import type { Answers } from "./questions";

export type SavedAnswersResult =
  | { status: "ok"; answers: Answers }
  | { status: "logged-out" }
  | { status: "error" };

/** 저장된 답을 불러와요. 아직 답이 없으면 빈 답을 돌려줘요. */
export async function loadSavedAnswers(): Promise<SavedAnswersResult> {
  try {
    const res = await fetch("/api/home", { cache: "no-store" });
    if (res.status === 401) return { status: "logged-out" };
    if (!res.ok) return { status: "error" };
    const body = (await res.json()) as HomeResponse;
    return { status: "ok", answers: body.hasAnswers ? { ...body.answers } : {} };
  } catch {
    return { status: "error" };
  }
}
