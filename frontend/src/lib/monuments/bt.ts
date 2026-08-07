// Paro Taktsang — papercraft: white monastery blocks banded with dark timber
// and capped with gold-ochre hip roofs, stacked on ledges of a sheer slate
// cliff, a thin stair ribbon picking its way up below and pines on the shelves.
// Landform-and-building hybrid: rock terrain base, no plaza disc.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
} from "three";
import { mat, TONES } from "./materials";

const SQ2 = Math.SQRT2;
const CLIFF_BACK = -0.33;

const CLIFF = "#7c8391";
const CLIFF_DARK = "#6b7280";
const CLIFF_LIGHT = "#8b929f";
const WHITE = TONES.white;
const WHITE_SHADE = "#e2ded4";
const TIMBER = "#8a5f47"; // the dark red kemar band
const WOOD = "#6f5341";
const ROOF_GOLD = "#c49a52";
const ROOF_DARK = "#a8823f";
const PINE = "#5d7a5c";
const PINE_DARK = "#4d6a4d";

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

/** Hipped roof: square frustum with the corners on the diagonals. */
function hipRoof(hx: number, hz: number, h: number, t: number, color: string): Mesh {
  const geo = new CylinderGeometry(t * SQ2, SQ2, 1, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, 0.5, 0);
  const m = new Mesh(geo, mat(color));
  m.scale.set(hx, h, hz);
  return m;
}

/**
 * One whitewashed monastery block: body, red kemar band, windows, and a gold
 * hip roof lifted clear of the wall on a dark eave plate. Sits on its own rock
 * shelf, which runs back into the cliff face.
 */
function block(
  w: number,
  d: number,
  h: number,
  x: number,
  y: number,
  z: number,
  roofH: number
): Group {
  const g = new Group();
  g.position.set(x, y, z);

  // rock shelf carrying it, tucked back into the cliff
  g.add(box(w + 0.05, 0.045, d + 0.14, 0, -0.022, -0.05, CLIFF_DARK));

  g.add(box(w, h, d, 0, h / 2, 0, WHITE));
  g.add(box(w + 0.006, 0.022, d + 0.006, 0, h - 0.026, 0, TIMBER));
  g.add(box(w + 0.01, 0.014, d + 0.01, 0, h + 0.007, 0, WOOD));

  // windows: two rows of small dark openings on the valley face
  for (const wy of [h * 0.33, h * 0.66])
    for (let i = 0; i < 3; i++) {
      const wx = (i - 1) * (w * 0.3);
      g.add(box(w * 0.14, 0.02, 0.01, wx, wy, d / 2 + 0.002, WOOD));
    }

  const roof = hipRoof(w * 0.62 + 0.028, d * 0.62 + 0.028, roofH, 0.42, ROOF_GOLD);
  roof.position.y = h + 0.014;
  g.add(roof);
  g.add(box(w * 0.36, 0.012, d * 0.36, 0, h + roofH + 0.012, 0, ROOF_DARK));
  return g;
}

/** Small conifer clinging to a ledge. */
function pine(x: number, y: number, z: number, h: number, dark: boolean): Group {
  const g = new Group();
  g.position.set(x, y, z);
  g.add(box(0.008, h * 0.35, 0.008, 0, h * 0.17, 0, WOOD));
  const crown = new Mesh(new ConeGeometry(h * 0.34, h * 0.82, 6), mat(dark ? PINE_DARK : PINE));
  crown.position.y = h * 0.58;
  g.add(crown);
  return g;
}

