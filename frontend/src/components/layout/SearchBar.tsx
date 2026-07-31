"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { CountryBasic } from "@/types/country";
import { searchCountries } from "@/services/countryService";
import { useI18n } from "@/lib/i18n";

interface SearchBarProps {
  onSelect?: (country: { iso_code: string; name: string }) => void;
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const { t } = useI18n();
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
        placeholder={t("search")}
        className="w-32 sm:w-48 md:w-64 lg:w-80 rounded-full bg-[var(--surface-container)] px-5 py-2 text-sm text-[var(--on-surface)] placeholder-[var(--on-surface-variant)] outline-none transition ring-1 ring-[var(--outline-variant)] focus:ring-[var(--primary)]/60"
      />

      {loading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--outline-variant)] border-t-[var(--primary)]" />
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 min-w-[280px] w-full rounded-xl bg-[var(--surface-container-low)] backdrop-blur-xl border border-[var(--outline-variant)] shadow-[0_16px_40px_rgba(27,37,64,0.16)] overflow-hidden z-50">
          {results.map((country) => (
            <button
              key={country.iso_code}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[var(--on-surface)] hover:bg-[var(--surface-container-high)] transition"
              onClick={() => {
                setQuery(country.name);
                setIsOpen(false);
                onSelect?.({ iso_code: country.iso_code, name: country.name });
              }}
            >
              <span className="text-xs text-[var(--on-surface-variant)] font-mono">
                {country.iso_code}
              </span>
              <span>{country.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
