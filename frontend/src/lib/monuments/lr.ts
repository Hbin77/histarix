// Providence Island (Monrovia) — papercraft landform: a low island in the
// Mesurado, its sandy shore ringed by slate-blue water, carrying one huge
// spreading cotton tree and a small open-sided pavilion with a dull
// terracotta roof. Natural landform: its own water/terrain base, no plaza.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
  SphereGeometry,
} from "three";
import { mat } from "./materials";

const SQ2 = Math.SQRT2;

const WATER = "#7e97ad"; // slate-blue river
const SHALLOW = "#93aabd";
const SAND = "#c6ae86"; // sand-brown shore
const GRASS = "#7f8f5c"; // muted olive
const GRASS_DK = "#6d7d4c";
const CANOPY_A = "#758750";
const CANOPY_B = "#657444";
const CANOPY_C = "#879364";
const BARK = "#9b9b85";
const TERRA = "#a9705a"; // dull terracotta roof
const POST = "#8a7458";

/** Island outline: a lobed blob rather than a disc. */
function islandPts(scale: number): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const r =
      (0.285 + 0.034 * Math.sin(3 * a + 0.6) + 0.019 * Math.sin(5 * a + 1.9)) *
      scale;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return pts;
}

/** Extrude an XZ polygon between y0 and y1. */
function prism(
  pts: Array<[number, number]>,
  y0: number,
  y1: number,
  color: string
): Mesh {
  const s = new Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: y1 - y0, bevelEnabled: false });
  geo.rotateX(Math.PI / 2);
  geo.translate(0, y1, 0);
  return new Mesh(geo, mat(color));
}

function leafBall(
  r: number,
  x: number,
  y: number,
  z: number,
  squash: number,
  color: string
): Mesh {
  const m = new Mesh(new SphereGeometry(r, 7, 5), mat(color));
  m.position.set(x, y, z);
  m.scale.set(1.15, squash, 1.05);
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

export function build(): Group {
  const g = new Group();

  // ---- the river, with a paler shallow ring around the island ----
  const river = new Mesh(new CylinderGeometry(0.375, 0.375, 0.03, 34), mat(WATER));
  river.position.y = 0.015;
  g.add(river);
  g.add(prism(islandPts(1.14), 0.028, 0.036, SHALLOW));

  // ---- the island: sandy shore under an olive crown ----
  g.add(prism(islandPts(1.0), 0.02, 0.062, SAND));
  g.add(prism(islandPts(0.9), 0.055, 0.074, GRASS));
  g.add(prism(islandPts(0.62), 0.07, 0.082, GRASS_DK));

  // ---- the cotton tree: buttress roots, thick bole, spreading crown ----
  const TX = -0.055;
  const TZ = -0.02;
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 + 0.35;
    const root = box(0.026, 0.062, 0.1, TX + Math.sin(a) * 0.045, 0.098, TZ + Math.cos(a) * 0.045, BARK);
    root.rotation.y = a;
    g.add(root);
  }
  const bole = new Mesh(new CylinderGeometry(0.028, 0.05, 0.24, 10), mat(BARK));
  bole.position.set(TX, 0.19, TZ);
  g.add(bole);
  // limbs reaching out under the canopy
  for (const [a, tilt, len] of [
    [0.5, 0.85, 0.15],
    [2.4, 0.95, 0.17],
    [4.2, 0.8, 0.14],
    [5.4, 1.0, 0.16],
  ] as const) {
    const limb = new Mesh(new CylinderGeometry(0.009, 0.017, len, 7), mat(BARK));
    limb.position.set(
      TX + Math.sin(a) * (Math.sin(tilt) * len) / 2,
      0.315 + (Math.cos(tilt) * len) / 2,
      TZ + Math.cos(a) * (Math.sin(tilt) * len) / 2
    );
    limb.rotation.set(0, a, tilt, "YXZ");
    g.add(limb);
  }

  // broad flat crown, wider than it is tall
  const crown: Array<[number, number, number, number, number, string]> = [
    [0.145, 0, 0.4, 0, 0.44, CANOPY_A],
    [0.12, -0.152, 0.375, 0.045, 0.42, CANOPY_B],
    [0.115, 0.158, 0.372, -0.035, 0.42, CANOPY_C],
    [0.1, 0.035, 0.368, 0.162, 0.4, CANOPY_B],
    [0.098, -0.055, 0.365, -0.158, 0.4, CANOPY_C],
    [0.085, 0.122, 0.428, 0.112, 0.4, CANOPY_A],
    [0.082, -0.128, 0.43, -0.098, 0.4, CANOPY_A],
    [0.075, 0.0, 0.452, -0.02, 0.42, CANOPY_C],
  ];
  for (const [r, dx, y, dz, sq, c] of crown)
    g.add(leafBall(r, TX + dx, y, TZ + dz, sq, c));

  // ---- open-sided pavilion with a dull terracotta roof ----
  const pav = new Group();
  pav.position.set(0.185, 0.074, 0.155);
  pav.rotation.y = -0.5;
  g.add(pav);
  pav.add(box(0.115, 0.014, 0.1, 0, 0.007, 0, SAND));
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      pav.add(box(0.011, 0.082, 0.011, sx * 0.043, 0.055, sz * 0.037, POST));
  pav.add(box(0.108, 0.009, 0.094, 0, 0.1, 0, POST)); // head plate
  const roof = new Mesh(new ConeGeometry(0.082 * SQ2, 0.048, 4), mat(TERRA));
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 0.129;
  pav.add(roof);

  // ---- shore dressing: scrub, a rock, a stub of jetty ----
  for (const [x, z, r, c] of [
    [0.19, -0.16, 0.048, GRASS_DK],
    [-0.2, 0.17, 0.055, GRASS],
    [-0.19, -0.16, 0.042, GRASS_DK],
    [0.05, 0.22, 0.04, GRASS],
    [0.24, 0.03, 0.036, GRASS_DK],
  ] as const) {
    g.add(leafBall(r, x, 0.078 + r * 0.3, z, 0.62, c));
  }
  return g;
}
