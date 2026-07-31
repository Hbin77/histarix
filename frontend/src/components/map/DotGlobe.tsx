"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import type { SelectedCountry } from "@/types/map";
import { COUNTRY_LANDMARKS, type CountryLandmark } from "@/data/landmarks";
import {
  countryIndexAt,
  indexCountries,
  loadCountries,
  type IndexedCountry,
} from "@/lib/geo";
import { useI18n } from "@/lib/i18n";

export interface DotGlobeHandle {
  zoomIn: () => void;
  zoomOut: () => void;
}

interface DotGlobeProps {
  onCountrySelect: (country: SelectedCountry) => void;
  onDeselect: () => void;
  selectedCountryCode?: string | null;
}

const RADIUS = 1;
const BASE_DIST = 3.35;
const FOCUS_DIST = 1.85;
const MIN_DIST = 1.35;
const MAX_DIST = 4.6;
const AUTO_ROTATE_SPEED = 0.045; // rad/s
const DOT_ROWS = 245;

const DEG = Math.PI / 180;

/** lat/lng (deg) to a point on the unit sphere; lng 0 / lat 0 faces +Z. */
function latLngToVec3(lat: number, lng: number, radius: number): Vector3 {
  const la = lat * DEG;
  const lo = lng * DEG;
  return new Vector3(
    radius * Math.cos(la) * Math.sin(lo),
    radius * Math.sin(la),
    radius * Math.cos(la) * Math.cos(lo)
  );
}

/**
 * Resolve a CSS custom property into a THREE color + alpha.
 * Handles rgb()/rgba(), and 3/4/6/8-digit hex — the CSS minifier rewrites
 * rgba() tokens to #RRGGBBAA, which THREE.Color cannot parse itself.
 */
function tokenColor(name: string): { color: Color; alpha: number } {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  const m = raw.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i
  );
  if (m) {
    return {
      color: new Color().setRGB(+m[1] / 255, +m[2] / 255, +m[3] / 255, SRGBColorSpace),
      alpha: m[4] !== undefined ? +m[4] : 1,
    };
  }
  if (raw.startsWith("#")) {
    let hex = raw.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = [...hex].map((c) => c + c).join("");
    }
    if (hex.length === 6 || hex.length === 8) {
      const n = (i: number) => parseInt(hex.slice(i, i + 2), 16) / 255;
      return {
        color: new Color().setRGB(n(0), n(2), n(4), SRGBColorSpace),
        alpha: hex.length === 8 ? n(6) : 1,
      };
    }
  }
  return { color: new Color(raw || "#ffffff"), alpha: 1 };
}

function circleSprite(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.72, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

function atmosphereSprite(core: { color: Color; alpha: number }): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d")!;
  const { color, alpha } = core;
  const rgb = `${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(color.b * 255)}`;
  const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  // globe rim sits at ~0.59 of the sprite radius (sprite scale 3.4 × globe r 1)
  g.addColorStop(0.0, `rgba(${rgb},0)`);
  g.addColorStop(0.56, `rgba(${rgb},0)`);
  g.addColorStop(0.6, `rgba(${rgb},${alpha})`);
  g.addColorStop(0.68, `rgba(${rgb},${alpha * 0.18})`);
  g.addColorStop(0.8, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  return new CanvasTexture(c);
}

interface DotField {
  positions: Float32Array;
  colors: Float32Array;
  /** dot indices per country feature index */
  byCountry: Map<number, number[]>;
  count: number;
}

/**
 * Sample an even-density dot grid over the sphere and tag each land dot with
 * its country via vector point-in-polygon — the same test used for click
 * picking, so dot highlights and picking can never disagree.
 */
function buildDots(indexed: IndexedCountry[]): DotField {
  const positions: number[] = [];
  const byCountry = new Map<number, number[]>();
  const dLat = 180 / DOT_ROWS;
  for (let r = 0; r < DOT_ROWS; r++) {
    const lat = -90 + (r + 0.5) * dLat;
    const cols = Math.max(1, Math.round(2 * DOT_ROWS * Math.cos(lat * DEG)));
    const dLng = 360 / cols;
    const stagger = (r % 2) * 0.5 * dLng;
    for (let c = 0; c < cols; c++) {
      let lng = -180 + (c + 0.5) * dLng + stagger;
      if (lng > 180) lng -= 360;
      const fi = countryIndexAt(lng, lat, indexed);
      if (fi < 0) continue; // ocean
      const p = latLngToVec3(lat, lng, RADIUS * 1.004);
      const dotIndex = positions.length / 3;
      positions.push(p.x, p.y, p.z);
      let list = byCountry.get(fi);
      if (!list) byCountry.set(fi, (list = []));
      list.push(dotIndex);
    }
  }
  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(positions.length),
    byCountry,
    count: positions.length / 3,
  };
}

