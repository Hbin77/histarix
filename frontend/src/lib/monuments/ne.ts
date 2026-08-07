// Mosquée d'Agadez — papercraft: the steep battered adobe minaret bristling
// with tier on tier of protruding toron stakes, rising out of a low
// flat-roofed earthen mosque block behind a pinnacled courtyard wall.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;

const MINARET = "#c69569"; // sun-baked clay brown
const WALL = "#b07d53"; // mosque block, a shade deeper
const WALL_LIT = "#d1a479"; // parapets and pinnacles
const COURT = "#ddc59d"; // warm sand courtyard
const TORON = "#6d5439"; // dark palm-wood stakes

const MIN_Z = -0.03; // minaret sits toward the back of the block
const H1 = 0.42; // lower minaret stage
const H2 = 0.45; // upper minaret stage
const HW0 = 0.125; // half-width at the ground
const HW1 = 0.08; // half-width at the stage break
const HW2 = 0.033; // half-width at the top

/** Half-width of the minaret shaft at height y. */
function shaftHW(y: number): number {
  return y < H1
    ? HW0 + (HW1 - HW0) * (y / H1)
    : HW1 + (HW2 - HW1) * ((y - H1) / H2);
}

/** Battered rectangular block (adobe walls lean inward), base at y = 0. */
function battered(
  hx: number,
  hz: number,
  h: number,
  taper: number,
  m: MeshLambertMaterial
): Mesh {
  const geo = new CylinderGeometry(taper * SQ2, SQ2, 1, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, 0.5, 0);
  const mesh = new Mesh(geo, m);
  mesh.scale.set(hx, h, hz);
  return mesh;
}

function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  m: MeshLambertMaterial
): Mesh {
  const mesh = new Mesh(new BoxGeometry(w, h, d), m);
  mesh.position.set(x, y, z);
  return mesh;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.34));

  const minaretMat = mat(MINARET);
  const wallMat = mat(WALL);
  const litMat = mat(WALL_LIT);
  const toronMat = mat(TORON);

  // ---- sandy courtyard over the plaza ----
  const court = new Mesh(new CylinderGeometry(0.325, 0.325, 0.018, 26), mat(COURT));
  court.position.y = 0.009;
  g.add(court);

  const GROUND = 0.018;

  // ---- prayer hall: low flat-roofed earthen block ----
  const hall = new Group();
  hall.position.set(0, GROUND, 0.055);
  hall.add(battered(0.215, 0.115, 0.145, 0.9, wallMat));
  hall.add(box(0.45, 0.022, 0.25, 0, 0.156, 0, litMat)); // roof parapet
  // tapering buttresses down the long walls
  for (const x of [-0.155, -0.052, 0.052, 0.155]) {
    for (const z of [0.107, -0.107]) {
      const b = battered(0.021, 0.014, 0.168, 0.72, litMat);
      b.position.set(x, 0, z);
      hall.add(b);
    }
  }
  // low arched doorway on the courtyard side
  hall.add(box(0.05, 0.075, 0.014, 0, 0.037, 0.114, mat(TONES.ink)));
  g.add(hall);

  // ---- courtyard wall with rounded adobe pinnacles ----
  const wall = new Group();
  wall.position.set(0, GROUND, 0.25);
  wall.add(battered(0.19, 0.018, 0.078, 0.86, wallMat));
  const pinnacle = new ConeGeometry(0.016 * SQ2, 0.038, 4);
  for (let i = -3; i <= 3; i++) {
    const p = new Mesh(pinnacle, litMat);
    p.rotation.y = Math.PI / 4;
    p.position.set(i * 0.054, 0.093, 0);
    wall.add(p);
  }
  g.add(wall);

  // ---- minaret: two battered stages ----
  const min = new Group();
  min.position.set(0, GROUND, MIN_Z);
  g.add(min);

  const lower = battered(HW0, HW0 * 0.96, H1, HW1 / HW0, minaretMat);
  min.add(lower);
  const upper = battered(HW1, HW1 * 0.96, H2, HW2 / HW1, minaretMat);
  upper.position.y = H1;
  min.add(upper);

  // crowning block and finial
  min.add(box(0.078, 0.026, 0.075, 0, H1 + H2 + 0.013, 0, litMat));
  min.add(box(0.05, 0.022, 0.048, 0, H1 + H2 + 0.037, 0, minaretMat));
  const tip = new Mesh(new ConeGeometry(0.019 * SQ2, 0.042, 4), litMat);
  tip.rotation.y = Math.PI / 4;
  tip.position.y = H1 + H2 + 0.069;
  min.add(tip);

  // ---- toron: rows of palm stakes bristling from every face ----
  const stakeGeo = new CylinderGeometry(0.0055, 0.0045, 0.05, 4);
  stakeGeo.rotateX(Math.PI / 2); // lie along +Z, then face-rotated
  const rows: Array<[number, number]> = [
    [0.185, 3],
    [0.265, 3],
    [0.345, 3],
    [0.425, 3],
    [0.505, 2],
    [0.585, 2],
    [0.66, 2],
    [0.735, 2],
  ];
  for (const [y, n] of rows) {
    const hw = shaftHW(y);
    const offs =
      n === 3 ? [-hw * 0.58, 0, hw * 0.58] : [-hw * 0.42, hw * 0.42];
    for (let f = 0; f < 4; f++) {
      const a = (f * Math.PI) / 2;
      for (const o of offs) {
        const s = new Mesh(stakeGeo, toronMat);
        s.position.set(
          Math.sin(a) * (hw + 0.016) + Math.cos(a) * o,
          y,
          Math.cos(a) * (hw + 0.016) - Math.sin(a) * o
        );
        s.rotation.y = a;
        min.add(s);
      }
    }
  }

  // a couple of toron rows on the prayer-hall walls too
  const hallStake = new CylinderGeometry(0.005, 0.004, 0.034, 4);
  hallStake.rotateX(Math.PI / 2);
  for (const x of [-0.185, -0.105, -0.02, 0.06, 0.14, 0.2]) {
    for (const [z, ry] of [
      [0.185, 0],
      [-0.075, Math.PI],
    ] as const) {
      const s = new Mesh(hallStake, toronMat);
      s.position.set(x, GROUND + 0.108, z);
      s.rotation.y = ry;
      g.add(s);
    }
  }

  return g;
}
