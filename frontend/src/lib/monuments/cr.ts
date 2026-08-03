// Arenal Volcano (Costa Rica) — "Pura Vida": steep, near-perfect papercraft
// cone. Bare grey-brown upper cone, forest-green lower half with an uneven
// treeline, lumpy rainforest canopy at the foot, a small lake slab and a
// tiny drifting smoke puff. Natural landform: own terrain base, no plaza.

import {
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const H = 0.58; // summit height
const R0 = 0.26; // cone radius at ground
const R_TOP = 0.026; // tiny crater rim radius
const SEG = 28; // radial segments (papercraft facets)

const ROCK = "#8c8378"; // bare volcanic grey-brown
const ROCK_DARK = "#746b60"; // fresh lava rubble at the crater
const CANOPY_DARK = "#617c50"; // deep rainforest green
const CANOPY_LIGHT = "#8aa274"; // sunlit canopy green
const SMOKE = "#e3ded4"; // soft warm-grey puff

/** Steep, almost-straight Arenal slope: radius at normalized height t. */
function slopeR(t: number): number {
  const s = Math.min(Math.max(t, 0), 1);
  // Mostly linear with a whisper of concavity — Arenal is a textbook cone.
  const f = 0.92 * (1 - s) + 0.08 * (1 - s) * (1 - s);
  return R_TOP + (R0 - R_TOP) * f;
}

function lathe(pts: Vector2[], color: string): Mesh {
  return new Mesh(new LatheGeometry(pts, SEG), mat(color));
}

/**
 * Displace vertices on the ring at height `ringY` down the slope by an
 * angle-dependent amount, re-projected onto the cone surface (+offset),
 * so the treeline hugs the mountainside unevenly. Integer sine
 * frequencies keep the lathe seam continuous.
 */
function jitterRing(
  mesh: Mesh,
  ringY: number,
  radialOffset: number,
  amp: number,
  phase: number
): void {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (Math.abs(y - ringY) > 1e-4) continue;
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const a = Math.atan2(z, x);
    const d =
      amp *
      (0.55 +
        0.45 * Math.sin(3 * a + phase) +
        0.35 * Math.sin(5 * a + phase * 2.3) +
        0.3 * Math.sin(7 * a + phase * 4.1));
    const ny = ringY - d;
    const nr = slopeR(ny / H) + radialOffset;
    const len = Math.hypot(x, z) || 1;
    pos.setXYZ(i, (x / len) * nr, ny, (z / len) * nr);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

/** Low-poly squashed canopy blob sitting on the rainforest apron. */
function canopyBlob(
  x: number,
  z: number,
  r: number,
  color: string
): Mesh {
  const blob = new Mesh(new SphereGeometry(r, 6, 4), mat(color));
  blob.scale.y = 0.62;
  blob.position.set(x, r * 0.42, z);
  return blob;
}

export function build(): Group {
  const g = new Group();

  // --- Main cone body (bare grey-brown volcanic slope), tiny flat crater ---
  const bodyTs = [0, 0.1, 0.2, 0.32, 0.44, 0.56, 0.68, 0.78, 0.87, 0.94, 1];
  const bodyPts = bodyTs.map((t) => new Vector2(slopeR(t), t * H));
  bodyPts.push(new Vector2(R_TOP * 0.5, H - 0.006));
  bodyPts.push(new Vector2(0.0001, H - 0.01));
  g.add(lathe(bodyPts, ROCK));

  // --- Darker fresh-lava rubble cap right at the summit ---
  const tCap = 0.85;
  const capOff = 0.004;
  const capTs = [tCap, 0.9, 0.95, 1];
  const capPts = capTs.map((t) => new Vector2(slopeR(t) + capOff, t * H));
  capPts.push(new Vector2(R_TOP * 0.5, H - 0.005));
  capPts.push(new Vector2(0.0001, H - 0.009));
  const cap = lathe(capPts, ROCK_DARK);
  jitterRing(cap, tCap * H, capOff, 0.022, 3.2);
  g.add(cap);

  // --- Forested lower half: green sleeve up to ~52% with uneven treeline ---
  const tTree = 0.52;
  const treeOff = 0.005;
  const sleeveTs = [0, 0.1, 0.2, 0.3, 0.4, 0.46, tTree];
  const sleevePts = sleeveTs.map(
    (t) => new Vector2(slopeR(t) + treeOff, t * H)
  );
  const sleeve = lathe(sleevePts, TONES.forest);
  jitterRing(sleeve, tTree * H, treeOff, 0.075, 1.4);
  g.add(sleeve);

  // --- Rainforest apron: soft green plain flaring to the footprint edge,
  //     rim wobbled in-plane so it doesn't read as a perfect plate ---
  const apronPts = [
    new Vector2(0.357, 0),
    new Vector2(0.344, 0.008),
    new Vector2(0.3, 0.014),
    new Vector2(0.22, 0.02),
    new Vector2(0.18, 0.024),
  ];
  const apron = lathe(apronPts, CANOPY_DARK);
  const apos = apron.geometry.attributes.position;
  for (let i = 0; i < apos.count; i++) {
    const y = apos.getY(i);
    if (y > 0.0085) continue; // wobble only the two outer rims
    const x = apos.getX(i);
    const z = apos.getZ(i);
    const a = Math.atan2(z, x);
    const s = 1 + 0.028 * Math.sin(4 * a + 0.7) + 0.018 * Math.sin(7 * a + 2.1);
    apos.setX(i, x * s);
    apos.setZ(i, z * s);
  }
  apos.needsUpdate = true;
  apron.geometry.computeVertexNormals();
  g.add(apron);

  // --- Small lake at the foot (Lake Arenal), flat water slab ---
  const lake = new Mesh(
    new CylinderGeometry(0.095, 0.095, 0.02, 22),
    mat(TONES.water)
  );
  lake.position.set(0.25, 0.011, 0.115);
  g.add(lake);

  // --- Lumpy canopy clusters hugging the cone base (skip the lake sector) ---
  const blobs: Array<[number, number, number, string]> = [
    [0.29, -0.1, 0.046, CANOPY_LIGHT],
    [0.24, -0.19, 0.038, CANOPY_DARK],
    [0.13, -0.27, 0.05, CANOPY_LIGHT],
    [0.0, -0.31, 0.04, CANOPY_DARK],
    [-0.14, -0.28, 0.048, CANOPY_LIGHT],
    [-0.26, -0.17, 0.04, CANOPY_DARK],
    [-0.31, -0.04, 0.05, CANOPY_LIGHT],
    [-0.29, 0.11, 0.042, CANOPY_DARK],
    [-0.2, 0.23, 0.05, CANOPY_LIGHT],
    [-0.07, 0.3, 0.04, CANOPY_DARK],
    [0.06, 0.31, 0.044, CANOPY_LIGHT],
    [0.13, 0.25, 0.034, CANOPY_DARK],
    [0.33, 0.02, 0.034, CANOPY_DARK],
    // inner lumps climbing the foot of the cone
    [0.16, -0.16, 0.036, CANOPY_DARK],
    [-0.05, -0.22, 0.04, CANOPY_LIGHT],
    [-0.22, 0.03, 0.038, CANOPY_DARK],
    [-0.1, 0.21, 0.036, CANOPY_LIGHT],
  ];
  for (const [x, z, r, c] of blobs) g.add(canopyBlob(x, z, r, c));

  // --- Tiny smoke puff drifting off the summit (overlapping cluster) ---
  const puffs: Array<[number, number, number, number]> = [
    [0.018, H + 0.004, 0.006, 0.024],
    [0.046, H + 0.022, 0.014, 0.034],
    [0.078, H + 0.044, 0.024, 0.04],
  ];
  for (const [x, y, z, r] of puffs) {
    const puff = new Mesh(new SphereGeometry(r, 6, 4), mat(SMOKE));
    puff.position.set(x, y, z);
    g.add(puff);
  }

  return g;
}