/** Subdivided border segments for every country ring, as line-segment pairs. */
function buildBorders(indexed: IndexedCountry[], radius: number): Float32Array {
  const out: number[] = [];
  const push = (a: Vector3, b: Vector3) => out.push(a.x, a.y, a.z, b.x, b.y, b.z);
  for (const country of indexed) {
    for (const polygon of country.feature.polygons) {
      for (const ring of polygon) {
        for (let i = 0; i < ring.length; i++) {
          const [lng1, lat1] = ring[i];
          const [lng2, lat2] = ring[(i + 1) % ring.length];
          if (Math.abs(lng2 - lng1) > 180) continue; // south-pole cap bottom edge
          // artificial edges introduced by antimeridian splitting / pole closure
          if (Math.abs(lng1) === 180 && Math.abs(lng2) === 180) continue;
          if (lat1 === -90 && lat2 === -90) continue;
          const steps = Math.max(
            1,
            Math.ceil(Math.max(Math.abs(lng2 - lng1), Math.abs(lat2 - lat1)) / 2)
          );
          let prev = latLngToVec3(lat1, lng1, radius);
          for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            const next = latLngToVec3(
              lat1 + (lat2 - lat1) * t,
              lng1 + (lng2 - lng1) * t,
              radius
            );
            push(prev, next);
            prev = next;
          }
        }
      }
    }
  }
  return new Float32Array(out);
}

