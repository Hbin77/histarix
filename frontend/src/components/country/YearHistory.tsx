"use client";

import type { Chronicle, ChronicleEvent } from "@/types/history";
import { useI18n } from "@/lib/i18n";
import { formatYear } from "@/lib/years";
import { EventItem } from "./EventItem";

interface YearHistoryProps {
  chronicle: Chronicle;
  year: number;
  onSelectYear: (year: number) => void;
}

const NEARBY = 3;

/** What happened on this land in the slider's year: eras, the year's events, the nearest ones. */
export function YearHistory({ chronicle, year, onSelectYear }: YearHistoryProps) {
  const { t, lang } = useI18n();
  const eras = chronicle.eras.filter((e) => e.from_year <= year && e.to_year >= year);
  const events = chronicle.events;
  const thisYear = events.filter((e) => e.year === year);
  const before = events.filter((e) => e.year < year).slice(-NEARBY).reverse();
  const after = events.filter((e) => e.year > year).slice(0, NEARBY);
  const prev = before[0];
  const next = after[0];

  return (
    <div className="space-y-7">
      <div className="flex items-center gap-2">
        <StepButton
          label={t("prevEvent")}
          disabled={!prev}
          onClick={() => prev && onSelectYear(prev.year)}
          d="M15 18l-6-6 6-6"
        />
        <h3
          className="flex-1 text-center text-2xl font-bold tracking-tight text-[var(--on-surface)] tabular-nums"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          {formatYear(year, lang)}
        </h3>
        <StepButton
          label={t("nextEvent")}
          disabled={!next}
          onClick={() => next && onSelectYear(next.year)}
          d="M9 18l6-6-6-6"
        />
      </div>

      <section aria-labelledby="era-heading" className="space-y-3">
        <SectionTitle id="era-heading">{t("thisLandIn")}</SectionTitle>
        {eras.map((era) => (
          <article
            key={`${era.from_year}-${era.name}`}
            className="rounded-xl bg-[var(--surface-container-low)] p-5 ring-1 ring-[var(--outline-variant)]/70"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-[var(--surface-container-highest)] px-2 py-0.5 text-[11px] font-semibold text-[var(--on-surface-variant)]">
                {t(`kind_${era.kind}`)}
              </span>
              <span className="text-[11px] tabular-nums text-[var(--on-surface-variant)]">
                {formatYear(era.from_year, lang)} – {formatYear(era.to_year, lang)}
              </span>
            </div>
            <h4 className="text-base font-bold leading-snug text-[var(--on-surface)]">{era.name}</h4>
            <p className="mt-2 text-sm leading-relaxed text-[var(--on-surface-variant)]">{era.summary}</p>
          </article>
        ))}
      </section>

      <section aria-labelledby="year-heading" className="space-y-3">
        <SectionTitle id="year-heading">{t("eventsThisYear")}</SectionTitle>
        {thisYear.length > 0 ? (
          thisYear.map((e) => <EventItem key={`${e.year}-${e.title}`} event={e} active onSelectYear={onSelectYear} />)
        ) : (
          <p className="text-sm text-[var(--on-surface-variant)]">{t("noEventsThisYear")}</p>
        )}
      </section>

      <EventList id="before-heading" title={t("earlierEvents")} events={before} onSelectYear={onSelectYear} />
      <EventList id="after-heading" title={t("laterEvents")} events={after} onSelectYear={onSelectYear} />
    </div>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h4 id={id} className="text-xs font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">
        {children}
      </h4>
      <div className="h-px flex-1 bg-[var(--outline-variant)]" />
    </div>
  );
}

function EventList({
  id,
  title,
  events,
  onSelectYear,
}: {
  id: string;
  title: string;
  events: ChronicleEvent[];
  onSelectYear: (year: number) => void;
}) {
  if (events.length === 0) return null;
  return (
    <section aria-labelledby={id} className="space-y-3">
      <SectionTitle id={id}>{title}</SectionTitle>
      {events.map((e) => (
        <EventItem key={`${e.year}-${e.title}`} event={e} onSelectYear={onSelectYear} />
      ))}
    </section>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  d,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  d: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--on-surface-variant)] ring-1 ring-[var(--outline-variant)] transition hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)] disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d={d} />
      </svg>
    </button>
  );
}
