// Okavango Delta — papercraft: a flat fan of floodplain with teal channels
// braiding across it, pale sage reed islands standing slightly proud between
// them, flat-topped acacias and fan palms, and one small elephant for scale.
// Natural landform: floodplain base, no plaza disc.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
} from "three";
import { mat } from "./materials";

const R = 0.375; // floodplain radius (footprint 0.75)
const PLAIN_Y = 0.05; // floodplain surface
const WATER_Y = 0.051; // channel surface, all but flush with the plain
const ISLE_Y = 0.022; // how far the reed islands stand above the plain

const PLAIN = "#93a877"; // floodplain grass
const PLAIN_DEEP = "#7f9366"; // shaded flanks of the plain
const ISLE = "#aeb990"; // pale sage reed bed
const SAND = "#cfc4a2"; // sandbar on the inside of a bend
const WATER = "#5e8f90"; // deep channel
const WATER_EDGE = "#7fa8a4"; // shallows
const ACACIA = "#7d9068";
const PALM = "#8aa06d";
const BARK = "#8a7a63";
const HIDE = "#83848b";

/** Lay a channel along a polyline as overlapping slabs, tapering in width. */
function channel(
  g: Group,
  pts: Array<[number, number]>,
  w0: number,
  w1: number,
  color: string,
  y: number
): void {
  const m = mat(color);
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[i + 1];
    const t = i / (pts.length - 2);
    const w = w0 + (w1 - w0) * t;
    const mx = (x0 + x1) / 2;
    const mz = (z0 + z1) / 2;
    const len = Math.hypot(x1 - x0, z1 - z0);
    if (Math.hypot(mx, mz) + (len + w) / 2 > R - 0.004) continue; // stay on the plain
    const slab = new Mesh(new BoxGeometry(len + w, 0.01, w), m);
    slab.position.set(mx, y - 0.005, mz);
    slab.rotation.y = Math.atan2(-(z1 - z0), x1 - x0);
    g.add(slab);
  }
}

/** Flat-topped reed island with an irregular papercraft edge. */
function island(x: number, z: number, rx: number, rz: number, rot: number): Mesh {
  const geo = new CylinderGeometry(1, 1, ISLE_Y, 11);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const pz = pos.getZ(i);
    const rr = Math.hypot(px, pz);
    if (rr < 1e-5) continue;
    const a = Math.atan2(pz, px);
    const k = 1 + 0.22 * Math.sin(3 * a + 1.9) + 0.14 * Math.sin(5 * a - 0.7);
    pos.setXYZ(i, px * k, pos.getY(i), pz * k);
  }
  geo.computeVertexNormals();
  const m = new Mesh(geo, mat(ISLE));
  m.scale.set(rx, 1, rz);
  m.position.set(x, PLAIN_Y + ISLE_Y / 2 - 0.004, z);
  m.rotation.y = rot;
  return m;
}

/** Flat-crowned acacia. */
function acacia(x: number, y: number, z: number, s: number): Group {
  const g = new Group();
  g.position.set(x, y, z);
  const trunk = new Mesh(new CylinderGeometry(0.005 * s, 0.008 * s, 0.07 * s, 5), mat(BARK));
  trunk.position.y = 0.035 * s;
  g.add(trunk);
  const crown = new Mesh(new CylinderGeometry(0.05 * s, 0.036 * s, 0.016 * s, 9), mat(ACACIA));
  crown.position.y = 0.077 * s;
  g.add(crown);
  const under = new Mesh(new ConeGeometry(0.034 * s, 0.026 * s, 8), mat(ACACIA));
  under.rotation.x = Math.PI;
  under.position.y = 0.058 * s;
  g.add(under);
  return g;
}

/** Fan palm: a bare stem with a burst of stiff fronds. */
function fanPalm(x: number, y: number, z: number, h: number): Group {
  const g = new Group();
  g.position.set(x, y, z);
  const stem = new Mesh(new CylinderGeometry(0.005, 0.008, h, 5), mat(BARK));
  stem.position.y = h / 2;
  g.add(stem);
  for (let i = 0; i < 6; i++) {
    const geo = new ConeGeometry(0.014, 0.06, 3);
    geo.translate(0, 0.03, 0);
    const f = new Mesh(geo, mat(PALM));
    f.scale.z = 0.35;
    f.position.y = h;
    f.rotation.set(0, (i / 6) * Math.PI * 2 + 0.3, 0.95 + 0.25 * Math.sin(i * 2.1));
    g.add(f);
  }
  return g;
}

