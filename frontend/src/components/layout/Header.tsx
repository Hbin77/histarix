"use client";

import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "./SearchBar";
import { AuthButton } from "@/components/auth/AuthButton";
import { LangSelector } from "./LangSelector";

interface HeaderProps {
  onCountrySelect?: (country: { iso_code: string; name: string }) => void;
}

export function Header({ onCountrySelect }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between px-6 bg-[#1b263b]/60 backdrop-blur-[12px]">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.png" alt="Histarix" width={28} height={28} />
        <span className="text-xl font-bold tracking-tight text-[#dfe5fa]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Histar<span className="text-[#85adff]">ix</span>
        </span>
      </Link>

      <SearchBar onSelect={onCountrySelect} />

      <div className="flex items-center gap-3">
        <LangSelector />
        <AuthButton />
      </div>
    </header>
  );
}
