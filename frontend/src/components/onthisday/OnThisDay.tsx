"use client";

import { useState } from "react";
import { useOnThisDay } from "@/hooks/useOnThisDay";

export function OnThisDay() {
  const [isOpen, setIsOpen] = useState(true);
  const { events, loading, error } = useOnThisDay();

  return (
    <div className="fixed bottom-24 left-6 z-40 w-80">
      {/* Header - always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-t-xl bg-[#11192b]/90 px-4 py-3 backdrop-blur-[12px] transition hover:bg-[#161f33]"
      >
        <span className="text-sm font-semibold text-[#dfe5fa]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>오늘의 역사</span>
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-[#a4abbf] transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {/* Content */}
      <div
        className={`overflow-hidden rounded-b-xl bg-[#11192b]/90 backdrop-blur-[12px] transition-all duration-300 ${
          isOpen ? "max-h-80" : "max-h-0"
        }`}
      >
        <div className="max-h-72 overflow-y-auto px-4 py-3 space-y-3">
          {loading && (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-16 rounded bg-[#161f33]" />
                  <div className="h-3 w-full rounded bg-[#161f33]" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-xs text-[#ff716c]">데이터를 불러올 수 없습니다.</p>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-4">
              <p className="text-xs text-[#a4abbf]">오늘의 역사 데이터를 불러오는 중...</p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-md bg-[#85adff]/15 px-3 py-1.5 text-xs font-medium text-[#85adff] transition hover:bg-[#85adff]/25"
              >
                다시 시도
              </button>
            </div>
          )}

          {events.map((event, idx) => (
            <div key={idx} className="group">
              <div className="flex items-center gap-2">
                <span className="inline-block rounded bg-[#85adff]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#85adff] tabular-nums">
                  {event.year}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[#a4abbf] group-hover:text-[#dfe5fa] transition">
                {event.title}
              </p>
              {event.wikipedia_url && (
                <a
                  href={event.wikipedia_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-[#85adff]/60 hover:text-[#85adff]"
                >
                  더 보기
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
