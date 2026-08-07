// Ilha de Moçambique — papercraft miniature: a slender coral-stone island
// ringed by pale sea-green shallows, the angular merloned bastions of the
// Fortaleza de São Sebastião anchoring the north end, a whitewashed town of
// tile-roofed houses running south, and a lateen-rigged dhow offshore.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
} from "three";
import { mat, TONES } from "./materials";

const SQ2 = Math.SQRT2;

const CHALK = "#efeae0"; // whitewashed lime render
const CORAL_STONE = "#ded1b8"; // cut coral rag
const CORAL_DARK = "#c0af92";
const CORAL_PINK = "#d4a091"; // faded painted facades
const TILE = "#bc8672"; // muted terracotta pantiles
const SHALLOW = "#a4c9ba"; // pale sea green over sand
const BEACH = "#e4d8ba";

const ISL_Y = 0.075; // island platform top
const FORT_X = -0.175;
const AX = 0.104; // fort half-width  (world X)
const AZ = 0.086; // fort half-depth  (world Z)

/** Flat elliptical slab (circle squashed along Z), base at y = 0. */
function slab(r: number, squash: number, h: number, color: string, seg = 26): Mesh {
  const m = new Mesh(new CylinderGeometry(r, r, h, seg), mat(color));
  m.scale.z = squash;
  m.position.y = h / 2;
  return m;
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

/** Fort plan: rectangle with a triangular spur bastion at each corner. */
function fortPlan(ax: number, az: number, spur: number, inset: number): Shape {
  const s = new Shape();
  const c = 0.026;
  s.moveTo(ax - c - inset, az - inset);
  s.lineTo(ax + spur - inset, az + spur - inset);
  s.lineTo(ax - inset, az - c - inset);
  s.lineTo(ax - inset, -az + c + inset);
  s.lineTo(ax + spur - inset, -az - spur + inset);
  s.lineTo(ax - c - inset, -az + inset);
  s.lineTo(-ax + c + inset, -az + inset);
  s.lineTo(-ax - spur + inset, -az - spur + inset);
  s.lineTo(-ax + inset, -az + c + inset);
  s.lineTo(-ax + inset, az - c - inset);
  s.lineTo(-ax - spur + inset, az + spur - inset);
  s.lineTo(-ax + c + inset, az - inset);
  s.closePath();
  return s;
}

/** Extrude a plan shape upward (shape +y maps to world +z). */
function prism(shape: Shape, h: number, color: string): Mesh {
  const geo = new ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  geo.scale(1, 1, -1);
  return new Mesh(geo, mat(color));
}

/** Pointed merlon: short block capped by a little pyramid. */
function merlon(x: number, y: number, z: number): Group {
  const g = new Group();
  g.position.set(x, y, z);
  g.add(box(0.024, 0.018, 0.02, 0, 0.009, 0, CORAL_STONE));
  const cap = new Mesh(new ConeGeometry(0.014 * SQ2, 0.032, 4), mat(CORAL_STONE));
  cap.rotation.y = Math.PI / 4;
  cap.position.y = 0.034;
  g.add(cap);
  return g;
}

/** Whitewashed house: rendered walls under a low terracotta gable. */
function house(w: number, d: number, wallH: number, wall: string): Group {
  const g = new Group();
  g.add(box(w, wallH, d, 0, wallH / 2, 0, wall));
  const hw = w / 2 + 0.005;
  const s = new Shape();
  s.moveTo(-hw, 0);
  s.lineTo(hw, 0);
  s.lineTo(0, w * 0.28);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: d + 0.01, bevelEnabled: false });
  geo.translate(0, wallH, -(d + 0.01) / 2);
  g.add(new Mesh(geo, mat(TILE)));
  return g;
}

/** Dhow: crescent hull, raked mast, one triangular lateen sail (faces ±Z). */
function dhow(): Group {
  const g = new Group();
  const hs = new Shape();
  hs.moveTo(-0.048, 0.032);
  hs.lineTo(0.056, 0.042);
  hs.lineTo(0.038, 0);
  hs.lineTo(-0.03, 0);
  hs.closePath();
  const hull = new Mesh(
    new ExtrudeGeometry(hs, { depth: 0.026, bevelEnabled: false }),
    mat(CORAL_DARK)
  );
  hull.position.z = -0.013;
  g.add(hull);

  const mast = new Mesh(new CylinderGeometry(0.003, 0.004, 0.125, 5), mat(CORAL_DARK));
  mast.position.set(0.004, 0.095, 0);
  g.add(mast);

  const ss = new Shape();
  ss.moveTo(-0.004, 0.034);
  ss.lineTo(0.072, 0.05);
  ss.lineTo(0.014, 0.152);
  ss.closePath();
  const sail = new Mesh(
    new ExtrudeGeometry(ss, { depth: 0.004, bevelEnabled: false }),
    mat(CHALK)
  );
  sail.position.z = -0.002;
  g.add(sail);
  return g;
}

