// Lake Malawi — papercraft: the broad teal lake with a dugout canoe and its
// standing fisherman, a warm sand beach curving into the foreground and
// layered rounded hills hazing away on the far shore, a baobab on the point.
// Natural landform: terrain base, no plaza disc.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Shape,
  SphereGeometry,
} from "three";
import { mat } from "./materials";

const WATER = "#78a3ad"; // muted teal
const SHOAL = "#93b6bc"; // sunlit shallows
const SAND = "#dcc8a2"; // warm beach
const SAND_WET = "#c3ac86";
const HILL_NEAR = "#96a26b"; // gold-green
const HILL_FAR = "#8ba08d"; // hazed by distance
const HILL_FAR2 = "#9aae9c";
const WOOD = "#8a6a4a";
const WOOD_DK = "#6d5238";
const FIGURE = "#4e4b45";
const BARK = "#a3968a";
const LEAF = "#8d9469";

const R_TILE = 0.365;
const WATER_H = 0.022;

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
function pad(
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
    curveSegments: 9,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, y0, 0);
  return new Mesh(geo, m);
}

/** A rounded hill: upper hemisphere squashed into a low dome. */
function hill(
  r: number,
  ry: number,
  x: number,
  y: number,
  z: number,
  m: MeshLambertMaterial
): Mesh {
  const geo = new SphereGeometry(1, 10, 3, 0, Math.PI * 2, 0, Math.PI / 2);
  geo.scale(r, ry, r * 0.85);
  geo.translate(x, y, z);
  return new Mesh(geo, m);
}

/**
 * A ridge along the far rim: annular sector extruded upward. Shape angles
 * map to the world as (cosθ, −sinθ) in (x, z), so the far shore sits at 90°.
 */
function ridge(
  rIn: number,
  rOut: number,
  a0: number,
  a1: number,
  y0: number,
  h: number,
  m: MeshLambertMaterial
): Mesh {
  const s = new Shape();
  s.absarc(0, 0, rOut, a0, a1, false);
  s.absarc(0, 0, rIn, a1, a0, true);
  s.closePath();
  const geo = new ExtrudeGeometry(s, {
    depth: h,
    bevelEnabled: false,
    curveSegments: 12,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, y0, 0);
  return new Mesh(geo, m);
}

/** Dugout hull: a lens in plan, pointed at both ends, extruded upward. */
function dugout(halfLen: number, halfW: number, h: number, m: MeshLambertMaterial): Mesh {
  const s = new Shape();
  const N = 8;
  const wAt = (t: number) => halfW * Math.pow(1 - t * t, 0.62);
  for (let i = 0; i <= N; i++) {
    const t = -1 + (2 * i) / N;
    const p: [number, number] = [wAt(t), t * halfLen];
    if (i === 0) s.moveTo(p[0], p[1]);
    else s.lineTo(p[0], p[1]);
  }
  for (let i = N; i >= 0; i--) {
    const t = -1 + (2 * i) / N;
    s.lineTo(-wAt(t), t * halfLen);
  }
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: h, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  return new Mesh(geo, m);
}

/** Baobab on the point: fat trunk, tiny flat crown. */
function baobab(h: number, r: number): Group {
  const g = new Group();
  const bark = mat(BARK);
  const leaf = mat(LEAF);

  const flare = new Mesh(new CylinderGeometry(r, r * 1.3, 0.05, 7), mat("#8d8078"));
  flare.position.y = 0.025;
  g.add(flare);
  const trunk = new Mesh(new CylinderGeometry(r * 0.68, r, h, 8, 1), bark);
  trunk.position.y = 0.05 + h / 2;
  g.add(trunk);

  const top = 0.05 + h;
  const rTop = r * 0.68;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.5;
    const len = rTop * (2.1 + (i % 2) * 0.6);
    const tilt = 1.05 + (i % 3) * 0.08;
    const arm = new Group();
    arm.rotation.y = a;
    arm.position.y = top;
    g.add(arm);
    const branch = new Mesh(new CylinderGeometry(rTop * 0.16, rTop * 0.42, len, 4), bark);
    branch.position.set((Math.sin(tilt) * len) / 2, (Math.cos(tilt) * len) / 2, 0);
    branch.rotation.z = -tilt;
    arm.add(branch);
    const tuft = new Mesh(new SphereGeometry(rTop * 0.72, 5, 3), leaf);
    tuft.scale.set(1.2, 0.42, 1.2);
    tuft.position.set(Math.sin(tilt) * len, Math.cos(tilt) * len, 0);
    arm.add(tuft);
  }
  const core = new Mesh(new SphereGeometry(rTop * 1.05, 6, 3), leaf);
  core.scale.set(1, 0.38, 1);
  core.position.y = top + rTop * 0.4;
  g.add(core);
  return g;
}

