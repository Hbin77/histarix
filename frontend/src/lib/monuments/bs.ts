// Queen's Staircase (Nassau) — papercraft: one long straight flight cut up a
// narrow slot gorge, sheer moss-streaked limestone walls closing in on both
// sides and tropical fronds leaning over the rim. Landform: rock base.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
} from "three";
import { mat } from "./materials";

const R = 0.375; // terrain radius (footprint 0.75)
const OUTER = 0.25; // outer edge of each wall mass
const BASE = 0.03; // gorge floor
const STAIR_W = 0.22;
const STEPS = 15;
const RISE = 0.027;
const RUN = 0.03;
const Z_FOOT = 0.25; // bottom of the flight; it climbs toward -Z
const STAIR_TOP = BASE + STEPS * RISE;

const LIME = "#bdb4a2";
const LIME_DARK = "#a89d8e";
const STEP = "#a29a8c";
const NOSE = "#d3ccbd"; // sunlit lip of each tread
const PAVE = "#c5bdae";
const MOSS = "#7d8f6b";
const FROND = "#6f8a5f";
const RAIL = "#7c7468";

/**
 * One length of gorge wall: a sheer inner face rising to `topY`, then a rough
 * shoulder falling away to the outer edge. `side` mirrors it across the gorge,
 * reversing the outline so the extrusion keeps its outward normals.
 */
function gorgeWall(
  z0: number,
  z1: number,
  innerX: number,
  topY: number,
  side: 1 | -1
): Mesh {
  const pts: Array<[number, number]> = [
    [innerX, 0],
    [innerX, topY],
    [innerX + 0.035, topY - 0.022],
    [0.2, topY * 0.5],
    [OUTER, 0.055],
    [OUTER, 0],
  ];
  const seq =
    side === 1
      ? pts
      : pts.map(([x, y]) => [-x, y] as [number, number]).reverse();
  const s = new Shape();
  s.moveTo(seq[0][0], seq[0][1]);
  for (const [x, y] of seq.slice(1)) s.lineTo(x, y);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: z1 - z0, bevelEnabled: false });
  geo.translate(0, 0, z0);
  return new Mesh(geo, mat(side === 1 ? LIME : LIME_DARK));
}

/** The flight itself: a stepped profile extruded across the gorge. */
function staircase(): Mesh {
  const s = new Shape();
  s.moveTo(0, 0);
  for (let i = 0; i < STEPS; i++) {
    s.lineTo(i * RUN, (i + 1) * RISE);
    s.lineTo((i + 1) * RUN, (i + 1) * RISE);
  }
  s.lineTo(STEPS * RUN, 0);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: STAIR_W, bevelEnabled: false });
  geo.translate(0, 0, -STAIR_W / 2);
  geo.rotateY(Math.PI / 2); // the profile's run swings onto -Z
  geo.translate(0, BASE, Z_FOOT);
  return new Mesh(geo, mat(STEP));
}

/** A drooping palm frond, base at the group origin. */
function frond(len: number, tilt: number, spin: number): Mesh {
  const geo = new ConeGeometry(0.024, len, 4);
  geo.translate(0, len / 2, 0);
  const m = new Mesh(geo, mat(FROND));
  m.scale.z = 0.28;
  m.rotation.set(0, spin, tilt);
  return m;
}

/** A clump of fronds leaning out over the gorge rim. */
function palm(x: number, y: number, z: number, lean: number): Group {
  const g = new Group();
  g.position.set(x, y, z);
  const trunk = new Mesh(new CylinderGeometry(0.009, 0.013, 0.05, 5), mat("#8a7f6c"));
  trunk.position.y = 0.025;
  g.add(trunk);
  for (let i = 0; i < 5; i++) {
    const spin = (i / 5) * Math.PI * 2 + 0.4;
    const f = frond(0.09 + 0.022 * Math.sin(i * 2.1), lean * (0.55 + 0.45 * Math.cos(spin)), spin);
    f.position.y = 0.048;
    g.add(f);
  }
  return g;
}

