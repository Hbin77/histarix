// Bratislava Castle — papercraft miniature. The "upside-down table": white
// rectangular palace block with four corner towers wearing red pyramidal
// caps (one bulkier Crown Tower), red hipped roof, perched on a green hill
// terrace with stone ramparts and a small gate tower on the slope.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;
const ROOF = "#a85a48"; // muted terracotta
const ROOF_DARK = "#8f4a3a";
const TREE = "#66815a";

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

/** Square corner tower with cornice + red pyramid cap. Base sits at baseY.
 *  faceSign: which Z side the shaft windows face (outward). */
function tower(
  x: number,
  z: number,
  w: number,
  baseY: number,
  topY: number,
  capH: number,
  finial: boolean,
  faceSign: number
): Group {
  const g = new Group();
  const h = topY - baseY;
  g.add(box(w, h, w, x, baseY + h / 2, z, TONES.white));
  // cornice band
  g.add(box(w * 1.18, 0.016, w * 1.18, x, topY + 0.008, z, TONES.stone));
  // red pyramid cap (4-sided, aligned to the square shaft)
  const cap = new Mesh(new ConeGeometry((w / 2) * SQ2 * 1.16, capH, 4), mat(ROOF));
  cap.rotation.y = Math.PI / 4;
  cap.position.set(x, topY + 0.016 + capH / 2, z);
  g.add(cap);
  if (finial) {
    const ball = new Mesh(new SphereGeometry(0.011, 6, 5), mat(TONES.gold));
    ball.position.set(x, topY + 0.016 + capH + 0.008, z);
    g.add(ball);
  }
  // slim windows on the outward Z face and outward X face
  const zf = z + faceSign * (w / 2 + 0.002);
  g.add(box(0.014, 0.032, 0.006, x, baseY + h * 0.66, zf, TONES.slate));
  g.add(box(0.014, 0.032, 0.006, x, baseY + h * 0.42, zf, TONES.slate));
  const xf = x + Math.sign(x) * (w / 2 + 0.002);
  g.add(box(0.006, 0.032, 0.014, xf, baseY + h * 0.66, z, TONES.slate));
  return g;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.36));

  // ---- green castle hill (elliptical frustum) ----
  const hill = new Mesh(new CylinderGeometry(0.82, 1, 1, 22), mat(TONES.forest));
  hill.scale.set(0.36, 0.112, 0.27);
  hill.position.y = 0.012 + 0.056;
  g.add(hill);

  // ---- stone terrace: rectangular retaining-wall frustum rising from
  //      the hill, with a thin lip the palace stands on ----
  const terrGeo = new CylinderGeometry(0.95 * SQ2, SQ2, 1, 4, 1);
  terrGeo.rotateY(Math.PI / 4);
  terrGeo.translate(0, 0.5, 0);
  const terrace = new Mesh(terrGeo, mat(TONES.stone));
  terrace.scale.set(0.28, 0.12, 0.19);
  terrace.position.y = 0.06;
  g.add(terrace);
  g.add(box(0.55, 0.016, 0.372, 0, 0.176, 0, TONES.stoneDark));
  const FLOOR = 0.184;

  // ---- rampart wall along the lower front slope + small gate tower ----
  const wallF = box(0.26, 0.04, 0.026, -0.06, 0.052, 0.222, TONES.stoneDark);
  wallF.rotation.z = -0.08; // hug the slope
  g.add(wallF);
  const wallR = box(0.13, 0.036, 0.024, 0.2, 0.05, 0.17, TONES.stoneDark);
  wallR.rotation.z = 0.12;
  wallR.rotation.y = -0.5;
  g.add(wallR);
  // gate tower (Sigismund-gate stand-in)
  g.add(box(0.055, 0.1, 0.055, -0.22, 0.06, 0.2, TONES.stone));
  const gateCap = new Mesh(new ConeGeometry(0.045, 0.05, 4), mat(ROOF));
  gateCap.rotation.y = Math.PI / 4;
  gateCap.position.set(-0.22, 0.135, 0.2);
  g.add(gateCap);
  g.add(box(0.024, 0.036, 0.008, -0.22, 0.05, 0.228, TONES.ink));

  // ---- trees dotted on the slope ----
  const treeGeo = new ConeGeometry(0.02, 0.05, 6);
  const treeMat = mat(TREE);
  const trees: [number, number, number][] = [
    [0.28, 0.05, 0.13],
    [0.33, 0.03, -0.04],
    [0.26, 0.055, -0.16],
    [-0.29, 0.045, -0.13],
    [-0.33, 0.03, 0.04],
    [-0.13, 0.05, 0.22],
    [0.1, 0.055, 0.21],
    [0.02, 0.045, -0.24],
  ];
  for (const [x, y, z] of trees) {
    const t = new Mesh(treeGeo, treeMat);
    t.position.set(x, y + 0.025, z);
    g.add(t);
  }

  // ---- white palace block ----
  const W = 0.42;
  const D = 0.22;
  const WALL_H = 0.2;
  const TOP = FLOOR + WALL_H; // 0.365
  g.add(box(W, WALL_H, D, 0, FLOOR + WALL_H / 2, 0, TONES.white));

  // window rows (3 storeys) — long facades
  const rowYs = [FLOOR + 0.045, FLOOR + 0.105, FLOOR + 0.16];
  const winXs = [-0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15];
  for (const y of rowYs)
    for (const x of winXs)
      for (const sz of [1, -1]) {
        if (sz === 1 && y === rowYs[0] && Math.abs(x) < 0.03) continue; // portal slot
        g.add(box(0.02, 0.034, 0.006, x, y, sz * (D / 2 + 0.002), TONES.slate));
      }
  // short facades
  for (const y of rowYs)
    for (const z of [-0.06, 0, 0.06])
      for (const sx of [1, -1])
        g.add(box(0.006, 0.034, 0.02, sx * (W / 2 + 0.002), y, z, TONES.slate));

  // central entrance portal on the front facade
  g.add(box(0.09, 0.006, 0.014, 0, FLOOR + 0.072, D / 2 + 0.004, TONES.stone));
  g.add(box(0.05, 0.062, 0.01, 0, FLOOR + 0.031, D / 2 + 0.003, TONES.ironDark));

  // cornice under the roof
  g.add(box(W + 0.02, 0.014, D + 0.02, 0, TOP + 0.007, 0, TONES.stone));

  // ---- red hipped roof (ridge along X) ----
  const roofGeo = new CylinderGeometry(0.26 * SQ2, SQ2, 1, 4, 1);
  roofGeo.rotateY(Math.PI / 4);
  roofGeo.translate(0, 0.5, 0);
  const roof = new Mesh(roofGeo, mat(ROOF));
  roof.scale.set(W / 2 + 0.02, 0.082, D / 2 + 0.02);
  roof.position.y = TOP + 0.012;
  g.add(roof);
  // ridge cap
  g.add(box(0.24, 0.015, 0.026, 0, TOP + 0.1, 0, ROOF_DARK));
  // small white dormers on both long roof slopes
  for (const x of [-0.1, 0, 0.1])
    for (const sz of [1, -1])
      g.add(box(0.024, 0.022, 0.024, x, TOP + 0.048, sz * 0.095, TONES.white));

  // ---- four corner towers ("upside-down table" legs) ----
  const cx = W / 2;
  const cz = D / 2;
  // Crown Tower — bulkier, front-left
  g.add(tower(-cx, cz, 0.1, FLOOR, FLOOR + 0.33, 0.14, true, 1));
  g.add(tower(cx, cz, 0.075, FLOOR, FLOOR + 0.3, 0.1, false, 1));
  g.add(tower(-cx, -cz, 0.075, FLOOR, FLOOR + 0.3, 0.1, false, -1));
  g.add(tower(cx, -cz, 0.075, FLOOR, FLOOR + 0.3, 0.1, false, -1));

  return g;
}
