"use client";

import { SearchBar } from "./SearchBar";
import { AuthButton } from "@/components/auth/AuthButton";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between px-6 bg-[#1b263b]/60 backdrop-blur-[12px]">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-tight text-[#dfe5fa]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Histar<span className="text-[#85adff]">ix</span>
        </span>
      </div>

      <SearchBar />

      <AuthButton />
    </header>
  );
}
