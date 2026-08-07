// Copán — papercraft: the low broad stepped pyramid of Temple 26 with the
// Hieroglyphic Stairway running the full width of its face, a small temple
// and roof comb on the summit, and a tall carved stela out in the plaza.
// Mossy gray-green limestone with pale sage stair blocks.

import { BoxGeometry, CylinderGeometry, Group, Mesh } from "three";
import { mat, plazaDisc } from "./materials";

const STONE = "#8e977f"; // mossy gray-green limestone
const STONE_DK = "#7c8670";
const SAGE = "#c2c4ad"; // pale sage stair blocks
const SAGE_DK = "#adb098";
const MOSS = "#6f8159";
const GLYPH = "#7e8669"; // carved glyph recess
const DOOR = "#464b3d";

const TIERS = 5;
const PYR_H = 0.28; // summit platform height
const TIER_H = PYR_H / TIERS;
const BASE_HX = 0.25;
const BASE_HZ = 0.2;
const TOP_HX = 0.12;
const TOP_HZ = 0.095;

const STAIR_HX = 0.1; // stairway half width
const STAIR_Z0 = 0.24; // bottom step, out in the plaza
const STAIR_Z1 = 0.095; // meets the summit platform edge
const STEPS = 18;

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
  g.add(plazaDisc(0.375));
  // The stela pushes the composition forward; recentre it on the plaza.
  const site = new Group();
  site.position.z = -0.075;
  g.add(site);

  // ---- stepped pyramid: five broad receding courses ----
  for (let i = 0; i < TIERS; i++) {
    const t = i / (TIERS - 1);
    const hx = BASE_HX + (TOP_HX - BASE_HX) * t;
    const hz = BASE_HZ + (TOP_HZ - BASE_HZ) * t;
    site.add(
      box(hx * 2, TIER_H, hz * 2, 0, i * TIER_H + TIER_H / 2, 0, i % 2 ? STONE_DK : STONE)
    );
    site.add(
      box(hx * 2 + 0.016, 0.011, hz * 2 + 0.016, 0, (i + 1) * TIER_H - 0.0055, 0, STONE_DK)
    );
  }

  // moss creeping along the courses
  for (const [x, y, z, w] of [
    [-0.185, 0.042, 0.203, 0.095],
    [0.205, 0.098, 0.178, 0.072],
    [-0.232, 0.098, -0.07, 0.062],
    [0.172, 0.154, -0.162, 0.08],
  ] as const) {
    site.add(box(w, 0.016, 0.022, x, y, z, MOSS));
  }

  // ---- Hieroglyphic Stairway: one wide flight up the whole face ----
  const stepH = PYR_H / STEPS;
  const stepD = (STAIR_Z0 - STAIR_Z1) / STEPS;
  for (let j = 0; j < STEPS; j++) {
    const zFront = STAIR_Z0 - j * stepD;
    site.add(
      box(
        STAIR_HX * 2,
        stepH,
        zFront - 0.09,
        0,
        j * stepH + stepH / 2,
        (zFront + 0.09) / 2,
        j % 2 ? SAGE : SAGE_DK
      )
    );
    // carved glyph blocks across every other riser
    if (j % 2 === 0) {
      for (const gx of [-0.06, 0, 0.06]) {
        site.add(
          box(0.038, 0.011, 0.007, gx, j * stepH + stepH * 0.52, zFront + 0.002, GLYPH)
        );
      }
    }
  }

  // ---- sloped balustrades flanking the flight ----
  const len = Math.hypot(PYR_H, STAIR_Z0 - STAIR_Z1);
  for (const sx of [1, -1]) {
    const b = box(
      0.03,
      0.04,
      len + 0.02,
      sx * 0.115,
      PYR_H / 2 + 0.022,
      (STAIR_Z0 + STAIR_Z1) / 2,
      STONE_DK
    );
    b.rotation.x = Math.atan2(PYR_H, STAIR_Z0 - STAIR_Z1);
    site.add(b);
  }

  // ---- summit temple with roof comb ----
  site.add(box(0.228, 0.016, 0.172, 0, PYR_H + 0.008, 0, STONE_DK));
  site.add(box(0.194, 0.076, 0.138, 0, PYR_H + 0.054, 0, STONE));
  site.add(box(0.054, 0.054, 0.012, 0, PYR_H + 0.043, 0.069, DOOR));
  site.add(box(0.216, 0.017, 0.16, 0, PYR_H + 0.1, 0, STONE_DK));
  site.add(box(0.155, 0.05, 0.024, 0, PYR_H + 0.133, -0.014, STONE));
  site.add(box(0.166, 0.013, 0.032, 0, PYR_H + 0.164, -0.014, STONE_DK));

  // ---- carved stela standing in the plaza, with its altar ----
  const stela = new Group();
  stela.position.set(-0.245, 0, 0.255);
  stela.rotation.y = 0.45;
  site.add(stela);
  stela.add(box(0.1, 0.024, 0.086, 0, 0.012, 0, STONE_DK));
  stela.add(box(0.062, 0.175, 0.054, 0, 0.112, 0, STONE));
  for (const y of [0.06, 0.112, 0.164])
    stela.add(box(0.07, 0.013, 0.062, 0, y, 0, GLYPH));
  stela.add(box(0.072, 0.042, 0.064, 0, 0.221, 0, STONE_DK));
  stela.add(box(0.08, 0.014, 0.072, 0, 0.249, 0, STONE));
  const altar = new Mesh(new CylinderGeometry(0.05, 0.054, 0.03, 10), mat(STONE_DK));
  altar.position.set(0, 0.015, 0.1);
  stela.add(altar);

  return g;
}
