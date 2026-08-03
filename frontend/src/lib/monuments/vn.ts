// Hạ Long Bay — papercraft karst seascape: steep fluted limestone islets
// with thin draped vegetation caps rising from a flat emerald sea — a
// twin-summit massif, blocky pillars, the leaning "kissing rocks" and a
// tiny junk boat with battened sails in the channel.
// Natural landform: no plaza disc — the water disc is the terrain base.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const SEG = 9; // radial facets per islet (visible papercraft creases)
const SEA_R = 0.36; // sea disc radius (footprint diameter 0.72)
const SEA_TOP = 0.014; // waterline height

const LAGOON = "#8db5a8"; // muted emerald shallows around the karsts
const LIME = "#c9c1b0"; // weathered limestone
const LIME_DK = "#aba28e"; // shadowed limestone

type Prof = Array<[number, number]>;

// Dome tower-karst: undercut waterline notch, mid bulge, rounded top.
const PROF_DOME: Prof = [
  [0, 0.42],
  [0.04, 0.68],
  [0.13, 0.97],
  [0.3, 1.0],
  [0.5, 0.97],
  [0.68, 0.92],
  [0.82, 0.82],
  [0.92, 0.6],
  [1, 0.14],
];

// Blocky mesa-karst: straighter cliffs, abrupt flat-ish crown.
const PROF_MESA: Prof = [
  [0, 0.46],
  [0.05, 0.72],
  [0.16, 0.98],
  [0.36, 1.0],
  [0.58, 0.98],
  [0.76, 0.95],
  [0.9, 0.87],
  [0.97, 0.62],
  [1, 0.28],
];

// "Kissing rock" pinnacle: tiny at the waterline, widest near the top.
const PROF_ROCK: Prof = [
  [0, 0.26],
  [0.12, 0.4],
  [0.34, 0.68],
  [0.64, 1.0],
  [0.86, 0.86],
  [1, 0.18],
];

function interp(prof: Prof, t: number): number {
  const s = Math.min(Math.max(t, 0), 1);
  for (let i = 1; i < prof.length; i++) {
    if (s <= prof[i][0]) {
      const [t0, m0] = prof[i - 1];
      const [t1, m1] = prof[i];
      return m0 + ((m1 - m0) * (s - t0)) / (t1 - t0);
    }
  }
  return prof[prof.length - 1][1];
}

/**
 * Re-project every vertex onto the fluted karst surface: angle-dependent
 * multiplier carves vertical limestone ribs; integer sine frequencies keep
 * the lathe seam continuous. `off` keeps caps hugging the flank.
 */
