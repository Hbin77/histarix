// Sveti Jovan Kaneo — papercraft: the little cross-plan church on its
// headland over Lake Ohrid, banded stone-and-brick walls under terracotta
// gables, an octagonal drum carrying one shallow tiled dome.
// Shoreline landform: terrain base, no plaza disc.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Shape,
  SphereGeometry,
} from "three";
import { mat, TONES } from "./materials";

const LAKE = "#8db2cf"; // Ohrid blue
const SHALLOW = "#a3c2d8";
const CLIFF = "#b0a693"; // pale shore rock
const CLIFF_DK = "#988e7c";
const GRASS = "#869a63";
const WALL = "#d6c5a5"; // sandy ashlar
const BRICK = TONES.brick; // dull red courses
const TILE = "#ab6e52"; // terracotta roofing
const TILE_DK = "#96603f";

const R_TILE = 0.362;
const WATER_H = 0.022;
const HEAD_TOP = 0.195; // headland grass level
const HEAD_CZ = -0.16; // the promontory hangs off the back of the tile

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

/** Ellipse footprint on the tile, extruded from y0 to y0 + h. */
function headland(
  rx: number,
  rz: number,
  cz: number,
  y0: number,
  h: number,
  m: MeshLambertMaterial
): Mesh {
  const s = new Shape();
  s.absellipse(0, -cz, rx, rz, 0, Math.PI * 2, false, 0);
  const geo = new ExtrudeGeometry(s, {
    depth: h,
    bevelEnabled: false,
    curveSegments: 22,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, y0, 0);
  return new Mesh(geo, m);
}

/** Saddle roof: triangular prism with the ridge running along +z. */
function gable(w: number, h: number, len: number, m: MeshLambertMaterial): Mesh {
  const s = new Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(0, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: len, bevelEnabled: false });
  geo.translate(0, 0, -len / 2);
  return new Mesh(geo, m);
}

/** The church: Greek-cross body, banded walls, drum and shallow dome. */
function church(): Group {
  const g = new Group();
  const wall = mat(WALL);
  const brick = mat(BRICK);
  const tile = mat(TILE);
  const tileDk = mat(TILE_DK);

  const ARM_W = 0.094;
  const ARM_L = 0.248;
  const WALL_H = 0.12;

  g.add(box(ARM_W, WALL_H, ARM_L, 0, 0, 0, wall));
  g.add(box(ARM_L, WALL_H, ARM_W, 0, 0, 0, wall));
  g.add(box(0.112, 0.172, 0.112, 0, 0, 0, wall));

  // alternating brick courses banding every wall
  for (const y of [0.034, 0.071, 0.108]) {
    g.add(box(ARM_W + 0.005, 0.01, ARM_L + 0.005, 0, y, 0, brick));
    g.add(box(ARM_L + 0.005, 0.01, ARM_W + 0.005, 0, y, 0, brick));
  }
  g.add(box(0.118, 0.01, 0.118, 0, 0.145, 0, brick));

  // narrow round-headed windows in the arm ends
  const dark = mat("#5c5346");
  for (const [x, z, ry] of [
    [0, ARM_L / 2, 0],
    [0, -ARM_L / 2, 0],
    [ARM_L / 2, 0, Math.PI / 2],
    [-ARM_L / 2, 0, Math.PI / 2],
  ] as const) {
    const win = box(0.015, 0.034, 0.008, x, 0.048, z, dark);
    win.rotation.y = ry;
    g.add(win);
  }

  // gables over each arm, and a low collar roof round the crossing
  const nsRoof = gable(ARM_W + 0.014, 0.034, ARM_L + 0.008, tile);
  nsRoof.position.y = WALL_H;
  g.add(nsRoof);
  const ewRoof = gable(ARM_W + 0.014, 0.034, ARM_L + 0.008, tile);
  ewRoof.rotation.y = Math.PI / 2;
  ewRoof.position.y = WALL_H;
  g.add(ewRoof);
  g.add(box(0.128, 0.011, 0.128, 0, 0.172, 0, tileDk));

  // octagonal drum with brick pilasters, then the shallow dome
  const DRUM_Y = 0.183;
  const drum = new Mesh(new CylinderGeometry(0.062, 0.064, 0.07, 8), wall);
  drum.rotation.y = Math.PI / 8;
  drum.position.y = DRUM_Y + 0.035;
  g.add(drum);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rib = box(0.01, 0.07, 0.013, 0, DRUM_Y, 0, brick);
    rib.position.set(Math.sin(a) * 0.061, DRUM_Y + 0.035, Math.cos(a) * 0.061);
    rib.rotation.y = a;
    g.add(rib);
  }
  const cornice = new Mesh(new CylinderGeometry(0.073, 0.068, 0.01, 8), tileDk);
  cornice.rotation.y = Math.PI / 8;
  cornice.position.y = DRUM_Y + 0.075;
  g.add(cornice);

  const dome = new Mesh(
    new SphereGeometry(0.069, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2),
    tile
  );
  dome.scale.y = 0.5;
  dome.position.y = DRUM_Y + 0.079;
  g.add(dome);

  const gold = mat(TONES.gold);
  g.add(box(0.004, 0.032, 0.004, 0, DRUM_Y + 0.113, 0, gold));
  g.add(box(0.017, 0.004, 0.004, 0, DRUM_Y + 0.132, 0, gold));

  // apse bulging from the east arm
  const apse = new Mesh(
    new CylinderGeometry(0.04, 0.04, 0.098, 7, 1, false, -Math.PI / 2, Math.PI),
    wall
  );
  apse.position.set(ARM_L / 2 + 0.006, 0.049, 0);
  apse.rotation.y = Math.PI / 2;
  g.add(apse);
  const apseRoof = new Mesh(
    new ConeGeometry(0.047, 0.024, 7, 1, false, -Math.PI / 2, Math.PI),
    tile
  );
  apseRoof.position.set(ARM_L / 2 + 0.006, 0.11, 0);
  apseRoof.rotation.y = Math.PI / 2;
  g.add(apseRoof);

  return g;
}

