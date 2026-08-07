// The Sudd (South Sudan) — papercraft: a broad low floodplain pan where
// lobes of green papyrus marsh crowd against each other, leaving a winding
// maze of blue-gray channels, with tufted papyrus stems standing on the mats.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const SILT = "#a89b80"; // cut bank of the floodplain
const WATER_DEEP = "#7ba0c2";
const GLINT = "#a9c6dd";
const MARSH = "#7d9a63";
const MARSH_DARK = "#6a8757";
const SEDGE = "#94a86e";
const STEM = "#8a9b62";
const UMBEL = "#96a86a";

const PAN_R = 0.335; // radius of the water surface
const WATER_Y = 0.118; // top of the water
const MAT_H = 0.036; // thickness of a papyrus mat

/** Organic marsh lobe: a wobbly closed outline extruded into a flat mat. */
function lobe(
  cx: number,
  cz: number,
  r: number,
  phase: number,
  color: string
): Mesh {
  const s = new Shape();
  const N = 16;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const w =
      1 +
      0.2 * Math.sin(3 * a + phase) +
      0.13 * Math.sin(5 * a + phase * 1.7) +
      0.08 * Math.sin(7 * a + phase * 2.9);
    // Shape y maps to world -z once the mat is laid flat, so the centre is
    // pre-negated; only the wobble ends up mirrored, which does not matter.
    const px = cx + Math.cos(a) * r * w;
    const pz = -cz + Math.sin(a) * r * w;
    if (i === 0) s.moveTo(px, pz);
    else s.lineTo(px, pz);
  }
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: MAT_H, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, WATER_Y, 0);
  return new Mesh(geo, mat(color));
}

/** Clump of papyrus: thin stems, each crowned with a soft umbel head. */
function papyrus(cx: number, cz: number, n: number, phase: number): Group {
  const g = new Group();
  g.position.set(cx, WATER_Y + MAT_H, cz);
  for (let i = 0; i < n; i++) {
    const a = phase + (i * Math.PI * 2) / n;
    const rad = 0.014 + 0.012 * ((i * 7) % 5) / 4;
    const h = 0.07 + 0.045 * ((i * 3) % 4) / 3;
    const x = Math.cos(a) * rad;
    const z = Math.sin(a) * rad;
    const stem = new Mesh(
      new CylinderGeometry(0.004, 0.0065, h, 5, 1, true),
      mat(STEM)
    );
    stem.position.set(x, h / 2, z);
    stem.rotation.z = Math.cos(a) * 0.14;
    stem.rotation.x = -Math.sin(a) * 0.14;
    g.add(stem);
    const head = new Mesh(new SphereGeometry(0.012, 5, 3), mat(UMBEL));
    head.scale.y = 0.72;
    head.position.set(x * 1.35, h + 0.004, z * 1.35);
    g.add(head);
  }
  return g;
}

export function build(): Group {
  const g = new Group();

  // ---- floodplain pan: broad silt shelf with the water surface on top ----
  g.add(
    new Mesh(
      new LatheGeometry(
        [
          new Vector2(0.375, 0),
          new Vector2(0.371, 0.032),
          new Vector2(0.36, 0.068),
          new Vector2(0.348, 0.098),
          new Vector2(0.34, 0.114),
          new Vector2(0.0001, 0.116),
        ],
        24
      ),
      mat(SILT)
    )
  );
  const water = new Mesh(
    new CylinderGeometry(PAN_R, PAN_R, 0.012, 24),
    mat(WATER_DEEP)
  );
  water.position.y = WATER_Y - 0.006;
  g.add(water);

  // sunlit streaks on the open water, before the mats go down
  for (const [x, z, w, d, ry] of [
    [-0.02, -0.02, 0.16, 0.04, 0.6],
    [0.13, 0.19, 0.12, 0.035, -0.5],
    [-0.2, 0.12, 0.1, 0.03, 1.2],
    [0.06, -0.25, 0.11, 0.032, 0.2],
  ] as const) {
    const streak = new Mesh(new BoxGeometry(w, 0.005, d), mat(GLINT));
    streak.position.set(x, WATER_Y - 0.002, z);
    streak.rotation.y = ry;
    g.add(streak);
  }

  // ---- papyrus mats: lobes crowding in, channels left in the gaps ----
  for (const [cx, cz, r, phase, color] of [
    [-0.14, -0.108, 0.142, 0.4, MARSH],
    [0.152, -0.055, 0.122, 2.1, MARSH_DARK],
    [-0.05, 0.178, 0.132, 3.4, MARSH],
    [0.222, 0.172, 0.086, 1.2, SEDGE],
    [-0.255, 0.055, 0.085, 5.0, MARSH_DARK],
    [0.04, -0.244, 0.078, 2.7, SEDGE],
    [-0.205, -0.245, 0.075, 0.9, MARSH],
    [0.275, -0.145, 0.07, 4.2, MARSH_DARK],
    [-0.268, 0.203, 0.056, 1.8, MARSH],
  ] as const)
    g.add(lobe(cx, cz, r, phase, color));

  // paler sedge fringes sitting proud on the bigger mats
  for (const [cx, cz, r, phase] of [
    [-0.16, -0.13, 0.075, 2.3],
    [0.16, -0.075, 0.06, 4.4],
    [-0.03, 0.185, 0.065, 0.8],
  ] as const) {
    const fringe = lobe(cx, cz, r, phase, SEDGE);
    fringe.position.y = MAT_H * 0.6;
    g.add(fringe);
  }

  // ---- papyrus clumps dotted across the mats ----
  for (const [cx, cz, n, phase] of [
    [-0.16, -0.09, 4, 0.3],
    [-0.08, -0.16, 3, 1.4],
    [0.15, -0.05, 4, 2.2],
    [-0.06, 0.18, 4, 3.1],
    [0.01, 0.13, 3, 1.9],
    [0.22, 0.17, 3, 2.6],
    [-0.25, 0.05, 3, 4.1],
    [0.04, -0.245, 3, 0.5],
    [-0.2, -0.24, 3, 5.2],
  ] as const)
    g.add(papyrus(cx, cz, n, phase));

  // ---- driftwood and silt bars caught in the channels ----
  for (const [x, z, w, ry] of [
    [0.06, 0.045, 0.07, 0.9],
    [-0.135, 0.055, 0.055, -0.4],
    [0.115, -0.195, 0.05, 1.6],
  ] as const) {
    const bar = new Mesh(new BoxGeometry(w, 0.014, 0.028), mat(TONES.sandDark));
    bar.position.set(x, WATER_Y + 0.005, z);
    bar.rotation.y = ry;
    g.add(bar);
  }

  return g;
}