function buildGraticule(radius: number): Float32Array {
  const out: number[] = [];
  const push = (a: Vector3, b: Vector3) => out.push(a.x, a.y, a.z, b.x, b.y, b.z);
  for (let lat = -60; lat <= 60; lat += 20) {
    for (let lng = -180; lng < 180; lng += 2) {
      push(latLngToVec3(lat, lng, radius), latLngToVec3(lat, lng + 2, radius));
    }
  }
  for (let lng = -180; lng < 180; lng += 20) {
    for (let lat = -84; lat < 84; lat += 2) {
      push(latLngToVec3(lat, lng, radius), latLngToVec3(lat + 2, lng, radius));
    }
  }
  return new Float32Array(out);
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// ── country palette assignment ──────────────────────────────────────────────

const PALETTE_SLOTS = 6;

/**
 * Worst-case pair distinguishability of the 6 palette slots: min ΔE (OKLab
 * ×100) across normal/deutan/protan/tritan vision. Precomputed offline with
 * the dataviz palette validator's math; used so the assigner steers real
 * neighbors toward the most distinguishable pairs (weak: amber↔green 2.9).
 */
const PAIR_DIST = [
  [0, 22.5, 6.8, 14, 9, 6.9],
  [22.5, 0, 11.3, 8.9, 2.9, 20.5],
  [6.8, 11.3, 0, 6.3, 8.5, 15.9],
  [14, 8.9, 6.3, 0, 10.4, 13.6],
  [9, 2.9, 8.5, 10.4, 0, 12.4],
  [6.9, 20.5, 15.9, 13.6, 12.4, 0],
];

/**
 * Countries sharing a border share ring vertices verbatim (both trace the
 * same TopoJSON arcs). Two or more shared vertices = a shared edge, not a
 * corner touch.
 */
function buildAdjacency(indexed: IndexedCountry[]): Set<number>[] {
  const vertexOwners = new Map<string, number[]>();
  indexed.forEach((country, fi) => {
    const seen = new Set<string>();
    for (const polygon of country.feature.polygons) {
      for (const ring of polygon) {
        for (const [lng, lat] of ring) {
          const key = lng + "," + lat;
          if (seen.has(key)) continue;
          seen.add(key);
          let owners = vertexOwners.get(key);
          if (!owners) vertexOwners.set(key, (owners = []));
          owners.push(fi);
        }
      }
    }
  });
  const sharedCount = new Map<number, number>();
  for (const owners of vertexOwners.values()) {
    if (owners.length < 2) continue;
    for (let a = 0; a < owners.length; a++) {
      for (let b = a + 1; b < owners.length; b++) {
        const key = owners[a] * 1000 + owners[b];
        sharedCount.set(key, (sharedCount.get(key) ?? 0) + 1);
      }
    }
  }
  const adjacency = indexed.map(() => new Set<number>());
  for (const [key, count] of sharedCount) {
    if (count < 2) continue;
    const a = Math.floor(key / 1000);
    const b = key % 1000;
    adjacency[a].add(b);
    adjacency[b].add(a);
  }
  return adjacency;
}

/**
 * Greedy graph coloring, highest-degree first. Neighbors never share a slot
 * unless a country has all six slots among its already-colored neighbors;
 * ties resolve toward the slot most distinguishable from every neighbor.
 */
function assignSlots(indexed: IndexedCountry[], adjacency: Set<number>[]): number[] {
  const order = indexed
    .map((_, i) => i)
    .sort((a, b) => adjacency[b].size - adjacency[a].size);
  const slot = new Array<number>(indexed.length).fill(-1);
  for (const fi of order) {
    const neighborSlots = [...adjacency[fi]]
      .map((n) => slot[n])
      .filter((s) => s >= 0);
    let best = fi % PALETTE_SLOTS;
    let bestScore = -1;
    for (let s = 0; s < PALETTE_SLOTS; s++) {
      const collides = neighborSlots.includes(s);
      const minDist = neighborSlots.length
        ? Math.min(...neighborSlots.map((ns) => PAIR_DIST[s][ns]))
        : PAIR_DIST[s][(s + 3) % PALETTE_SLOTS];
      const score = (collides ? 0 : 1000) + minDist;
      if (score > bestScore) {
        bestScore = score;
        best = s;
      }
    }
    slot[fi] = best;
  }
  return slot;
}

interface SlotColors {
  base: Color[];
  hover: Color[];
  selected: Color[];
  dimmed: Color[];
}

/** Hover/selected are HSL derivations of the slot color (MASTER.md §2). */
function deriveSlotColors(baseColors: Color[], ocean: Color): SlotColors {
  const hsl = { h: 0, s: 0, l: 0 };
  const derive = (c: Color, ds: number, dl: number) => {
    c.getHSL(hsl);
    return new Color().setHSL(
      hsl.h,
      Math.min(1, hsl.s + ds),
      Math.max(0, hsl.l + dl)
    );
  };
  return {
    base: baseColors,
    hover: baseColors.map((c) => derive(c, 0.05, -0.1)),
    selected: baseColors.map((c) => derive(c, 0.08, -0.17)),
    dimmed: baseColors.map((c) => c.clone().lerp(ocean, 0.42)),
  };
}

interface Flight {
  t0: number;
  dur: number;
  fromYaw: number;
  toYaw: number;
  fromPitch: number;
  toPitch: number;
  fromDist: number;
  toDist: number;
  onDone?: () => void;
}

interface LandmarkCard {
  landmark: CountryLandmark;
  thumb: string | null;
}

type Status = "loading" | "ready" | "error";

export const DotGlobe = forwardRef<DotGlobeHandle, DotGlobeProps>(
  function DotGlobe({ onCountrySelect, onDeselect, selectedCountryCode }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<Status>("loading");
    const [isImmersive, setIsImmersive] = useState(false);
    const [card, setCard] = useState<LandmarkCard | null>(null);
    const { t } = useI18n();

    const onCountrySelectRef = useRef(onCountrySelect);
    const onDeselectRef = useRef(onDeselect);
    useEffect(() => {
      onCountrySelectRef.current = onCountrySelect;
      onDeselectRef.current = onDeselect;
    }, [onCountrySelect, onDeselect]);

    // Mutable scene state shared between the effect and imperative handles
    const world = useRef<{
      yaw: number;
      pitch: number;
      dist: number;
      flight: Flight | null;
      selectedFi: number | null;
      selectedIso: string | null;
      hoveredFi: number | null;
      cardAnchor: Vector3 | null;
      cardTimer: ReturnType<typeof setTimeout> | null;
      indexed: IndexedCountry[] | null;
      dots: DotField | null;
      dotGeometry: BufferGeometry | null;
      slots: number[] | null;
      slotColors: SlotColors | null;
      reducedMotion: boolean;
      /** selection requested before the scene/data was ready */
      pendingIso: string | null;
      applyExternalSelection: ((iso: string | null) => void) | null;
    }>({
      yaw: -0.4,
      pitch: 0.45,
      dist: BASE_DIST,
      flight: null,
      selectedFi: null,
      selectedIso: null,
      hoveredFi: null,
      cardAnchor: null,
      cardTimer: null,
      indexed: null,
      dots: null,
      dotGeometry: null,
      slots: null,
      slotColors: null,
      reducedMotion: false,
      pendingIso: null,
      applyExternalSelection: null,
    });

    const startFlight = (
      toYaw: number,
      toPitch: number,
      toDist: number,
      dur: number,
      onDone?: () => void
    ) => {
      const w = world.current;
      const wrap = ((toYaw - w.yaw + Math.PI) % (2 * Math.PI)) - Math.PI;
      w.flight = {
        t0: performance.now(),
        dur: w.reducedMotion ? Math.min(dur, 250) : dur,
        fromYaw: w.yaw,
        toYaw: w.yaw + (wrap < -Math.PI ? wrap + 2 * Math.PI : wrap),
        fromPitch: w.pitch,
        toPitch,
        fromDist: w.dist,
        toDist,
        onDone,
      };
    };

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        const w = world.current;
        startFlight(w.yaw, w.pitch, Math.max(MIN_DIST, w.dist / 1.35), 350);
      },
      zoomOut: () => {
        const w = world.current;
        startFlight(w.yaw, w.pitch, Math.min(MAX_DIST, w.dist * 1.35), 350);
      },
    }));

    // React to external selection changes (search select, panel close)
    useEffect(() => {
      const w = world.current;
      const iso = selectedCountryCode ?? null;
      if (iso === w.selectedIso) return;
      if (w.applyExternalSelection) w.applyExternalSelection(iso);
      else w.pendingIso = iso; // scene not built yet; applied once ready
    }, [selectedCountryCode]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      let disposed = false;
      let rafId = 0;
      const disposables: { dispose: () => void }[] = [];

      const w = world.current;
      w.reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      let renderer: WebGLRenderer;
      try {
        renderer = new WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        setStatus("error");
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.domElement.className = "dot-globe-canvas";
      renderer.domElement.setAttribute("role", "img");
      renderer.domElement.setAttribute("aria-label", "Interactive world globe");
      container.appendChild(renderer.domElement);

      const scene = new Scene();
      const camera = new PerspectiveCamera(
        38,
        container.clientWidth / container.clientHeight,
        0.1,
        100
      );
      camera.position.set(0, 0, w.dist);

      const group = new Group();
      group.rotation.order = "XYZ"; // pitch (x) applied over yaw (y)
      scene.add(group);

      // --- design tokens → materials
      const ocean = tokenColor("--globe-ocean");
      const paletteBase = Array.from({ length: PALETTE_SLOTS }, (_, i) =>
        tokenColor(`--globe-cat-${i + 1}`).color
      );
      const outline = tokenColor("--globe-outline");
      const graticule = tokenColor("--globe-graticule");
      const atmosphere = tokenColor("--globe-atmosphere");
      w.slotColors = deriveSlotColors(paletteBase, ocean.color);

      const oceanGeometry = new SphereGeometry(RADIUS, 64, 64);
      const oceanMaterial = new MeshBasicMaterial({ color: ocean.color });
      const oceanMesh = new Mesh(oceanGeometry, oceanMaterial);
      group.add(oceanMesh);
      disposables.push(oceanGeometry, oceanMaterial);

      const atmoTexture = atmosphereSprite(atmosphere);
      const atmoMaterial = new SpriteMaterial({
        map: atmoTexture,
        transparent: true,
        depthWrite: false,
      });
      const atmoSprite = new Sprite(atmoMaterial);
      atmoSprite.scale.setScalar(3.4);
      atmoSprite.renderOrder = -1;
      scene.add(atmoSprite);
      disposables.push(atmoTexture, atmoMaterial);

      const graticuleGeometry = new BufferGeometry();
      graticuleGeometry.setAttribute(
        "position",
        new BufferAttribute(buildGraticule(RADIUS * 1.001), 3)
      );
      const graticuleMaterial = new LineBasicMaterial({
        color: graticule.color,
        transparent: true,
        opacity: graticule.alpha,
      });
      group.add(new LineSegments(graticuleGeometry, graticuleMaterial));
      disposables.push(graticuleGeometry, graticuleMaterial);

      // --- dot colors
      // One state-aware pass over the whole color buffer (~17k dots, cheap).
      // Selection dims every other country toward the ocean for focus.
      const repaint = () => {
        const dots = w.dots;
        const geometry = w.dotGeometry;
        const slots = w.slots;
        const sc = w.slotColors;
        if (!dots || !geometry || !slots || !sc) return;
        for (const [fi, list] of dots.byCountry) {
          const slot = slots[fi];
          const color =
            fi === w.selectedFi
              ? sc.selected[slot]
              : fi === w.hoveredFi
                ? sc.hover[slot]
                : w.selectedFi !== null
                  ? sc.dimmed[slot]
                  : sc.base[slot];
          for (const di of list) {
            dots.colors[di * 3] = color.r;
            dots.colors[di * 3 + 1] = color.g;
            dots.colors[di * 3 + 2] = color.b;
          }
        }
        (geometry.getAttribute("color") as BufferAttribute).needsUpdate = true;
      };

      // --- selection
      const clearSelection = () => {
        if (w.cardTimer) {
          clearTimeout(w.cardTimer);
          w.cardTimer = null;
        }
        w.cardAnchor = null;
        setCard(null);
        w.selectedFi = null;
        w.selectedIso = null;
        repaint();
      };

      const showLandmark = (iso: string, lat: number, lng: number) => {
        const landmark = COUNTRY_LANDMARKS[iso];
        if (!landmark) return;
        fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${landmark.wikiTitle}`
        )
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
          .then((data) => {
            if (disposed || w.selectedIso !== iso) return;
            const raw: unknown =
              data?.thumbnail?.source ?? data?.originalimage?.source ?? null;
            const thumb =
              typeof raw === "string" &&
              raw.startsWith("https://upload.wikimedia.org/")
                ? raw
                : null;
            w.cardTimer = setTimeout(() => {
              w.cardTimer = null;
              if (disposed || w.selectedIso !== iso) return;
              w.cardAnchor = latLngToVec3(lat, lng, RADIUS * 1.01);
              setCard({ landmark, thumb });
            }, 800);
          });
      };

      const selectCountry = (
        country: IndexedCountry,
        fi: number,
        lat: number,
        lng: number,
        notify: boolean
      ) => {
        clearSelection();
        w.selectedFi = fi;
        w.selectedIso = country.feature.iso;
        repaint();
        setIsImmersive(true);
        startFlight(-lng * DEG, lat * DEG, FOCUS_DIST, 1600);
        if (country.feature.iso) {
          if (notify) {
            onCountrySelectRef.current({
              iso_code: country.feature.iso,
              name: country.feature.name,
              center: [lng, lat],
            });
          }
          showLandmark(country.feature.iso, lat, lng);
        }
      };

      const deselect = (notify: boolean) => {
        clearSelection();
        setIsImmersive(false);
        startFlight(w.yaw, 0.45, BASE_DIST, 1400);
        if (notify) onDeselectRef.current();
      };

      w.applyExternalSelection = (iso: string | null) => {
        if (iso === null) {
          w.pendingIso = null;
          if (w.selectedFi !== null) deselect(false);
          return;
        }
        const indexed = w.indexed;
        if (!indexed) {
          w.pendingIso = iso; // data still loading; applied once ready
          return;
        }
        const fi = indexed.findIndex((c) => c.feature.iso === iso);
        if (fi < 0) return;
        const [lng, lat] = indexed[fi].centroid;
        selectCountry(indexed[fi], fi, lat, lng, false);
      };

      // --- picking
      const raycaster = new Raycaster();
      const pointer = new Vector2();
      const pickCountry = (
        event: PointerEvent
      ): { country: IndexedCountry; fi: number; lat: number; lng: number } | null => {
        if (!w.indexed) return null;
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObject(oceanMesh, false)[0];
        if (!hit) return null;
        const local = group.worldToLocal(hit.point.clone()).normalize();
        const lat = Math.asin(Math.min(1, Math.max(-1, local.y))) / DEG;
        const lng = Math.atan2(local.x, local.z) / DEG;
        const fi = countryIndexAt(lng, lat, w.indexed);
        if (fi < 0) return null;
        return { country: w.indexed[fi], fi, lat, lng };
      };

      // --- input
      let pointerDown = false;
      let draggedFar = false;
      let lastX = 0;
      let lastY = 0;
      let hoverHold = 0; // 1 while a country is hovered → pauses rotation
      const activePointers = new Map<number, { x: number; y: number }>();
      let pinchDist = 0;

      const setHover = (fi: number | null) => {
        if (fi === w.hoveredFi) return;
        w.hoveredFi = fi;
        repaint();
        renderer.domElement.style.cursor = fi !== null ? "pointer" : "grab";
        hoverHold = fi !== null ? 1 : 0;
      };

      const onPointerDown = (event: PointerEvent) => {
        activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (activePointers.size === 2) {
          const [a, b] = [...activePointers.values()];
          pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
          pointerDown = false; // entering pinch must never end in a click-select
          return;
        }
        pointerDown = true;
        draggedFar = false;
        lastX = event.clientX;
        lastY = event.clientY;
        renderer.domElement.setPointerCapture(event.pointerId);
      };

      const onPointerMove = (event: PointerEvent) => {
        if (activePointers.has(event.pointerId)) {
          activePointers.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
          });
        }
        if (activePointers.size === 2) {
          const [a, b] = [...activePointers.values()];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (pinchDist > 0) {
            w.dist = Math.min(
              MAX_DIST,
              Math.max(MIN_DIST, w.dist * (pinchDist / d))
            );
            w.flight = null;
          }
          pinchDist = d;
          return;
        }
        if (pointerDown) {
          const dx = event.clientX - lastX;
          const dy = event.clientY - lastY;
          if (Math.abs(event.clientX - lastX) + Math.abs(event.clientY - lastY) > 3)
            draggedFar = true;
          if (draggedFar) {
            const k = 0.0035 * (w.dist / BASE_DIST);
            w.yaw += dx * k;
            w.pitch = Math.min(
              75 * DEG,
              Math.max(-75 * DEG, w.pitch + dy * k)
            );
            w.flight = null;
            lastX = event.clientX;
            lastY = event.clientY;
          }
          return;
        }
        setHover(pickCountry(event)?.fi ?? null);
      };

      const onPointerUp = (event: PointerEvent) => {
        activePointers.delete(event.pointerId);
        if (activePointers.size < 2) pinchDist = 0;
        if (!pointerDown) return;
        pointerDown = false;
        if (draggedFar) return;
        const picked = pickCountry(event);
        if (!picked || !picked.country.feature.iso) return;
        if (picked.country.feature.iso === w.selectedIso) {
          deselect(true);
        } else {
          selectCountry(picked.country, picked.fi, picked.lat, picked.lng, true);
        }
      };

      const onPointerLeave = () => {
        setHover(null);
      };

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        w.dist = Math.min(
          MAX_DIST,
          Math.max(MIN_DIST, w.dist * Math.exp(event.deltaY * 0.001))
        );
        w.flight = null;
      };

      const canvas = renderer.domElement;
      canvas.style.cursor = "grab";
      canvas.style.touchAction = "none"; // globe owns pan/pinch gestures
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerUp);
      canvas.addEventListener("pointerleave", onPointerLeave);
      canvas.addEventListener("wheel", onWheel, { passive: false });

      // --- data load, then dots/borders
      loadCountries()
        .then((geo) => {
          if (disposed) return;
          const indexed = indexCountries(geo);
          w.indexed = indexed;

          w.slots = assignSlots(indexed, buildAdjacency(indexed));

          const dots = buildDots(indexed);
          w.dots = dots;
          const dotGeometry = new BufferGeometry();
          dotGeometry.setAttribute("position", new BufferAttribute(dots.positions, 3));
          dotGeometry.setAttribute("color", new BufferAttribute(dots.colors, 3));
          w.dotGeometry = dotGeometry;
          const dotTexture = circleSprite();
          const dotMaterial = new PointsMaterial({
            size: 0.016,
            vertexColors: true,
            map: dotTexture,
            transparent: true,
            alphaTest: 0.35,
            sizeAttenuation: true,
          });
          group.add(new Points(dotGeometry, dotMaterial));
          disposables.push(dotGeometry, dotMaterial, dotTexture);
          repaint(); // initial per-country palette pass

          const borderGeometry = new BufferGeometry();
          borderGeometry.setAttribute(
            "position",
            new BufferAttribute(buildBorders(indexed, RADIUS * 1.002), 3)
          );
          const borderMaterial = new LineBasicMaterial({
            color: outline.color,
            transparent: true,
            opacity: outline.alpha,
          });
          group.add(new LineSegments(borderGeometry, borderMaterial));
          disposables.push(borderGeometry, borderMaterial);

          setStatus("ready");
          // intro: settle in from a distance
          if (!w.reducedMotion) {
            w.dist = 4.3;
            startFlight(w.yaw, w.pitch, BASE_DIST, 1400);
          }
          // selection requested before data finished loading (e.g. search)
          if (w.pendingIso && w.pendingIso !== w.selectedIso) {
            const iso = w.pendingIso;
            w.pendingIso = null;
            w.applyExternalSelection?.(iso);
          }
        })
        .catch(() => {
          if (disposed) return;
          setStatus("error");
          teardown(); // the error screen replaces the canvas — stop the GPU loop
        });

      // --- frame loop
      let speedFactor = w.reducedMotion ? 0 : 1;
      let lastTime = performance.now();
      const renderFrame = (now: number) => {
        rafId = requestAnimationFrame(renderFrame);
        const dt = Math.min(0.1, (now - lastTime) / 1000);
        lastTime = now;

        if (w.flight) {
          const f = w.flight;
          const t = Math.min(1, (now - f.t0) / f.dur);
          const e = easeInOutCubic(t);
          w.yaw = f.fromYaw + (f.toYaw - f.fromYaw) * e;
          w.pitch = f.fromPitch + (f.toPitch - f.fromPitch) * e;
          w.dist = f.fromDist + (f.toDist - f.fromDist) * e;
          if (t >= 1) {
            w.flight = null;
            f.onDone?.();
          }
        } else if (!w.reducedMotion) {
          const idle =
            !pointerDown && w.selectedFi === null && hoverHold === 0 ? 1 : 0;
          speedFactor += (idle - speedFactor) * Math.min(1, dt * 4);
          w.yaw += AUTO_ROTATE_SPEED * speedFactor * dt;
        }

        group.rotation.set(w.pitch, w.yaw, 0);
        camera.position.set(0, 0, w.dist);
        camera.lookAt(0, 0, 0);

        // landmark card follows its anchor point
        const cardEl = cardRef.current;
        if (cardEl && w.cardAnchor) {
          const v = w.cardAnchor.clone().applyEuler(group.rotation);
          const facing = v.z > 0.2;
          v.project(camera);
          const x = ((v.x + 1) / 2) * container.clientWidth;
          const y = ((1 - v.y) / 2) * container.clientHeight;
          cardEl.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
          cardEl.style.opacity = facing ? "1" : "0";
          cardEl.style.visibility = facing ? "visible" : "hidden";
        }

        renderer.render(scene, camera);
      };
      rafId = requestAnimationFrame(renderFrame);

      const resizeObserver = new ResizeObserver(() => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width === 0 || height === 0) return;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      });
      resizeObserver.observe(container);

      let torn = false;
      const teardown = () => {
        if (torn) return;
        torn = true;
        cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        if (w.cardTimer) clearTimeout(w.cardTimer);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
        canvas.removeEventListener("pointerleave", onPointerLeave);
        canvas.removeEventListener("wheel", onWheel);
        for (const d of disposables) d.dispose();
        renderer.dispose();
        canvas.remove();
        w.applyExternalSelection = null;
        w.indexed = null;
        w.dots = null;
        w.dotGeometry = null;
        w.slots = null;
        w.slotColors = null;
        w.flight = null;
        w.selectedFi = null;
        w.selectedIso = null;
        w.hoveredFi = null;
        w.cardAnchor = null;
        w.cardTimer = null;
        w.pendingIso = null;
      };

      return () => {
        disposed = true;
        teardown();
      };
      // The scene is built once; prop changes are handled via refs above.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleReset = () => {
      const w = world.current;
      w.applyExternalSelection?.(null);
      onDeselectRef.current();
    };

    if (status === "error") {
      return (
        <div className="flex h-full w-full items-center justify-center bg-[var(--surface)]">
          <div className="text-center">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" className="mb-4 mx-auto" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <h2 className="text-xl font-semibold text-[var(--on-surface)]">{t("loadError")}</h2>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 min-h-11 rounded-xl bg-[var(--surface-container-high)] px-5 py-2.5 text-sm font-medium text-[var(--on-surface)] transition hover:bg-[var(--surface-container-highest)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
            >
              {t("retry")}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="relative h-full w-full">
        <div ref={containerRef} className="dot-globe-container h-full w-full" data-ready={status === "ready"} />

        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-[var(--on-surface-variant)] animate-pulse">
              {t("loadingData")}
            </p>
          </div>
        )}

        {card && (
          <div ref={cardRef} className="dot-globe-card">
            <div className="landmark-marker">
              <div className="landmark-monument">
                {card.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.thumb}
                    alt={card.landmark.name}
                    className="landmark-img"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="landmark-placeholder">
                    {card.landmark.name[0]}
                  </div>
                )}
              </div>
              <div className="landmark-base">
                <div className="landmark-base-glow"></div>
              </div>
              <div className="landmark-info-card">
                <div className="landmark-name">{card.landmark.name}</div>
                <div className="landmark-tagline">{card.landmark.tagline}</div>
              </div>
            </div>
          </div>
        )}

        {isImmersive && (
          <button
            onClick={handleReset}
            className="absolute top-20 left-3 md:left-6 z-30 flex min-h-11 items-center gap-2 rounded-xl bg-[var(--surface-container)]/90 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium text-[var(--on-surface)] backdrop-blur-xl transition hover:bg-[var(--surface-container-highest)] border border-[var(--outline-variant)]/30 focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
            {t("backToMap")}
          </button>
        )}
      </div>
    );
  }
);
