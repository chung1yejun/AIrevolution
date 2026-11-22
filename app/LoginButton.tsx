"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { signInWithGoogle } from "@/lib/auth";

const LOGIN_ERROR = "로그인에 실패했어요. 다시 시도해 주세요";

/** 'Google 계정으로 시작하기' 버튼. 누르면 구글 로그인 화면으로 이동해요. */
export default function LoginButton({ initialError = false }: { initialError?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(initialError);

  async function handleClick() {
    setLoading(true);
    setFailed(false);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // 성공하면 브라우저가 구글 화면으로 넘어가요. 그동안 로딩을 유지해요.
    } catch {
      setFailed(true);
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3">
      {failed && (
        <p role="alert" className="text-center text-[14px] text-warn">
          {LOGIN_ERROR}
        </p>
      )}
      <Button className="text-[17px] font-bold" loading={loading} onClick={handleClick}>
        Google 계정으로 시작하기
      </Button>
    </div>
  );
}
