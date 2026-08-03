// Alhambra (Granada) — papercraft miniature.
// "The red one": reddish fortress-palace crowning a green, cypress-clad hill.
// Left: Alcazaba tower cluster (Torre de la Vela + Torre del Homenaje).
// Center: slender Torre de Comares over long crenellated curtain walls.
// Right: Palace of Charles V block + Santa María church spire.
// Natural hill base — no plaza disc.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
} from "three";
import { mat, TONES } from "./materials";

const HILL_H = 0.16; // plateau height
const HILL_AX = 0.36; // bottom semi-axis along x
const HILL_AZ = 0.23; // bottom semi-axis along z
const HILL_TOP = 0.82; // top radius ratio (frustum taper)

const WALL = TONES.brick; // sun-warmed rampart red
const TOWER = "#b3795c"; // slightly deeper alhambra red
const DARK = TONES.brickDark;
const CYPRESS = "#4f6b51"; // dark cypress green
const BUSH = "#6b8a5e"; // lighter canopy green

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

/** Merlon row around the top perimeter of a rectangle (centered cx, cz). */
function merlons(
  g: Group,
  cx: number,
  cz: number,
  w: number,
  d: number,
  y: number,
  color: string
): void {
  const s = 0.014;
  const geo = new BoxGeometry(s, s * 1.25, s);
  const m = mat(color);
  const nx = Math.max(2, Math.round(w / 0.036));
  const nz = Math.max(2, Math.round(d / 0.036));
  const put = (x: number, z: number) => {
    const mm = new Mesh(geo, m);
    mm.position.set(x, y, z);
    g.add(mm);
  };
  for (let i = 0; i <= nx; i++) {
    const x = cx - w / 2 + (w * i) / nx;
    put(x, cz + d / 2);
    put(x, cz - d / 2);
  }
  for (let i = 1; i < nz; i++) {
    const z = cz - d / 2 + (d * i) / nz;
    put(cx + w / 2, z);
    put(cx - w / 2, z);
  }
}

/** Crenellated fortress tower rising from the plateau. */
function tower(
  g: Group,
  x: number,
  z: number,
  w: number,
  d: number,
  h: number,
  color: string
): void {
  g.add(box(w, h, d, x, HILL_H + h / 2, z, color));
  g.add(box(w + 0.014, 0.013, d + 0.014, x, HILL_H + h + 0.0065, z, DARK));
  merlons(g, x, z, w + 0.008, d + 0.008, HILL_H + h + 0.021, color);
}

/** Crenellated curtain wall segment along x. */
function wall(g: Group, cx: number, cz: number, len: number, h: number): void {
  g.add(box(len, h, 0.022, cx, HILL_H + h / 2, cz, WALL));
  const n = Math.max(2, Math.round(len / 0.038));
  const geo = new BoxGeometry(0.013, 0.016, 0.016);
  const m = mat(WALL);
  for (let i = 0; i <= n; i++) {
    const mm = new Mesh(geo, m);
    mm.position.set(cx - len / 2 + (len * i) / n, HILL_H + h + 0.008, cz);
    g.add(mm);
  }
}

/** Point on the hill slope at polar angle a (rad) and height fraction f. */
function slope(a: number, f: number): [number, number, number] {
  const r = 1 + (HILL_TOP - 1) * f;
  return [HILL_AX * r * Math.cos(a), f * HILL_H, HILL_AZ * r * Math.sin(a)];
}

function cypress(g: Group, x: number, y: number, z: number, h: number): void {
  const c = new Mesh(new ConeGeometry(h * 0.22, h, 5), mat(CYPRESS));
  c.position.set(x, y + h / 2, z);
  g.add(c);
}

function bush(g: Group, x: number, y: number, z: number, r: number): void {
  const b = new Mesh(new SphereGeometry(r, 6, 4), mat(BUSH));
  b.position.set(x, y + r * 0.7, z);
  b.scale.y = 0.8;
  g.add(b);
}

