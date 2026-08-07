// Laas Geel — papercraft: a low ochre-tan granite outcrop whose front face
// opens in a shallow rock arch, sheltering an inner wall painted with
// rust-red and cream long-horned cattle.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Path,
  Shape,
  TorusGeometry,
} from "three";
import { mat } from "./materials";

const ROCK = "#c9ab7c"; // sunlit granite
const ROCK_D = "#a98d62"; // shaded boulders
const ROCK_L = "#dcc59b"; // sheltered inner wall, out of the sun
const SANDY = "#d9c49a"; // desert floor
const OCHRE = "#a4553f"; // rust-red pigment
const CREAM = "#eadfc6"; // cream pigment

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

/** Rock slab in the XY plane extruded through Z, with one arched mouth cut
 *  out of it. `outline` runs counter-clockwise from the bottom-left. */
function archedFace(
  outline: Array<[number, number]>,
  hw: number,
  spring: number,
  thick: number,
  color: string
): Mesh {
  const s = new Shape();
  s.moveTo(outline[0][0], outline[0][1]);
  for (let i = 1; i < outline.length; i++) s.lineTo(outline[i][0], outline[i][1]);
  s.closePath();
  const p = new Path();
  p.moveTo(-hw, 0.004);
  p.lineTo(-hw, spring);
  p.absarc(0, spring, hw, Math.PI, 0, true);
  p.lineTo(hw, 0.004);
  p.closePath();
  s.holes.push(p);
  const geo = new ExtrudeGeometry(s, {
    depth: thick,
    bevelEnabled: false,
    curveSegments: 7,
  });
  geo.translate(0, 0, -thick / 2);
  return new Mesh(geo, mat(color));
}

/** Angular boulder: a squat 6-sided prism, tipped a little off vertical. */
function boulder(
  rBot: number,
  rTop: number,
  h: number,
  x: number,
  y: number,
  z: number,
  spin: number,
  tilt: number,
  m: MeshLambertMaterial
): Mesh {
  const mesh = new Mesh(new CylinderGeometry(rTop, rBot, h, 6), m);
  mesh.position.set(x, y + h / 2, z);
  mesh.rotation.set(tilt, spin, tilt * 0.6);
  return mesh;
}

/** One painted long-horned bull, drawn flat against the shelter wall. */
function bull(color: string, s: number): Group {
  const g = new Group();
  const c = mat(color);
  const add = (w: number, h: number, x: number, y: number) => {
    const m = new Mesh(new BoxGeometry(w * s, h * s, 0.007), c);
    m.position.set(x * s, y * s, 0);
    g.add(m);
  };
  add(0.052, 0.026, 0, 0); // barrel body
  add(0.014, 0.016, 0.032, 0.009); // neck
  add(0.019, 0.012, 0.043, 0.019); // muzzle
  for (const [x, h] of [
    [-0.021, 0.019],
    [-0.009, 0.018],
    [0.013, 0.019],
    [0.023, 0.018],
  ] as const) {
    add(0.006, h, x, -0.013 - h / 2 + 0.006);
  }
  add(0.005, 0.018, -0.027, 0.006); // tail

  // the huge lyre horns — a crescent opening upward over the head
  const horns = new Mesh(
    new TorusGeometry(0.026 * s, 0.0042 * s, 3, 10, Math.PI),
    c
  );
  horns.rotation.z = Math.PI;
  horns.position.set(0.041 * s, 0.03 * s, 0);
  g.add(horns);
  return g;
}

export function build(): Group {
  const g = new Group();
  const rock = mat(ROCK);
  const rockD = mat(ROCK_D);

  // ---- desert floor (natural outcrop: terrain, not a plaza) ----
  const floor = new Mesh(new CylinderGeometry(0.325, 0.318, 0.026, 26), mat(SANDY));
  floor.position.y = 0.013;
  g.add(floor);

  // ---- bulk of the outcrop, piled up behind and above the shelter ----
  g.add(box(0.38, 0.3, 0.19, -0.005, 0.16, -0.125, ROCK_D));
  g.add(boulder(0.155, 0.135, 0.13, -0.085, 0.3, -0.1, 0.35, 0.05, rock));
  g.add(boulder(0.13, 0.115, 0.1, 0.115, 0.29, -0.14, -0.22, -0.04, rockD));
  g.add(boulder(0.105, 0.088, 0.07, 0.212, 0.05, -0.06, -0.5, -0.06, rockD));
  g.add(boulder(0.108, 0.092, 0.08, -0.212, 0.05, -0.05, 0.3, 0.07, rockD));

  // side piers closing the alcove, so the shelter reads as a hollow
  for (const sx of [-1, 1]) {
    g.add(box(0.085, 0.29, 0.115, sx * 0.163, 0.145, 0.018, ROCK_D));
  }

  // ---- the sheltered inner wall, lit only by the arch ----
  g.add(box(0.29, 0.3, 0.05, 0, 0.15, 0.022, ROCK_L));

  // ---- painted frieze: three long-horned cattle across the wall ----
  const herd: Array<[string, number, number, number]> = [
    // pigment, scale, x, y
    [OCHRE, 1.0, -0.058, 0.172],
    [CREAM, 0.82, 0.055, 0.196],
    [OCHRE, 0.74, 0.028, 0.104],
    [CREAM, 0.62, -0.078, 0.096],
  ];
  for (const [color, s, x, y] of herd) {
    const b = bull(color, s);
    b.position.set(x, y, 0.05);
    g.add(b);
  }
  // a scatter of pigment dots between the animals
  for (const [x, y, r] of [
    [-0.005, 0.238, 0.006],
    [0.012, 0.234, 0.005],
    [-0.104, 0.226, 0.005],
    [0.098, 0.128, 0.005],
  ] as const) {
    g.add(box(r * 2, r * 2, 0.006, x, y, 0.05, OCHRE));
  }

  // ---- the arched rock face standing in front of the painted wall ----
  const face = archedFace(
    [
      [-0.205, 0],
      [0.205, 0],
      [0.205, 0.245],
      [0.152, 0.302],
      [0.086, 0.283],
      [0.02, 0.336],
      [-0.056, 0.308],
      [-0.13, 0.345],
      [-0.205, 0.31],
    ],
    0.128,
    0.178,
    0.052,
    ROCK
  );
  face.position.set(0, 0, 0.085);
  g.add(face);

  // fallen slabs at the mouth of the shelter
  for (const [x, z, w, h, d, ry] of [
    [-0.2, 0.185, 0.09, 0.032, 0.06, 0.4],
    [0.175, 0.2, 0.075, 0.026, 0.052, -0.3],
    [0.03, 0.235, 0.062, 0.022, 0.046, 0.9],
  ] as const) {
    const b = box(w, h, d, x, 0.026 + h / 2, z, ROCK_D);
    b.rotation.y = ry;
    g.add(b);
  }

  return g;
}
