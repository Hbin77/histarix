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
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
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
import { TONES } from "@/lib/monuments/materials";
import {
  disposeModel,
  hasLandmarkModel,
  loadLandmarkModel,
  placeOnGlobe,
} from "@/lib/landmark3d";
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
const TEX_W = 4096;
const TEX_H = 2048;

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
  /** same colors as CSS hex, for the canvas land painter */
  baseHex: string[];
  hoverHex: string[];
  selectedHex: string[];
  dimmedHex: string[];
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
  const hover = baseColors.map((c) => derive(c, 0.05, -0.08));
  const selected = baseColors.map((c) => derive(c, 0.08, -0.14));
  const dimmed = baseColors.map((c) => c.clone().lerp(ocean, 0.42));
  const css = (c: Color) => "#" + c.getHexString();
  return {
    base: baseColors,
    hover,
    selected,
    dimmed,
    baseHex: baseColors.map(css),
    hoverHex: hover.map(css),
    selectedHex: selected.map(css),
    dimmedHex: dimmed.map(css),
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
  fromTilt: number;
  toTilt: number;
  onDone?: () => void;
}

interface LandmarkCard {
  landmark: CountryLandmark;
  thumb: string | null;
  /** true when a 3D model replaces the photo (PoC) */
  hidePhoto?: boolean;
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
      /** camera tilt below the equator plane (rad) — oblique 3D-landmark view */
      camTilt: number;
      flight: Flight | null;
      selectedFi: number | null;
      selectedIso: string | null;
      hoveredFi: number | null;
      cardAnchor: Vector3 | null;
      cardTimer: ReturnType<typeof setTimeout> | null;
      indexed: IndexedCountry[] | null;
      slots: number[] | null;
      slotColors: SlotColors | null;
      reducedMotion: boolean;
      /** selection requested before the scene/data was ready */
      pendingIso: string | null;
      applyExternalSelection: ((iso: string | null) => void) | null;
      /** zoom the landmark orbit rig; returns false when the rig is idle */
      adjustRigRange: ((factor: number) => boolean) | null;
    }>({
      yaw: -0.4,
      pitch: 0.45,
      dist: BASE_DIST,
      camTilt: 0,
      flight: null,
      selectedFi: null,
      selectedIso: null,
      hoveredFi: null,
      cardAnchor: null,
      cardTimer: null,
      indexed: null,
      slots: null,
      slotColors: null,
      reducedMotion: false,
      pendingIso: null,
      applyExternalSelection: null,
      adjustRigRange: null,
    });

    const startFlight = (
      toYaw: number,
      toPitch: number,
      toDist: number,
      dur: number,
      onDone?: () => void,
      toTilt?: number
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
        fromTilt: w.camTilt,
        toTilt: toTilt ?? w.camTilt,
        onDone,
      };
    };

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        const w = world.current;
        if (w.adjustRigRange?.(1 / 1.35)) return;
        startFlight(w.yaw, w.pitch, Math.max(MIN_DIST, w.dist / 1.35), 350);
      },
      zoomOut: () => {
        const w = world.current;
        if (w.adjustRigRange?.(1.35)) return;
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

      // Land is a canvas-painted equirect texture: countries as solid fills.
      const landCanvas = document.createElement("canvas");
      landCanvas.width = TEX_W;
      landCanvas.height = TEX_H;
      const landCtx = landCanvas.getContext("2d")!;
      const oceanCss = "#" + ocean.color.getHexString();
      landCtx.fillStyle = oceanCss;
      landCtx.fillRect(0, 0, TEX_W, TEX_H);
      const landTexture = new CanvasTexture(landCanvas);
      landTexture.colorSpace = SRGBColorSpace;
      landTexture.anisotropy = Math.min(
        8,
        renderer.capabilities.getMaxAnisotropy()
      );

      const oceanGeometry = new SphereGeometry(RADIUS, 96, 64);
      const oceanMaterial = new MeshBasicMaterial({ map: landTexture });
      const oceanMesh = new Mesh(oceanGeometry, oceanMaterial);
      // aligns the standard equirect texture with latLngToVec3's convention
      oceanMesh.rotation.y = -Math.PI / 2;
      group.add(oceanMesh);
      disposables.push(oceanGeometry, oceanMaterial, landTexture);

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

      // Lights only affect the (Lambert) landmark models — the globe's
      // Basic materials ignore them.
      scene.add(new HemisphereLight(0xffffff, 0xd5dae8, 1.15));
      const sun = new DirectionalLight(0xffffff, 0.9);
      sun.position.set(0.6, 1, 1.4);
      scene.add(sun);

      // --- PoC: procedural 3D landmark state (effect-scoped)
      let model3d: Group | null = null;
      let model3dStart = 0;
      let modelAnchor: Vector3 | null = null;
      const MODEL_HEIGHT = 0.28;
      const EMERGE_MS = 1200;
      const BURIAL = MODEL_HEIGHT * 1.12;
      // overshoot ease: the monument bursts slightly past ground level, then settles
      const easeOutBack = (t: number) => {
        const k = 2.4;
        const u = t - 1;
        return 1 + u * u * ((k + 1) * u + k);
      };
      let cardBelow = false;
      // Google-Earth-style orbit rig: once the flight lands, the camera eases
      // from the axis rig to an anchor-orbit view (35° elevation over the
      // anchor's tangent plane) so upright monuments are seen obliquely.
      // rigDir: +1 blending in, -1 blending out (model removed at 0).
      let rigBlend = 0;
      let rigDir = 0;
      let rigRange = 0.95;
      const RIG_ELEV = 35 * DEG;
      const removeModel3d = () => {
        if (!model3d) return;
        group.remove(model3d);
        disposeModel(model3d);
        model3d = null;
        modelAnchor = null;
        rigBlend = 0;
        rigDir = 0;
      };
      w.adjustRigRange = (factor: number) => {
        if (!model3d || rigBlend <= 0) return false;
        rigRange = Math.min(2.2, Math.max(0.35, rigRange * factor));
        return true;
      };

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
      // One state-aware paint of the land texture: every country filled with
      // its slot color (hover/selected derivations, dimmed while a selection
      // focuses the globe). Repaints happen on state change only.
      const px = (lng: number) => ((lng + 180) / 360) * TEX_W;
      const py = (lat: number) => ((90 - lat) / 180) * TEX_H;
      const repaint = () => {
        const slots = w.slots;
        const sc = w.slotColors;
        const indexed = w.indexed;
        if (!slots || !sc || !indexed) return;
        landCtx.fillStyle = oceanCss;
        landCtx.fillRect(0, 0, TEX_W, TEX_H);
        indexed.forEach((country, fi) => {
          const slot = slots[fi];
          landCtx.fillStyle =
            fi === w.selectedFi
              ? sc.selectedHex[slot]
              : fi === w.hoveredFi
                ? sc.hoverHex[slot]
                : w.selectedFi !== null
                  ? sc.dimmedHex[slot]
                  : sc.baseHex[slot];
          landCtx.beginPath();
          for (const polygon of country.feature.polygons) {
            for (const ring of polygon) {
              ring.forEach(([lng, lat], i) => {
                if (i === 0) landCtx.moveTo(px(lng), py(lat));
                else landCtx.lineTo(px(lng), py(lat));
              });
              landCtx.closePath();
            }
          }
          landCtx.fill("evenodd");
        });
        landTexture.needsUpdate = true;
      };

      // --- selection
      const clearSelection = () => {
        if (w.cardTimer) {
          clearTimeout(w.cardTimer);
          w.cardTimer = null;
        }
        w.cardAnchor = null;
        setCard(null);
        if (model3d) rigDir = -1; // rig + model blend out in the frame loop
        cardBelow = false;
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
              const anchor = latLngToVec3(landmark.lat, landmark.lng, RADIUS * 1.002);
              if (hasLandmarkModel(iso)) {
                // 3D monument at its real coordinates; card text sits below
                loadLandmarkModel(iso)
                  .then((model) => {
                    if (!model) return;
                    if (disposed || w.selectedIso !== iso) {
                      disposeModel(model);
                      return;
                    }
                    removeModel3d();
                    model3d = model;
                    const slots = w.slots;
                    const sc = w.slotColors;
                    if (slots && sc && w.selectedFi !== null) {
                      const slot = slots[w.selectedFi];
                      // ground skirt in the country's (selected) land color makes
                      // the monument sit on its own soil instead of a grey disc
                      const skirt = new Mesh(
                        new CylinderGeometry(0.55, 0.62, 0.012, 48),
                        new MeshBasicMaterial({ color: sc.selected[slot].clone() })
                      );
                      skirt.position.y = 0.005;
                      model3d.add(skirt);
                      // standard plaza discs re-tint toward the land color
                      const plazaHex = new Color(TONES.plaza).getHexString();
                      const plazaTint = sc.base[slot]
                        .clone()
                        .lerp(new Color(1, 1, 1), 0.42);
                      model3d.traverse((child) => {
                        if (
                          child instanceof Mesh &&
                          !Array.isArray(child.material) &&
                          "color" in child.material &&
                          (child.material.color as Color).getHexString() === plazaHex
                        ) {
                          (child.material.color as Color).copy(plazaTint);
                        }
                      });
                    }
                    placeOnGlobe(model3d, anchor, MODEL_HEIGHT);
                    modelAnchor = anchor.clone();
                    // start fully buried; the ocean sphere depth-hides it
                    model3d.position.addScaledVector(
                      anchor.clone().normalize(),
                      -BURIAL
                    );
                    group.add(model3d);
                    model3dStart = -1; // emerge begins once the flight lands
                    rigDir = 1;
                    w.cardAnchor = anchor;
                    cardBelow = true;
                    setCard({ landmark, thumb, hidePhoto: true });
                  })
                  .catch(() => {
                    // fall back to the photo card on any load failure
                    if (disposed || w.selectedIso !== iso) return;
                    w.cardAnchor = anchor;
                    cardBelow = false;
                    setCard({ landmark, thumb });
                  });
              } else {
                w.cardAnchor = anchor;
                cardBelow = false;
                setCard({ landmark, thumb });
              }
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
        const has3d = hasLandmarkModel(country.feature.iso);
        rigRange = 0.95;
        startFlight(-lng * DEG, lat * DEG, has3d ? 2.2 : FOCUS_DIST, 1600);
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
        startFlight(w.yaw, 0.45, BASE_DIST, 1400, undefined, 0);
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

repaint(); // initial land paint

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
          w.camTilt = f.fromTilt + (f.toTilt - f.fromTilt) * e;
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
        camera.position.set(
          0,
          -Math.sin(w.camTilt) * w.dist,
          Math.cos(w.camTilt) * w.dist
        );
        camera.lookAt(0, 0, 0);

        // blend to/from the anchor-orbit rig while a 3D landmark is on stage
        if (model3d) {
          const blendStep = w.reducedMotion ? 1 : dt;
          if (rigDir > 0 && !w.flight) {
            rigBlend = Math.min(1, rigBlend + blendStep * 1.6);
          } else if (rigDir < 0) {
            rigBlend -= blendStep * 2.2;
            if (rigBlend <= 0) removeModel3d();
          }
        }
        if (model3d && modelAnchor && rigBlend > 0) {
          const rigAnchor = modelAnchor.clone().applyEuler(group.rotation);
          const normal = rigAnchor.clone().normalize();
          const north = new Vector3(0, 1, 0)
            .addScaledVector(normal, -normal.y)
            .normalize();
          const orbitPos = rigAnchor
            .clone()
            .addScaledVector(normal, Math.sin(RIG_ELEV) * rigRange)
            .addScaledVector(north, -Math.cos(RIG_ELEV) * rigRange);
          const orbitTarget = rigAnchor
            .clone()
            .addScaledVector(normal, MODEL_HEIGHT * 0.45);
          const e = easeInOutCubic(Math.max(0, Math.min(1, rigBlend)));
          camera.position.lerp(orbitPos, e);
          const target = new Vector3(0, 0, 0).lerp(orbitTarget, e);
          camera.lookAt(target);
        }

        // 3D landmark emerge: rises out of the terrain with a slight overshoot,
        // starting only when the camera has landed so the burst is on stage
        if (model3d && model3dStart === -1 && !w.flight) model3dStart = now;
        if (model3d && model3dStart > 0 && modelAnchor) {
          const t = w.reducedMotion
            ? 1
            : Math.min(1, (now - model3dStart) / EMERGE_MS);
          const lift = BURIAL * (1 - easeOutBack(t));
          model3d.position
            .copy(modelAnchor)
            .addScaledVector(modelAnchor.clone().normalize(), -lift);
          if (t >= 1) {
            model3d.position.copy(modelAnchor);
            model3dStart = 0;
          }
        }

        // landmark card follows its anchor point
        const cardEl = cardRef.current;
        if (cardEl && w.cardAnchor) {
          const v = w.cardAnchor.clone().applyEuler(group.rotation);
          const facing = v.z > 0.2;
          // refresh matrixWorldInverse — the camera may have been repositioned
          // by the orbit rig after the renderer last computed it
          camera.updateMatrixWorld(true);
          v.project(camera);
          const x = ((v.x + 1) / 2) * container.clientWidth;
          const y = ((1 - v.y) / 2) * container.clientHeight;
          const anchorShift = cardBelow ? "translate(-50%, 16px)" : "translate(-50%, -100%)";
          cardEl.style.transform = `translate(${x}px, ${y}px) ${anchorShift}`;
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
        removeModel3d();
        for (const d of disposables) d.dispose();
        renderer.dispose();
        canvas.remove();
        w.applyExternalSelection = null;
        w.adjustRigRange = null;
        w.indexed = null;
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
              {!card.hidePhoto && (
                <>
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
                </>
              )}
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
