// Mount Kenya — stylized papercraft massif: broad forested shield rising to
// a cluster of jagged rock spires (Batian & Nelion twins with Point Lenana
// beside them) carrying small snow/glacier patches. Natural landform: own
// terrain base, no plaza disc.

import { ConeGeometry, Group, LatheGeometry, Mesh, Vector2 } from "three";
import { mat, TONES } from "./materials";

const SEG = 26; // radial segments (visible papercraft facets)

const MASSIF_H = 0.245; // shoulder height where the spires take over
const R0 = 0.34; // massif radius at ground
const R_TOP = 0.07; // shoulder radius

const ROCK = "#79808f"; // summit rock — cool gray, near slate
const ROCK_DARK = "#666d7d";
const MOOR = "#9a9c74"; // high-altitude moorland olive

/** Shield profile: mostly straight slope with a soft concave foot. */
function shieldR(t: number): number {
  const s = Math.min(Math.max(t, 0), 1);
  const f = 0.6 * (1 - s) + 0.4 * Math.pow(1 - s, 2.2);
  return R_TOP + (R0 - R_TOP) * f;
}

function lathe(pts: Vector2[], color: string): Mesh {
  return new Mesh(new LatheGeometry(pts, SEG), mat(color));
}

/**
 * Vertical jitter of a lathe's edge ring (uneven treeline / moor line),
 * re-projected onto the shield slope (+offset) so the edge hugs the
 * mountainside. Integer sine frequencies keep the lathe seam continuous.
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
        0.35 * Math.sin(6 * a + phase * 2.1) +
        0.25 * Math.sin(9 * a + phase * 3.7));
    const ny = ringY - d;
    const nr = shieldR(ny / MASSIF_H) + radialOffset;
    const len = Math.hypot(x, z) || 1;
    pos.setXYZ(i, (x / len) * nr, ny, (z / len) * nr);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

/**
 * Angle-dependent radial warp of a whole mesh so the massif isn't a perfect
 * cone of revolution. Multiplicative — layered offset lathes warped with the
 * same params stay nested. Integer frequencies keep the seam continuous.
 */
function warp(mesh: Mesh): void {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 1e-5) continue;
    const a = Math.atan2(z, x);
    const k =
      1 +
      0.04 * Math.sin(2 * a + 0.8) +
      0.025 * Math.sin(5 * a + 2.4) +
      0.018 * Math.sin(7 * a + 4.9);
    pos.setXYZ(i, x * k, pos.getY(i), z * k);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

function spire(
  r: number,
  h: number,
  x: number,
  baseY: number,
  z: number,
  color: string,
  rotY: number,
  sx = 1,
  sz = 1
): Mesh {
  const m = new Mesh(new ConeGeometry(r, h, 5), mat(color));
  m.position.set(x, baseY + h / 2, z);
  m.rotation.y = rotY;
  m.scale.set(sx, 1, sz);
  return m;
}

