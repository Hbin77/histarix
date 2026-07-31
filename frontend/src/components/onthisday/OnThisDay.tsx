"use client";

import { useState } from "react";
import { useOnThisDay } from "@/hooks/useOnThisDay";
import { useI18n } from "@/lib/i18n";

export function OnThisDay() {
  const [isOpen, setIsOpen] = useState(true);
  const { events, loading, error } = useOnThisDay();
  const { t } = useI18n();

  return (
    <div className="fixed bottom-24 left-3 md:left-6 z-40 w-56 md:w-80">
      {/* Header - always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-t-xl bg-[var(--surface-container)]/90 px-4 py-3 backdrop-blur-[12px] ring-1 ring-[var(--outline-variant)]/60 transition hover:bg-[var(--surface-container-high)]"
      >
        <span className="text-sm font-semibold text-[var(--on-surface)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>{t("onThisDay")}</span>
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-[var(--on-surface-variant)] transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {/* Content */}
      <div
        className={`overflow-hidden rounded-b-xl bg-[var(--surface-container)]/90 backdrop-blur-[12px] transition-all duration-300 ${
          isOpen ? "max-h-80 ring-1 ring-[var(--outline-variant)]/60" : "max-h-0"
        }`}
      >
        <div className="max-h-72 overflow-y-auto px-4 py-3 space-y-3">
          {loading && (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-16 rounded bg-[var(--surface-container-high)]" />
                  <div className="h-3 w-full rounded bg-[var(--surface-container-high)]" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-xs text-[var(--error)]">{t("loadError")}</p>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-4">
              <p className="text-xs text-[var(--on-surface-variant)]">{t("loadingData")}</p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-md bg-[var(--primary)]/15 px-3 py-1.5 text-xs font-medium text-[var(--primary)] transition hover:bg-[var(--primary)]/25"
              >
                {t("retry")}
              </button>
            </div>
          )}

          {events.map((event, idx) => (
            <div key={idx} className="group">
              <div className="flex items-center gap-2">
                <span className="inline-block rounded bg-[var(--primary)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--primary)] tabular-nums">
                  {event.year}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[var(--on-surface-variant)] group-hover:text-[var(--on-surface)] transition">
                {event.text || event.title || ""}
              </p>
              {event.wikipedia_url && (
                <a
                  href={event.wikipedia_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-[var(--primary)] hover:text-[var(--primary-container)]"
                >
                  {t("readMore")}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
