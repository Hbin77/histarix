"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("인증 토큰이 없습니다");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/auth/verify?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "이메일 인증이 완료되었습니다");
        } else {
          setStatus("error");
          setMessage(data.detail || "인증에 실패했습니다");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("인증 중 오류가 발생했습니다");
      });
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070e1d]">
      <div className="w-full max-w-[400px] rounded-2xl bg-[#0b1323]/95 p-10 text-center backdrop-blur-xl">
        <h1 className="mb-2 text-2xl font-bold text-[#dfe5fa]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Histar<span className="text-[#85adff]">ix</span>
        </h1>

        {status === "loading" && (
          <p className="mt-6 text-[#a4abbf]">이메일 인증 중...</p>
        )}

        {status === "success" && (
          <>
            <div className="mt-6 text-4xl">✅</div>
            <p className="mt-4 text-[#dfe5fa]">{message}</p>
            <Link
              href="/auth/login"
              className="mt-6 inline-block rounded-lg px-6 py-3 text-sm font-semibold text-[#dfe5fa]"
              style={{ background: "linear-gradient(135deg, #85adff, #6e9fff)" }}
            >
              로그인하기
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mt-6 text-4xl">❌</div>
            <p className="mt-4 text-[#ff716c]">{message}</p>
            <Link href="/" className="mt-6 inline-block text-sm text-[#85adff] hover:underline">
              홈으로 돌아가기
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
