// Christ Church Cathedral (Stanley) — papercraft: small cruciform stone-and-
// brick church under a deep-red corrugated roof with white eaves trim, a
// squat square tower with clock and pyramid cap, and the freestanding arch of
// four curving whale jawbones on the lawn in front.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;

const BRICK = TONES.brick;
const STONE = "#b3aea2"; // grey Falkland stone
const ROOF = TONES.woodRed; // corrugated red metal
const TRIM = TONES.white;
const LAWN = "#93a97b";
const BONE = "#efe9dc";

const LAWN_Y = 0.026; // everything stands on the turf

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

/** Gabled roof, eaves at mesh y = 0. Cross-section half-width hw, ridge
 *  height h, ridge length L. `alongX` runs the ridge east-west. */
function gable(
  hw: number,
  h: number,
  L: number,
  color: string,
  alongX: boolean
): Mesh {
  const s = new Shape();
  s.moveTo(-hw, 0);
  s.lineTo(hw, 0);
  s.lineTo(0, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: L, bevelEnabled: false });
  geo.translate(0, 0, -L / 2);
  if (alongX) geo.rotateY(Math.PI / 2);
  return new Mesh(geo, mat(color));
}

/** One whale jawbone: tapering segments on a curve that stands near-vertical
 *  at the foot and sweeps inward only near the top, so the pair closes into a
 *  pointed arch rather than an A-frame. */
