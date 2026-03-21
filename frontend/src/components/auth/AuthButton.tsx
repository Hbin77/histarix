"use client";
import { useEffect, useState } from "react";
import { getToken, logout } from "@/lib/auth";
import Link from "next/link";

export function AuthButton() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!getToken());
  }, []);

  if (loggedIn) {
    return (
      <button
        onClick={logout}
        className="rounded-lg px-4 py-1.5 text-sm text-[#a4abbf] transition hover:text-[#dfe5fa]"
      >
        로그아웃
      </button>
    );
  }

  return (
    <Link
      href="/auth/login"
      className="rounded-lg px-4 py-1.5 text-sm text-[#85adff] transition hover:text-[#dfe5fa]"
    >
      로그인
    </Link>
  );
}
