// Tikal, Temple I — papercraft: nine steep battered terraces of weathered
// warm-grey limestone, a single narrow staircase running straight up the
// front to a small shrine, and the tall flat roof comb above it. The whole
// thing stands on a muted jungle-green plaza fringed with forest.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  Vector2,
} from "three";
import { mat, plazaDisc } from "./materials";

const SQ2 = Math.SQRT2;

const LIME = "#c7bda8"; // weathered limestone
const LIME_LIGHT = "#d8cfba";
const LIME_DARK = "#aca290";
const STAIR = "#d2c9b4";
const GRASS = "#829563";
const JUNGLE = "#4d6b45";
const JUNGLE_MID = "#587a4d";
const DOOR = "#3b382f";

const TIERS = 9;
const TIER_H = 0.06;
const WALL_H = 0.047;
const Y0 = 0.07; // terraces spring from the platform
const HX0 = 0.205;
const HZ0 = 0.185;
const HX1 = 0.062;
const HZ1 = 0.056;

const hxAt = (i: number) => HX0 + ((HX1 - HX0) * i) / TIERS;
const hzAt = (i: number) => HZ0 + ((HZ1 - HZ0) * i) / TIERS;

/** Battered rectangular terrace: half-extents (hx, hz) tapering to (tx, tz)
 *  over height h. Mesh base at y = 0. */
function frustum(
  hx: number,
  hz: number,
  tx: number,
  tz: number,
  h: number,
  color: string
): Mesh {
  const geo = new CylinderGeometry(SQ2, SQ2, 1, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, 0.5, 0);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const up = y > 0.5;
    pos.setX(i, pos.getX(i) * (up ? tx : hx));
    pos.setZ(i, pos.getZ(i) * (up ? tz : hz));
    pos.setY(i, y * h);
  }
  geo.computeVertexNormals();
  return new Mesh(geo, mat(color));
}

/** Stepped staircase climbing from (z0, y0) to (z1, y1); the profile is a
 *  sawtooth extruded across the stair width, so every tread reads. */
function staircase(
  z0: number,
  y0: number,
  z1: number,
  y1: number,
  width: number,
  steps: number,
  color: string
): Mesh {
  const zAt = (t: number) => z0 + (z1 - z0) * t;
  const yAt = (t: number) => y0 + (y1 - y0) * t;
  const s = new Shape();
  s.moveTo(zAt(0), yAt(0));
  for (let k = 0; k < steps; k++) {
    const t = (k + 1) / steps;
    s.lineTo(zAt(k / steps), yAt(t)); // riser
    s.lineTo(zAt(t), yAt(t)); // tread
  }
  s.lineTo(zAt(1) - 0.07, yAt(1));
  s.lineTo(zAt(0) - 0.07, yAt(0));
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: width, bevelEnabled: false });
  geo.translate(0, 0, -width / 2);
  geo.rotateY(-Math.PI / 2);
  return new Mesh(geo, mat(color));
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

/** Low forest clump. */
function canopy(r: number, h: number, color: string): Mesh {
  const pts: Vector2[] = [];
  for (let i = 0; i <= 5; i++) {
    const t = i / 5;
    pts.push(new Vector2(r * Math.sqrt(Math.max(0, 1 - Math.pow(t, 2.6))), h * t));
  }
  return new Mesh(new LatheGeometry(pts, 8), mat(color));
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.35));

  // ---- jungle-green plaza ----
  const lawn = new Mesh(new CylinderGeometry(0.335, 0.335, 0.018, 30), mat(GRASS));
  lawn.position.y = 0.017;
  g.add(lawn);

  // ---- limestone platform ----
  g.add(box(0.43, 0.024, 0.4, 0, 0.038, 0, LIME_DARK));
  g.add(box(0.406, 0.024, 0.376, 0, 0.06, 0, LIME));

  // ---- nine battered terraces ----
  for (let i = 0; i < TIERS; i++) {
    const yb = Y0 + i * TIER_H;
    const tx = hxAt(i + 1) * 1.02;
    const tz = hzAt(i + 1) * 1.02;
    const wall = frustum(hxAt(i), hzAt(i), tx, tz, WALL_H, i % 2 ? LIME : LIME_LIGHT);
    wall.position.y = yb;
    g.add(wall);
    g.add(
      box(
        hxAt(i + 1) * 2 * 1.1,
        TIER_H - WALL_H,
        hzAt(i + 1) * 2 * 1.1,
        0,
        yb + WALL_H + (TIER_H - WALL_H) / 2,
        0,
        LIME_DARK
      )
    );
  }

  // ---- the single central staircase ----
  const TOP = Y0 + TIERS * TIER_H; // 0.592
  g.add(staircase(HZ0 + 0.045, Y0, HZ1 + 0.035, TOP, 0.1, 22, STAIR));

  // ---- summit shrine ----
  g.add(box(0.145, 0.11, 0.118, 0, TOP + 0.055, -0.005, LIME));
  g.add(box(0.164, 0.016, 0.136, 0, TOP + 0.118, -0.005, LIME_DARK));
  g.add(box(0.046, 0.078, 0.01, 0, TOP + 0.039, 0.055, DOOR)); // doorway
  for (const sx of [1, -1])
    g.add(box(0.015, 0.11, 0.008, sx * 0.043, TOP + 0.055, 0.057, LIME_LIGHT));

  // ---- tall flat roof comb, stepped on its face ----
  const comb = frustum(0.073, 0.032, 0.055, 0.026, 0.175, LIME_LIGHT);
  comb.position.set(0, TOP + 0.126, -0.03);
  g.add(comb);
  for (const [y, w, d] of [
    [0.042, 0.14, 0.07],
    [0.094, 0.126, 0.066],
    [0.142, 0.112, 0.062],
  ] as const)
    g.add(box(w, 0.014, d, 0, TOP + 0.126 + y, -0.03, LIME));
  g.add(box(0.1, 0.013, 0.058, 0, TOP + 0.308, -0.03, LIME_DARK)); // capstone

  // ---- forest fringing the plaza ----
  const trees: Array<[number, number, number, number, string]> = [
    [-0.235, -0.12, 0.072, 0.1, JUNGLE],
    [-0.1, -0.245, 0.07, 0.095, JUNGLE_MID],
    [0.07, -0.255, 0.072, 0.1, JUNGLE],
    [0.235, -0.13, 0.068, 0.09, JUNGLE_MID],
    [0.275, 0.06, 0.062, 0.082, JUNGLE],
    [-0.275, 0.07, 0.06, 0.078, JUNGLE_MID],
    [0.2, 0.215, 0.055, 0.07, JUNGLE_MID],
    [-0.2, 0.215, 0.055, 0.07, JUNGLE],
  ];
  for (const [x, z, r, h, color] of trees) {
    const t = canopy(r, h, color);
    t.position.set(x, 0.022, z);
    g.add(t);
  }

  return g;
}
