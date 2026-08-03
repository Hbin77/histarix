// Narikala Fortress, Tbilisi — papercraft miniature.
// Steep green hill with a crenellated stone wall zigzagging up the front
// face, a walled summit citadel with a square keep, and the tiny brick
// St. Nicholas church with its conical dome on the lower terrace.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  Vector3,
} from "three";
import { mat, TONES } from "./materials";

const WALL = TONES.stoneDark;
const MERLON = TONES.stone;
const HILL = TONES.forest;
const HILL_DARK = "#5f7a52"; // muted darker green (shrubs / treeline)

const merlonGeo = new BoxGeometry(0.034, 0.02, 0.018);
const merlonMat = mat(MERLON);

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

/** Crenellated curtain-wall run p0 → p1 (y follows the slope; body sinks
 *  into the hillside so the base never floats). Merlons stay world-upright
 *  and step along the run so steep climbs read as battlements, not rubble. */
function wallRun(p0: Vector3, p1: Vector3): Group {
  const g = new Group();
  const tilt = new Group();
  tilt.position.copy(p0);
  tilt.lookAt(p1); // local +z points down the run
  const len = p0.distanceTo(p1);
  const body = new Mesh(new BoxGeometry(0.028, 0.082, len + 0.012), mat(WALL));
  body.position.set(0, 0.011, len / 2); // top at +0.052, sunk ~0.03
  tilt.add(body);
  g.add(tilt);
  const yaw = Math.atan2(p1.x - p0.x, p1.z - p0.z) + Math.PI / 2;
  const n = Math.max(2, Math.round(len / 0.055));
  for (let i = 0; i <= n; i++) {
    const m = new Mesh(merlonGeo, merlonMat);
    m.position.lerpVectors(p0, p1, i / n);
    m.position.y += 0.058;
    m.rotation.y = yaw;
    g.add(m);
  }
  return g;
}

/** Small square wall tower with corner merlons; base sinks into the hill. */
function tower(x: number, groundY: number, z: number, w: number, h: number): Group {
  const g = new Group();
  g.position.set(x, groundY, z);
  const body = new Mesh(new BoxGeometry(w, h + 0.05, w), mat(WALL));
  body.position.y = (h - 0.05) / 2;
  g.add(body);
  const s = w / 2 - 0.008;
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const m = new Mesh(merlonGeo, merlonMat);
      m.scale.set(0.55, 1, 1);
      m.position.set(sx * s, h + 0.008, sz * s);
      g.add(m);
    }
  return g;
}

/** Tiny Georgian church: cruciform brick body, drum, conical dome, cross. */
function church(): Group {
  const g = new Group();
  // cruciform body (two crossing boxes) + shallow hip roofs
  g.add(box(0.1, 0.055, 0.06, 0, 0.0275, 0, TONES.brick));
  g.add(box(0.06, 0.055, 0.095, 0, 0.0275, 0, TONES.brick));
  const hip = (hx: number, hz: number) => {
    const geo = new CylinderGeometry(0.28 * Math.SQRT2, Math.SQRT2, 1, 4, 1);
    geo.rotateY(Math.PI / 4);
    geo.translate(0, 0.5, 0);
    const m = new Mesh(geo, mat(TONES.brickDark));
    m.scale.set(hx, 0.024, hz);
    m.position.y = 0.055;
    g.add(m);
  };
  hip(0.054, 0.033);
  hip(0.033, 0.0515);
  // drum + conical dome + cross
  const drum = new Mesh(new CylinderGeometry(0.026, 0.028, 0.055, 8), mat(TONES.brick));
  drum.position.y = 0.1;
  g.add(drum);
  const rim = new Mesh(new CylinderGeometry(0.034, 0.034, 0.01, 8), mat(TONES.brickDark));
  rim.position.y = 0.131;
  g.add(rim);
  const cone = new Mesh(new ConeGeometry(0.038, 0.095, 8), mat(TONES.slate));
  cone.position.y = 0.1835;
  g.add(cone);
  g.add(box(0.004, 0.024, 0.004, 0, 0.241, 0, TONES.white));
  g.add(box(0.014, 0.004, 0.004, 0, 0.245, 0, TONES.white));
  return g;
}

/** Hill surface height helpers (mirror the two terrain frustums below). */
function summitY(x: number, z: number): number {
  const r = Math.hypot(x - 0.1, z);
  if (r <= 0.09) return 0.3;
  return Math.max(0.02, 0.02 + (0.28 * (0.26 - r)) / 0.17);
}
function knollY(x: number, z: number): number {
  const r = Math.hypot(x + 0.17, z + 0.02);
  if (r <= 0.08) return 0.19;
  return Math.max(0.02, 0.02 + (0.17 * (0.2 - r)) / 0.12);
}
function groundY(x: number, z: number): number {
  return Math.max(summitY(x, z), knollY(x, z));
}

