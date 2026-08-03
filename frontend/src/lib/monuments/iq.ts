// Ziggurat of Ur — papercraft miniature. Three receding battered mudbrick
// tiers, monumental central staircase projecting forward, two lateral
// staircases hugging the facade, all converging at the first terrace, then a
// single flight continuing to the second terrace. Sand/brick tones.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;
const GROUND = "#cfb98e"; // muted desert sand apron
const PILASTER = "#b98a68"; // buttress strips, a shade under brick
const RAIL = "#ad7a58"; // sloped stair parapet walls
const TIER2 = "#c79d76"; // weathered mudbrick, slightly lighter than brick
const TIER3 = "#cfb287"; // pale sun-baked upper core

/** Rectangular battered frustum: base half-extents (hx, hz), height h,
 *  taper ratio t. Base sits at y = 0 of the mesh. */
function tier(hx: number, hz: number, h: number, t: number, color: string): Mesh {
  const geo = new CylinderGeometry(t * SQ2, SQ2, 1, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, 0.5, 0);
  const m = new Mesh(geo, mat(color));
  m.scale.set(hx, h, hz);
  return m;
}

function box(
  w: number, h: number, d: number,
  x: number, y: number, z: number,
  color: string
): Mesh {
  const m = new Mesh(new BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z);
  return m;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  // desert sand apron
  const apron = new Mesh(new CylinderGeometry(0.325, 0.335, 0.014, 28), mat(GROUND));
  apron.position.y = 0.012;
  g.add(apron);

  // ---- three receding tiers (base at y=0; batter via taper) ----
  // tier 1: 0.54 x 0.38 base, h 0.20, top half-extents 0.2376 x 0.1672
  const T1H = 0.2;
  g.add(tier(0.27, 0.19, T1H, 0.88, TONES.brick));
  // tier 2 & 3 sit back from the front so the terrace + upper stair read
  const T2H = 0.11;
  const t2 = tier(0.19, 0.12, T2H, 0.85, TIER2);
  t2.position.set(0, T1H, -0.05);
  g.add(t2);
  const T3H = 0.09;
  const t3 = tier(0.12, 0.078, T3H, 0.84, TIER3);
  t3.position.set(0, T1H + T2H, -0.05);
  g.add(t3);

  // dark portal doorway at the head of the upper flight (tier-3 front face)
  g.add(box(0.045, 0.055, 0.012, 0, T1H + T2H + 0.03, -0.05 + 0.076, TONES.ironDark));

  // ---- buttress pilaster strips on tier-1 walls ----
  const batterZ = Math.atan((0.19 - 0.1672) / T1H); // front/rear lean
  const batterX = Math.atan((0.27 - 0.2376) / T1H); // side lean
  const BH = 0.185;
  const addButtress = (
    x: number, z: number, rx: number, rz: number, alongX: boolean
  ) => {
    const b = new Mesh(
      alongX
        ? new BoxGeometry(0.032, BH, 0.014)
        : new BoxGeometry(0.014, BH, 0.032),
      mat(PILASTER)
    );
    b.position.set(x, BH / 2, z);
    b.rotation.x = rx;
    b.rotation.z = rz;
    g.add(b);
  };
  // front (+Z): visible in the wedge above the lateral stairs
  for (const x of [-0.225, -0.17, -0.115, 0.115, 0.17, 0.225])
    addButtress(x, 0.183, -batterZ, 0, true);
  // rear (−Z)
  for (const x of [-0.19, -0.065, 0.065, 0.19])
    addButtress(x, -0.183, batterZ, 0, true);
  // sides (±X)
  for (const z of [-0.11, 0, 0.11]) {
    addButtress(0.258, z, 0, batterX, false);
    addButtress(-0.258, z, 0, -batterX, false);
  }

  // ---- monumental central stair: solid steps projecting on +Z ----
  const STEPS1 = 8;
  const stepH = T1H / STEPS1; // 0.025
  const Z_FOOT = 0.345; // stair foot (outer edge)
  const Z_HEAD = 0.167; // meets tier-1 top front edge
  const run1 = (Z_FOOT - Z_HEAD) / STEPS1;
  for (let i = 0; i < STEPS1; i++) {
    g.add(
      box(
        0.095, (i + 1) * stepH, run1 + 0.004,
        0, ((i + 1) * stepH) / 2, Z_FOOT - (i + 0.5) * run1,
        TONES.sand
      )
    );
  }
  // flanking parapet walls riding the central flight: smooth sloped rails
  const slope1 = Math.atan2(T1H, Z_FOOT - Z_HEAD);
  for (const sx of [1, -1]) {
    const rail = new Mesh(new BoxGeometry(0.02, 0.036, 0.285), mat(RAIL));
    rail.position.set(sx * 0.0575, T1H / 2 + 0.022, (Z_FOOT + Z_HEAD) / 2);
    rail.rotation.x = slope1;
    g.add(rail);
    // squared foot block anchoring each rail at ground level
    g.add(box(0.026, 0.05, 0.036, sx * 0.0575, 0.025, 0.346, RAIL));
  }

  // ---- two lateral stairs hugging the facade, converging inward ----
  const X_FOOT = 0.245; // outer foot
  const run2 = (X_FOOT - 0.075) / STEPS1;
  for (const sx of [1, -1]) {
    for (let i = 0; i < STEPS1; i++) {
      g.add(
        box(
          run2 + 0.004, (i + 1) * stepH, 0.05,
          sx * (X_FOOT - (i + 0.5) * run2), ((i + 1) * stepH) / 2, 0.185,
          TONES.sand
        )
      );
    }
    // smooth sloped outer parapet along each lateral flight
    const slope2 = Math.atan2(T1H, X_FOOT - 0.075);
    const rail = new Mesh(new BoxGeometry(0.285, 0.034, 0.016), mat(RAIL));
    rail.position.set(sx * (X_FOOT + 0.075) / 2, T1H / 2 + 0.02, 0.214);
    rail.rotation.z = -sx * slope2;
    g.add(rail);
    // squared foot block at each lateral stair foot
    g.add(box(0.03, 0.048, 0.02, sx * 0.252, 0.024, 0.214, RAIL));
  }

  // ---- solid gatehouse where the three flights converge ----
  g.add(box(0.14, 0.075, 0.048, 0, T1H + 0.0375, 0.16, TONES.brick));
  // dark portal centered on the stair axis (echoed by the tier-3 doorway)
  g.add(box(0.042, 0.052, 0.012, 0, T1H + 0.026, 0.182, TONES.ironDark));

  // ---- single upper flight: first terrace -> tier-2 top ----
  const STEPS2 = 5;
  const stepH2 = T2H / STEPS2;
  const Z2_FOOT = 0.145;
  const Z2_HEAD = 0.052; // tier-2 top front edge (center z −0.05 + 0.102)
  const run3 = (Z2_FOOT - Z2_HEAD) / STEPS2;
  for (let i = 0; i < STEPS2; i++) {
    g.add(
      box(
        0.07, (i + 1) * stepH2, run3 + 0.004,
        0, T1H + ((i + 1) * stepH2) / 2, Z2_FOOT - (i + 0.5) * run3,
        TONES.sand
      )
    );
  }

  // ---- terrace-edge parapet on tier-1 top front (broken at the stair) ----
  for (const sx of [1, -1])
    g.add(box(0.155, 0.02, 0.014, sx * 0.152, T1H + 0.01, 0.158, TONES.brickDark));

  return g;
}
