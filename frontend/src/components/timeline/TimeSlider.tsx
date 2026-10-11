"use client";

import type { KeyboardEvent } from "react";
import { useI18n } from "@/lib/i18n";
import {
  MAX_YEAR,
  MIN_YEAR,
  TICK_YEARS,
  formatTick,
  formatYear,
  posToYear,
  stepYear,
  yearToPos,
} from "@/lib/years";
import { BORDERS_UNTIL } from "@/lib/borders";

interface TimeSliderProps {
  currentYear: number;
  isPlaying: boolean;
  onYearChange: (year: number) => void;
  onTogglePlay: () => void;
}

/** range input resolution; years come from the nonlinear scale in lib/years */
const STEPS = 2000;

export function TimeSlider({
  currentYear,
  isPlaying,
  onYearChange,
  onTogglePlay,
}: TimeSliderProps) {
  const { lang, t } = useI18n();
  const label = formatYear(currentYear, lang);

  // arrows move one year (shift: ten) instead of one nonlinear track step
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const dir =
      e.key === "ArrowRight" || e.key === "ArrowUp"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowDown"
          ? -1
          : 0;
    if (dir !== 0) {
      e.preventDefault();
      onYearChange(stepYear(currentYear, dir * (e.shiftKey ? 10 : 1)));
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      onYearChange(e.key === "Home" ? MIN_YEAR : MAX_YEAR);
    }
  };

  return (
    <div className="ui-enter fixed bottom-3 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-4xl -translate-x-1/2">
      {currentYear <= BORDERS_UNTIL && (
        <p className="mb-1 px-3 text-right text-[10px] text-[var(--on-surface-variant)]">
          {t("bordersSource")}{" "}
          <a
            href="https://seshat-db.com/cliopatria/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--outline)] underline-offset-2 hover:text-[var(--on-surface)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
          >
            Cliopatria (Seshat)
          </a>{" "}
          ·{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--outline)] underline-offset-2 hover:text-[var(--on-surface)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
          >
            CC BY 4.0
          </a>
        </p>
      )}
      <div className="flex h-14 md:h-16 items-center gap-3 md:gap-4 rounded-2xl bg-[var(--surface-container)]/85 px-2 md:px-5 backdrop-blur-xl ring-1 ring-[var(--outline-variant)]/70 shadow-[0_8px_24px_rgba(27,37,64,0.10)]">
        <button
          onClick={onTogglePlay}
          aria-label={t(isPlaying ? "pause" : "play")}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] ring-1 ring-[var(--primary)]/30 transition hover:bg-[var(--primary)]/20 focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <rect x="3" y="2" width="4" height="12" rx="1" />
              <rect x="9" y="2" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M4 2l10 6-10 6V2z" />
            </svg>
          )}
        </button>

        <output
          aria-live="off"
          className="min-w-[5.5rem] md:min-w-[7.5rem] shrink-0 text-center text-base md:text-lg font-bold text-[var(--on-surface)] tabular-nums whitespace-nowrap"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          {label}
        </output>

        <div className="flex flex-1 flex-col gap-1">
          <input
            type="range"
            min={0}
            max={STEPS}
            value={Math.round(yearToPos(currentYear) * STEPS)}
            onChange={(e) => onYearChange(posToYear(Number(e.target.value) / STEPS))}
            onKeyDown={onKeyDown}
            aria-label={t("timeSlider")}
            aria-valuetext={label}
            className="h-11 w-full cursor-pointer accent-[var(--primary)] [&::-moz-range-track]:bg-[var(--outline-variant)] [&::-moz-range-progress]:bg-[var(--primary)] [&::-moz-range-thumb]:bg-[var(--primary)]"
          />
          <div aria-hidden="true" className="relative hidden h-3 md:block text-[10px] text-[var(--on-surface-variant)]">
            {TICK_YEARS.map((y, i) => (
              <span
                key={y}
                className="absolute top-0 whitespace-nowrap tabular-nums"
                style={{
                  left: `${yearToPos(y) * 100}%`,
                  transform:
                    i === 0 ? "none" : i === TICK_YEARS.length - 1 ? "translateX(-100%)" : "translateX(-50%)",
                }}
              >
                {formatTick(y, lang)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
