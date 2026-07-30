// Country boundary data (Natural Earth 110m via world-atlas, preprocessed
// into /public/data/countries.geo.json) and spherical geometry helpers.

export interface CountryFeature {
  /** ISO 3166-1 alpha-2; null for territories without a code (not clickable) */
  iso: string | null;
  name: string;
  /** MultiPolygon: polygons[polygon][ring][point] = [lng, lat] */
  polygons: number[][][][];
}

export interface CountryGeo {
  features: CountryFeature[];
}

export async function loadCountries(): Promise<CountryGeo> {
  const res = await fetch("/data/countries.geo.json");
  if (!res.ok) throw new Error(`countries.geo.json: ${res.status}`);
  return res.json();
}

/** Ray-casting point-in-ring test (even-odd rule). */
function pointInRing(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function pointInPolygon(lng: number, lat: number, polygon: number[][][]): boolean {
  if (!pointInRing(lng, lat, polygon[0])) return false;
  for (let r = 1; r < polygon.length; r++) {
    if (pointInRing(lng, lat, polygon[r])) return false; // inside a hole
  }
  return true;
}

export interface IndexedCountry {
  feature: CountryFeature;
  /** overall [minLng, minLat, maxLng, maxLat] across all polygons */
  bbox: [number, number, number, number];
  /** [minLng, minLat, maxLng, maxLat] per polygon, for cheap prefiltering */
  bboxes: [number, number, number, number][];
  /** [lng, lat] of the largest polygon's area centroid */
  centroid: [number, number];
}

function polygonBbox(polygon: number[][][]): [number, number, number, number] {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const [x, y] of polygon[0]) {
    if (x < minLng) minLng = x;
    if (x > maxLng) maxLng = x;
    if (y < minLat) minLat = y;
    if (y > maxLat) maxLat = y;
  }
  return [minLng, minLat, maxLng, maxLat];
}

/** Shoelace area + centroid of an outer ring (planar approx, fine for focusing). */
function ringAreaCentroid(ring: number[][]): { area: number; cx: number; cy: number } {
  let area = 0, cx = 0, cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const f = xj * yi - xi * yj;
    area += f;
    cx += (xi + xj) * f;
    cy += (yi + yj) * f;
  }
  area /= 2;
  if (Math.abs(area) < 1e-9) {
    const [x, y] = ring[0];
    return { area: 0, cx: x, cy: y };
  }
  return { area: Math.abs(area), cx: cx / (6 * area), cy: cy / (6 * area) };
}

export function indexCountries(geo: CountryGeo): IndexedCountry[] {
  return geo.features.map((feature) => {
    const bboxes = feature.polygons.map(polygonBbox);
    const bbox: [number, number, number, number] = [
      Math.min(...bboxes.map((b) => b[0])),
      Math.min(...bboxes.map((b) => b[1])),
      Math.max(...bboxes.map((b) => b[2])),
      Math.max(...bboxes.map((b) => b[3])),
    ];
    let best = { area: -1, cx: 0, cy: 0 };
    for (const polygon of feature.polygons) {
      const c = ringAreaCentroid(polygon[0]);
      if (c.area > best.area) best = c;
    }
    return { feature, bbox, bboxes, centroid: [best.cx, best.cy] };
  });
}

/** Index of the country containing a lng/lat, or -1 over ocean. */
export function countryIndexAt(
  lng: number,
  lat: number,
  indexed: IndexedCountry[]
): number {
  for (let i = 0; i < indexed.length; i++) {
    const country = indexed[i];
    const [bMinLng, bMinLat, bMaxLng, bMaxLat] = country.bbox;
    if (lng < bMinLng || lng > bMaxLng || lat < bMinLat || lat > bMaxLat)
      continue;
    for (let p = 0; p < country.feature.polygons.length; p++) {
      const [minLng, minLat, maxLng, maxLat] = country.bboxes[p];
      if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) continue;
      if (pointInPolygon(lng, lat, country.feature.polygons[p])) return i;
    }
  }
  return -1;
}

/** Find the country containing a lng/lat, or null over ocean. */
export function countryAt(
  lng: number,
  lat: number,
  indexed: IndexedCountry[]
): IndexedCountry | null {
  const i = countryIndexAt(lng, lat, indexed);
  return i < 0 ? null : indexed[i];
}
