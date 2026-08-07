// Ilulissat Icefjord — papercraft landform: a cluster of angular icebergs in
// white and glacier-blue drifting in a deep navy fjord, backed by a low grey
// rocky coast with tiny red and blue Greenlandic houses for scale.
// Natural landform: water is the ground plane, no plaza disc.

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

const R = 0.35; // fjord radius (footprint 0.70)
const SEA_H = 0.03;

const FJORD = "#46617f"; // deep navy meltwater
const ICE = "#f1efe9";
const ICE_BLUE = "#a4c0d4"; // wet ice at the waterline
const ICE_SHADE = "#b9cddb"; // pale glacier blue
const ROCK = "#8b8983";
const ROCK_DARK = "#71706c";
const ROOF = "#565c64";

/** Angular ice mass: a few-sided frustum, sheared into a tilted wedge and
 *  crumpled by an angle-periodic radial wobble so every facet reads. */
function iceberg(
  rBot: number,
  rTop: number,
  h: number,
  sides: number,
  shear: number,
  phase: number,
  color: string
): Mesh {
  const geo = new CylinderGeometry(rTop, rBot, h, sides, 1);
  geo.translate(0, h / 2, 0);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = pos.getY(i);
    const a = Math.atan2(z, x);
    const wob =
      1 +
      0.24 *
        (0.6 * Math.sin(a + phase) +
          0.4 * Math.sin(2 * a + phase * 1.9) +
          0.28 * Math.sin(3 * a + phase * 3.1));
    // One dominant high point on the crown plus a secondary shoulder, so the
    // flat top breaks into a peak with a long slope instead of a plateau.
    const lift =
      h * (0.17 * Math.sin(a + phase * 1.3) + 0.12 * Math.sin(2 * a + phase * 2.7));
    const ny = y > h * 0.5 ? y + lift : y;
    pos.setXYZ(i, x * wob + shear * ny, ny, z * wob);
  }
  geo.computeVertexNormals();
  return new Mesh(geo, mat(color));
}

/** Circle segment of the fjord disc beyond a chord, rotated into place. */
function segment(d: number, h: number, color: string, rotY: number): Mesh {
  const zc = Math.sqrt(R * R - d * d);
  const a = Math.atan2(zc, d);
  const s = new Shape();
  s.moveTo(d, -zc);
  s.absarc(0, 0, R, -a, a, false);
  s.closePath();
  const geo = new ExtrudeGeometry(s, {
    depth: h,
    bevelEnabled: false,
    curveSegments: 12,
  });
  geo.rotateX(-Math.PI / 2);
  geo.rotateY(rotY);
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

/** Tiny gabled Greenlandic house in a saturated-but-muted paint colour. */
function house(wall: string): Group {
  const g = new Group();
  const W = 0.036;
  const D = 0.028;
  g.add(box(W, 0.026, D, 0, 0.013, 0, wall));
  const s = new Shape();
  s.moveTo(-W / 2 - 0.003, 0);
  s.lineTo(W / 2 + 0.003, 0);
  s.lineTo(0, 0.018);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: D + 0.006, bevelEnabled: false });
  geo.translate(0, 0.026, -(D + 0.006) / 2);
  g.add(new Mesh(geo, mat(ROOF)));
  return g;
}

export function build(): Group {
  const g = new Group();

  // ---- fjord water ----
  const sea = new Mesh(new CylinderGeometry(R, R, SEA_H, 36), mat(FJORD));
  sea.position.y = SEA_H / 2;
  g.add(sea);

  // ---- low grey rocky coast along the back ----
  g.add(segment(0.2, 0.048, ROCK, Math.PI / 2));
  g.add(segment(0.26, 0.07, ROCK_DARK, Math.PI / 2));
  for (const [x, z, r, h, p] of [
    [-0.13, -0.29, 0.05, 0.05, 1.1],
    [0.09, -0.3, 0.044, 0.042, 2.6],
    [0.22, -0.25, 0.038, 0.034, 4.2],
    [-0.25, -0.24, 0.036, 0.03, 5.5],
  ] as const) {
    const rock = iceberg(r, r * 0.45, h, 5, 0.1, p, ROCK_DARK);
    rock.position.set(x, 0.046, z);
    g.add(rock);
  }

  // tiny houses for scale
  const homes: Array<[number, number, number, string]> = [
    [-0.185, -0.235, 0.3, "#a8574f"],
    [-0.075, -0.255, -0.2, "#4d6a8a"],
    [0.025, -0.24, 0.45, "#a8574f"],
    [0.135, -0.262, -0.35, "#4d6a8a"],
    [0.215, -0.222, 0.15, "#b5905a"],
  ];
  for (const [x, z, ry, wall] of homes) {
    const h = house(wall);
    h.position.set(x, 0.048, z);
    h.rotation.y = ry;
    g.add(h);
  }

  // ---- the iceberg cluster ----
  const bergs: Array<
    [number, number, number, number, number, number, number, number, string]
  > = [
    // rBot, rTop, h, sides, shear, phase, x, z, colour
    // Low blue ice rams first, then the white masses that ride on them.
    [0.13, 0.108, 0.075, 6, 0.06, 3.9, -0.115, 0.115, ICE_BLUE],
    [0.12, 0.1, 0.06, 6, -0.05, 1.4, 0.085, -0.09, ICE_BLUE],
    [0.21, 0.115, 0.38, 7, 0.18, 0.8, -0.02, 0.02, ICE],
    [0.115, 0.068, 0.225, 6, -0.2, 2.3, 0.18, 0.08, ICE_SHADE],
    [0.1, 0.06, 0.17, 6, 0.22, 4.0, -0.195, 0.088, ICE],
    [0.072, 0.044, 0.105, 5, -0.18, 5.2, 0.085, 0.235, ICE_SHADE],
    [0.06, 0.036, 0.08, 5, 0.18, 1.7, -0.105, 0.245, ICE],
    [0.07, 0.042, 0.1, 5, -0.18, 3.4, 0.25, -0.07, ICE_SHADE],
    [0.054, 0.032, 0.065, 5, 0.16, 6.1, -0.275, -0.05, ICE],
  ];
  for (const [rb, rt, h, sd, sh, p, x, z, color] of bergs) {
    const body = iceberg(rb, rt, h, sd, sh, p, color);
    body.position.set(x, SEA_H - 0.012, z);
    g.add(body);
    if (color === ICE_BLUE) continue;
    const collar = iceberg(rb * 1.1, rb * 1.03, h * 0.2, sd, sh * 0.2, p, ICE_BLUE);
    collar.position.set(x, SEA_H - 0.016, z);
    g.add(collar);
  }

  // ---- brash ice drifting between the bergs ----
  for (const [x, z, r, p] of [
    [-0.13, 0.19, 0.04, 0.4],
    [0.02, 0.15, 0.032, 2.0],
    [0.17, 0.2, 0.028, 3.3],
    [-0.26, 0.19, 0.026, 4.6],
    [0.31, 0.09, 0.024, 5.9],
    [-0.06, -0.13, 0.03, 1.2],
    [0.13, -0.16, 0.026, 2.9],
  ] as const) {
    const floe = iceberg(r, r * 0.8, 0.022, 5, 0, p, ICE_SHADE);
    floe.position.set(x, SEA_H - 0.008, z);
    g.add(floe);
  }

  return g;
}