export function build(): Group {
  const g = new Group();

  // ---- The lake ----
  const lake = new Mesh(new CylinderGeometry(R_TILE, R_TILE, WATER_H, 36), mat(LAKE));
  lake.position.y = WATER_H / 2;
  g.add(lake);
  const shoal = new Mesh(new CylinderGeometry(0.31, 0.31, 0.006, 28), mat(SHALLOW));
  shoal.scale.set(1.05, 1, 0.86);
  shoal.position.set(0, WATER_H, 0.02);
  g.add(shoal);

  // ---- Headland: rock stepping up to a grassed crown ----
  g.add(headland(0.252, 0.208, HEAD_CZ, 0.0, 0.088, mat(CLIFF_DK)));
  g.add(headland(0.236, 0.194, HEAD_CZ - 0.006, 0.088, 0.072, mat(CLIFF)));
  g.add(headland(0.216, 0.176, HEAD_CZ - 0.01, 0.16, 0.035, mat(CLIFF_DK)));
  g.add(headland(0.204, 0.164, HEAD_CZ - 0.01, HEAD_TOP, 0.012, mat(GRASS)));

  // boulders where the rock meets the water
  const rockDk = mat(CLIFF_DK);
  for (const [x, z, s, r] of [
    [-0.24, 0.02, 0.048, 0.4],
    [0.22, 0.04, 0.042, 1.1],
    [0.0, 0.08, 0.036, 0.7],
    [-0.11, 0.07, 0.03, 1.4],
    [0.28, -0.14, 0.04, 0.2],
  ] as const) {
    const b = box(s, s * 0.7, s * 0.85, x, WATER_H - 0.004, z, rockDk);
    b.rotation.y = r;
    g.add(b);
  }

  // ---- The church on the crown ----
  const ch = church();
  ch.position.set(0.004, HEAD_TOP + 0.012, HEAD_CZ + 0.005);
  ch.rotation.y = -0.16;
  g.add(ch);

  // low churchyard wall along the cliff edge
  const wallStone = mat(CLIFF);
  for (let i = 0; i < 9; i++) {
    const a = -1.05 + (i * 2.1) / 8;
    const seg = box(
      0.05,
      0.016,
      0.014,
      Math.sin(a) * 0.178,
      HEAD_TOP + 0.012,
      HEAD_CZ + Math.cos(a) * 0.144,
      wallStone
    );
    seg.rotation.y = a;
    g.add(seg);
  }

  // ---- Cypresses and scrub on the headland ----
  const trunk = mat("#7d6b52");
  const leaf = mat("#5d7a54");
  for (const [x, z, s] of [
    [-0.155, -0.055, 1],
    [0.15, -0.06, 0.85],
    [-0.04, -0.015, 0.7],
    [0.17, -0.28, 0.9],
    [-0.18, -0.28, 0.8],
  ] as const) {
    const t = new Group();
    t.position.set(x, HEAD_TOP + 0.012, z);
    const stem = new Mesh(new CylinderGeometry(0.004, 0.006, 0.018 * s, 5), trunk);
    stem.position.y = 0.009 * s;
    t.add(stem);
    const crown = new Mesh(new ConeGeometry(0.022 * s, 0.078 * s, 6), leaf);
    crown.position.y = 0.055 * s;
    t.add(crown);
    g.add(t);
  }

  return g;
}
