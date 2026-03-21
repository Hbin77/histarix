"use client";

import type { HistoricalEvent } from "@/types/history";
import { formatYear } from "@/components/timeline/TimeDisplay";

interface HistoryTimelineProps {
  events: HistoricalEvent[];
}

function getTimelineColor(year: number | undefined): string {
  if (year === undefined) return "#6b7280";
  if (year < 0) return "#f59e0b";
  if (year < 500) return "#ef4444";
  if (year < 1500) return "#8b5cf6";
  if (year < 1800) return "#06b6d4";
  if (year < 1945) return "#3b82f6";
  return "#10b981";
}

export function HistoryTimeline({ events }: HistoryTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#414859" strokeWidth="1.5" className="mb-4">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
        <p className="text-sm text-[#6e7588]">타임라인 데이터가 없습니다.</p>
      </div>
    );
  }

  const sorted = [...events].sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
  const minYear = sorted[0]?.year ?? 0;
  const maxYear = sorted[sorted.length - 1]?.year ?? 2024;
  const range = Math.max(maxYear - minYear, 1);

  return (
    <div className="space-y-6">
      {/* Visual range bar */}
      <div className="rounded-lg bg-[#161f33]/50 p-4">
        <div className="flex justify-between text-[10px] text-[#6e7588] mb-2">
          <span>{minYear < 0 ? `BC ${Math.abs(minYear)}` : minYear}</span>
          <span>{maxYear}</span>
        </div>
        <div className="relative h-3 rounded-full bg-[#0b1323] overflow-hidden">
          {sorted.map((event, i) => {
            const pos = (((event.year ?? 0) - minYear) / range) * 100;
            const color = getTimelineColor(event.year);
            return (
              <div
                key={i}
                className="absolute top-0 h-full w-1 rounded-full"
                style={{ left: `${pos}%`, backgroundColor: color }}
                title={`${event.year}: ${event.title || event.label}`}
              />
            );
          })}
        </div>
      </div>

      {/* Timeline list */}
      <div className="relative">
        {sorted.map((event, idx) => {
          const color = getTimelineColor(event.year);
          return (
            <div key={idx} className="flex gap-4 mb-6 last:mb-0">
              {/* Year column */}
              <div className="w-20 shrink-0 text-right">
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color }}
                >
                  {event.year != null ? formatYear(event.year) : ""}
                </span>
              </div>

              {/* Dot + line */}
              <div className="flex flex-col items-center">
                <div
                  className="h-4 w-4 rounded-full border-2 shrink-0"
                  style={{ borderColor: color, backgroundColor: color + "30" }}
                />
                {idx < sorted.length - 1 && (
                  <div className="w-px flex-1 bg-[#1b263b] min-h-[24px]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <h5 className="text-sm font-semibold text-[#dfe5fa]">
                  {event.title || event.label}
                </h5>
                {event.description && (
                  <p className="mt-1 text-xs text-[#a4abbf] leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
