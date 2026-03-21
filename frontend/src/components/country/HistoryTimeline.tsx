"use client";

import type { HistoricalEvent } from "@/types/history";
import { formatYear } from "@/components/timeline/TimeDisplay";

interface HistoryTimelineProps {
  events: HistoricalEvent[];
}

export function HistoryTimeline({ events }: HistoryTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-[#6e7588]">
        타임라인에 표시할 사건이 없습니다.
      </p>
    );
  }

  const sorted = [...events].sort((a, b) => (a.year ?? 0) - (b.year ?? 0));

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-2 top-0 bottom-0 w-px bg-[#85adff]/15" />

      <div className="space-y-6">
        {sorted.map((event, idx) => (
          <div key={idx} className="relative">
            {/* Dot */}
            <div className="absolute -left-[18px] top-1 h-3 w-3 rounded-full border-2 border-[#85adff]/40 bg-[#0b1323]" />

            {/* Card */}
            <div className="rounded-lg bg-[#1b263b]/30 p-4 transition hover:bg-white/8">
              <span className="text-xs font-bold text-[#85adff] tabular-nums">
                {event.year != null ? formatYear(event.year) : event.date ?? ""}
              </span>
              <h5 className="mt-1 text-sm font-medium text-[#dfe5fa]">
                {event.title}
              </h5>
              <p className="mt-1 text-xs leading-relaxed text-[#a4abbf]">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
