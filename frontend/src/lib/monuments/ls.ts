// Thaba Bosiu — papercraft landform: the flat-topped sandstone mesa of
// Moshoeshoe's mountain fortress. A continuous ochre cliff band rings the
// rim, dusty sage talus falls away below it, and the Khubelu pass climbs
// the front face to the grassy tabletop and its handful of huts.
// Natural landform: its own terrain base, no plaza disc.

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

const SAGE = "#93a07a"; // dusty sage-green slope
const SAGE_DK = "#7f8d68";
const SAGE_LT = "#a5b08c";
// close-toned courses so the talus facets read as a slope, not terraces
const SLOPE = ["#7f8d68", "#879470", "#8e9b79", "#96a281", "#9ead89"];
const OCHRE = "#c39f6e"; // muted ochre-tan cliff
const OCHRE_DK = "#a9855a";
const OCHRE_LT = "#d5b489";
const TABLE = "#adb083"; // dry plateau grass
const PATH = "#c8b892";
const HUT = "#b99e7c";
const THATCH = "#8b7853";

const TALUS_TOP = 0.22;
const CLIFF_TOP = 0.372;

/** Mesa plan: a lobed outline so the rim never reads as a turned cylinder. */
const planR = (a: number, scale: number) =>
  0.335 * scale * (1 + 0.085 * Math.sin(3 * a + 0.4) + 0.045 * Math.sin(5 * a + 2.1));

function plan(scale: number): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const r = planR(a, scale);
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return pts;
}

/** Talus surface: the skirt narrows from scale 1.0 at the foot to 0.858. */
const talusScale = (y: number) =>
  1.0 - 0.142 * Math.min(Math.max((y - 0.018) / (TALUS_TOP - 0.018), 0), 1);

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

function scrub(r: number, x: number, y: number, z: number, color: string): Mesh {
  const m = new Mesh(new SphereGeometry(r, 6, 4), mat(color));
  m.position.set(x, y, z);
  m.scale.set(1.1, 0.6, 1);
  return m;
}

export function build(): Group {
  const g = new Group();

  // ---- dry veld floor ----
  const floor = new Mesh(new CylinderGeometry(0.36, 0.375, 0.028, 30), mat(SAGE_DK));
  floor.position.y = 0.014;
  g.add(floor);

  // ---- gentle grassy talus, faceted in five shallow courses ----
  const scales = [1.0, 0.958, 0.921, 0.888, 0.858];
  for (let i = 0; i < 5; i++) {
    const y0 = 0.018 + i * 0.041;
    g.add(prism(plan(scales[i]), y0, y0 + 0.045, SLOPE[i]));
  }

  // ---- the sandstone cliff band ringing the rim ----
  g.add(prism(plan(0.84), TALUS_TOP - 0.006, CLIFF_TOP, OCHRE));
  g.add(prism(plan(0.845), TALUS_TOP - 0.006, 0.268, OCHRE_DK)); // shadowed foot
  g.add(prism(plan(0.848), 0.306, 0.326, OCHRE_LT)); // sunlit strata course
  g.add(prism(plan(0.852), CLIFF_TOP, CLIFF_TOP + 0.024, OCHRE_LT)); // rim lip

  // ---- grassy tabletop ----
  g.add(prism(plan(0.815), CLIFF_TOP + 0.014, CLIFF_TOP + 0.038, TABLE));

  // ---- the Khubelu pass: one worn ramp up the talus into a cliff gully ----
  const zFoot = planR(Math.PI / 2, talusScale(0.03)) - 0.012;
  const zHead = planR(Math.PI / 2, talusScale(TALUS_TOP)) - 0.02;
  const rise = TALUS_TOP - 0.03;
  const ramp = new Mesh(
    new BoxGeometry(0.055, 0.014, Math.hypot(rise, zFoot - zHead) + 0.03),
    mat(PATH)
  );
  ramp.position.set(0, (0.03 + TALUS_TOP) / 2, (zFoot + zHead) / 2);
  ramp.rotation.x = Math.atan2(rise, zFoot - zHead);
  g.add(ramp);
  const gully = new Mesh(new BoxGeometry(0.05, 0.155, 0.03), mat(PATH));
  gully.position.set(0, 0.288, planR(Math.PI / 2, 0.84) - 0.008);
  g.add(gully);

  // ---- huts of the old fortress village on the tabletop ----
  for (const [x, z, r] of [
    [-0.09, -0.05, 0.036],
    [0.02, -0.13, 0.031],
    [0.09, 0.02, 0.033],
  ] as const) {
    const wall = new Mesh(new CylinderGeometry(r, r, 0.032, 8), mat(HUT));
    wall.position.set(x, CLIFF_TOP + 0.054, z);
    g.add(wall);
    const roof = new Mesh(new ConeGeometry(r * 1.34, 0.034, 8), mat(THATCH));
    roof.position.set(x, CLIFF_TOP + 0.087, z);
    g.add(roof);
  }

  // ---- scrub on the talus and boulders at the cliff foot ----
  for (let i = 0; i < 9; i++) {
    const a = i * 0.72 + 0.5;
    const y = 0.03 + ((i * 3) % 5) * 0.042;
    const s = 0.032 + ((i * 5) % 3) * 0.01;
    const r = planR(a, talusScale(y)) - 0.02;
    g.add(scrub(s, Math.cos(a) * r, y + s * 0.3, Math.sin(a) * r, i % 2 ? SAGE_DK : SAGE));
  }
  for (const [deg, s] of [
    [25, 0.05],
    [115, 0.042],
    [200, 0.046],
    [300, 0.038],
  ] as const) {
    const a = (deg * Math.PI) / 180;
    const r = planR(a, talusScale(TALUS_TOP)) - 0.015;
    const b = new Mesh(new BoxGeometry(s, s * 0.72, s), mat(OCHRE_DK));
    b.position.set(Math.cos(a) * r, TALUS_TOP - 0.01, Math.sin(a) * r);
    b.rotation.y = a;
    g.add(b);
  }

  return g;
}
