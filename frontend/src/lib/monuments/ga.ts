// Parc National de la Lopé — papercraft landform: domed ochre-green savanna
// knolls rising behind a lumpy dark-green forest band, the whole far bank
// split from the foreground by a wide braided brown river with sand bars.
// A forest elephant stands on the open slope. Natural landform: no plaza disc.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const R = 0.32; // scene radius (footprint 0.64)
const BANK_H = 0.05; // far-bank plateau top
const BANK_Z = 0.075; // land lies at z < BANK_Z

const RIVER = "#9c8467";
const SANDBAR = "#c2ad8a";
const GRASS = "#b4a86c"; // sunlit savanna
const GRASS_DRY = "#a1955c";
const FOREST_DARK = "#46603f";
const FOREST_MID = "#56714b";
const ELEPHANT = "#4c5254";

/** Knoll profile: radius fraction at normalized height t. Full flanks with a
 *  rounded crest — a grassy dome, not a cone. */
const prof = (t: number) => Math.sqrt(Math.max(0, 1 - Math.pow(t, 2.6)));
/** Inverse: knoll height at radius fraction f. */
const heightAt = (h: number, f: number) =>
  h * Math.pow(Math.max(0, 1 - f * f), 1 / 2.6);

const KNOLLS = [
  { x: -0.03, z: -0.13, r: 0.208, h: 0.44, seg: 14, color: GRASS },
  { x: 0.185, z: -0.12, r: 0.105, h: 0.27, seg: 12, color: GRASS_DRY },
  { x: -0.215, z: -0.13, r: 0.085, h: 0.19, seg: 12, color: GRASS_DRY },
];

/** Ground height anywhere on the far bank. */
function terrainY(x: number, z: number): number {
  let y = BANK_H;
  for (const k of KNOLLS) {
    const d = Math.hypot(x - k.x, z - k.z);
    if (d < k.r) y = Math.max(y, BANK_H + heightAt(k.h, d / k.r));
  }
  return y;
}

function dome(r: number, h: number, seg: number, color: string, N = 8): Mesh {
  const pts: Vector2[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push(new Vector2(r * prof(t), h * t));
  }
  return new Mesh(new LatheGeometry(pts, seg), mat(color));
}

/** Circle segment of the scene disc lying beyond a chord, extruded to h.
 *  rotY = +PI/2 keeps z < d, -PI/2 keeps z > d. */
function segment(d: number, h: number, color: string, rotY: number): Mesh {
  const zc = Math.sqrt(R * R - d * d);
  const a = Math.atan2(zc, d);
  const s = new Shape();
  s.moveTo(d, -zc);
  s.absarc(0, 0, R, -a, a, false);
  s.closePath();
  const geo = new ExtrudeGeometry(s, {
    depth: h,
    bevelEnabled: false,
    curveSegments: 14,
  });
  geo.rotateX(-Math.PI / 2);
  geo.rotateY(rotY);
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

/** Small forest elephant, facing +x, base at y = 0. */
function elephant(): Group {
  const g = new Group();
  g.add(box(0.072, 0.042, 0.038, 0, 0.052, 0, ELEPHANT));
  g.add(box(0.036, 0.036, 0.032, 0.05, 0.056, 0, ELEPHANT)); // head
  for (const sz of [1, -1])
    g.add(box(0.016, 0.03, 0.006, 0.046, 0.062, sz * 0.019, ELEPHANT)); // ears
  const t1 = box(0.012, 0.024, 0.012, 0.069, 0.038, 0, ELEPHANT);
  t1.rotation.z = 0.4;
  g.add(t1);
  const t2 = box(0.011, 0.02, 0.011, 0.082, 0.018, 0, ELEPHANT);
  t2.rotation.z = 1.0;
  g.add(t2);
  for (const sx of [0.025, -0.025])
    for (const sz of [1, -1])
      g.add(box(0.013, 0.032, 0.013, sx, 0.016, sz * 0.013, ELEPHANT));
  return g;
}

export function build(): Group {
  const g = new Group();

  // ---- braided brown river fills the whole disc, land sits on top ----
  const water = new Mesh(new CylinderGeometry(R, R, 0.028, 36), mat(RIVER));
  water.position.y = 0.014;
  g.add(water);

  const bars: Array<[number, number, number, number]> = [
    [-0.12, 0.135, 0.088, 0.3],
    [0.11, 0.115, 0.07, 0.32],
    [0.0, 0.185, 0.052, 0.34],
  ];
  for (const [x, z, r, sz] of bars) {
    const bar = new Mesh(new CylinderGeometry(r, r, 0.014, 10), mat(SANDBAR));
    bar.position.set(x, 0.031, z);
    bar.scale.z = sz;
    g.add(bar);
  }

  // ---- far bank plateau and the foreground strip ----
  const bank = segment(-BANK_Z, BANK_H, FOREST_MID, Math.PI / 2);
  g.add(bank);
  g.add(segment(0.21, 0.04, FOREST_MID, -Math.PI / 2));
  for (const [x, z, r] of [
    [-0.14, 0.248, 0.055],
    [0.0, 0.258, 0.05],
    [0.15, 0.243, 0.046],
  ] as const) {
    const bush = dome(r, r * 0.9, 8, FOREST_DARK, 5);
    bush.position.set(x, 0.032, z);
    g.add(bush);
  }

  // ---- savanna knolls ----
  for (const k of KNOLLS) {
    const m = dome(k.r, k.h, k.seg, k.color);
    m.position.set(k.x, BANK_H - 0.004, k.z);
    g.add(m);
  }

  // ---- forest band lumping along the bank front and up the knoll feet ----
  const trees: Array<[number, number, number, number, string]> = [
    [-0.27, -0.02, 0.068, 0.055, FOREST_DARK],
    [-0.19, 0.0, 0.078, 0.066, FOREST_MID],
    [-0.11, 0.008, 0.082, 0.072, FOREST_DARK],
    [-0.03, 0.0, 0.076, 0.06, FOREST_MID],
    [0.235, -0.01, 0.074, 0.064, FOREST_DARK],
    [0.285, -0.07, 0.06, 0.048, FOREST_MID],
    [0.28, -0.14, 0.05, 0.04, FOREST_DARK],
    [-0.28, -0.09, 0.055, 0.044, FOREST_MID],
  ];
  for (const [x, z, r, h, color] of trees) {
    const m = dome(r, h, 8, color, 5);
    m.position.set(x, terrainY(x, z) - 0.016, z);
    g.add(m);
  }

  // ---- forest elephant on the open ground at the foot of the big knoll ----
  const ex = 0.1;
  const ez = 0.045;
  const el = elephant();
  el.position.set(ex, terrainY(ex, ez) - 0.006, ez);
  el.rotation.y = 0.18;
  g.add(el);

  return g;
}
