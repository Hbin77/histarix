"use client";

import type { CountryHistory as CountryHistoryType } from "@/types/history";
import { formatYear } from "@/components/timeline/TimeDisplay";
import { useI18n } from "@/lib/i18n";

interface CountryHistoryProps {
  history: CountryHistoryType | null;
}

type EraKey = "ancient" | "classical" | "medieval" | "earlyModern" | "modern" | "contemporary" | "other";

function getEraKey(year: number | undefined): EraKey {
  if (year === undefined) return "other";
  if (year < -500) return "ancient";
  if (year < 500) return "classical";
  if (year < 1500) return "medieval";
  if (year < 1800) return "earlyModern";
  if (year < 1945) return "modern";
  return "contemporary";
}

const ERA_COLORS: Record<EraKey, string> = {
  ancient: "#f59e0b",
  classical: "#ef4444",
  medieval: "#8b5cf6",
  earlyModern: "#06b6d4",
  modern: "#3b82f6",
  contemporary: "#10b981",
  other: "#6b7280",
};

export function CountryHistory({ history }: CountryHistoryProps) {
  const { t } = useI18n();

  if (!history) {
    return <p className="text-sm text-[#6e7588]">{t("loadingHistory")}</p>;
  }

  const events = history.events || [];
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#414859" strokeWidth="1.5" className="mb-4">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
        <p className="text-sm text-[#6e7588]">{t("noHistory")}</p>
        <p className="text-xs text-[#414859] mt-1">{t("comingSoon")}</p>
      </div>
    );
  }

  // Group by era
  const grouped = new Map<EraKey, typeof events>();
  for (const event of events) {
    const era = getEraKey(event.year);
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
              {t("viewOnWikipedia")}
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
              style={{ backgroundColor: ERA_COLORS[era] }}
            />
            <h4
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: ERA_COLORS[era] }}
            >
              {t(era)}
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
                    borderColor: ERA_COLORS[era],
                    backgroundColor: "#0b1323",
                  }}
                />

                {/* Year badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-block rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums"
                    style={{
                      backgroundColor: ERA_COLORS[era] + "20",
                      color: ERA_COLORS[era],
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
          {events.length} {t("totalEvents")}
        </p>
      </div>
    </div>
  );
}
