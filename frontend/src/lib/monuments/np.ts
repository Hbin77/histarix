// Boudhanath Stupa, Kathmandu — papercraft miniature.
// Crossed-square mandala plinth in three white tiers, massive whitewashed
// hemisphere dome, gold harmika cube with painted Buddha eyes, 13-step gold
// pyramid spire, gilded umbrella + pinnacle, prayer-flag strands.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const PLINTH = "#e2dbc8"; // whitewash, a step deeper than the dome
const FLAG_BLUE = "#7a93a8";
const FLAG_RED = "#a8756b";
const FLAG_GREEN = "#82997a";
const FLAG_YELLOW = "#bfa963";

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

/** Octagonal terrace tier (mandala plinth abstraction), flat face forward. */
function tier(r: number, h: number, y: number, color: string): Mesh {
  const m = new Mesh(new CylinderGeometry(r, r, h, 8), mat(color));
  m.rotation.y = Math.PI / 8;
  m.position.y = y;
  return m;
}

/** Prayer-flag strand p0 → p1: thin line with small pennants hanging off. */
function strand(p0: Vector3, p1: Vector3, colors: string[]): Group {
  const g = new Group();
  g.position.copy(p0);
  g.lookAt(p1); // local +Z aims at p1
  const len = p0.distanceTo(p1);
  const line = new Mesh(new CylinderGeometry(0.0022, 0.0022, len, 3), mat(TONES.slate));
  line.rotation.x = Math.PI / 2;
  line.position.z = len / 2;
  g.add(line);
  colors.forEach((c, i) => {
    const t = 0.2 + (0.62 * i) / (colors.length - 1);
    const flag = new Mesh(new BoxGeometry(0.004, 0.016, 0.02), mat(c));
    flag.position.set(0, -0.011, t * len);
    g.add(flag);
  });
  return g;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  // ---- circular enclosure wall around the mandala ----
  const ring = new Mesh(new TorusGeometry(0.345, 0.011, 6, 28), mat(PLINTH));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.013;
  g.add(ring);

  // ---- three-tier octagonal mandala plinth ----
  g.add(tier(0.335, 0.055, 0.0275, PLINTH));
  g.add(tier(0.29, 0.055, 0.0825, PLINTH));
  g.add(tier(0.25, 0.055, 0.1375, PLINTH));

  // ---- drum lip + massive whitewashed dome ----
  const drum = new Mesh(new CylinderGeometry(0.212, 0.216, 0.03, 24), mat(TONES.white));
  drum.position.y = 0.18;
  g.add(drum);
  const dome = new Mesh(
    new SphereGeometry(0.205, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(TONES.white)
  );
  dome.scale.y = 0.82;
  dome.position.y = 0.193;
  g.add(dome);

  // ---- gilded platform + harmika cube with painted eyes ----
  g.add(box(0.155, 0.02, 0.155, 0, 0.357, 0, TONES.gold));
  g.add(box(0.132, 0.018, 0.132, 0, 0.375, 0, TONES.gold));
  g.add(box(0.115, 0.095, 0.115, 0, 0.4295, 0, TONES.gold));

  // eye panels on all four faces
  for (let i = 0; i < 4; i++) {
    const face = new Group();
    face.rotation.y = (i * Math.PI) / 2;
    const off = 0.0575 + 0.004;
    const panel = box(0.088, 0.062, 0.007, 0, 0.432, off, TONES.white);
    const eyeL = box(0.017, 0.012, 0.005, -0.021, 0.44, off + 0.004, TONES.ink);
    const eyeR = box(0.017, 0.012, 0.005, 0.021, 0.44, off + 0.004, TONES.ink);
    const nose = box(0.007, 0.018, 0.005, 0, 0.418, off + 0.004, TONES.ink);
    face.add(panel, eyeL, eyeR, nose);
    g.add(face);
  }

  // ---- stepped gold pyramid spire (13 rings abstracted to 9 steps) ----
  const STEPS = 9;
  for (let i = 0; i < STEPS; i++) {
    const w = 0.15 - i * 0.0133;
    g.add(box(w, 0.02, w, 0, 0.487 + i * 0.02, 0, TONES.gold));
  }
  const spireTop = 0.477 + STEPS * 0.02; // 0.657

  // ---- gilded umbrella: neck, flat parasol disc, bead, pinnacle ----
  const neck = new Mesh(new CylinderGeometry(0.009, 0.011, 0.03, 8), mat(TONES.gold));
  neck.position.y = spireTop + 0.015;
  g.add(neck);
  const parasol = new Mesh(new CylinderGeometry(0.02, 0.062, 0.02, 12), mat(TONES.gold));
  parasol.position.y = spireTop + 0.038;
  g.add(parasol);
  const bead = new Mesh(new CylinderGeometry(0.007, 0.007, 0.022, 8), mat(TONES.gold));
  bead.position.y = spireTop + 0.058;
  g.add(bead);
  const tip = new Mesh(new CylinderGeometry(0.0005, 0.014, 0.05, 8), mat(TONES.gold));
  tip.position.y = spireTop + 0.092;
  g.add(tip);

  // ---- prayer-flag strands sweeping to the enclosure wall ----
  const flagTop = new Vector3(0, spireTop - 0.005, 0);
  const seq = [
    FLAG_BLUE,
    TONES.white,
    FLAG_RED,
    FLAG_GREEN,
    FLAG_YELLOW,
    FLAG_BLUE,
    FLAG_RED,
  ];
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    const anchor = new Vector3(Math.cos(a) * 0.33, 0.035, Math.sin(a) * 0.33);
    g.add(strand(flagTop, anchor, seq));
  }

  return g;
}