export function build(): Group {
  const g = new Group();

  // --- Terrain base: irregular forest apron (footprint dia <= 0.75) ---
  const basePts = [
    new Vector2(0.342, 0),
    new Vector2(0.336, 0.01),
    new Vector2(0.318, 0.018),
  ];
  const apron = lathe(basePts, TONES.forest);
  warp(apron);
  g.add(apron);

  // --- Massif shield body (rock) ---
  const bodyTs = [0, 0.07, 0.15, 0.25, 0.36, 0.48, 0.6, 0.72, 0.83, 0.92, 1];
  const bodyPts = bodyTs.map((t) => new Vector2(shieldR(t), t * MASSIF_H));
  bodyPts.push(new Vector2(R_TOP * 0.5, MASSIF_H + 0.006));
  bodyPts.push(new Vector2(0.0001, MASSIF_H + 0.01));
  const body = lathe(bodyPts, ROCK);
  warp(body);
  g.add(body);

  // Rocky ridge shoulder under the spire cluster (kills the flat-disc top)
  const ridge = new Mesh(new ConeGeometry(0.115, 0.15, 6), mat(ROCK));
  ridge.position.set(0.02, 0.15 + 0.075, 0.0);
  ridge.scale.set(1.7, 1, 0.9);
  ridge.rotation.y = 0.15;
  g.add(ridge);

  // --- Forest skirt: lower ~35% of the shield ---
  const skirtOff = 0.006;
  const skirtTs = [0, 0.08, 0.16, 0.24, 0.32];
  const skirtPts = skirtTs.map(
    (t) => new Vector2(shieldR(t) + skirtOff, t * MASSIF_H)
  );
  const skirt = lathe(skirtPts, TONES.forest);
  jitterRing(skirt, 0.32 * MASSIF_H, skirtOff, 0.016, 1.4);
  warp(skirt);
  g.add(skirt);

  // --- Moorland band: olive belt above the forest ---
  const moorOff = 0.004;
  const moorTs = [0.18, 0.3, 0.42, 0.53, 0.62];
  const moorPts = moorTs.map(
    (t) => new Vector2(shieldR(t) + moorOff, t * MASSIF_H)
  );
  const moor = lathe(moorPts, MOOR);
  jitterRing(moor, 0.62 * MASSIF_H, moorOff, 0.018, 3.8);
  warp(moor);
  g.add(moor);

  // --- Summit spires: Batian (tallest), Nelion (twin), Point Lenana ---
  g.add(spire(0.078, 0.38, -0.035, 0.19, 0.025, ROCK_DARK, 0.4, 1, 0.82)); // Batian
  g.add(spire(0.066, 0.31, 0.052, 0.19, -0.02, ROCK, 1.2, 0.88, 1)); // Nelion
  g.add(spire(0.056, 0.21, 0.12, 0.18, 0.03, ROCK, 2.1, 1, 0.85)); // Lenana

  // Lesser teeth completing the jagged ridge line
  g.add(spire(0.042, 0.14, -0.115, 0.18, -0.02, ROCK_DARK, 1.7, 1, 0.85));
  g.add(spire(0.036, 0.11, 0.005, 0.185, -0.075, ROCK_DARK, 0.2, 0.9, 1));
  g.add(spire(0.034, 0.1, -0.06, 0.185, 0.085, ROCK, 2.8, 1, 0.9));
  g.add(spire(0.03, 0.085, 0.09, 0.18, -0.065, ROCK_DARK, 0.9));
  g.add(spire(0.028, 0.08, -0.16, 0.16, 0.045, ROCK, 2.3, 1, 0.85));

  // --- Snow: tip caps on the twins + glacier patches in the cols ---
  const capB = new Mesh(new ConeGeometry(0.023, 0.085, 5), mat(TONES.snow));
  capB.position.set(-0.035, 0.57 - 0.085 / 2 + 0.005, 0.025);
  capB.rotation.y = 0.4;
  capB.scale.set(1, 1, 0.82);
  g.add(capB);

  const capN = new Mesh(new ConeGeometry(0.02, 0.07, 5), mat(TONES.snow));
  capN.position.set(0.052, 0.5 - 0.07 / 2 + 0.005, -0.02);
  capN.rotation.y = 1.2;
  capN.scale.set(0.88, 1, 1);
  g.add(capN);

  // Lewis Glacier: tucked in the saddle between Nelion and Lenana
  const lewis = new Mesh(new ConeGeometry(0.04, 0.05, 6), mat(TONES.snow));
  lewis.position.set(0.088, 0.262, 0.005);
  lewis.scale.set(1.2, 1, 0.8);
  g.add(lewis);

  // Small glacier remnant on Batian's west flank
  const flank = new Mesh(new ConeGeometry(0.032, 0.04, 5), mat(TONES.snow));
  flank.position.set(-0.085, 0.235, 0.005);
  flank.scale.set(1, 1, 0.75);
  g.add(flank);

  return g;
}
