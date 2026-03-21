"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { CountryBasic } from "@/types/country";
import { searchCountries } from "@/services/countryService";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CountryBasic[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    searchCountries(q)
      .then((data) => {
        setResults(data);
        setIsOpen(true);
      })
      .catch(() => {
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(value), 300);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="국가 검색..."
        className="w-80 rounded-full bg-[#11192b] px-5 py-2 text-sm text-[#dfe5fa] placeholder-[#a4abbf] outline-none transition focus:ring-1 focus:ring-[#85adff]/40"
      />

      {loading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#414859] border-t-[#85adff]" />
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full rounded-xl bg-[#0b1323] backdrop-blur-xl border border-[#414859]/30 shadow-2xl overflow-hidden z-50">
          {results.map((country) => (
            <button
              key={country.iso_code}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#dfe5fa] hover:bg-[#1b263b]/50 transition"
              onClick={() => {
                setQuery(country.name);
                setIsOpen(false);
              }}
            >
              <span className="text-xs text-[#6e7588] font-mono">
                {country.iso_code}
              </span>
              <span>{country.name_ko ?? country.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
