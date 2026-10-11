// Time-slider year scale and localized year formatting.
//
// The slider is piecewise linear: each quarter of the track covers a span of
// history, so recent centuries (dense with events and border changes) get as
// much room as the first two and a half millennia.

import type { Lang } from "@/lib/i18n";

export const MIN_YEAR = -3000;
export const MAX_YEAR = 2026;

/** [year, track position 0..1] knots, ascending in both */
const KNOTS: [number, number][] = [
  [MIN_YEAR, 0],
  [-500, 0.25],
  [1000, 0.5],
  [1800, 0.75],
  [MAX_YEAR, 1],
];

/** Tick years shown under the track (spaced to fit at tablet width). */
export const TICK_YEARS = [-3000, -1000, 500, 1000, 1500, 1800, 1900, 2000];

/** There is no year 0: 1 BC is followed by AD 1. */
export function clampYear(year: number): number {
  const y = Math.round(Math.min(MAX_YEAR, Math.max(MIN_YEAR, year)));
  return y === 0 ? 1 : y;
}

export function yearToPos(year: number): number {
  for (let i = 1; i < KNOTS.length; i++) {
    const [y1, p1] = KNOTS[i];
    if (year <= y1) {
      const [y0, p0] = KNOTS[i - 1];
      return p0 + ((Math.max(year, y0) - y0) / (y1 - y0)) * (p1 - p0);
    }
  }
  return 1;
}

export function posToYear(pos: number): number {
  for (let i = 1; i < KNOTS.length; i++) {
    const [y1, p1] = KNOTS[i];
    if (pos <= p1) {
      const [y0, p0] = KNOTS[i - 1];
      return clampYear(y0 + ((Math.max(pos, p0) - p0) / (p1 - p0)) * (y1 - y0));
    }
  }
  return MAX_YEAR;
}

/** Step one year forward/back, skipping the nonexistent year 0. */
export function stepYear(year: number, delta: number): number {
  let next = year + delta;
  if (year < 0 && next >= 0) next += 1;
  else if (year > 0 && next <= 0) next -= 1;
  return clampYear(next);
}

/** Full year label: 기원전 500년 / 500 BC / 公元前500年 / 紀元前500年. */
export function formatYear(year: number, lang: Lang): string {
  const n = Math.abs(year);
  if (lang === "en") return year < 0 ? `${n} BC` : `${n}`;
  if (lang === "ko") return year < 0 ? `기원전 ${n}년` : `${n}년`;
  if (lang === "zh") return year < 0 ? `公元前${n}年` : `${n}年`;
  return year < 0 ? `紀元前${n}年` : `${n}年`;
}

/** Compact label for slider ticks. */
export function formatTick(year: number, lang: Lang): string {
  const n = Math.abs(year);
  if (year >= 0) return `${n}`;
  if (lang === "en") return `${n} BC`;
  if (lang === "ko") return `기원전 ${n}`;
  return `前${n}`;
}
