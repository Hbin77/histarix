"use client";

import type { HistoricalEvent } from "@/types/history";
import { formatYear } from "@/components/timeline/TimeDisplay";

interface HistoryTimelineProps {
  events: HistoricalEvent[];
}

export function HistoryTimeline({ events }: HistoryTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-white/40">
        타임라인에 표시할 사건이 없습니다.
      </p>
    );
  }

  const sorted = [...events].sort((a, b) => a.year - b.year);

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-2 top-0 bottom-0 w-px bg-blue-500/20" />

      <div className="space-y-6">
        {sorted.map((event, idx) => (
          <div key={idx} className="relative">
            {/* Dot */}
            <div className="absolute -left-[18px] top-1 h-3 w-3 rounded-full border-2 border-blue-400 bg-gray-900" />

            {/* Card */}
            <div className="rounded-lg bg-white/5 p-4 transition hover:bg-white/8">
              <span className="text-xs font-bold text-blue-400 tabular-nums">
                {formatYear(event.year)}
              </span>
              <h5 className="mt-1 text-sm font-medium text-white/90">
                {event.title}
              </h5>
              <p className="mt-1 text-xs leading-relaxed text-white/50">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