export function build(): Group {
  const g = new Group();

  // ---- The lake ----
  const lake = new Mesh(new CylinderGeometry(R_TILE, R_TILE, WATER_H, 28), mat(WATER));
  lake.position.y = WATER_H / 2;
  g.add(lake);

  // ---- Far shore: layered hills receding into haze ----
  const D2R = Math.PI / 180;
  const far = mat(HILL_FAR);
  const far2 = mat(HILL_FAR2);
  const near = mat(HILL_NEAR);
  const BASE = WATER_H - 0.004;

  // the hazed far ridge, and rolling crowns riding along it
  g.add(ridge(0.255, R_TILE, 22 * D2R, 158 * D2R, BASE, 0.098, far));
  for (const [deg, r, ry] of [
    [123, 0.072, 0.062],
    [143, 0.068, 0.084],
    [162, 0.07, 0.07],
    [181, 0.074, 0.09],
    [200, 0.068, 0.068],
    [219, 0.072, 0.086],
    [238, 0.066, 0.06],
  ] as const) {
    const a = deg * D2R;
    g.add(hill(r, ry, Math.sin(a) * 0.288, BASE + 0.084, Math.cos(a) * 0.288, far2));
  }

  // a nearer gold-green headland running down into the water
  g.add(ridge(0.205, 0.312, 22 * D2R, 158 * D2R, BASE, 0.028, near));
  for (const [deg, r, ry] of [
    [113, 0.062, 0.036],
    [247, 0.06, 0.034],
    [126, 0.072, 0.044],
    [148, 0.07, 0.056],
    [170, 0.074, 0.042],
    [192, 0.07, 0.054],
    [214, 0.072, 0.046],
    [236, 0.068, 0.05],
  ] as const) {
    const a = deg * D2R;
    g.add(hill(r, ry, Math.sin(a) * 0.25, BASE + 0.024, Math.cos(a) * 0.25, near));
  }

  // ---- Beach curving into the foreground, with a wet-sand rim ----
  g.add(pad(0.28, 0.135, 0.235, WATER_H - 0.006, 0.012, mat(SAND_WET)));
  g.add(pad(0.262, 0.118, 0.245, WATER_H + 0.004, 0.014, mat(SAND)));

  // sunlit shallows off the beach, and glints out on the open water
  g.add(pad(0.31, 0.085, 0.155, WATER_H - 0.002, 0.004, mat(SHOAL)));
  for (const [rx, rz, cz] of [
    [0.16, 0.018, 0.03],
    [0.1, 0.013, -0.055],
    [0.13, 0.015, -0.11],
  ] as const) {
    g.add(pad(rx, rz, cz, WATER_H - 0.001, 0.003, mat(SHOAL)));
  }

  // ---- The dugout, out on open water ----
  const canoe = new Group();
  canoe.position.set(-0.085, WATER_H - 0.006, -0.015);
  canoe.rotation.y = 0.42;
  g.add(canoe);

  const hull = dugout(0.115, 0.021, 0.026, mat(WOOD));
  canoe.add(hull);
  const well = dugout(0.09, 0.013, 0.008, mat(WOOD_DK));
  well.position.y = 0.02;
  canoe.add(well);

  // fisherman standing amidships, and his paddle
  const fig = mat(FIGURE);
  canoe.add(box(0.014, 0.062, 0.012, 0, 0.026, -0.012, fig));
  const head = new Mesh(new SphereGeometry(0.009, 5, 3), fig);
  head.position.set(0, 0.098, -0.012);
  canoe.add(head);
  const paddle = box(0.005, 0.086, 0.005, 0.016, 0.03, -0.008, mat(WOOD_DK));
  paddle.rotation.z = 0.38;
  canoe.add(paddle);
  canoe.add(box(0.012, 0.026, 0.004, 0.033, 0.018, -0.008, mat(WOOD_DK)));

  // a second canoe drawn up on the sand
  const beached = new Group();
  beached.position.set(0.15, WATER_H + 0.016, 0.235);
  beached.rotation.y = -0.75;
  g.add(beached);
  beached.add(dugout(0.082, 0.017, 0.02, mat(WOOD)));
  const bWell = dugout(0.062, 0.01, 0.006, mat(WOOD_DK));
  bWell.position.y = 0.015;
  beached.add(bWell);

  // ---- The baobab standing on the point ----
  const tree = baobab(0.3, 0.047);
  tree.position.set(-0.15, WATER_H + 0.018, 0.245);
  g.add(tree);

  // ---- Scrub and a fish-drying rack along the beach ----
  const scrub = mat("#7c8459");
  for (const [x, z, s] of [
    [0.03, 0.3, 1],
    [-0.09, 0.28, 0.8],
    [0.25, 0.19, 0.9],
    [-0.28, 0.16, 0.75],
  ] as const) {
    const bush = new Mesh(new SphereGeometry(0.022 * s, 5, 3), scrub);
    bush.scale.y = 0.6;
    bush.position.set(x, WATER_H + 0.022, z);
    g.add(bush);
  }
  const rack = new Group();
  rack.position.set(0.01, WATER_H + 0.018, 0.185);
  rack.rotation.y = 0.2;
  g.add(rack);
  for (const x of [-0.038, 0.038]) {
    rack.add(box(0.005, 0.03, 0.005, x, 0, 0, mat(WOOD_DK)));
  }
  rack.add(box(0.088, 0.005, 0.02, 0, 0.03, 0, mat(WOOD)));

  return g;
}
