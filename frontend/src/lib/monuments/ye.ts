// Dar al-Hajar (Wadi Dhahr) — papercraft: a stacked mud-brick tower-house of
// stepped rectangular tiers growing straight out of a jagged sandstone
// pinnacle. Ochre-tan walls picked out with white gypsum window surrounds,
// string courses and parapet trim.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
} from "three";
import { mat, TONES } from "./materials";

const OCHRE = "#c19669";
const OCHRE_D = "#a87e54";
const ROCK = "#bd9a76";
const ROCK_D = "#a37f5c";
const PANE = "#5d4b39";

const ochre = mat(OCHRE);
const white = mat(TONES.white);
const pane = mat(PANE);

function box(
  w: number,
  d: number,
  y0: number,
  y1: number,
  m: MeshLambertMaterial,
  x = 0,
  z = 0
): Mesh {
  const mesh = new Mesh(new BoxGeometry(w, y1 - y0, d), m);
  mesh.position.set(x, (y0 + y1) / 2, z);
  return mesh;
}

/** Gypsum-framed window, face normal along local +Z before rotation. */
function win(
  x: number,
  y: number,
  z: number,
  ry: number,
  w = 0.026,
  h = 0.036
): Group {
  const g = new Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  g.add(new Mesh(new BoxGeometry(w, h, 0.009), white));
  const p = new Mesh(new BoxGeometry(w * 0.46, h * 0.52, 0.012), pane);
  p.position.y = -h * 0.09;
  g.add(p);
  return g;
}

interface Tier {
  w: number;
  d: number;
  y0: number;
  y1: number;
  x: number;
  z: number;
}