function flute(
  mesh: Mesh,
  prof: Prof,
  h: number,
  r: number,
  off: number,
  phase: number
): void {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    if (Math.hypot(x, z) < 1e-4) continue;
    const y = pos.getY(i);
    if (y > h) continue; // authored tip geometry above the profile domain
    const a = Math.atan2(z, x);
    const f =
      1 +
      0.09 * Math.sin(2 * a + phase) +
      0.07 * Math.sin(4 * a + phase * 2.1) +
      0.05 * Math.sin(7 * a + phase * 3.6);
    const nr = r * interp(prof, y / h) * f + off;
    const len = Math.hypot(x, z);
    pos.setXYZ(i, (x / len) * nr, y, (z / len) * nr);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

/**
 * Drape the cap's lowest ring irregularly down the flank and flare it
 * slightly outward so the fringe faces tilt down (no bright collar).
 * Runs AFTER flute(); scales the fluted radius to track the profile.
 */
function drapeCapEdge(
  cap: Mesh,
  prof: Prof,
  ringY: number,
  h: number,
  r: number,
  off: number,
  phase: number
): void {
  const pos = cap.geometry.attributes.position;
  const m0 = interp(prof, ringY / h) + off / r;
  for (let i = 0; i < pos.count; i++) {
    if (Math.abs(pos.getY(i) - ringY) > 1e-4) continue;
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const a = Math.atan2(z, x);
    const d =
      h *
      (0.024 +
        0.011 * Math.sin(2 * a + phase) +
        0.008 * Math.sin(3 * a + phase * 2.2) +
        0.005 * Math.sin(5 * a + phase * 3.9));
    const ny = ringY - d;
    const m1 = interp(prof, ny / h) + off / r;
    const len = Math.hypot(x, z) || 1;
    const nr = (len * m1) / m0 + 0.004; // track flank + outward fringe flare
    pos.setXYZ(i, (x / len) * nr, ny, (z / len) * nr);
  }
  pos.needsUpdate = true;
  cap.geometry.computeVertexNormals();
}

/** One limestone islet: fluted lathe body + thin draped green cap. */
function karst(
  prof: Prof,
  h: number,
  r: number,
  tone: string,
  capTone: string,
  phase: number
): Group {
  const g = new Group();

  const bodyPts = prof.map(([t, m]) => new Vector2(r * m, t * h));
  bodyPts.push(new Vector2(0.0001, h * 1.006));
  const body = new Mesh(new LatheGeometry(bodyPts, SEG), mat(tone));
  flute(body, prof, h, r, 0, phase);
  g.add(body);

  // Thin vegetation cap over the top ~18%, hugging the fluted flank.
  const off = 0.005;
  const tCap = 0.8;
  const capTs = [tCap, 0.845, 0.9, 0.95, 1];
  const capPts = capTs.map((t) => new Vector2(r * interp(prof, t) + off, t * h));
  capPts.push(new Vector2(r * 0.07, h * 1.012));
  capPts.push(new Vector2(0.0001, h * 1.028)); // steep tip — no glare facet
  const cap = new Mesh(new LatheGeometry(capPts, SEG), mat(capTone));
  flute(cap, prof, h, r, off, phase);
  drapeCapEdge(cap, prof, tCap * h, h, r, off, phase + 1.3);
  g.add(cap);

  return g;
}

/** Bare undercut pinnacle (kissing rocks / scattered nubs), no cap. */
function seaRock(h: number, r: number, tone: string, phase: number): Mesh {
  const pts = PROF_ROCK.map(([t, m]) => new Vector2(r * m, t * h));
  pts.push(new Vector2(0.0001, h * 1.01));
  const rock = new Mesh(new LatheGeometry(pts, 6), mat(tone));
  flute(rock, PROF_ROCK, h, r, 0, phase);
  return rock;
}

/** Tiny junk boat: dark hull + two battened trapezoid sails. */
function junk(): Group {
  const b = new Group();

  const hull = new Mesh(new BoxGeometry(0.09, 0.016, 0.03), mat(TONES.ironDark));
  hull.position.y = SEA_TOP + 0.003;
  b.add(hull);

  const deckY = SEA_TOP + 0.011;
  const mast = new Mesh(new CylinderGeometry(0.002, 0.002, 0.082, 5), mat(TONES.iron));
  mast.position.set(-0.004, deckY + 0.038, 0);
  b.add(mast);

  const sail = (w: number, hh: number): Mesh => {
    const s = new Shape();
    s.moveTo(0, 0);
    s.lineTo(w, hh * 0.18);
    s.lineTo(w * 0.82, hh);
    s.lineTo(0, hh * 0.86);
    s.closePath();
    return new Mesh(
      new ExtrudeGeometry(s, { depth: 0.0022, bevelEnabled: false }),
      mat(TONES.woodRed)
    );
  };

  const main = sail(0.048, 0.075);
  main.position.set(-0.003, deckY + 0.002, -0.0011);
  b.add(main);

  const fore = sail(0.033, 0.052);
  fore.rotation.y = Math.PI; // mirrored, facing the bow
  fore.position.set(-0.007, deckY + 0.002, 0.0011);
  b.add(fore);

  return b;
}

export function build(): Group {
  const g = new Group();

  // --- Flat sea: pale outer rim + muted emerald lagoon ---
  const sea = new Mesh(
    new CylinderGeometry(SEA_R, SEA_R, SEA_TOP - 0.004, 24),
    mat(TONES.water)
  );
  sea.position.y = (SEA_TOP - 0.004) / 2;
  g.add(sea);
  const lagoon = new Mesh(
    new CylinderGeometry(SEA_R * 0.9, SEA_R * 0.9, SEA_TOP, 24),
    mat(LAGOON)
  );
  lagoon.position.y = SEA_TOP / 2;
  g.add(lagoon);

  // --- Karst islets: twin-summit massif + varied pillars ---
  const isles: Array<{
    prof: Prof;
    x: number;
    z: number;
    h: number;
    r: number;
    tone: string;
    cap: string;
    rot: number;
    ph: number;
    sq: number; // z-squash → elliptical cross-section
    lean: number;
  }> = [
    // Twin-summit massif (two overlapping karsts fuse into one island)
    { prof: PROF_DOME, x: -0.11, z: 0.02, h: 0.55, r: 0.095, tone: LIME, cap: TONES.forest, rot: 0.4, ph: 0.7, sq: 0.85, lean: 0.04 },
    { prof: PROF_MESA, x: -0.185, z: 0.075, h: 0.37, r: 0.074, tone: LIME, cap: TONES.forest, rot: 2.1, ph: 2.9, sq: 0.85, lean: -0.06 },
    // Free-standing pillars
    { prof: PROF_MESA, x: 0.15, z: -0.11, h: 0.47, r: 0.082, tone: LIME_DK, cap: TONES.roofGreen, rot: 1.7, ph: 2.3, sq: 0.88, lean: -0.09 },
    { prof: PROF_DOME, x: 0.04, z: 0.18, h: 0.33, r: 0.066, tone: LIME, cap: TONES.forest, rot: 2.9, ph: 4.1, sq: 0.78, lean: 0.1 },
    { prof: PROF_MESA, x: -0.25, z: -0.13, h: 0.26, r: 0.055, tone: LIME_DK, cap: TONES.roofGreen, rot: 0.9, ph: 1.4, sq: 0.85, lean: -0.08 },
    { prof: PROF_DOME, x: 0.26, z: 0.06, h: 0.19, r: 0.046, tone: LIME, cap: TONES.forest, rot: 2.2, ph: 3.2, sq: 0.88, lean: 0.12 },
    { prof: PROF_DOME, x: -0.05, z: -0.23, h: 0.13, r: 0.036, tone: LIME_DK, cap: TONES.forest, rot: 1.2, ph: 5.0, sq: 0.8, lean: -0.1 },
  ];
  for (const k of isles) {
    const isle = karst(k.prof, k.h, k.r, k.tone, k.cap, k.ph);
    isle.scale.z = k.sq;
    isle.rotation.set(0, k.rot, k.lean);
    isle.position.set(k.x, -0.004, k.z); // slight sink hides leaning gap
    g.add(isle);
  }

  // --- Twin "kissing rocks" leaning toward each other, front-right,
  //     tops close but a clear gap between them ---
  const rockA = seaRock(0.16, 0.03, LIME, 1.9);
  rockA.rotation.z = -0.22; // top leans +x
  rockA.position.set(0.165, -0.004, 0.2);
  g.add(rockA);
  const rockB = seaRock(0.13, 0.027, LIME_DK, 4.4);
  rockB.rotation.z = 0.24; // top leans -x
  rockB.position.set(0.26, -0.004, 0.2);
  g.add(rockB);

  // --- Scattered bare nubs for scale ---
  const nub1 = seaRock(0.055, 0.018, LIME_DK, 0.6);
  nub1.position.set(0.3, -0.004, -0.07);
  g.add(nub1);
  const nub2 = seaRock(0.045, 0.016, LIME, 3.1);
  nub2.position.set(-0.29, -0.004, 0.1);
  g.add(nub2);

  // --- Junk boat drifting in the open front channel ---
  const boat = junk();
  boat.scale.setScalar(1.15);
  boat.position.set(-0.02, 0, 0.28);
  boat.rotation.y = -0.5;
  g.add(boat);

  return g;
}