export function build(): Group {
  const g = new Group();

  // ---- rock terrain and the paved gorge floor ----
  const ground = new Mesh(new CylinderGeometry(R, R, BASE, 30), mat(LIME_DARK));
  ground.position.y = BASE / 2;
  g.add(ground);
  const floor = new Mesh(new BoxGeometry(0.26, 0.012, 0.6), mat(PAVE));
  floor.position.set(0, BASE, 0.06);
  g.add(floor);

  // ---- the head of the gorge: the terrace the flight climbs out onto ----
  const headland = new Mesh(new BoxGeometry(0.42, STAIR_TOP, 0.14), mat(LIME_DARK));
  headland.position.set(0, STAIR_TOP / 2, -0.245);
  g.add(headland);
  const headCap = new Mesh(new BoxGeometry(0.43, 0.014, 0.15), mat(PAVE));
  headCap.position.set(0, STAIR_TOP, -0.245);
  g.add(headCap);

  // ---- the two walls, in lengths of varying height so the rim is ragged ----
  const zs = [-0.27, -0.185, -0.1, -0.01, 0.08, 0.18, 0.27];
  const right: Array<[number, number]> = [
    [0.142, 0.5],
    [0.134, 0.46],
    [0.148, 0.47],
    [0.136, 0.45],
    [0.144, 0.46],
    [0.138, 0.38],
  ];
  const left: Array<[number, number]> = [
    [0.136, 0.52],
    [0.146, 0.47],
    [0.134, 0.44],
    [0.142, 0.47],
    [0.138, 0.43],
    [0.148, 0.35],
  ];
  for (let i = 0; i < 6; i++) {
    g.add(gorgeWall(zs[i], zs[i + 1], right[i][0], right[i][1], 1));
    g.add(gorgeWall(zs[i], zs[i + 1], left[i][0], left[i][1], -1));
  }

  // ---- the flight, with a pale lip on every tread so the steps read ----
  g.add(staircase());
  const nose = mat(NOSE);
  for (let i = 0; i < STEPS; i++) {
    const lip = new Mesh(new BoxGeometry(STAIR_W, 0.007, 0.011), nose);
    lip.position.set(0, BASE + (i + 1) * RISE, Z_FOOT - i * RUN);
    g.add(lip);
  }

  // central pipe handrail on short posts
  const slope = Math.atan2(STEPS * RISE, STEPS * RUN);
  const railLen = Math.hypot(STEPS * RUN, STEPS * RISE);
  const rail = new Mesh(new BoxGeometry(0.012, 0.012, railLen), mat(RAIL));
  rail.position.set(0, BASE + (STEPS * RISE) / 2 + 0.055, Z_FOOT - (STEPS * RUN) / 2);
  rail.rotation.x = slope;
  g.add(rail);
  for (const i of [2, 6, 10, 14]) {
    const post = new Mesh(new BoxGeometry(0.011, 0.062, 0.011), mat(RAIL));
    post.position.set(0, BASE + (i + 1) * RISE + 0.028, Z_FOOT - i * RUN - RUN / 2);
    g.add(post);
  }

  // ---- moss streaking the inner faces ----
  const moss = mat(MOSS);
  for (const [sx, z, y0, h, w] of [
    [1, -0.2, 0.18, 0.24, 0.05],
    [1, -0.03, 0.3, 0.2, 0.035],
    [1, 0.13, 0.12, 0.28, 0.045],
    [1, 0.24, 0.26, 0.14, 0.03],
    [-1, -0.24, 0.24, 0.2, 0.04],
    [-1, -0.08, 0.14, 0.3, 0.05],
    [-1, 0.08, 0.3, 0.18, 0.032],
    [-1, 0.21, 0.16, 0.22, 0.042],
  ] as const) {
    const patch = new Mesh(new BoxGeometry(0.016, h, w), moss);
    patch.position.set(sx * 0.134, y0 + h / 2, z);
    g.add(patch);
  }

  // ---- fronds leaning in over both rims ----
  g.add(palm(0.166, 0.44, -0.14, -1.25));
  g.add(palm(0.172, 0.4, 0.12, -1.4));
  g.add(palm(-0.168, 0.45, -0.05, 1.3));
  g.add(palm(-0.174, 0.38, 0.21, 1.45));

  // ferns down on the gorge floor, either side of the flight
  for (const [x, z] of [
    [0.118, 0.2],
    [-0.12, 0.13],
    [0.116, -0.06],
  ] as const) {
    const fern = new Group();
    fern.position.set(x, BASE + 0.012, z);
    for (let i = 0; i < 4; i++) {
      const f = frond(0.055, 0.75, (i / 4) * Math.PI * 2 + 0.6);
      fern.add(f);
    }
    g.add(fern);
  }

  return g;
}
