// Historical borders (Cliopatria v0.2.1, Seshat Global History Databank,
// CC BY 4.0) shipped as century buckets under /public/data/borders/ by
// data-pipeline/scripts/export_borders.py.

import type { Lang } from "@/lib/i18n";
import { pointInPolygon, polygonBbox } from "@/lib/geo";

/** Last year the border dataset covers; later years show modern borders. */
export const BORDERS_UNTIL = 2024;
const FIRST_BUCKET = -3400;
const LAST_BUCKET = 2000;

export interface PolityShape {
  /** Cliopatria polity name (key into the polity metadata) */
  p: string;
  from: number;
  to: number;
  /** polygons[polygon][ring][point] = [lng, lat] */
  g: number[][][][];
}

export interface PolityMeta {
  /** localized display names */
  l: Record<Lang, string>;
  /** palette slot, precomputed so touching polities differ (assign_slots.py) */
  s: number;
}

export type PolityIndex = Record<string, PolityMeta>;

export interface ActivePolity {
  name: string;
  slot: number;
  /** the year's shapes of this polity (stable objects within a bucket — cache keys) */
  shapes: PolityShape[];
  polygons: number[][][][];
  bboxes: [number, number, number, number][];
  /** overall [minLng, minLat, maxLng, maxLat] */
  bbox: [number, number, number, number];
}

const bucketCache = new Map<number, Promise<PolityShape[]>>();
const shapeBboxes = new WeakMap<PolityShape, [number, number, number, number][]>();
let metaPromise: Promise<PolityIndex> | null = null;

function bucketOf(year: number): number {
  return Math.min(LAST_BUCKET, Math.max(FIRST_BUCKET, Math.floor(year / 100) * 100));
}

function fetchJson<T>(url: string): Promise<T> {
  return fetch(url).then((r) => {
    if (!r.ok) throw new Error(`${url}: ${r.status}`);
    return r.json() as Promise<T>;
  });
}

function loadBucket(bucket: number): Promise<PolityShape[]> {
  let p = bucketCache.get(bucket);
  if (!p) {
    p = fetchJson<PolityShape[]>(`/data/borders/${bucket}.json`);
    // a failed fetch must not poison the cache — the next request retries
    p.catch(() => bucketCache.delete(bucket));
    bucketCache.set(bucket, p);
  }
  return p;
}

export function loadPolityIndex(): Promise<PolityIndex> {
  if (!metaPromise) {
    metaPromise = fetchJson<{ polities: PolityIndex }>("/data/borders/polities.json").then(
      (d) => d.polities
    );
    metaPromise.catch(() => {
      metaPromise = null;
    });
  }
  return metaPromise;
}

/** Shapes alive in `year`; also warms the next bucket for playback. */
export async function shapesAt(year: number): Promise<PolityShape[]> {
  const bucket = bucketOf(year);
  const shapes = await loadBucket(bucket);
  if (bucket < LAST_BUCKET) loadBucket(bucket + 100).catch(() => {});
  return shapes.filter((s) => s.from <= year && s.to >= year);
}

/** Group a year's shapes by polity, largest first (small states paint on top). */
export function groupPolities(shapes: PolityShape[], index: PolityIndex): ActivePolity[] {
  const byName = new Map<string, ActivePolity>();
  for (const s of shapes) {
    let pol = byName.get(s.p);
    if (!pol) {
      pol = {
        name: s.p,
        slot: index[s.p]?.s ?? 0,
        shapes: [],
        polygons: [],
        bboxes: [],
        bbox: [Infinity, Infinity, -Infinity, -Infinity],
      };
      byName.set(s.p, pol);
    }
    pol.shapes.push(s);
    let boxes = shapeBboxes.get(s);
    if (!boxes) {
      boxes = s.g.map(polygonBbox);
      shapeBboxes.set(s, boxes);
    }
    s.g.forEach((polygon, k) => {
      const b = boxes[k];
      pol.polygons.push(polygon);
      pol.bboxes.push(b);
      pol.bbox = [
        Math.min(pol.bbox[0], b[0]),
        Math.min(pol.bbox[1], b[1]),
        Math.max(pol.bbox[2], b[2]),
        Math.max(pol.bbox[3], b[3]),
      ];
    });
  }
  const area = (b: number[]) => (b[2] - b[0]) * (b[3] - b[1]);
  return [...byName.values()].sort((a, b) => area(b.bbox) - area(a.bbox));
}

/** The topmost (smallest) polity containing the point, or null. */
export function polityAt(lng: number, lat: number, polities: ActivePolity[]): ActivePolity | null {
  for (let i = polities.length - 1; i >= 0; i--) {
    const pol = polities[i];
    const [bx0, by0, bx1, by1] = pol.bbox;
    if (lng < bx0 || lng > bx1 || lat < by0 || lat > by1) continue;
    for (let k = 0; k < pol.polygons.length; k++) {
      const [x0, y0, x1, y1] = pol.bboxes[k];
      if (lng < x0 || lng > x1 || lat < y0 || lat > y1) continue;
      if (pointInPolygon(lng, lat, pol.polygons[k])) return pol;
    }
  }
  return null;
}