export function build(): Group {
  const g = new Group();

  // ---- the floodplain ----
  const plain = new Mesh(new CylinderGeometry(R, R, PLAIN_Y, 32), mat(PLAIN));
  plain.position.y = PLAIN_Y / 2;
  g.add(plain);
  const rim = new Mesh(new CylinderGeometry(R, R - 0.02, 0.02, 32), mat(PLAIN_DEEP));
  rim.position.y = 0.01;
  g.add(rim);

  // ---- braided channels: one trunk stream with three branches ----
  const trunk: Array<[number, number]> = [
    [-0.34, 0.02],
    [-0.28, 0.09],
    [-0.18, 0.06],
    [-0.09, -0.03],
    [0.0, -0.1],
    [0.1, -0.13],
    [0.19, -0.09],
    [0.26, -0.01],
    [0.3, 0.05],
    [0.33, 0.1],
  ];
  const branchFront: Array<[number, number]> = [
    [0.0, -0.1],
    [-0.02, 0.0],
    [0.03, 0.1],
    [0.0, 0.19],
    [-0.07, 0.26],
    [-0.15, 0.3],
  ];
  const branchBack: Array<[number, number]> = [
    [-0.18, 0.06],
    [-0.22, -0.02],
    [-0.2, -0.12],
    [-0.25, -0.2],
    [-0.22, -0.28],
  ];
  const branchRight: Array<[number, number]> = [
    [0.26, -0.01],
    [0.3, 0.1],
    [0.26, 0.2],
    [0.18, 0.26],
  ];
  // shallows first, a touch wider, then the deep thread down the middle
  channel(g, trunk, 0.075, 0.065, WATER_EDGE, WATER_Y);
  channel(g, branchFront, 0.055, 0.042, WATER_EDGE, WATER_Y);
  channel(g, branchBack, 0.05, 0.038, WATER_EDGE, WATER_Y);
  channel(g, branchRight, 0.046, 0.034, WATER_EDGE, WATER_Y);
  channel(g, trunk, 0.05, 0.042, WATER, WATER_Y + 0.002);
  channel(g, branchFront, 0.034, 0.026, WATER, WATER_Y + 0.002);
  channel(g, branchBack, 0.03, 0.022, WATER, WATER_Y + 0.002);
  channel(g, branchRight, 0.028, 0.02, WATER, WATER_Y + 0.002);

  // ---- reed islands standing between the channels ----
  const isles: Array<[number, number, number, number, number]> = [
    [0.05, -0.22, 0.17, 0.09, 0.3],
    [0.1, 0.17, 0.07, 0.08, -0.5],
    [-0.24, 0.18, 0.09, 0.08, 0.9],
    [-0.27, -0.14, 0.05, 0.07, 1.6],
    [0.27, -0.15, 0.06, 0.07, -1.1],
    [-0.05, 0.05, 0.045, 0.04, 0.4],
  ];
  for (const [x, z, rx, rz, rot] of isles) g.add(island(x, z, rx, rz, rot));

  // sandbars on the inside of the bends
  for (const [x, z, rx, rz, rot] of [
    [-0.24, 0.02, 0.05, 0.03, 0.5],
    [0.14, -0.05, 0.045, 0.026, -0.4],
    [-0.03, 0.13, 0.035, 0.022, 1.0],
  ] as const) {
    const bar = new Mesh(new CylinderGeometry(1, 1, 0.008, 9), mat(SAND));
    bar.scale.set(rx, 1, rz);
    bar.position.set(x, PLAIN_Y + 0.004, z);
    bar.rotation.y = rot;
    g.add(bar);
  }

  // ---- acacias dotted over the islands and the plain ----
  const ISLE_TOP = PLAIN_Y + ISLE_Y - 0.004;
  for (const [x, y, z, s] of [
    [-0.02, ISLE_TOP, -0.22, 1.15],
    [0.13, ISLE_TOP, -0.24, 0.95],
    [0.1, ISLE_TOP, 0.17, 1.0],
    [-0.26, ISLE_TOP, 0.19, 1.1],
    [-0.27, ISLE_TOP, -0.15, 0.85],
    [0.27, ISLE_TOP, -0.16, 0.9],
    [0.22, PLAIN_Y, 0.07, 0.8],
    [-0.13, PLAIN_Y, -0.14, 0.75],
  ] as const)
    g.add(acacia(x, y, z, s));

  for (const [x, y, z, h] of [
    [0.07, ISLE_TOP, -0.19, 0.17],
    [-0.21, ISLE_TOP, 0.16, 0.15],
    [0.3, PLAIN_Y, 0.02, 0.135],
  ] as const)
    g.add(fanPalm(x, y, z, h));

  // ---- one elephant, wading the shallows at the edge of an island ----
  const ele = new Group();
  ele.position.set(-0.1, PLAIN_Y + 0.004, -0.19);
  ele.rotation.y = -0.7;
  ele.scale.setScalar(1.25);
  g.add(ele);
  const hide = mat(HIDE);
  const body = new Mesh(new SphereGeometry(0.026, 7, 5), hide);
  body.scale.set(1.45, 1.0, 0.92);
  body.position.y = 0.03;
  ele.add(body);
  const head = new Mesh(new SphereGeometry(0.016, 6, 5), hide);
  head.position.set(0.04, 0.034, 0);
  ele.add(head);
  for (const [x, y, z, rz] of [
    [0.052, 0.02, 0, 0.35],
    [0.058, 0.008, 0, 0.9],
  ] as const) {
    const seg = new Mesh(new CylinderGeometry(0.005, 0.007, 0.016, 5), hide);
    seg.position.set(x, y, z);
    seg.rotation.z = rz;
    ele.add(seg);
  }
  for (const sz of [1, -1]) {
    const ear = new Mesh(new SphereGeometry(0.012, 5, 4), hide);
    ear.scale.set(0.5, 1.1, 1);
    ear.position.set(0.034, 0.036, sz * 0.014);
    ele.add(ear);
  }
  for (const [x, z] of [
    [0.022, 0.013],
    [0.022, -0.013],
    [-0.022, 0.013],
    [-0.022, -0.013],
  ] as const) {
    const leg = new Mesh(new CylinderGeometry(0.006, 0.007, 0.024, 5), hide);
    leg.position.set(x, 0.012, z);
    ele.add(leg);
  }

  return g;
}
