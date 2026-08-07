"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CountryBasic } from "@/types/country";
import { searchCountries } from "@/services/countryService";
import { useI18n } from "@/lib/i18n";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelect: (country: { iso_code: string; name: string }) => void;
}

const RECENT_KEY = "histarix_recent";

function readRecent(): CountryBasic[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? (JSON.parse(raw) as CountryBasic[]) : [];
    return Array.isArray(list) ? list.slice(0, 5) : [];
  } catch {
    return [];
  }
}

function pushRecent(country: CountryBasic): void {
  try {
    const list = [country, ...readRecent().filter((c) => c.iso_code !== country.iso_code)];
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5)));
  } catch {
    /* private mode */
  }
}

/**
 * Full-screen command-palette search (⌘K). Keyboard navigable, shows recent
 * selections when the query is empty.
 */
export function CommandPalette({ open, onClose, onSelect }: CommandPaletteProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CountryBasic[]>([]);
  const [recent, setRecent] = useState<CountryBasic[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    setActive(0);
    setRecent(readRecent());
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  const runSearch = useCallback((q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timerRef.current = setTimeout(() => {
      searchCountries(q)
        .then((data) => {
          setResults(data);
          setActive(0);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 220);
  }, []);

  const items = query.trim().length >= 2 ? results : recent;

  const choose = useCallback(
    (country: CountryBasic) => {
      pushRecent(country);
      onSelect({ iso_code: country.iso_code, name: country.name });
      onClose();
    },
    [onClose, onSelect]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter" && items[active]) {
        choose(items[active]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, active, choose, onClose]);

  if (!open) return null;

  return (
    <div
      className="palette-overlay fixed inset-0 z-[90] flex items-start justify-center bg-[var(--on-surface)]/25 backdrop-blur-sm px-4 pt-[14vh]"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={t("search")}
    >
      <div className="palette-panel w-full max-w-xl overflow-hidden rounded-2xl bg-[var(--surface-container-low)] shadow-[0_24px_64px_rgba(27,37,64,0.28)] ring-1 ring-[var(--outline-variant)]">
        <div className="flex items-center gap-3 border-b border-[var(--outline-variant)] px-5 py-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--on-surface-variant)" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              runSearch(e.target.value);
            }}
            placeholder={t("search")}
            className="min-w-0 flex-1 bg-transparent text-base text-[var(--on-surface)] placeholder-[var(--on-surface-variant)] outline-none"
          />
          <kbd className="rounded-md bg-[var(--surface-container-high)] px-2 py-1 text-[10px] font-medium text-[var(--on-surface-variant)]">ESC</kbd>
        </div>

        <div className="max-h-[46vh] overflow-y-auto p-2">
          {items.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-[var(--on-surface-variant)]">
              {loading
                ? t("loadingData")
                : query.trim().length >= 2
                  ? t("noInfo")
                  : t("searchHint")}
            </p>
          )}
          {items.length > 0 && query.trim().length < 2 && (
            <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--on-surface-variant)]">
              {t("recent")}
            </p>
          )}
          {items.map((c, i) => (
            <button
              key={c.iso_code}
              onClick={() => choose(c)}
              onMouseEnter={() => setActive(i)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                i === active
                  ? "bg-[var(--surface-container-high)]"
                  : "hover:bg-[var(--surface-container-high)]/60"
              }`}
            >
              <span className="text-xl" aria-hidden="true">{c.flag}</span>
              <span className="flex-1 truncate text-sm font-medium text-[var(--on-surface)]">
                {c.name}
              </span>
              <span className="text-xs text-[var(--on-surface-variant)]">{c.region}</span>
              {i === active && (
                <kbd className="rounded bg-[var(--surface-container-highest)] px-1.5 py-0.5 text-[10px] text-[var(--on-surface-variant)]">↵</kbd>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
