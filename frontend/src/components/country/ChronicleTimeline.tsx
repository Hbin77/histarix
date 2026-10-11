"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Chronicle, ChronicleEra, ChronicleEvent } from "@/types/history";
import { useI18n } from "@/lib/i18n";
import { formatYear, MIN_YEAR } from "@/lib/years";
import { EventItem } from "./EventItem";

interface ChronicleTimelineProps {
  chronicle: Chronicle;
  year: number;
  onSelectYear: (year: number) => void;
}

/** Most specific era for a year: the latest-starting one that contains it. */
function eraIndexFor(year: number, eras: ChronicleEra[]): number {
  let best = 0;
  eras.forEach((era, i) => {
    if (era.from_year <= year && era.to_year >= year && era.from_year >= eras[best].from_year) best = i;
  });
  return best;
}

/** The whole chronicle as chapters (eras) holding their events. */
export function ChronicleTimeline({ chronicle, year, onSelectYear }: ChronicleTimelineProps) {
  const { t, lang } = useI18n();
  const currentRef = useRef<HTMLElement>(null);

  const chapters = useMemo(() => {
    const byEra: ChronicleEvent[][] = chronicle.eras.map(() => []);
    for (const e of chronicle.events) byEra[eraIndexFor(e.year, chronicle.eras)].push(e);
    return chronicle.eras.map((era, i) => ({ era, events: byEra[i] }));
  }, [chronicle]);
  const current = eraIndexFor(year, chronicle.eras);

  // open on the chapter the slider is in. Scroll only the panel's own
  // scroller (scrollIntoView would also shift the panel chrome), and after the
  // panel's reset-to-top on tab change, which runs after child effects.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = currentRef.current;
      const scroller = el?.closest<HTMLElement>("[data-panel-scroll]");
      if (!el || !scroller) return;
      const offset = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
      scroller.scrollTo({ top: scroller.scrollTop + offset - 16 });
    });
    return () => cancelAnimationFrame(id);
    // only when the tab opens — following the slider would yank the reader
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chronicle]);

  return (
    <ol className="space-y-8">
      {chapters.map(({ era, events }, i) => {
        const isCurrent = i === current;
        return (
          <li key={`${era.from_year}-${era.name}`}>
            <section ref={isCurrent ? currentRef : undefined} aria-current={isCurrent ? "true" : undefined}>
              <button
                type="button"
                onClick={() => onSelectYear(Math.max(era.from_year, MIN_YEAR))}
                className={`mb-3 block w-full min-h-11 rounded-xl px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[var(--primary)] ${
                  isCurrent
                    ? "bg-[var(--primary)]/8 ring-1 ring-[var(--primary)]/40"
                    : "hover:bg-[var(--surface-container-high)]"
                }`}
              >
                <span className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--on-surface-variant)]">
                  <span className="tabular-nums">
                    {formatYear(era.from_year, lang)} – {formatYear(era.to_year, lang)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{t(`kind_${era.kind}`)}</span>
                  {isCurrent && (
                    <span className="rounded-md bg-[var(--primary)]/12 px-2 py-0.5 font-semibold text-[var(--primary-container)]">
                      {t("currentEra")}
                    </span>
                  )}
                </span>
                <span
                  className="mt-1 block text-base font-bold leading-snug text-[var(--on-surface)]"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  {era.name}
                </span>
                <span className="mt-1.5 block text-xs leading-relaxed text-[var(--on-surface-variant)]">
                  {era.summary}
                </span>
                <span className="sr-only">{t("goToYear")}</span>
              </button>
              {events.length > 0 && (
                <div className="ml-4 space-y-3 border-l border-[var(--outline-variant)] pl-4">
                  {events.map((e, k) => (
                    <EventItem key={`${e.year}-${k}`} event={e} active={e.year === year} onSelectYear={onSelectYear} />
                  ))}
                </div>
              )}
            </section>
          </li>
        );
      })}
    </ol>
  );
}