export function build(): Group {
  const g = new Group();

  // ---- green hill (faceted elliptical frustum, base at y=0) ----
  const hill = new Mesh(
    new CylinderGeometry(HILL_TOP, 1, HILL_H, 14),
    mat(TONES.forest)
  );
  hill.scale.set(HILL_AX, 1, HILL_AZ);
  hill.position.y = HILL_H / 2;
  g.add(hill);

  // reddish terrace slab where the ramparts meet the hilltop
  g.add(box(0.55, 0.024, 0.18, 0, HILL_H + 0.002, 0, DARK));

  // ---- curtain walls (long crenellated circuit) ----
  wall(g, 0, 0.079, 0.52, 0.07);
  wall(g, 0, -0.079, 0.52, 0.07);
  g.add(box(0.022, 0.07, 0.14, 0.26, HILL_H + 0.035, 0, WALL));
  g.add(box(0.022, 0.07, 0.14, -0.26, HILL_H + 0.035, 0, WALL));

  // ---- Alcazaba cluster (left) ----
  tower(g, -0.235, 0.01, 0.1, 0.1, 0.16, WALL); // Torre de la Vela
  tower(g, -0.125, -0.025, 0.07, 0.07, 0.2, TOWER); // Torre del Homenaje
  tower(g, -0.19, 0.062, 0.05, 0.05, 0.1, WALL); // front bastion

  // ---- Torre de Comares (tall, slender — center) ----
  tower(g, 0.04, -0.012, 0.095, 0.095, 0.3, TOWER);
  // arched window slits on the south face
  for (const dx of [-0.024, 0, 0.024])
    g.add(box(0.013, 0.03, 0.008, 0.04 + dx, HILL_H + 0.24, 0.038, DARK));
  for (const dx of [-0.02, 0.02])
    g.add(box(0.012, 0.024, 0.008, -0.235 + dx, HILL_H + 0.12, 0.062, DARK));

  // ---- Nasrid palace blocks (low, whitish — between Comares and palace) ----
  g.add(box(0.055, 0.105, 0.07, 0.108, HILL_H + 0.0525, 0.028, TONES.stone));
  g.add(box(0.04, 0.085, 0.05, 0.09, HILL_H + 0.0425, -0.048, TONES.white));

  // ---- Palace of Charles V (right, Renaissance block) ----
  g.add(box(0.13, 0.13, 0.12, 0.2, HILL_H + 0.065, 0.005, TONES.sand));
  g.add(box(0.136, 0.014, 0.126, 0.2, HILL_H + 0.13, 0.005, TONES.sandDark));
  // famous circular inner courtyard (reads from the aerial quarter view)
  const patio = new Mesh(
    new CylinderGeometry(0.042, 0.042, 0.014, 20),
    mat("#a08d6d")
  );
  patio.position.set(0.2, HILL_H + 0.137, 0.005);
  g.add(patio);

  // ---- Santa María church tower + spire (right of Comares) ----
  g.add(box(0.032, 0.15, 0.032, 0.135, HILL_H + 0.075, -0.058, TONES.white));
  const spire = new Mesh(new ConeGeometry(0.027, 0.052, 4), mat(TONES.slate));
  spire.position.set(0.135, HILL_H + 0.176, -0.058);
  spire.rotation.y = Math.PI / 4;
  g.add(spire);

  // ---- cypress + canopy on the slopes (heaviest on the south face) ----
  const cy: Array<[number, number, number]> = [
    [1.1, 0.1, 0.085],
    [1.45, 0.35, 0.075],
    [1.8, 0.15, 0.09],
    [2.1, 0.4, 0.07],
    [0.75, 0.3, 0.08],
    [0.45, 0.12, 0.085],
    [2.5, 0.25, 0.075],
    [2.9, 0.15, 0.08],
    [-0.4, 0.2, 0.07],
    [-2.6, 0.2, 0.07],
    [-1.4, 0.3, 0.065],
    [-1.9, 0.15, 0.075],
    [1.25, 0.62, 0.065],
    [1.95, 0.58, 0.06],
    [0.6, 0.55, 0.06],
  ];
  for (const [a, f, h] of cy) {
    const [x, y, z] = slope(a, f);
    cypress(g, x * 0.98, y, z * 0.98, h);
  }
  const bu: Array<[number, number, number]> = [
    [0.95, 0.55, 0.026],
    [1.6, 0.6, 0.024],
    [2.25, 0.55, 0.025],
    [0.3, 0.45, 0.022],
    [2.75, 0.5, 0.024],
    [-1.0, 0.5, 0.022],
    [-2.2, 0.45, 0.024],
  ];
  for (const [a, f, r] of bu) {
    const [x, y, z] = slope(a, f);
    bush(g, x * 0.97, y, z * 0.97, r);
  }

  return g;
}
