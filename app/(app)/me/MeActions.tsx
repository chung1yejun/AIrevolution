"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { signOut } from "@/lib/auth";
import WithdrawDialog from "./WithdrawDialog";

const DELETE_ERROR = "탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요.";

/** API 오류 응답({ error: { message } })에서 한국어 설명을 꺼내요. */
function errorMessage(body: unknown): string {
  if (typeof body === "object" && body !== null && "error" in body) {
    const { error } = body;
    if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
      return error.message;
    }
  }
  return DELETE_ERROR;
}

/** 로그아웃하고 첫 화면으로 가요. 로그아웃이 실패해도 첫 화면으로 보내요. */
async function signOutAndGoHome(router: ReturnType<typeof useRouter>) {
  await signOut().catch(() => null);
  router.replace("/");
  router.refresh();
}

export default function MeActions() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleSignOut() {
    setSigningOut(true);
    await signOutAndGoHome(router);
  }

  async function handleDelete() {
    setDeleteError("");
    setDeleting(true);
    try {
      const res = await fetch("/api/me", { method: "DELETE" });
      if (res.status === 401) {
        // 이미 로그인이 풀렸으면 첫 화면으로 보내요.
        await signOutAndGoHome(router);
        return;
      }
      const body: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setDeleteError(errorMessage(body));
        setDeleting(false);
        return;
      }
      await signOutAndGoHome(router);
    } catch {
      setDeleteError("인터넷 연결을 확인하고 다시 시도해 주세요.");
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="mt-6 flex flex-col gap-3">
        <Button variant="secondary" loading={signingOut} onClick={handleSignOut}>
          로그아웃
        </Button>
        <Button
          variant="ghost"
          className="text-[var(--namgim-error-text)]!"
          onClick={() => {
            setDeleteError("");
            setDialogOpen(true);
          }}
        >
          탈퇴하기
        </Button>
      </div>

      {dialogOpen && (
        <WithdrawDialog
          deleting={deleting}
          error={deleteError}
          onCancel={() => setDialogOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
