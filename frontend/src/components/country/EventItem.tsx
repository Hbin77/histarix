"use client";

import type { ChronicleEvent } from "@/types/history";
import { useI18n } from "@/lib/i18n";
import { formatYear } from "@/lib/years";

interface EventItemProps {
  event: ChronicleEvent;
  /** the slider is on this event's year */
  active?: boolean;
  onSelectYear: (year: number) => void;
}

/** One chronicle event; activating it moves the time slider to its year. */
export function EventItem({ event, active = false, onSelectYear }: EventItemProps) {
  const { t, lang } = useI18n();
  const year = formatYear(event.year, lang);
  return (
    <button
      type="button"
      onClick={() => onSelectYear(event.year)}
      aria-current={active ? "true" : undefined}
      className={`group block w-full min-h-11 rounded-xl p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[var(--primary)] ${
        active
          ? "bg-[var(--primary)]/8 ring-1 ring-[var(--primary)]/40"
          : "bg-[var(--surface-container-high)]/50 hover:bg-[var(--surface-container-highest)]"
      }`}
    >
      <span className="mb-1.5 flex items-center gap-2">
        <span
          className={`rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums ${
            active || event.importance === 1
              ? "bg-[var(--primary)]/12 text-[var(--primary-container)]"
              : "bg-[var(--surface-container-highest)] text-[var(--on-surface-variant)]"
          }`}
        >
          {year}
        </span>
        <span className="text-[11px] text-[var(--on-surface-variant)]">{t(`cat_${event.category}`)}</span>
      </span>
      <span
        className={`block text-sm leading-snug text-[var(--on-surface)] ${
          event.importance === 1 ? "font-bold" : "font-semibold"
        }`}
      >
        {event.title}
      </span>
      <span className="mt-1.5 block text-xs leading-relaxed text-[var(--on-surface-variant)]">
        {event.description}
      </span>
      <span className="sr-only">{t("goToYear")}</span>
    </button>
  );
}
