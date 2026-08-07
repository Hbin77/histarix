"use client";

import Image from "next/image";
import Link from "next/link";
import { LangSelector } from "./LangSelector";
import { useI18n } from "@/lib/i18n";

interface HeaderProps {
  onOpenSearch: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
  const { t } = useI18n();
  return (
    <header className="ui-enter fixed top-3 left-1/2 z-50 flex w-[calc(100%-1.5rem)] max-w-3xl -translate-x-1/2 items-center justify-between gap-3 rounded-2xl bg-[var(--surface-container)]/85 px-3 py-2 backdrop-blur-xl ring-1 ring-[var(--outline-variant)]/70 shadow-[0_8px_24px_rgba(27,37,64,0.10)]">
      <Link href="/" className="flex min-h-11 items-center gap-2 pl-1">
        <Image src="/logo.png" alt="Histarix" width={26} height={26} className="[filter:saturate(1.5)_brightness(0.85)]" />
        <span className="hidden sm:inline text-lg font-bold tracking-tight text-[var(--on-surface)]" style={{ fontFamily: "var(--font-headline)" }}>
          Histar<span className="text-[var(--primary)]">ix</span>
        </span>
      </Link>

      <button
        onClick={onOpenSearch}
        className="group flex h-11 flex-1 max-w-sm items-center gap-2.5 rounded-xl bg-[var(--surface-container-high)]/70 px-4 text-sm text-[var(--on-surface-variant)] ring-1 ring-transparent transition hover:ring-[var(--outline-variant)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <span className="flex-1 truncate text-left">{t("search")}</span>
        <kbd className="hidden md:inline rounded-md bg-[var(--surface-container-low)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--on-surface-variant)] ring-1 ring-[var(--outline-variant)]">⌘K</kbd>
      </button>

      <LangSelector />
    </header>
  );
}
