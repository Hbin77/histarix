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
          📅 오늘의 역사
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
            <p className="text-xs text-[#a4abbf]">오늘의 역사 이벤트가 없습니다.</p>
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