function jawbone(sx: number, spread: number, h: number): Group {
  const g = new Group();
  g.scale.z = 0.72; // blade-like cross-section
  const SEGS = 9;
  const px = (u: number) => sx * spread * (1 - Math.pow(u, 2.1));
  const py = (u: number) => h * u;
  const rad = (u: number) => 0.021 - 0.0142 * u;
  const m = mat(BONE);
  for (let i = 0; i < SEGS; i++) {
    const u0 = i / SEGS;
    const u1 = (i + 1) / SEGS;
    const dx = px(u1) - px(u0);
    const dy = py(u1) - py(u0);
    const len = Math.hypot(dx, dy) + 0.009;
    const seg = new Mesh(new CylinderGeometry(rad(u1), rad(u0), len, 5), m);
    seg.position.set((px(u0) + px(u1)) / 2, (py(u0) + py(u1)) / 2, 0);
    seg.rotation.z = Math.atan2(-dx, dy);
    g.add(seg);
  }
  return g;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.35));
  const turf = new Mesh(new CylinderGeometry(0.335, 0.335, 0.02, 30), mat(LAWN));
  turf.position.y = 0.018;
  g.add(turf);

  const site = new Group();
  site.position.y = LAWN_Y;
  g.add(site);

  // ---- nave ----
  site.add(box(0.375, 0.022, 0.162, 0.025, 0.011, 0, TONES.stoneDark));
  site.add(box(0.36, 0.185, 0.145, 0.025, 0.1075, 0, STONE));
  site.add(box(0.385, 0.013, 0.198, 0.025, 0.1985, 0, TRIM)); // eaves board
  const naveRoof = gable(0.086, 0.115, 0.375, ROOF, true);
  naveRoof.position.set(0.025, 0.205, 0);
  site.add(naveRoof);
  site.add(box(0.378, 0.011, 0.015, 0.025, 0.316, 0, TRIM)); // ridge cap

  // ---- transept crossing ----
  site.add(box(0.105, 0.185, 0.27, 0.07, 0.1075, 0, STONE));
  site.add(box(0.152, 0.013, 0.285, 0.07, 0.1985, 0, TRIM));
  const transRoof = gable(0.064, 0.105, 0.285, ROOF, false);
  transRoof.position.set(0.07, 0.205, 0);
  site.add(transRoof);
  for (const sz of [1, -1]) {
    const barge = gable(0.073, 0.114, 0.007, TRIM, false);
    barge.position.set(0.07, 0.2, sz * 0.146);
    site.add(barge);
  }

  // ---- chancel ----
  site.add(box(0.078, 0.155, 0.125, 0.244, 0.0925, 0, STONE));
  site.add(box(0.09, 0.012, 0.15, 0.244, 0.176, 0, TRIM));
  const chanRoof = gable(0.073, 0.088, 0.09, ROOF, true);
  chanRoof.position.set(0.244, 0.182, 0);
  site.add(chanRoof);

  // ---- squat brick tower ----
  const TX = -0.215;
  site.add(box(0.138, 0.024, 0.138, TX, 0.012, 0, TONES.stoneDark));
  site.add(box(0.124, 0.43, 0.124, TX, 0.239, 0, BRICK));
  for (const y of [0.2, 0.33])
    site.add(box(0.136, 0.012, 0.136, TX, y, 0, STONE)); // string courses
  site.add(box(0.152, 0.016, 0.152, TX, 0.462, 0, STONE)); // coping
  const cap = new Mesh(new ConeGeometry(0.084 * SQ2, 0.092, 4), mat(ROOF));
  cap.rotation.y = Math.PI / 4;
  cap.position.set(TX, 0.516, 0);
  site.add(cap);
  const spike = new Mesh(new CylinderGeometry(0.0035, 0.005, 0.05, 5), mat(STONE));
  spike.position.set(TX, 0.585, 0);
  site.add(spike);
  site.add(box(0.03, 0.006, 0.006, TX, 0.606, 0, TONES.ink)); // weathervane

  // belfry louvres on all four faces
  for (const sz of [1, -1]) {
    site.add(box(0.052, 0.072, 0.006, TX, 0.393, sz * 0.063, TONES.ink));
    site.add(box(0.006, 0.072, 0.052, TX + sz * 0.063, 0.393, 0, TONES.ink));
  }
  // clock face
  const clock = new Mesh(new CylinderGeometry(0.028, 0.028, 0.007, 14), mat(TRIM));
  clock.rotation.x = Math.PI / 2;
  clock.position.set(TX, 0.268, 0.064);
  site.add(clock);
  site.add(box(0.004, 0.019, 0.004, TX, 0.276, 0.069, TONES.ink));
  site.add(box(0.015, 0.004, 0.004, TX + 0.006, 0.268, 0.069, TONES.ink));
  // west door
  site.add(box(0.05, 0.082, 0.008, TX, 0.041, 0.064, TONES.ironDark));
  site.add(box(0.062, 0.094, 0.005, TX, 0.047, 0.061, STONE));

  // ---- lancet windows with pale surrounds ----
  const lancet = (x: number, y: number, z: number, w: number, h: number) => {
    site.add(box(w + 0.012, h + 0.012, 0.005, x, y, z * 0.985, TRIM));
    site.add(box(w, h, 0.008, x, y, z, TONES.ink));
  };
  for (const sz of [1, -1])
    for (const x of [-0.1, -0.048, 0.15, 0.196])
      lancet(x, 0.115, sz * 0.0755, 0.024, 0.072);
  for (const sz of [1, -1]) lancet(0.07, 0.125, sz * 0.14, 0.052, 0.092);
  site.add(box(0.005, 0.09, 0.05, 0.2835, 0.105, 0, TRIM)); // east window
  site.add(box(0.008, 0.078, 0.038, 0.285, 0.105, 0, TONES.ink));

  // ---- whalebone arch on the lawn ----
  const AX = 0.0;
  const AZ = 0.256;
  const SPREAD = 0.132;
  const AH = 0.3;
  for (const sx of [1, -1])
    for (const zo of [0.026, -0.026]) {
      const b = jawbone(sx, SPREAD, AH);
      b.position.set(AX, 0, AZ + zo);
      site.add(b);
      site.add(
        box(0.044, 0.022, 0.034, AX + sx * SPREAD, 0.011, AZ + zo, TONES.stoneDark)
      );
    }
  site.add(box(0.03, 0.028, 0.09, AX, AH - 0.012, AZ, BONE)); // apex clasp

  return g;
}
