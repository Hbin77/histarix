// Sri Siva Subramaniya (Nadi) — papercraft: Dravidian gopuram. Eight
// diminishing tiers, each banded in a different muted colour and crowned by a
// pale cornice carrying a row of tiny sculpted figures, topped by a barrel
// shala ridge with kalasha finials, over a low walled courtyard.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;

const CORNICE = "#e3dac7"; // pale plaster string course
const PLINTH = "#d6c9b2";
const COURT = "#dcd3c0";
const FIG_A = TONES.gold;
const FIG_B = "#a5605a";

/** Muted band cycle: red, teal, ochre, rose, soft indigo. */
const BANDS = [
  "#b06a5e",
  "#5b8f8a",
  "#c2a165",
  "#bb8f95",
  "#7f8cb0",
  "#b06a5e",
  "#5b8f8a",
  "#c2a165",
];

const TIERS = 8;
const TIER_H = 0.08; // wall 0.062 + cornice 0.018
const WALL_H = 0.062;
const CORN_H = 0.018;
const Y0 = 0.163; // first tier springs from the plinth cornice
const HX0 = 0.155;
const HZ0 = 0.115;
const HX1 = 0.063;
const HZ1 = 0.046;

const hxAt = (i: number) => HX0 + ((HX1 - HX0) * i) / TIERS;
const hzAt = (i: number) => HZ0 + ((HZ1 - HZ0) * i) / TIERS;

/** Battered rectangular tier wall: half-extents (hx, hz) at the base,
 *  tapering to (tx, tz) at height h. Mesh base sits at y = 0. */
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
    const s = y > 0.5 ? 1 : 0; // upper ring
    pos.setX(i, pos.getX(i) * (s ? tx : hx));
    pos.setZ(i, pos.getZ(i) * (s ? tz : hz));
    pos.setY(i, y * h);
  }
  geo.computeVertexNormals();
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