export function build(): Group {
  const g = new Group();

  // ---- rocky ground and the pinnacle the palace grows out of ----
  const ground = new Mesh(new CylinderGeometry(0.32, 0.32, 0.024, 26), mat(ROCK_D));
  ground.position.y = 0.012;
  g.add(ground);

  const knob = (
    rT: number,
    rB: number,
    h: number,
    x: number,
    y: number,
    z: number,
    sides: number,
    ry: number,
    color: string
  ) => {
    const m = new Mesh(new CylinderGeometry(rT, rB, h, sides), mat(color));
    m.position.set(x, y + h / 2, z);
    m.rotation.y = ry;
    g.add(m);
  };
  knob(0.14, 0.19, 0.25, 0.03, 0.01, 0.0, 6, 0.4, ROCK);
  knob(0.095, 0.125, 0.19, 0.15, 0.01, 0.05, 5, 1.15, ROCK_D);
  knob(0.07, 0.1, 0.14, -0.115, 0.01, 0.085, 5, 2.1, ROCK_D);
  knob(0.055, 0.08, 0.095, 0.09, 0.01, -0.145, 5, 0.8, ROCK);
  // angular slabs breaking the pinnacle into facets
  for (const [x, y, z, w, h, rx, ry] of [
    [0.15, 0.06, 0.13, 0.075, 0.17, 0.16, 0.5],
    [-0.13, 0.05, -0.05, 0.07, 0.14, -0.2, 2.4],
    [0.2, 0.03, -0.06, 0.065, 0.11, 0.22, 1.9],
    [-0.02, 0.04, 0.16, 0.08, 0.13, -0.14, 0.15],
  ] as const) {
    const s = new Mesh(new BoxGeometry(w, h, w * 0.7), mat(ROCK_D));
    s.position.set(x, y + h / 2, z);
    s.rotation.set(rx, ry, 0.1);
    g.add(s);
  }
  // loose boulders scattered at the foot
  for (const [x, z, s, r] of [
    [-0.21, 0.02, 0.055, 0.5],
    [0.22, -0.09, 0.048, 1.2],
    [0.05, 0.21, 0.052, 0.2],
    [-0.16, -0.17, 0.045, 0.9],
  ] as const) {
    const b = new Mesh(new BoxGeometry(s, s * 0.75, s), mat(ROCK_D));
    b.position.set(x, 0.024 + s * 0.3, z);
    b.rotation.set(0.12, r, 0.09);
    g.add(b);
  }

  // ---- stacked palace tiers ----
  // Tiers step in only slightly and shuffle back and forth, so the stack
  // reads as one irregular tower-house rather than a wedding cake.
  const tiers: Tier[] = [
    { w: 0.205, d: 0.185, y0: 0.17, y1: 0.38, x: -0.055, z: 0.005 },
    { w: 0.19, d: 0.17, y0: 0.38, y1: 0.565, x: -0.045, z: 0.015 },
    { w: 0.17, d: 0.152, y0: 0.565, y1: 0.72, x: -0.03, z: -0.005 },
    { w: 0.148, d: 0.132, y0: 0.72, y1: 0.85, x: -0.02, z: 0.008 },
  ];
  for (const t of tiers) {
    g.add(box(t.w, t.d, t.y0, t.y1, ochre, t.x, t.z));
    // white string course a little under half way up
    const sc = t.y0 + (t.y1 - t.y0) * 0.42;
    g.add(box(t.w + 0.005, t.d + 0.005, sc, sc + 0.008, white, t.x, t.z));
    // white parapet capping the tier
    g.add(box(t.w + 0.007, t.d + 0.007, t.y1 - 0.011, t.y1, white, t.x, t.z));
    g.add(box(t.w + 0.003, t.d + 0.003, t.y1 - 0.021, t.y1 - 0.011, mat(OCHRE_D), t.x, t.z));
  }

  // lower annex merging into the right-hand shoulder of the rock
  const annex: Tier = { w: 0.135, d: 0.125, y0: 0.2, y1: 0.4, x: 0.125, z: -0.015 };
  g.add(box(annex.w, annex.d, annex.y0, annex.y1, ochre, annex.x, annex.z));
  g.add(box(annex.w + 0.007, annex.d + 0.007, 0.389, 0.4, white, annex.x, annex.z));

  // projecting front bay on the lowest tier
  g.add(box(0.095, 0.055, 0.21, 0.37, ochre, -0.06, 0.115));
  g.add(box(0.102, 0.062, 0.359, 0.37, white, -0.06, 0.115));

  // crowning turret
  g.add(box(0.098, 0.09, 0.85, 0.9, ochre, -0.02, 0.008));
  g.add(box(0.106, 0.098, 0.889, 0.9, white, -0.02, 0.008));
  for (const [cx, cz] of [
    [-0.063, 0.049],
    [0.023, 0.049],
    [-0.063, -0.033],
    [0.023, -0.033],
  ] as const) {
    g.add(box(0.017, 0.017, 0.9, 0.918, white, cx, cz));
  }

  // ---- gypsum-framed windows on the sunlit faces ----
  const F = 0.0; // front face rotation
  const R = Math.PI / 2; // right face rotation
  const wins: Array<[number, number, number, number, number, number]> = [
    // tier 1 — front face z = 0.0975, right face x = 0.0475
    [-0.115, 0.215, 0.102, F, 0.028, 0.038],
    [-0.055, 0.215, 0.102, F, 0.028, 0.038],
    [0.005, 0.215, 0.102, F, 0.028, 0.038],
    [-0.085, 0.31, 0.102, F, 0.026, 0.03],
    [-0.025, 0.31, 0.102, F, 0.026, 0.03],
    [0.052, 0.215, 0.05, R, 0.028, 0.038],
    [0.052, 0.215, -0.038, R, 0.028, 0.038],
    [0.052, 0.31, 0.006, R, 0.026, 0.03],
    // tier 2 — front face z = 0.1, right face x = 0.05
    [-0.1, 0.42, 0.105, F, 0.028, 0.038],
    [-0.045, 0.42, 0.105, F, 0.028, 0.038],
    [0.01, 0.42, 0.105, F, 0.028, 0.038],
    [-0.072, 0.51, 0.105, F, 0.024, 0.03],
    [-0.018, 0.51, 0.105, F, 0.024, 0.03],
    [0.055, 0.42, 0.058, R, 0.028, 0.038],
    [0.055, 0.42, -0.028, R, 0.028, 0.038],
    [0.055, 0.51, 0.015, R, 0.024, 0.03],
    // tier 3 — front face z = 0.071, right face x = 0.055
    [-0.075, 0.6, 0.076, F, 0.026, 0.034],
    [-0.03, 0.6, 0.076, F, 0.026, 0.034],
    [0.015, 0.6, 0.076, F, 0.026, 0.034],
    [-0.052, 0.675, 0.076, F, 0.022, 0.028],
    [0.0, 0.675, 0.076, F, 0.022, 0.028],
    [0.06, 0.6, 0.028, R, 0.026, 0.034],
    [0.06, 0.6, -0.038, R, 0.026, 0.034],
    // tier 4 — front face z = 0.074, right face x = 0.054
    [-0.055, 0.748, 0.079, F, 0.024, 0.03],
    [-0.015, 0.748, 0.079, F, 0.024, 0.03],
    [0.025, 0.748, 0.079, F, 0.024, 0.03],
    [-0.035, 0.812, 0.079, F, 0.02, 0.026],
    [0.012, 0.812, 0.079, F, 0.02, 0.026],
    [0.059, 0.748, 0.008, R, 0.024, 0.03],
    [0.059, 0.748, -0.042, R, 0.024, 0.03],
    // annex — front face z = 0.0475, right face x = 0.1925
    [0.09, 0.29, 0.052, F, 0.026, 0.034],
    [0.155, 0.29, 0.052, F, 0.026, 0.034],
    [0.197, 0.29, -0.045, R, 0.026, 0.034],
    [0.197, 0.29, 0.015, R, 0.026, 0.034],
    // projecting front bay
    [-0.06, 0.28, 0.147, F, 0.03, 0.042],
  ];
  for (const [x, y, z, ry, w, h] of wins) g.add(win(x, y, z, ry, w, h));

  return g;
}
