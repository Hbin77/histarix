"use client";
import { useEffect, useState } from "react";
import { getToken, logout } from "@/lib/auth";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export function AuthButton() {
  const [loggedIn, setLoggedIn] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    setLoggedIn(!!getToken());
  }, []);

  if (loggedIn) {
    return (
      <button
        onClick={logout}
        className="rounded-lg px-4 py-1.5 text-sm text-[#a4abbf] transition hover:text-[#dfe5fa]"
      >
        {t("logout")}
      </button>
    );
  }

  return (
    <Link
      href="/auth/login"
      className="rounded-lg px-4 py-1.5 text-sm text-[#85adff] transition hover:text-[#dfe5fa]"
    >
      {t("login")}
    </Link>
  );
}