export function build(): Group {
  const g = new Group();

  // ---- water: deep channel, sea-green shallows, beach, coral island ----
  g.add(slab(0.375, 1, 0.026, TONES.water, 34));
  g.add(slab(0.352, 0.62, 0.032, SHALLOW, 30));
  g.add(slab(0.32, 0.45, 0.043, BEACH, 26));
  g.add(slab(0.3, 0.4, 0.065, CORAL_DARK, 26)); // low sea wall
  g.add(slab(0.293, 0.385, ISL_Y, CORAL_STONE, 26));

  // ---- Fortaleza de São Sebastião ----
  const fort = new Group();
  fort.position.set(FORT_X, ISL_Y - 0.004, 0);
  fort.add(prism(fortPlan(AX, AZ, 0.032, 0), 0.152, CORAL_DARK));
  const upper = prism(fortPlan(AX, AZ, 0.032, 0.006), 0.034, CORAL_STONE);
  upper.position.y = 0.148;
  fort.add(upper);
  // cordon band, then the pointed merlon crest
  fort.add(box(0.218, 0.013, 0.182, 0, 0.188, 0, CORAL_STONE));
  for (const x of [-0.072, -0.036, 0, 0.036, 0.072])
    for (const z of [AZ - 0.004, -AZ + 0.004]) fort.add(merlon(x, 0.195, z));
  for (const z of [-0.046, 0, 0.046]) fort.add(merlon(-AX + 0.004, 0.195, z));
  // parade-ground quarters peeking over the wall
  fort.add(box(0.078, 0.05, 0.06, 0.036, 0.214, 0.016, CHALK));
  fort.add(box(0.05, 0.038, 0.05, -0.028, 0.208, -0.03, CORAL_PINK));
  // the little whitewashed chapel on the seaward side
  const chapel = new Group();
  chapel.position.set(-0.056, 0.189, 0.026);
  chapel.add(box(0.05, 0.05, 0.044, 0, 0.025, 0, CHALK));
  chapel.add(box(0.032, 0.026, 0.011, 0, 0.063, 0, CHALK));
  const chapelRoof = new Mesh(new ConeGeometry(0.033 * SQ2, 0.03, 4), mat(TILE));
  chapelRoof.rotation.y = Math.PI / 4;
  chapelRoof.position.y = 0.063;
  chapel.add(chapelRoof);
  fort.add(chapel);
  g.add(fort);

  // ---- whitewashed town strung along the island ----
  const put = (x: number, z: number, w: number, d: number, h: number, c: string) => {
    const hs = house(w, d, h, c);
    hs.position.set(x, ISL_Y, z);
    if (Math.abs(z) < 0.001) hs.rotation.y = Math.PI / 2;
    g.add(hs);
  };
  put(-0.035, 0.05, 0.062, 0.05, 0.055, CHALK);
  put(-0.035, -0.05, 0.055, 0.046, 0.048, CORAL_PINK);
  put(0.048, 0.052, 0.058, 0.048, 0.052, CHALK);
  put(0.048, -0.05, 0.06, 0.048, 0.058, CHALK);
  put(0.118, 0.048, 0.052, 0.044, 0.046, CORAL_PINK);
  put(0.118, -0.046, 0.055, 0.045, 0.05, CHALK);
  put(0.182, 0.042, 0.048, 0.04, 0.044, CHALK);
  put(0.182, -0.04, 0.045, 0.038, 0.04, CORAL_PINK);
  put(0.238, 0.028, 0.042, 0.036, 0.038, CHALK);
  put(0.238, -0.028, 0.04, 0.034, 0.036, CHALK);
  put(0.276, 0, 0.036, 0.032, 0.032, CORAL_PINK);

  // ---- church tower: the town's one vertical accent ----
  const tower = new Group();
  tower.position.set(0.015, ISL_Y, 0);
  tower.add(box(0.064, 0.204, 0.064, 0, 0.102, 0, CHALK));
  tower.add(box(0.072, 0.016, 0.072, 0, 0.212, 0, CORAL_STONE));
  tower.add(box(0.052, 0.052, 0.052, 0, 0.246, 0, CHALK));
  for (const [dx, dz] of [[0.026, 0], [-0.026, 0], [0, 0.026], [0, -0.026]] as const)
    tower.add(box(0.014, 0.03, 0.014, dx, 0.248, dz, TONES.ink));
  const spire = new Mesh(new ConeGeometry(0.04 * SQ2, 0.06, 4), mat(TILE));
  spire.rotation.y = Math.PI / 4;
  spire.position.y = 0.302;
  tower.add(spire);
  g.add(tower);

  // ---- dhow standing off the beach ----
  const boat = dhow();
  boat.position.set(0.135, 0.026, 0.245);
  boat.rotation.y = -0.45;
  g.add(boat);

  return g;
}
