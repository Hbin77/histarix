// Chichén Itzá (El Castillo) — papercraft: 9-tier square stepped pyramid
// (talud-style frustums with inset ledges), four grand projecting staircases
// with serpent-head balustrades, small flat-roofed temple on the summit.

import { BoxGeometry, CylinderGeometry, Group, Mesh } from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;

export function build(): Group {
  const g = new Group();
  const stone = mat(TONES.stone);
  const stoneDark = mat(TONES.stoneDark);
  const doorway = mat("#6f6250");
  const frieze = mat(TONES.sandDark);
  const lip = mat("#c9bda6"); // soft shadow line under each terrace edge

  g.add(plazaDisc(0.37));

  // ---- 9 stepped tiers ----
  const TIERS = 9;
  const TIER_H = 0.03;
  const BASE_HALF = 0.26;
  const TAPER = 0.005; // slight talud lean within one tier
  const LEDGE = 0.016; // strong inset step between tiers
  const TOP_Y = TIERS * TIER_H; // 0.27 summit platform
  for (let i = 0; i < TIERS; i++) {
    const b = BASE_HALF - i * (TAPER + LEDGE);
    const tier = new Mesh(
      new CylinderGeometry((b - TAPER) * SQ2, b * SQ2, TIER_H, 4, 1),
      stone
    );
    tier.rotation.y = Math.PI / 4;
    tier.position.y = i * TIER_H + TIER_H / 2;
    g.add(tier);

    // thin darker lip at the tier foot so every terrace edge reads
    const trim = new Mesh(
      new CylinderGeometry((b + 0.001) * SQ2, (b + 0.001) * SQ2, 0.008, 4, 1),
      lip
    );
    trim.rotation.y = Math.PI / 4;
    trim.position.y = i * TIER_H + 0.004;
    g.add(trim);
  }
  const TOP_HALF = BASE_HALF - (TIERS - 1) * (TAPER + LEDGE) - TAPER; // 0.079

  // ---- Four grand staircases (proud of the tier faces) ----
  const BOT_Z = 0.288; // stair foot, just beyond the base edge
  const rise = TOP_Y;
  const run = BOT_Z - TOP_HALF;
  const tilt = Math.atan2(rise, run);
  const len = Math.hypot(rise, run);
  const ny = run / len; // up-normal of the ramp surface
  const nz = rise / len;
  const MID_Y = rise / 2 + 0.009;
  const MID_Z = (BOT_Z + TOP_HALF) / 2;

  const rampGeo = new BoxGeometry(0.1, 0.026, len);
  const stepGeo = new BoxGeometry(0.102, 0.005, 0.011);
  const balGeo = new BoxGeometry(0.02, 0.03, len * 0.84);
  const headGeo = new BoxGeometry(0.034, 0.03, 0.055);
  const snoutGeo = new BoxGeometry(0.026, 0.016, 0.02);

  for (let k = 0; k < 4; k++) {
    const stair = new Group();
    stair.rotation.y = (k * Math.PI) / 2;

    const ramp = new Mesh(rampGeo, stoneDark);
    ramp.rotation.x = tilt;
    ramp.position.set(0, MID_Y, MID_Z);
    stair.add(ramp);

    // thin cross-ridges suggesting the steps
    for (let s = 0; s < 8; s++) {
      const t = 0.09 + s * 0.114;
      const step = new Mesh(stepGeo, stone);
      step.rotation.x = tilt;
      step.position.set(
        0,
        rise * (1 - t) + 0.009 + ny * 0.014,
        TOP_HALF + t * run + nz * 0.014
      );
      stair.add(step);
    }

    // balustrades (ending flush at the platform) + serpent heads at the foot
    for (const sx of [1, -1]) {
      const bal = new Mesh(balGeo, stoneDark);
      bal.rotation.x = tilt;
      bal.position.set(
        sx * 0.061,
        MID_Y + ny * 0.02 - rise * 0.08,
        MID_Z + nz * 0.02 + run * 0.08
      );
      stair.add(bal);

      const head = new Mesh(headGeo, stoneDark);
      head.position.set(sx * 0.061, 0.027, 0.315);
      stair.add(head);
      const snout = new Mesh(snoutGeo, stone);
      snout.position.set(sx * 0.061, 0.02, 0.348);
      stair.add(snout);
    }
    g.add(stair);
  }

  // ---- Summit temple ----
  const talud = new Mesh(
    new CylinderGeometry(0.068 * SQ2, 0.076 * SQ2, 0.016, 4, 1),
    stone
  );
  talud.rotation.y = Math.PI / 4;
  talud.position.y = TOP_Y + 0.008;
  g.add(talud);

  const wall = new Mesh(new BoxGeometry(0.134, 0.084, 0.134), stone);
  wall.position.y = TOP_Y + 0.016 + 0.042;
  g.add(wall);

  // doorways piercing through both axes (reads on all four faces)
  const doorA = new Mesh(new BoxGeometry(0.05, 0.058, 0.138), doorway);
  doorA.position.y = TOP_Y + 0.048;
  g.add(doorA);
  const doorB = new Mesh(new BoxGeometry(0.138, 0.058, 0.05), doorway);
  doorB.position.y = TOP_Y + 0.048;
  g.add(doorB);

  const band = new Mesh(new BoxGeometry(0.144, 0.02, 0.144), frieze);
  band.position.y = TOP_Y + 0.1 + 0.01;
  g.add(band);

  const roof = new Mesh(new BoxGeometry(0.136, 0.013, 0.136), stoneDark);
  roof.position.y = TOP_Y + 0.12 + 0.0065;
  g.add(roof);

  return g;
}