export function build(): Group {
  const g = new Group();

  // ---- terrain: green base skirt + two hill frustums (landform, no plaza) ----
  const base = new Mesh(new CylinderGeometry(0.36, 0.375, 0.02, 24), mat(HILL_DARK));
  base.position.y = 0.01;
  g.add(base);

  const summit = new Mesh(new CylinderGeometry(0.09, 0.26, 0.28, 11), mat(HILL));
  summit.position.set(0.1, 0.16, 0);
  g.add(summit);

  const knoll = new Mesh(new CylinderGeometry(0.08, 0.2, 0.17, 10), mat(HILL));
  knoll.position.set(-0.17, 0.105, -0.02);
  g.add(knoll);

  // rocky outcrops on the flanks (embedded, stone-toned)
  const rock = (x: number, z: number, r: number, h: number) => {
    const m = new Mesh(new ConeGeometry(r, h, 5), mat(TONES.stoneDark));
    m.position.set(x, groundY(x, z) - 0.03 + h / 2, z);
    m.rotation.y = x * 9;
    g.add(m);
  };
  rock(-0.02, 0.145, 0.04, 0.055);
  rock(0.02, -0.14, 0.045, 0.06);
  rock(-0.29, 0.09, 0.04, 0.05);

  // sparse dark shrubs
  const shrub = (x: number, z: number) => {
    const m = new Mesh(new ConeGeometry(0.022, 0.05, 6), mat(HILL_DARK));
    m.position.set(x, groundY(x, z) + 0.015, z);
    g.add(m);
  };
  shrub(-0.08, 0.12);
  shrub(0.24, -0.1);
  shrub(-0.25, 0.09);
  shrub(0.3, 0.03);

  // ---- zigzag curtain wall climbing the front face ----
  const path: Array<[number, number]> = [
    [-0.335, 0.01],
    [-0.28, 0.05],
    [-0.21, 0.01],
    [-0.13, 0.05],
    [-0.05, 0.0],
    [-0.01, 0.04], // extra bend so the run hugs the saddle
    [0.025, 0.065], // meets the citadel SW corner
  ];
  const pts = path.map(([x, z]) => new Vector3(x, groundY(x, z), z));
  for (let i = 0; i < pts.length - 1; i++) g.add(wallRun(pts[i], pts[i + 1]));

  // wall towers at the lower bends
  g.add(tower(-0.335, groundY(-0.335, 0.01) - 0.01, 0.01, 0.055, 0.1));
  g.add(tower(-0.21, groundY(-0.21, 0.01) - 0.01, 0.01, 0.05, 0.09));
  g.add(tower(-0.05, groundY(-0.05, 0.0) - 0.01, 0.0, 0.05, 0.09));

  // ---- eastern spur descending the right shoulder ----
  const spur: Array<[number, number]> = [
    [0.175, 0.065],
    [0.25, 0.1],
    [0.305, 0.065],
  ];
  const spts = spur.map(([x, z]) => new Vector3(x, groundY(x, z), z));
  for (let i = 0; i < spts.length - 1; i++) g.add(wallRun(spts[i], spts[i + 1]));
  g.add(tower(0.305, groundY(0.305, 0.065) - 0.02, 0.065, 0.048, 0.085));

  // ---- summit citadel: walled square + keep tower ----
  const cit: Array<[number, number]> = [
    [0.025, 0.065],
    [0.175, 0.065],
    [0.175, -0.065],
    [0.025, -0.065],
    [0.025, 0.065],
  ];
  const cpts = cit.map(([x, z]) => new Vector3(x, 0.295, z));
  for (let i = 0; i < cpts.length - 1; i++) g.add(wallRun(cpts[i], cpts[i + 1]));

  // square keep: distinctly taller than the curtain, protruding parapet
  const keep = new Group();
  keep.position.set(0.125, 0.3, -0.005);
  const kBody = new Mesh(new BoxGeometry(0.075, 0.21, 0.075), mat(WALL));
  kBody.position.y = 0.08; // sinks 0.025 into the summit
  keep.add(kBody);
  const kCap = new Mesh(new BoxGeometry(0.09, 0.022, 0.09), mat(WALL));
  kCap.position.y = 0.196;
  keep.add(kCap);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const m = new Mesh(merlonGeo, merlonMat);
      m.scale.set(0.62, 1.15, 1.2);
      m.position.set(sx * 0.036, 0.218, sz * 0.036);
      keep.add(m);
    }
  for (const sx of [1, -1]) {
    const m1 = new Mesh(merlonGeo, merlonMat);
    m1.scale.set(0.62, 1.15, 1.2);
    m1.position.set(sx * 0.036, 0.218, 0);
    keep.add(m1);
    const m2 = new Mesh(merlonGeo, merlonMat);
    m2.scale.set(0.62, 1.15, 1.2);
    m2.position.set(0, 0.218, sx * 0.036);
    keep.add(m2);
  }
  g.add(keep);

  // ---- St. Nicholas church on the lower terrace, rising behind the wall ----
  const pad = box(0.15, 0.024, 0.12, -0.155, 0.196, -0.025, TONES.stone);
  g.add(pad);
  const ch = church();
  ch.position.set(-0.155, 0.208, -0.025);
  ch.rotation.y = 0.25;
  ch.scale.setScalar(1.18);
  g.add(ch);

  return g;
}
