// Grande Mosquée de Djenné — papercraft: a massive banco block whose east
// facade carries three tapering towers, engaged pilasters running up past the
// roofline into ostrich-egg finials, and rows of toron beams bristling from
// every wall.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
} from "three";
import { mat, plazaDisc } from "./materials";

const SQ2 = Math.SQRT2;

const ADOBE = "#c5a67e"; // sun-dried banco
const ADOBE_DK = "#a8845d";
const ADOBE_LT = "#d3b791";
const TORON = "#6b4f34"; // palm-wood beams
const EGG = "#e4dccb"; // ostrich-egg finials
const SAND = "#e3d0ab";

const HALF_X = 0.255;
const HALF_Z = 0.155;
const GROUND = 0.026;
const WALL_TOP = 0.265;

function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  m: MeshLambertMaterial
): Mesh {
  const b = new Mesh(new BoxGeometry(w, h, d), m);
  b.position.set(x, y + h / 2, z);
  return b;
}

/** Battered pier: a rectangular frustum whose top is `shrink` of its base. */
function pier(
  w: number,
  d: number,
  shrink: number,
  h: number,
  m: MeshLambertMaterial
): Mesh {
  const geo = new CylinderGeometry(((w * shrink) / 2) * SQ2, (w / 2) * SQ2, h, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.scale(1, 1, d / w);
  geo.translate(0, h / 2, 0);
  return new Mesh(geo, m);
}

/** Pointed cap and ostrich egg that crown every pier and pinnacle. */
function finial(w: number, h: number, eggR: number): Group {
  const g = new Group();
  const cap = new Mesh(new ConeGeometry((w / 2) * SQ2, h, 4), mat(ADOBE_DK));
  cap.rotation.y = Math.PI / 4;
  cap.position.y = h / 2;
  g.add(cap);
  const egg = new Mesh(new SphereGeometry(eggR, 5, 3), mat(EGG));
  egg.scale.y = 1.35;
  egg.position.y = h + eggR * 0.9;
  g.add(egg);
  return g;
}

/** Pier + finial as one unit, standing on the ground at (x, z). */
function pinnacle(
  w: number,
  d: number,
  shrink: number,
  h: number,
  x: number,
  z: number,
  m: MeshLambertMaterial,
  eggR: number
): Group {
  const g = new Group();
  g.position.set(x, GROUND, z);
  g.add(pier(w, d, shrink, h, m));
  const f = finial(w * shrink, w * shrink * 0.6, eggR);
  f.position.y = h;
  g.add(f);
  return g;
}

export function build(): Group {
  const g = new Group();
  const adobe = mat(ADOBE);
  const adobeDk = mat(ADOBE_DK);
  const toron = mat(TORON);

  g.add(plazaDisc(0.37));
  const sand = new Mesh(new CylinderGeometry(0.365, 0.365, 0.018, 32), mat(SAND));
  sand.position.y = 0.019;
  g.add(sand);

  // ---- The block ----
  g.add(box(HALF_X * 2, WALL_TOP - GROUND, HALF_Z * 2, 0, GROUND, 0, adobe));
  g.add(box(HALF_X * 2 + 0.014, 0.014, HALF_Z * 2 + 0.014, 0, WALL_TOP, 0, mat(ADOBE_LT)));

  // ---- Three towers on the east facade ----
  const TOWER_X = [-0.163, 0, 0.163];
  const TOWER_Z = HALF_Z + 0.024;
  for (const x of TOWER_X) {
    g.add(pinnacle(0.108, 0.09, 0.56, 0.488, x, TOWER_Z, adobe, 0.019));
    // one tall niche up each tower face
    g.add(box(0.032, 0.052, 0.012, x, 0.135, TOWER_Z + 0.044, mat("#8f7050")));
  }

  // ---- Facade pilasters flanking and between the towers ----
  for (const x of [-0.238, -0.082, 0.082, 0.238]) {
    g.add(pinnacle(0.034, 0.032, 0.56, 0.32, x, HALF_Z + 0.008, adobe, 0.0095));
  }

  // ---- Pilasters marching down both flanks and across the rear ----
  for (const z of [-0.116, -0.039, 0.039, 0.116]) {
    for (const sx of [1, -1]) {
      g.add(pinnacle(0.032, 0.034, 0.56, 0.3, sx * (HALF_X + 0.01), z, adobe, 0.009));
    }
  }
  for (const x of [-0.19, -0.064, 0.064, 0.19]) {
    g.add(pinnacle(0.034, 0.03, 0.56, 0.295, x, -HALF_Z - 0.008, adobe, 0.009));
  }
  // corner piers, stouter than the rest
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
    g.add(
      pinnacle(
        0.042,
        0.042,
        0.58,
        0.325,
        sx * (HALF_X + 0.008),
        sz * (HALF_Z + 0.008),
        adobeDk,
        0.011
      )
    );
  }

  // ---- Toron beams: rows of palm stakes left proud of every wall ----
  const stake = (x: number, y: number, z: number, ry: number) => {
    const s = box(0.008, 0.008, 0.042, x, y, z, toron);
    s.rotation.y = ry;
    g.add(s);
  };
  for (const y of [0.082, 0.142, 0.202]) {
    for (const x of [-0.208, -0.124, -0.041, 0.041, 0.124, 0.208]) {
      stake(x, y, HALF_Z + 0.014, 0);
      stake(x, y, -HALF_Z - 0.014, 0);
    }
    for (const z of [-0.078, 0, 0.078]) {
      stake(HALF_X + 0.014, y, z, Math.PI / 2);
      stake(-HALF_X - 0.014, y, z, Math.PI / 2);
    }
  }
  // rows climbing the towers themselves
  for (const x of TOWER_X) {
    for (const y of [0.225, 0.3, 0.375, 0.44]) {
      stake(x - 0.024, y, TOWER_Z + 0.042, 0);
      stake(x + 0.024, y, TOWER_Z + 0.042, 0);
    }
  }

  // ---- Mud-brick stair climbing the facade between the towers ----
  for (let i = 0; i < 3; i++) {
    g.add(
      box(
        0.1 - i * 0.014,
        0.018,
        0.028,
        0,
        GROUND + i * 0.018,
        HALF_Z + 0.115 - i * 0.026,
        adobeDk
      )
    );
  }

  return g;
}
