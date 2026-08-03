// Pha That Luang (Vientiane) — papercraft miniature.
// Golden lotus-bud stupa: curvilinear square spire on a 3-tier stepped base,
// ringed by small gold stupas, inside a white cloister wall studded with
// tiny gold spires and a red-roofed entry pavilion.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;

const GOLD = TONES.gold; // #cfa84c
const GOLD_LIGHT = "#d9b45c";
const GOLD_DARK = "#b18d3f";
const GOLD_DEEP = "#95762f";

/** 4-sided frustum, flats facing the axes; base of mesh at y = 0.
 *  hwB/hwT are half flat-to-flat widths. */
function frustum4(hwB: number, hwT: number, h: number, color: string): Mesh {
  const geo = new CylinderGeometry(hwT * SQ2, hwB * SQ2, h, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, h / 2, 0);
  return new Mesh(geo, mat(color));
}

function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  color: string
): Mesh {
  const m = new Mesh(new BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z);
  return m;
}

/** Points spaced along the perimeter of a square of half-size hw,
 *  n per side, corners included exactly once. */
function squareRing(hw: number, n: number): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const t = -hw + (2 * hw * i) / n;
    pts.push([t, hw], [hw, -t], [-t, -hw], [-hw, t]);
  }
  return pts;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  // ---- Cloister wall ring: white walls, red coping, tiny gold spires ----
  const W = 0.25; // wall centerline half-size
  const WALL_H = 0.048;
  const WALL_T = 0.022;
  for (let i = 0; i < 4; i++) {
    const wall = box(2 * W + WALL_T, WALL_H, WALL_T, 0, WALL_H / 2, W, TONES.white);
    const cope = box(2 * W + WALL_T, 0.008, WALL_T + 0.004, 0, WALL_H + 0.004, W, TONES.woodRed);
    const wg = new Group();
    wg.add(wall, cope);
    wg.rotation.y = (i * Math.PI) / 2;
    g.add(wg);
  }
  // tiny gold spires along the wall top (corners + thirds)
  for (const [x, z] of squareRing(W, 3)) {
    const ped = box(0.018, 0.014, 0.018, x, WALL_H + 0.019, z, GOLD_DARK);
    const sp = new Mesh(new ConeGeometry(0.011, 0.05, 6), mat(GOLD));
    sp.position.set(x, WALL_H + 0.051, z);
    g.add(ped, sp);
  }

  // ---- Entry pavilion on the front (+z) wall ----
  const pav = new Group();
  pav.position.set(0, 0, W);
  pav.add(box(0.075, 0.06, 0.055, 0, 0.03, 0, TONES.white));
  const roof1 = frustum4(0.052, 0.02, 0.03, TONES.woodRed);
  roof1.position.y = 0.06;
  const roof2 = frustum4(0.036, 0.012, 0.026, TONES.woodRed);
  roof2.position.y = 0.092;
  const pavTip = new Mesh(new ConeGeometry(0.008, 0.032, 6), mat(GOLD));
  pavTip.position.y = 0.132;
  pav.add(roof1, roof2, pavTip);
  g.add(pav);

  // ---- 3-tier stepped base (gold) ----
  g.add(box(0.39, 0.05, 0.39, 0, 0.025, 0, GOLD_DARK));
  g.add(box(0.32, 0.045, 0.32, 0, 0.0725, 0, GOLD));
  g.add(box(0.25, 0.05, 0.25, 0, 0.12, 0, GOLD_DARK));
  // small stair porches on each side of the lowest tier
  for (let i = 0; i < 4; i++) {
    const porch = box(0.07, 0.032, 0.045, 0, 0.016, 0.215, GOLD_DEEP);
    const pg = new Group();
    pg.add(porch);
    pg.rotation.y = (i * Math.PI) / 2;
    g.add(pg);
  }

  // ---- Ring of small stupas on tier-2 ledge, around tier 3 ----
  for (const [x, z] of squareRing(0.145, 5)) {
    const ped = box(0.022, 0.016, 0.022, x, 0.103, z, GOLD_DEEP);
    const sp = new Mesh(new ConeGeometry(0.013, 0.055, 6), mat(GOLD_LIGHT));
    sp.position.set(x, 0.1385, z);
    g.add(ped, sp);
  }

  // ---- Tall square pedestal level with upward lotus petals on its rim ----
  const pedestal = frustum4(0.082, 0.072, 0.07, GOLD_DARK);
  pedestal.position.y = 0.145;
  g.add(pedestal);
  for (const [x, z] of squareRing(0.07, 3)) {
    const petal = new Mesh(new ConeGeometry(0.011, 0.04, 5), mat(GOLD));
    petal.position.set(x, 0.225, z);
    petal.rotation.set(z * 3.6, 0, -x * 3.6); // lean gently outward
    g.add(petal);
  }

  // ---- Lotus bud: outward swell, shouldered curve, long slender spire ----
  const stages: Array<[number, number, number]> = [
    // [hw bottom, hw top, height]
    [0.05, 0.07, 0.05], // swell out over the petal ring
    [0.07, 0.044, 0.09],
    [0.044, 0.028, 0.08],
    [0.027, 0.014, 0.12],
    [0.013, 0.008, 0.06],
  ];
  let y = 0.215;
  stages.forEach(([hwB, hwT, h], i) => {
    const s = frustum4(hwB, hwT, h, GOLD_LIGHT);
    s.position.y = y;
    g.add(s);
    y += h;
    if (i > 0) {
      // slim molding band at each joint above the swell
      const band = box(hwT * 2 + 0.01, 0.008, hwT * 2 + 0.01, 0, y, 0, GOLD_DEEP);
      g.add(band);
    }
  });

  // ---- Finial: small parasol flare, then the point ----
  const parasol = frustum4(0.006, 0.016, 0.022, GOLD_DARK);
  parasol.position.y = y + 0.003;
  g.add(parasol);
  const tip = new Mesh(new ConeGeometry(0.009, 0.06, 6), mat(GOLD_LIGHT));
  tip.position.y = y + 0.025 + 0.03;
  g.add(tip);

  return g;
}