/** Tiny pastel shrine: stepped cube under a small ribbed dome. */
function shrine(color: string, cap: string): Group {
  const g = new Group();
  g.add(box(0.062, 0.058, 0.062, 0, 0.029, 0, color));
  g.add(box(0.076, 0.014, 0.076, 0, 0.065, 0, CORNICE));
  g.add(box(0.046, 0.026, 0.046, 0, 0.085, 0, cap));
  const dome = new Mesh(new ConeGeometry(0.032, 0.042, 6), mat(CORNICE));
  dome.position.y = 0.119;
  g.add(dome);
  const tip = new Mesh(new ConeGeometry(0.008, 0.022, 5), mat(TONES.gold));
  tip.position.y = 0.151;
  g.add(tip);
  return g;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.372));

  // ---- low walled courtyard ----
  g.add(box(0.58, 0.045, 0.46, 0, 0.0225, 0, COURT));
  const wall = (w: number, d: number, x: number, z: number, color: string) =>
    g.add(box(w, 0.05, d, x, 0.07, z, color));
  wall(0.58, 0.022, 0, -0.219, "#c6b9a2"); // rear
  wall(0.022, 0.46, -0.279, 0, "#c6b9a2");
  wall(0.022, 0.46, 0.279, 0, "#c6b9a2");
  wall(0.17, 0.022, -0.205, 0.219, "#c6b9a2"); // front, split for the gate
  wall(0.17, 0.022, 0.205, 0.219, "#c6b9a2");

  // corner shrines
  const shrines: Array<[number, number, string, string]> = [
    [-0.225, -0.16, "#bb8f95", "#5b8f8a"],
    [0.225, -0.16, "#5b8f8a", "#c2a165"],
    [-0.225, 0.155, "#c2a165", "#b06a5e"],
    [0.225, 0.155, "#b06a5e", "#7f8cb0"],
  ];
  for (const [x, z, body, cap] of shrines) {
    const s = shrine(body, cap);
    s.position.set(x, 0.045, z);
    g.add(s);
  }

  // ---- entrance mandapam: banded columns under a painted lintel ----
  const colGeo = new CylinderGeometry(0.014, 0.016, 0.1, 6);
  const colColors = ["#b06a5e", "#5b8f8a", "#c2a165", "#5b8f8a", "#b06a5e"];
  colColors.forEach((c, i) => {
    const col = new Mesh(colGeo, mat(c));
    col.position.set(-0.11 + i * 0.055, 0.095, 0.178);
    g.add(col);
  });
  g.add(box(0.3, 0.02, 0.06, 0, 0.155, 0.178, "#bb8f95"));
  g.add(box(0.32, 0.014, 0.074, 0, 0.172, 0.178, CORNICE));

  // ---- gopuram plinth with its dark gateway ----
  g.add(box(0.34, 0.1, 0.26, 0, 0.095, 0, PLINTH));
  g.add(box(0.366, 0.018, 0.284, 0, 0.154, 0, CORNICE));
  g.add(box(0.088, 0.078, 0.006, 0, 0.084, 0.131, TONES.ink)); // gateway
  for (const sx of [1, -1])
    g.add(box(0.018, 0.1, 0.008, sx * 0.062, 0.095, 0.13, "#b06a5e"));

  // ---- the eight tiers ----
  for (let i = 0; i < TIERS; i++) {
    const yb = Y0 + i * TIER_H;
    const hx = hxAt(i);
    const hz = hzAt(i);
    const tx = hxAt(i + 1);
    const tz = hzAt(i + 1);

    const wallMesh = frustum(hx, hz, tx, tz, WALL_H, BANDS[i]);
    wallMesh.position.y = yb;
    g.add(wallMesh);

    // projecting cornice
    const cx = tx * 1.2;
    const cz = tz * 1.2;
    g.add(box(cx * 2, CORN_H, cz * 2, 0, yb + WALL_H + CORN_H / 2, 0, CORNICE));
    const top = yb + WALL_H + CORN_H;

    // corner mini-shrines (karna kuta) on the three lowest tiers
    const corners = i < 3;
    if (corners) {
      for (const sx of [1, -1])
        for (const sz of [1, -1]) {
          g.add(
            box(0.03, 0.03, 0.03, sx * (cx - 0.017), top + 0.015, sz * (cz - 0.017), BANDS[(i + 2) % BANDS.length])
          );
          const cone = new Mesh(new ConeGeometry(0.022, 0.026, 4), mat(CORNICE));
          cone.position.set(sx * (cx - 0.017), top + 0.043, sz * (cz - 0.017));
          cone.rotation.y = Math.PI / 4;
          g.add(cone);
        }
    }

    // row of tiny sculpted figures along the front and back cornices
    const n = i < 3 ? 5 : i < 6 ? 4 : 3;
    const span = cx - (corners ? 0.05 : 0.024);
    for (let k = 0; k < n; k++) {
      const x = -span + (2 * span * k) / (n - 1);
      for (const sz of [1, -1])
        g.add(
          box(0.017, 0.026, 0.015, x, top + 0.013, sz * (cz - 0.009), k % 2 ? FIG_B : FIG_A)
        );
    }
  }

  // ---- barrel shala ridge with arched end faces ----
  const TOP = Y0 + TIERS * TIER_H; // 0.803
  g.add(box(0.17, 0.014, 0.096, 0, TOP + 0.007, 0, CORNICE)); // ridge seat
  const barrel = new Mesh(new CylinderGeometry(0.036, 0.036, 0.152, 12), mat("#b06a5e"));
  barrel.rotation.z = Math.PI / 2;
  barrel.position.y = TOP + 0.022;
  g.add(barrel);
  for (const sx of [1, -1]) {
    const face = new Mesh(new CylinderGeometry(0.041, 0.041, 0.014, 12), mat(CORNICE));
    face.rotation.z = Math.PI / 2;
    face.position.set(sx * 0.08, TOP + 0.022, 0);
    g.add(face);
    const eye = new Mesh(new CylinderGeometry(0.013, 0.013, 0.008, 6), mat(TONES.gold));
    eye.rotation.z = Math.PI / 2;
    eye.position.set(sx * 0.088, TOP + 0.026, 0);
    g.add(eye);
  }

  // kalasha finials in a row along the ridge
  for (let k = 0; k < 5; k++) {
    const x = -0.058 + k * 0.029;
    g.add(box(0.016, 0.014, 0.016, x, TOP + 0.062, 0, CORNICE));
    const pot = new Mesh(new ConeGeometry(0.013, 0.024, 6), mat(TONES.gold));
    pot.position.set(x, TOP + 0.081, 0);
    g.add(pot);
    const spike = new Mesh(new ConeGeometry(0.0045, 0.022, 5), mat(TONES.gold));
    spike.position.set(x, TOP + 0.104, 0);
    g.add(spike);
  }

  return g;
}
