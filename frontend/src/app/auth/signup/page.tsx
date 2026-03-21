"use client";

import { useState } from "react";
import { signup } from "@/lib/auth";

function getPasswordStrength(password: string): { level: "weak" | "medium" | "strong"; width: string; color: string } {
  if (password.length === 0) return { level: "weak", width: "0%", color: "#ff716c" };
  if (password.length < 6) return { level: "weak", width: "33%", color: "#ff716c" };
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  if (password.length >= 8 && score >= 3) return { level: "strong", width: "100%", color: "#34d399" };
  if (password.length >= 6 && score >= 2) return { level: "medium", width: "66%", color: "#fbbf24" };
  return { level: "weak", width: "33%", color: "#ff716c" };
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("비밀번호가 일치하지 않습니다.");
      setIsError(true);
      return;
    }
    if (password.length < 8) {
      setMessage("비밀번호는 8자 이상이어야 합니다.");
      setIsError(true);
      return;
    }
    if (!agreeTerms) {
      setMessage("이용약관에 동의해주세요.");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      await signup(name, email, password);
      window.location.href = "/";
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "회원가입에 실패했습니다");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, #11192b 0%, #070e1d 70%)",
      }}
    >
      <div className="w-full max-w-[480px] rounded-2xl bg-[#0b1323]/95 p-10 backdrop-blur-xl">
        {/* Logo */}
        <h1
          className="mb-1 text-center text-3xl font-bold text-[#dfe5fa]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Histar<span className="text-[#85adff]">ix</span>
        </h1>
        <p className="mb-8 text-center text-sm text-[#a4abbf]">
          역사 탐험을 시작하세요
        </p>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-[#a4abbf]">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              required
              className="w-full rounded-lg bg-[#070e1d] px-4 py-3 text-sm text-[#dfe5fa] placeholder-[#6e7588] outline-none transition focus:ring-1 focus:ring-[#85adff]/40"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-[#a4abbf]">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="w-full rounded-lg bg-[#070e1d] px-4 py-3 text-sm text-[#dfe5fa] placeholder-[#6e7588] outline-none transition focus:ring-1 focus:ring-[#85adff]/40"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-[#a4abbf]">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상, 대소문자 + 숫자 + 특수문자"
              required
              className="w-full rounded-lg bg-[#070e1d] px-4 py-3 text-sm text-[#dfe5fa] placeholder-[#6e7588] outline-none transition focus:ring-1 focus:ring-[#85adff]/40"
            />
            {password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1 flex-1 rounded-full bg-[#161f33] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: strength.width, backgroundColor: strength.color }}
                  />
                </div>
                <span className="text-[10px]" style={{ color: strength.color }}>
                  {strength.level === "weak" ? "약함" : strength.level === "medium" ? "보통" : "강함"}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-[#a4abbf]">비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력해주세요"
              required
              className="w-full rounded-lg bg-[#070e1d] px-4 py-3 text-sm text-[#dfe5fa] placeholder-[#6e7588] outline-none transition focus:ring-1 focus:ring-[#85adff]/40"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="h-4 w-4 rounded accent-[#85adff]"
            />
            <span className="text-xs text-[#a4abbf]">
              <a href="#" className="text-[#85adff] hover:underline">이용약관</a> 및{" "}
              <a href="#" className="text-[#85adff] hover:underline">개인정보처리방침</a>에 동의합니다
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-3 text-sm font-semibold text-[#dfe5fa] transition disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #85adff, #6e9fff)" }}
          >
            {loading ? "처리 중..." : "회원가입"}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center text-sm ${isError ? "text-[#ff716c]" : "text-[#85adff]"}`}>
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-[#a4abbf]">
          이미 계정이 있으신가요?{" "}
          <a href="/auth/login" className="text-[#85adff] hover:text-[#6e9fff] transition">
            로그인
          </a>
        </p>
      </div>
    </div>
  );
}
