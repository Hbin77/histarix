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
    <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 md:h-20 items-center gap-3 md:gap-4 bg-[#070e1d]/80 px-3 md:px-6 backdrop-blur-[12px]">
      <button
        onClick={onTogglePlay}
        className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-[#85adff]/20 text-[#85adff] ring-1 ring-[#85adff]/30 transition hover:bg-[#85adff]/30"
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
        className="w-20 md:w-24 shrink-0 text-center text-base md:text-lg font-bold text-[#dfe5fa] tabular-nums"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      />

      <div className="flex flex-1 flex-col gap-1">
        <input
          type="range"
          min={-3000}
          max={2026}
          value={currentYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="w-full cursor-pointer accent-[#85adff]"
        />
        <div className="hidden md:flex justify-between text-[10px] text-[#6e7588]">
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
