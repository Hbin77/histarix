"use client";

import type { CountryHistory as CountryHistoryType } from "@/types/history";
import { formatYear } from "@/components/timeline/TimeDisplay";

interface CountryHistoryProps {
  history: CountryHistoryType | null;
}

export function CountryHistory({ history }: CountryHistoryProps) {
  if (!history) {
    return (
      <p className="text-sm text-white/40">역사 정보를 불러올 수 없습니다.</p>
    );
  }

  return (
    <div className="space-y-5">
      {history.summary && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white/60">개요</h4>
          <p className="text-sm leading-relaxed text-white/70">
            {history.summary}
          </p>
          {history.wikipedia_url && (
            <a
              href={history.wikipedia_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs text-blue-400 hover:underline"
            >
              Wikipedia에서 더 보기 →
            </a>
          )}
        </div>
      )}

      {history.events.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white/60">주요 사건</h4>
          {history.events.map((event, idx) => (
            <div
              key={idx}
              className="rounded-lg bg-white/5 p-4 transition hover:bg-white/8"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block rounded bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400 tabular-nums">
                  {formatYear(event.year)}
                </span>
                {event.category && (
                  <span className="text-xs text-white/30">
                    {event.category}
                  </span>
                )}
              </div>
              <h5 className="text-sm font-medium text-white/90">
                {event.title}
              </h5>
              <p className="mt-1 text-xs leading-relaxed text-white/50">
                {event.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {history.events.length === 0 && !history.summary && (
        <p className="text-sm text-white/40">
          이 국가에 대한 역사 정보가 없습니다.
        </p>
      )}
    </div>
  );
}
