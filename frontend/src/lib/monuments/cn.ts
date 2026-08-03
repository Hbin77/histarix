// 万里长城 (Great Wall) — papercraft miniature diorama.
// Slender crenellated wall snaking in an S-curve over two green ridge humps,
// two square watchtowers with dark window notches on the crests.
// Natural-landform base: no plaza disc, elliptical grass terrain instead.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Vector2,
  Vector3,
} from "three";
import { mat, TONES } from "./materials";

const PLATEAU = 0.03; // top of the grass base slab
const WALL_W = 0.042; // wall width across the path
const WALL_H = 0.042; // walkway height above terrain
const GRASS = "#87a074"; // base meadow, slightly lighter than forest humps

interface Hump {
  cx: number;
  cz: number;
  rx: number;
  rz: number;
  h: number; // crest height above the plateau
}

// Two ridge humps under the S-curve's swings + a broad low saddle ridge
// connecting them so the wall rides a crest line the whole way.
const HUMPS: Hump[] = [
  { cx: -0.155, cz: 0.07, rx: 0.2, rz: 0.145, h: 0.14 },
  { cx: 0.14, cz: -0.07, rx: 0.22, rz: 0.16, h: 0.19 },
  { cx: 0.0, cz: 0.0, rx: 0.3, rz: 0.12, h: 0.05 },
];

/** Analytic terrain: plateau + quartic bumps (shared by humps and wall). */
function groundY(x: number, z: number): number {
  let y = PLATEAU;
  for (const hm of HUMPS) {
    const d2 = ((x - hm.cx) / hm.rx) ** 2 + ((z - hm.cz) / hm.rz) ** 2;
    if (d2 < 1) y += hm.h * (1 - d2) ** 2;
  }
  return y;
}

const AMP = 0.1; // S-curve swing amplitude

/** S-curve path of the wall in the XZ plane, t in [0, 1]. */
function pathXZ(t: number): { x: number; z: number } {
  return { x: -0.345 + 0.69 * t, z: AMP * Math.sin(2 * Math.PI * t) };
}

/** Walk-top point (terrain + wall height) at parameter t. The extreme ends
 *  dip slightly so the ribbon reads as continuing past the diorama rim. */
function walkTop(t: number): Vector3 {
  const p = pathXZ(t);
  const edge = Math.min(t, 1 - t);
  const dip = edge < 0.06 ? (0.06 - edge) * 0.42 : 0;
  return new Vector3(p.x, groundY(p.x, p.z) + WALL_H - dip, p.z);
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

/** One wall segment from p0 to p1 (walk-top points), local +Z along path.
 *  Ends overrun by 0.01 on both sides to heal wedge gaps at bends. */
function wallSegment(p0: Vector3, p1: Vector3, crenellate: boolean): Group {
  const g = new Group();
  g.position.copy(p0);
  g.lookAt(p1); // non-camera objects aim local +Z at the target
  const len = p0.distanceTo(p1);
  const mid = (p0.y + p1.y) / 2;
  const depth = Math.max(mid - 0.018, 0.05); // bury body down to base level

  g.add(box(WALL_W, depth, len + 0.02, 0, -depth / 2, len / 2, TONES.stone));
  // parapet rails on both edges
  for (const sx of [1, -1]) {
    g.add(box(0.009, 0.026, len + 0.02, sx * 0.0165, 0.01, len / 2, TONES.stoneDark));
    if (crenellate)
      g.add(box(0.012, 0.016, 0.016, sx * 0.0165, 0.031, len / 2, TONES.stoneDark));
  }
  return g;
}

/** Squashed low-poly cone hump matching the quartic terrain bump.
 *  Skirt runs down to ground level so overhang past the slab stays grounded. */
function hump(hm: Hump, color: string): Mesh {
  const hPhys = hm.h + PLATEAU - 0.004;
  const ss = [0, 0.04, 0.12, 0.25, 0.45, 0.7, 1];
  const pts = ss.map(
    (s) => new Vector2(Math.sqrt(1 - Math.sqrt(s)) * hm.rx + 0.001, s * hPhys)
  );
  const m = new Mesh(new LatheGeometry(pts, 12), mat(color));
  m.scale.z = hm.rz / hm.rx;
  m.position.set(hm.cx, 0.004, hm.cz);
  return m;
}

/** Square two-storey watchtower at path parameter t, aligned to the path. */
function tower(t: number): Group {
  const g = new Group();
  const p = pathXZ(t);
  const gy = groundY(p.x, p.z);
  g.position.set(p.x, gy, p.z);
  const dz = AMP * 2 * Math.PI * Math.cos(2 * Math.PI * t);
  g.rotation.y = Math.atan2(0.69, dz);

  // lower storey (buried into the crest) + upper storey
  g.add(box(0.1, 0.14, 0.1, 0, 0.01, 0, TONES.stoneDark));
  g.add(box(0.088, 0.062, 0.088, 0, 0.111, 0, TONES.stone));
  // dark window notches, one per face
  g.add(box(0.006, 0.028, 0.024, 0.0455, 0.109, 0, TONES.ink));
  g.add(box(0.006, 0.028, 0.024, -0.0455, 0.109, 0, TONES.ink));
  g.add(box(0.024, 0.028, 0.006, 0, 0.109, 0.0455, TONES.ink));
  g.add(box(0.024, 0.028, 0.006, 0, 0.109, -0.0455, TONES.ink));
  // overhanging cap slab + crenellated parapet
  g.add(box(0.106, 0.011, 0.106, 0, 0.148, 0, TONES.stoneDark));
  g.add(box(0.106, 0.018, 0.008, 0, 0.162, 0.049, TONES.stoneDark));
  g.add(box(0.106, 0.018, 0.008, 0, 0.162, -0.049, TONES.stoneDark));
  g.add(box(0.008, 0.018, 0.106, 0.049, 0.162, 0, TONES.stoneDark));
  g.add(box(0.008, 0.018, 0.106, -0.049, 0.162, 0, TONES.stoneDark));
  // merlons: corners + edge midpoints
  for (const sx of [1, 0, -1])
    for (const sz of [1, 0, -1]) {
      if (sx === 0 && sz === 0) continue;
      g.add(box(0.013, 0.014, 0.013, sx * 0.049, 0.178, sz * 0.049, TONES.stoneDark));
    }
  return g;
}

export function build(): Group {
  const g = new Group();

  // --- elliptical grass base slab (0.74 x 0.5 footprint) ---
  const base = new Mesh(new CylinderGeometry(1, 1.03, PLATEAU, 26), mat(GRASS));
  base.scale.set(0.36, 1, 0.25);
  base.position.y = PLATEAU / 2;
  g.add(base);

  // --- forest ridge humps + connecting saddle ridge ---
  g.add(hump(HUMPS[0], TONES.forest));
  g.add(hump(HUMPS[1], "#6f8a5e"));
  g.add(hump(HUMPS[2], TONES.forest));

  // --- snaking crenellated wall ---
  const N = 30;
  for (let i = 0; i < N; i++) {
    g.add(wallSegment(walkTop(i / N), walkTop((i + 1) / N), i % 2 === 0));
  }

  // --- watchtowers on the two crests ---
  g.add(tower(0.25));
  g.add(tower(0.72));

  return g;
}
