"use client";

import { SearchBar } from "./SearchBar";
import { AuthButton } from "@/components/auth/AuthButton";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between px-6 bg-black/40 backdrop-blur-lg border-b border-white/5">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Histarix
        </span>
      </div>

      <SearchBar />

      <AuthButton />
    </header>
  );
}