export function build(): Group {
  const g = new Group();

  // ---- forested valley floor the cliff springs out of ----
  const floor = new Mesh(new CylinderGeometry(0.375, 0.375, 0.03, 28), mat(PINE_DARK));
  floor.position.y = 0.015;
  g.add(floor);
  const skirt = new Mesh(new CylinderGeometry(0.15, 0.29, 0.1, 12), mat(PINE));
  skirt.position.set(-0.01, 0.055, 0.02);
  g.add(skirt);

  // ---- the cliff: fractured columns of slate, tallest behind the monastery ----
  const columns: Array<[number, number, number, number, string, number]> = [
    [-0.26, 0.15, 0.46, -0.08, CLIFF_DARK, 0.05],
    [-0.135, 0.14, 0.75, -0.04, CLIFF, 0.045],
    [0.005, 0.17, 0.88, -0.01, CLIFF_LIGHT, 0.05],
    [0.15, 0.15, 0.8, -0.05, CLIFF, 0],
    [0.275, 0.12, 0.5, -0.1, CLIFF_DARK, 0.055],
  ];
  for (const [x, w, h, fz, color, capH] of columns) {
    const depth = fz - CLIFF_BACK;
    g.add(box(w, h, depth, x, h / 2, CLIFF_BACK + depth / 2, color));
    if (capH === 0) continue;
    const cap = new Mesh(new ConeGeometry(w * 0.66, capH, 4), mat(color));
    cap.rotation.y = x * 9;
    cap.position.set(x, h + capH / 2 - 0.008, CLIFF_BACK + depth * 0.62);
    g.add(cap);
  }
  // buttresses breaking up the face below the monastery
  for (const [x, w, h, fz, color] of [
    [-0.2, 0.1, 0.3, 0.02, CLIFF],
    [-0.03, 0.13, 0.34, 0.05, CLIFF_DARK],
    [0.13, 0.1, 0.42, 0.02, CLIFF_LIGHT],
    [0.24, 0.08, 0.26, -0.01, CLIFF],
  ] as const)
    g.add(box(w, h, fz + 0.16, x, h / 2, fz - (fz + 0.16) / 2 + 0.0, color));

  // ---- the monastery, stepping up the face from left to right ----
  g.add(block(0.11, 0.1, 0.13, -0.175, 0.27, 0.055, 0.06)); // lower temple
  g.add(block(0.14, 0.11, 0.175, -0.045, 0.35, 0.06, 0.075)); // main hall
  g.add(block(0.11, 0.1, 0.155, 0.095, 0.46, 0.045, 0.065)); // upper temple
  g.add(block(0.08, 0.08, 0.1, 0.215, 0.32, 0.03, 0.05)); // side chapel

  // gilded spire on the main hall
  const spire = new Mesh(new CylinderGeometry(0.008, 0.014, 0.05, 6), mat(ROOF_GOLD));
  spire.position.set(-0.045, 0.635, 0.06);
  g.add(spire);
  const orb = new Mesh(new SphereGeometry(0.013, 7, 5), mat(ROOF_GOLD));
  orb.position.set(-0.045, 0.667, 0.06);
  g.add(orb);

  // ---- stair ribbon switchbacking up the face to the lowest temple ----
  const stairMat = mat(WHITE_SHADE);
  const path: Array<[number, number, number]> = [
    [-0.315, 0.055, 0.13],
    [-0.235, 0.095, 0.175],
    [-0.315, 0.135, 0.145],
    [-0.25, 0.18, 0.1],
    [-0.31, 0.225, 0.07],
    [-0.235, 0.255, 0.05],
  ];
  for (let i = 0; i < path.length - 1; i++) {
    const [x0, y0, z0] = path[i];
    const [x1, y1, z1] = path[i + 1];
    const len = Math.hypot(x1 - x0, y1 - y0, z1 - z0);
    const run = new Mesh(new BoxGeometry(len, 0.01, 0.024), stairMat);
    run.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    run.rotation.y = Math.atan2(-(z1 - z0), x1 - x0);
    run.rotation.z = Math.asin((y1 - y0) / len);
    g.add(run);
  }

  // ---- pines on the shelves and along the valley floor ----
  for (const [x, y, z, h, dark] of [
    [-0.28, 0.29, 0.09, 0.09, false],
    [-0.105, 0.335, 0.11, 0.075, true],
    [0.03, 0.435, 0.1, 0.07, false],
    [0.165, 0.42, 0.08, 0.065, true],
    [0.275, 0.35, 0.06, 0.06, false],
    [-0.23, 0.13, 0.19, 0.13, true],
    [-0.05, 0.14, 0.23, 0.15, false],
    [0.13, 0.13, 0.21, 0.12, true],
    [0.28, 0.1, 0.16, 0.1, false],
    [-0.33, 0.05, 0.1, 0.09, true],
    [0.33, 0.05, 0.06, 0.085, false],
  ] as const)
    g.add(pine(x, y, z, h, dark));

  return g;
}
