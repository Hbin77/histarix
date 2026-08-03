// Sigiriya (Lion Rock) — papercraft monolith: sheer-sided flat-topped rock
// in muted orange-brown, jungle canopy skirt, tiny summit ruins, lion-paw
// gate terrace on the front face and a water-garden approach axis.
// Natural landform: no plaza disc — grounded on its own jungle terrain.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const H = 0.56; // plateau height
const SEG = 26; // lathe radial segments
const SX = 1.18; // ellipse stretch (east-west)
const SZ = 0.88; // ellipse squash (front-back)
const R_TOP = 0.235; // plateau rim radius (unscaled)

const ROCK = "#b78a66"; // muted orange-brown monolith
const JUNGLE_DK = "#6b845d";
const TERRAIN = "#8fa075";

/** Rock silhouette: sheer cliff walls, undercut base, slight top overhang. */
const PROFILE: Array<[number, number]> = [
  [0, 0.205],
  [0.05, 0.225],
  [0.12, 0.242],
  [0.25, 0.255],
  [0.45, 0.265],
  [0.62, 0.272],
  [0.78, 0.272],
  [0.89, 0.268],
  [0.96, 0.255],
  [1, R_TOP],
];

/** Interpolated rock radius (unscaled) at normalized height t. */
function rockR(t: number): number {
  for (let i = 1; i < PROFILE.length; i++) {
    if (t <= PROFILE[i][0]) {
      const [t0, r0] = PROFILE[i - 1];
      const [t1, r1] = PROFILE[i];
      return r0 + ((t - t0) / (t1 - t0)) * (r1 - r0);
    }
  }
  return R_TOP;
}

function box(
  w: number,
  h: number,
  d: number,
  tone: string,
  x: number,
  y: number,
  z: number
): Mesh {
  const m = new Mesh(new BoxGeometry(w, h, d), mat(tone));
  m.position.set(x, y, z);
  return m;
}

/** Angle+height rocky jitter; integer frequencies keep the lathe seam tight. */
function displaceRock(mesh: Mesh): void {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = y / H;
    if (t < 0.015 || t > 0.955) continue;
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 0.05) continue; // leave the top cap fan alone
    const a = Math.atan2(z, x);
    const fade =
      Math.min(1, (t - 0.015) / 0.1) * Math.min(1, (0.955 - t) / 0.08);
    const d =
      0.013 *
      fade *
      (0.55 * Math.sin(4 * a + 6 * t) +
        0.3 * Math.sin(7 * a + 2.4 - 4 * t) +
        0.22 * Math.sin(11 * a + 1.3 + 9 * t));
    const nr = r + d;
    pos.setXYZ(i, (x / r) * nr, y, (z / r) * nr);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

/** Low rectangular ruin foundation (4 thin walls). */
function ruinFrame(w: number, d: number, tone: string): Group {
  const g = new Group();
  const t = 0.008;
  const h = 0.018;
  g.add(box(w, h, t, tone, 0, h / 2, -d / 2 + t / 2));
  g.add(box(w, h, t, tone, 0, h / 2, d / 2 - t / 2));
  g.add(box(t, h, d - 2 * t, tone, -w / 2 + t / 2, h / 2, 0));
  g.add(box(t, h, d - 2 * t, tone, w / 2 - t / 2, h / 2, 0));
  return g;
}

function tree(x: number, y: number, z: number, r: number): Group {
  const g = new Group();
  const trunk = new Mesh(
    new CylinderGeometry(0.004, 0.005, 0.018, 5),
    mat(TONES.ironDark)
  );
  trunk.position.set(x, y + 0.009, z);
  g.add(trunk);
  const blob = new Mesh(new SphereGeometry(r, 6, 4), mat(TONES.forest));
  blob.scale.y = 0.78;
  blob.position.set(x, y + 0.018 + r * 0.6, z);
  g.add(blob);
  return g;
}

