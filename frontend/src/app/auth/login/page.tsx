"use client";

import { useState } from "react";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await login(email, password);
      window.location.href = "/";
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "로그인에 실패했습니다");
    } finally {
      setLoading(false);
    }
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
            className="w-full rounded-lg bg-[#070e1d] px-4 py-3 text-sm text-[#dfe5fa] placeholder-[#6e7588] outline-none transition focus:ring-1 focus:ring-[#85adff]/40"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
            className="w-full rounded-lg bg-[#070e1d] px-4 py-3 text-sm text-[#dfe5fa] placeholder-[#6e7588] outline-none transition focus:ring-1 focus:ring-[#85adff]/40"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-3 text-sm font-medium text-[#dfe5fa] transition disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #85adff, #6e9fff)' }}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-[#ff716c]">{message}</p>
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
