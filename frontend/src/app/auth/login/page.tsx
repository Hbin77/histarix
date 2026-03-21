"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("이메일을 확인해주세요!");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070e1d] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#0b1323]/95 p-8 backdrop-blur-xl">
        <h1 className="mb-2 text-center text-2xl font-bold text-[#dfe5fa]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Histar<span className="text-[#85adff]">ix</span>
        </h1>
        <p className="mb-8 text-center text-sm text-[#a4abbf]">
          역사를 탐험하세요
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소"
            required
            className="w-full rounded-lg bg-black px-4 py-3 text-sm text-[#dfe5fa] placeholder-[#6e7588] outline-none transition focus:ring-1 focus:ring-[#85adff]/40"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-3 text-sm font-medium text-white transition disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #85adff, #6e9fff)' }}
          >
            {loading ? "전송 중..." : "매직 링크 전송"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#414859]" />
          <span className="text-xs text-[#6e7588]">또는</span>
          <div className="h-px flex-1 bg-[#414859]" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#161f33] py-3 text-sm font-medium text-[#a4abbf] transition hover:bg-[#1b263b]"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
          Google로 로그인
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-[#85adff]">{message}</p>
        )}

        <div className="mt-6 text-center space-y-2">
          <a
            href="/auth/signup"
            className="block text-sm text-[#85adff] hover:text-[#6e9fff] transition"
          >
            회원가입
          </a>
          <a
            href="/"
            className="block text-xs text-[#6e7588] hover:text-[#a4abbf] transition"
          >
            ← 지도로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}
