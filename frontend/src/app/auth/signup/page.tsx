"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage("회원가입에 실패했습니다. 다시 시도해주세요.");
      setIsError(true);
    } else {
      setMessage("인증 이메일이 발송되었습니다. 이메일을 확인해주세요!");
      setIsError(false);
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: "google" | "github") => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
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

        {/* Social buttons */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#161f33] py-3 text-sm font-medium text-[#a4abbf] transition hover:bg-[#1b263b]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuth("github")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#161f33] py-3 text-sm font-medium text-[#a4abbf] transition hover:bg-[#1b263b]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#414859]" />
          <span className="text-xs text-[#6e7588]">또는</span>
          <div className="h-px flex-1 bg-[#414859]" />
        </div>

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
              className="w-full rounded-lg bg-black px-4 py-3 text-sm text-[#dfe5fa] placeholder-[#6e7588] outline-none transition focus:ring-1 focus:ring-[#85adff]/40"
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
              className="w-full rounded-lg bg-black px-4 py-3 text-sm text-[#dfe5fa] placeholder-[#6e7588] outline-none transition focus:ring-1 focus:ring-[#85adff]/40"
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
              className="w-full rounded-lg bg-black px-4 py-3 text-sm text-[#dfe5fa] placeholder-[#6e7588] outline-none transition focus:ring-1 focus:ring-[#85adff]/40"
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
              className="w-full rounded-lg bg-black px-4 py-3 text-sm text-[#dfe5fa] placeholder-[#6e7588] outline-none transition focus:ring-1 focus:ring-[#85adff]/40"
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
            className="w-full rounded-lg py-3 text-sm font-semibold text-white transition disabled:opacity-50"
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