export function build(): Group {
  const g = new Group();

  // --- Jungle terrain base (landform: its own ground, no plaza) ---
  const terrain = new Mesh(
    new CylinderGeometry(0.365, 0.375, 0.032, 30),
    mat(TERRAIN)
  );
  terrain.position.y = 0.016;
  g.add(terrain);

  // --- The monolith ---
  const pts = PROFILE.map(([t, r]) => new Vector2(r, t * H));
  pts.push(new Vector2(0.12, H));
  pts.push(new Vector2(0.0001, H));
  const rock = new Mesh(new LatheGeometry(pts, SEG), mat(ROCK));
  displaceRock(rock);
  rock.scale.set(SX, 1, SZ);
  g.add(rock);

  // Dark mineral streaks running down the upper cliff (kept off the gate axis)
  const streaks: Array<[number, number, number]> = [
    [0.35, 0.042, 0.13],
    [2.5, 0.034, 0.1],
    [3.3, 0.046, 0.14],
    [4.1, 0.03, 0.09],
    [5.4, 0.04, 0.12],
  ];
  for (const [a, w, h] of streaks) {
    const tc = 0.85 - (h / 2) / H;
    const r = rockR(tc) - 0.005;
    const px = Math.cos(a) * r * SX;
    const pz = Math.sin(a) * r * SZ;
    const rib = box(w, h, 0.014, "#9a7052", px, 0.85 * H - h / 2, pz);
    rib.rotation.y = Math.atan2(px, pz);
    g.add(rib);
  }

  // --- Summit: grass plateau (inset so the rock rim stays visible) ---
  const grass = new Mesh(
    new CylinderGeometry(R_TOP * 0.9, R_TOP * 0.82, 0.014, SEG),
    mat(TONES.forest)
  );
  grass.scale.set(SX, 1, SZ);
  grass.position.y = H + 0.001;
  const grassTop = H + 0.008;
  g.add(grass);

  const f1 = ruinFrame(0.13, 0.08, TONES.stone);
  f1.position.set(-0.06, grassTop, 0.02);
  g.add(f1);
  const f2 = ruinFrame(0.07, 0.055, TONES.stone);
  f2.position.set(0.1, grassTop, -0.05);
  g.add(f2);
  g.add(box(0.05, 0.014, 0.05, TONES.stoneDark, -0.15, grassTop + 0.007, -0.06));
  // summit water tank
  g.add(box(0.062, 0.01, 0.048, TONES.stoneDark, 0.08, grassTop + 0.005, 0.07));
  g.add(box(0.05, 0.005, 0.036, TONES.water, 0.08, grassTop + 0.011, 0.07));

  g.add(tree(0.19, grassTop, 0.02, 0.018));
  g.add(tree(-0.17, grassTop, 0.08, 0.016));
  g.add(tree(-0.02, grassTop, -0.11, 0.017));

  // --- Jungle canopy blobs ringing the rock base (gap at the front axis) ---
  const ring = (
    n: number,
    rx: number,
    rz: number,
    phase: number,
    size: number
  ): void => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + phase;
      const px = Math.cos(a) * rx;
      const pz = Math.sin(a) * rz;
      if (pz > 0.12 && Math.abs(px) < 0.13) continue; // keep the gate axis clear
      const r = size + 0.014 * Math.sin(i * 12.9 + phase * 7);
      const blob = new Mesh(
        new SphereGeometry(r, 6, 4),
        mat(i % 3 === 0 ? JUNGLE_DK : TONES.forest)
      );
      blob.scale.y = 0.72;
      blob.position.set(px, 0.028 + r * 0.5, pz);
      g.add(blob);
    }
  };
  ring(11, 0.265, 0.205, 0.26, 0.05); // inner row hugging the cliff foot
  ring(12, 0.315, 0.255, 0.55, 0.036); // outer row on the terrain edge

  // --- Lion-paw gate terrace on the front face ---
  const terraceTop = 0.14;
  g.add(box(0.16, 0.026, 0.1, TONES.brickDark, 0, terraceTop - 0.013, 0.24));
  for (const s of [-1, 1]) {
    g.add(box(0.04, 0.046, 0.055, TONES.woodRed, s * 0.052, terraceTop + 0.023, 0.265));
    for (const tx of [-0.013, 0, 0.013]) {
      g.add(
        box(0.011, 0.02, 0.013, TONES.brickDark, s * 0.052 + tx, terraceTop + 0.01, 0.297)
      );
    }
  }
  // stair between the paws climbing into the rock face
  for (let i = 0; i < 4; i++) {
    g.add(
      box(0.028, 0.009, 0.013, TONES.stone, 0, terraceTop + 0.0045 + i * 0.009, 0.276 - i * 0.011)
    );
  }
  // approach stair descending from the terrace to the gardens
  for (let i = 0; i < 6; i++) {
    g.add(
      box(0.05, 0.012, 0.016, TONES.stone, 0, terraceTop - 0.006 - i * 0.018, 0.295 + i * 0.008)
    );
  }

  // --- Water-garden axis in front ---
  g.add(box(0.05, 0.012, 0.12, TONES.sand, 0, 0.038, 0.3));
  for (const s of [-1, 1]) {
    g.add(box(0.07, 0.01, 0.09, TONES.stone, s * 0.078, 0.037, 0.3));
    g.add(box(0.058, 0.005, 0.078, TONES.water, s * 0.078, 0.0445, 0.3));
  }

  return g;
}
