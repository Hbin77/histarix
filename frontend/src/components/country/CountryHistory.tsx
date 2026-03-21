"use client";

import type { CountryHistory as CountryHistoryType } from "@/types/history";
import { formatYear } from "@/components/timeline/TimeDisplay";

interface CountryHistoryProps {
  history: CountryHistoryType | null;
}

function getEra(year: number | undefined): string {
  if (year === undefined) return "기타";
  if (year < -500) return "고대";
  if (year < 500) return "고전기";
  if (year < 1500) return "중세";
  if (year < 1800) return "근세";
  if (year < 1945) return "근대";
  return "현대";
}

function getEraColor(era: string): string {
  const colors: Record<string, string> = {
    "고대": "#f59e0b",
    "고전기": "#ef4444",
    "중세": "#8b5cf6",
    "근세": "#06b6d4",
    "근대": "#3b82f6",
    "현대": "#10b981",
    "기타": "#6b7280",
  };
  return colors[era] || "#6b7280";
}

export function CountryHistory({ history }: CountryHistoryProps) {
  if (!history) {
    return <p className="text-sm text-[#6e7588]">역사 데이터를 불러오는 중...</p>;
  }

  const events = history.events || [];
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#414859" strokeWidth="1.5" className="mb-4">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
        <p className="text-sm text-[#6e7588]">이 국가의 역사 데이터가 아직 없습니다.</p>
        <p className="text-xs text-[#414859] mt-1">곧 업데이트될 예정입니다.</p>
      </div>
    );
  }

  // Group by era
  const grouped = new Map<string, typeof events>();
  for (const event of events) {
    const era = getEra(event.year);
    if (!grouped.has(era)) grouped.set(era, []);
    grouped.get(era)!.push(event);
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      {history.summary && (
        <div className="rounded-xl bg-gradient-to-br from-[#161f33] to-[#0b1323] p-5">
          <p className="text-sm leading-relaxed text-[#a4abbf]">{history.summary}</p>
          {history.wikipedia_url && (
            <a
              href={history.wikipedia_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-xs text-[#85adff] hover:underline"
            >
              Wikipedia에서 더 보기 →
            </a>
          )}
        </div>
      )}

      {/* Era sections */}
      {Array.from(grouped.entries()).map(([era, eraEvents]) => (
        <div key={era}>
          {/* Era header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: getEraColor(era) }}
            />
            <h4
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: getEraColor(era) }}
            >
              {era}
            </h4>
            <div className="flex-1 h-px bg-[#1b263b]" />
          </div>

          {/* Events */}
          <div className="relative ml-1 border-l border-[#1b263b] pl-6 space-y-4">
            {eraEvents.map((event, idx) => (
              <div
                key={idx}
                className="group relative rounded-lg bg-[#161f33]/50 p-4 transition-all duration-200 hover:bg-[#1b263b] hover:scale-[1.01] hover:shadow-lg hover:shadow-black/20"
              >
                {/* Timeline dot */}
                <div
                  className="absolute -left-[29px] top-5 h-3 w-3 rounded-full border-2"
                  style={{
                    borderColor: getEraColor(era),
                    backgroundColor: "#0b1323",
                  }}
                />

                {/* Year badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-block rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums"
                    style={{
                      backgroundColor: getEraColor(era) + "20",
                      color: getEraColor(era),
                    }}
                  >
                    {event.year != null ? formatYear(event.year) : event.date || ""}
                  </span>
                  {event.category && (
                    <span className="text-[10px] text-[#6e7588]">{event.category}</span>
                  )}
                </div>

                {/* Title */}
                <h5 className="text-sm font-semibold text-[#dfe5fa] leading-snug">
                  {event.title || event.label}
                </h5>

                {/* Description */}
                {event.description && (
                  <p className="mt-1.5 text-xs leading-relaxed text-[#a4abbf] group-hover:text-[#dfe5fa]/80 transition-colors">
                    {event.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className="text-center pt-4">
        <p className="text-[10px] text-[#414859]">
          총 {events.length}개의 역사적 사건
        </p>
      </div>
    </div>
  );
}
