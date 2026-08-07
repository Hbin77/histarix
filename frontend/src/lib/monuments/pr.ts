// Castillo San Felipe del Morro — papercraft: sand-beige ramparts stacked in
// battered tiers up a grey-blue rock headland, domed garita sentry boxes
// corbelled out at the seaward corners and a small lighthouse on the top
// terrace, all ringed by the Atlantic.

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
import { mat, TONES } from "./materials";

const SQ2 = Math.SQRT2;

const WALL = "#d5c4a1"; // sand-beige masonry
const WALL_SH = "#bcaa88";
const CORDON = "#c8b591";
const ROCK = "#8b96a2"; // grey-blue headland
const ROCK_DK = "#75808d";
const FOAM = "#bcd4e2";
const LIGHT = "#efeadf"; // lighthouse render

const ROCK_Y = 0.145; // headland top
const T1 = ROCK_Y; // first rampart tier base
const T1_H = 0.1;
const T2 = T1 + T1_H + 0.014;
const T2_H = 0.085;
const T3 = T2 + T2_H + 0.014;
const T3_H = 0.078;
const TOP = T3 + T3_H + 0.014;

/** Battered rectangular rampart (walls lean inward), base at local y = 0. */
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

/** Wobbly-edged rock slab, base at y = 0. */
function rockSlab(r: number, h: number, squash: number, color: string): Mesh {
  const s = new Shape();
  const N = 16;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const rr = r * (1 + 0.09 * Math.sin(3 * a + 1.1) + 0.06 * Math.sin(5 * a + 0.4));
    if (i === 0) s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: h, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  geo.scale(1, 1, squash);
  return new Mesh(geo, mat(color));
}

/** Garita: corbelled cylindrical sentry box under a little masonry dome. */
function garita(m: MeshLambertMaterial): Group {
  const g = new Group();
  const corbel = new Mesh(new CylinderGeometry(0.028, 0.014, 0.024, 10), mat(WALL_SH));
  corbel.position.y = 0.012;
  g.add(corbel);
  const body = new Mesh(new CylinderGeometry(0.029, 0.029, 0.048, 10), m);
  body.position.y = 0.048;
  g.add(body);
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI) / 2 - Math.PI / 4;
    const slit = new Mesh(new BoxGeometry(0.009, 0.02, 0.01), mat(TONES.ink));
    slit.position.set(Math.sin(a) * 0.027, 0.05, Math.cos(a) * 0.027);
    slit.rotation.y = a;
    g.add(slit);
  }
  const ring = new Mesh(new CylinderGeometry(0.033, 0.032, 0.008, 10), mat(CORDON));
  ring.position.y = 0.076;
  g.add(ring);
  const dome = new Mesh(
    new SphereGeometry(0.031, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2),
    m
  );
  dome.scale.y = 0.9;
  dome.position.y = 0.079;
  g.add(dome);
  const knob = new Mesh(new SphereGeometry(0.008, 6, 4), mat(CORDON));
  knob.position.y = 0.114;
  g.add(knob);
  return g;
}

export function build(): Group {
  const g = new Group();
  const wall = mat(WALL);
  const shade = mat(WALL_SH);
  const cordon = mat(CORDON);
  const dark = mat(TONES.ink);

  // ---- sea, surf, headland ----
  const sea = new Mesh(new CylinderGeometry(0.36, 0.36, 0.026, 34), mat(TONES.water));
  sea.position.y = 0.013;
  g.add(sea);
  const surf = new Mesh(new CylinderGeometry(0.315, 0.315, 0.03, 30), mat(FOAM));
  surf.position.y = 0.015;
  g.add(surf);

  const shoal = rockSlab(0.295, 0.075, 0.86, ROCK_DK);
  g.add(shoal);
  const head = rockSlab(0.265, ROCK_Y, 0.84, ROCK);
  g.add(head);
  // a couple of boulders at the water line
  for (const [x, z, r] of [
    [-0.255, 0.16, 0.045],
    [0.245, -0.15, 0.05],
    [0.13, 0.245, 0.038],
  ] as const) {
    const b = new Mesh(new SphereGeometry(r, 6, 4), mat(ROCK_DK));
    b.scale.y = 0.6;
    b.position.set(x, 0.03, z);
    g.add(b);
  }

  // ---- three battered rampart tiers; each steps back only at the rear, so
  //      the seaward face stays one sheer wall ----
  const tiers: Array<[number, number, number, number, number]> = [
    [0.225, 0.15, T1, T1_H, 0],
    [0.185, 0.122, T2, T2_H, 0.024],
    [0.14, 0.092, T3, T3_H, 0.048],
  ];
  for (const [hx, hz, y, h, dz] of tiers) {
    const t = battered(hx, hz, h, 0.9, wall);
    t.position.set(0, y, dz);
    g.add(t);
    g.add(box(hx * 1.86, 0.014, hz * 1.86, 0, y + h + 0.007, dz, cordon));
    g.add(box(hx * 1.76, 0.016, hz * 1.76, 0, y + h + 0.022, dz, shade));
  }

  // gun embrasures along the two lower tiers
  for (const [z, y, n, halfW] of [
    [0.148, T1 + 0.05, 5, 0.175],
    [0.144, T2 + 0.045, 4, 0.14],
  ] as const) {
    for (let i = 0; i < n; i++) {
      const x = -halfW + (i * 2 * halfW) / (n - 1);
      g.add(box(0.024, 0.02, 0.012, x, y, z, dark));
    }
  }

  // ---- garitas corbelled out at the seaward corners ----
  const posts: Array<[number, number, number]> = [
    [0.208, 0.138, T1 + T1_H - 0.01],
    [-0.208, 0.138, T1 + T1_H - 0.01],
    [0.172, -0.088, T2 + T2_H - 0.01],
  ];
  for (const [x, z, y] of posts) {
    const gr = garita(wall);
    gr.position.set(x, y, z);
    g.add(gr);
  }

  // ---- top terrace: guardhouses and the lighthouse ----
  g.add(box(0.09, 0.036, 0.062, -0.082, TOP + 0.018, 0.062, wall));
  g.add(box(0.098, 0.01, 0.07, -0.082, TOP + 0.041, 0.062, cordon));
  g.add(box(0.07, 0.03, 0.05, 0.092, TOP + 0.015, 0.008, wall));

  const lh = new Group();
  lh.position.set(0.015, TOP, 0.04);
  g.add(lh);
  lh.add(box(0.086, 0.03, 0.078, 0, 0.015, 0, mat(LIGHT)));
  const tower = new Mesh(new CylinderGeometry(0.026, 0.032, 0.088, 12), mat(LIGHT));
  tower.position.y = 0.074;
  lh.add(tower);
  const gal = new Mesh(new CylinderGeometry(0.036, 0.036, 0.008, 12), cordon);
  gal.position.y = 0.122;
  lh.add(gal);
  const lantern = new Mesh(new CylinderGeometry(0.022, 0.022, 0.03, 10), dark);
  lantern.position.y = 0.141;
  lh.add(lantern);
  const cap = new Mesh(
    new SphereGeometry(0.024, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(LIGHT)
  );
  cap.scale.y = 0.85;
  cap.position.y = 0.156;
  lh.add(cap);
  const spike = new Mesh(new CylinderGeometry(0.0015, 0.004, 0.022, 5), cordon);
  spike.position.y = 0.19;
  lh.add(spike);

  return g;
}
