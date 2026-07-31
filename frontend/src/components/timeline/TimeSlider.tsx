"use client";

import { TimeDisplay } from "./TimeDisplay";

interface TimeSliderProps {
  currentYear: number;
  isPlaying: boolean;
  onYearChange: (year: number) => void;
  onTogglePlay: () => void;
}

export function TimeSlider({
  currentYear,
  isPlaying,
  onYearChange,
  onTogglePlay,
}: TimeSliderProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 md:h-20 items-center gap-3 md:gap-4 bg-[var(--surface-container)]/85 px-3 md:px-6 backdrop-blur-[12px] ring-1 ring-[var(--outline-variant)]/60">
      <button
        onClick={onTogglePlay}
        className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] ring-1 ring-[var(--primary)]/30 transition hover:bg-[var(--primary)]/20"
      >
        {isPlaying ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <rect x="3" y="2" width="4" height="12" rx="1" />
            <rect x="9" y="2" width="4" height="12" rx="1" />
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M4 2l10 6-10 6V2z" />
          </svg>
        )}
      </button>

      <TimeDisplay
        year={currentYear}
        className="w-20 md:w-24 shrink-0 text-center text-base md:text-lg font-bold text-[var(--on-surface)] tabular-nums"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      />

      <div className="flex flex-1 flex-col gap-1">
        <input
          type="range"
          min={-3000}
          max={2026}
          value={currentYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="w-full cursor-pointer accent-[var(--primary)] [&::-moz-range-track]:bg-[var(--outline-variant)] [&::-moz-range-progress]:bg-[var(--primary)] [&::-moz-range-thumb]:bg-[var(--primary)]"
        />
        <div className="hidden md:flex justify-between text-[10px] text-[var(--on-surface-variant)]">
          <span>3000 BC</span>
          <span>2000 BC</span>
          <span>1000 BC</span>
          <span>0</span>
          <span>1000</span>
          <span>2000</span>
        </div>
      </div>
    </div>
  );
}
