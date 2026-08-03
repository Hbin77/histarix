// Kilimanjaro ("Roof of Africa") — stylized papercraft massif: Kibo as a
// very broad, gently sloped shield dome capped by a wide FLAT snow table,
// the jagged Mawenzi spike to its left, and a savanna plain skirt with
// tiny flat-topped acacias. Natural landform: no plaza disc — its own
// terrain base with TONES-only palette plus muted landform hexes.

import {
  ConeGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const H = 0.4; // summit (flat snow table) height
const R0 = 0.33; // dome radius at ground
const RT = 0.17; // flat-top radius (wide — the "roof" table)
const SEG = 30; // radial facets

/** Broad, near-straight shield profile with a soft convex shoulder. */
function slopeR(t: number): number {
  const s = Math.min(Math.max(t, 0), 1);
  const f = 0.78 * (1 - s) + 0.22 * (1 - s * s);
  return RT + (R0 - RT) * f;
}

function lathe(pts: Vector2[], color: string): Mesh {
  return new Mesh(new LatheGeometry(pts, SEG), mat(color));
}

/**
 * Displace the vertices of the ring at `ringY` down the slope by an
 * angle-dependent amount, re-projecting onto the dome surface (+offset)
 * so the edge hugs the mountainside. Integer sine frequencies keep the
 * lathe seam continuous — reads as streaky, uneven snow/grass lines.
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
        0.45 * Math.sin(4 * a + phase) +
        0.35 * Math.sin(7 * a + phase * 2.1) +
        0.28 * Math.sin(11 * a + phase * 3.7));
    const ny = ringY - d;
    const nr = slopeR(ny / H) + radialOffset;
    const len = Math.hypot(x, z) || 1;
    pos.setXYZ(i, (x / len) * nr, ny, (z / len) * nr);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

/** Tiny umbrella acacia: flared trunk + wide flat-topped canopy. */
function acacia(x: number, z: number, s: number): Group {
  const t = new Group();
  const trunk = new Mesh(
    new CylinderGeometry(0.005, 0.008, 0.038, 5),
    mat("#7a6248")
  );
  trunk.position.y = 0.019;
  t.add(trunk);
  const canopy = new Mesh(
    new CylinderGeometry(0.04, 0.018, 0.015, 7),
    mat("#5f7d52")
  );
  canopy.position.y = 0.044;
  t.add(canopy);
  t.position.set(x, 0.014, z);
  t.scale.setScalar(s);
  return t;
}

export function build(): Group {
  const g = new Group();

  // --- Savanna plain: dry-grass terrain slab the whole massif rises from ---
  const plain = new Mesh(
    new CylinderGeometry(0.365, 0.373, 0.014, SEG),
    mat(TONES.sand)
  );
  plain.position.y = 0.007;
  plain.scale.z = 0.95;
  g.add(plain);

  // Green grass bands on the plain (flat squashed discs)
  const patches: Array<[number, number, number, number]> = [
    [0.18, 0.26, 0.12, 0.55],
    [-0.16, 0.28, 0.1, 0.5],
    [0.31, -0.12, 0.09, 0.65],
    [-0.05, -0.31, 0.1, 0.55],
  ];
  for (const [px, pz, pr, sq] of patches) {
    const p = new Mesh(new CylinderGeometry(pr, pr, 0.007, 12), mat(TONES.forest));
    p.position.set(px, 0.016, pz);
    p.scale.z = sq;
    g.add(p);
  }

  // --- Kibo: broad shield dome, shifted right of center, slightly
  //     squashed front-to-back so it reads wider than tall ---
  const kibo = new Group();
  kibo.position.x = 0.035;
  kibo.scale.x = 0.93;
  kibo.scale.z = 0.88;

  const bodyTs = [0, 0.08, 0.17, 0.27, 0.38, 0.5, 0.62, 0.73, 0.83, 0.92, 1];
  const bodyPts = bodyTs.map((t) => new Vector2(slopeR(t), t * H));
  bodyPts.push(new Vector2(0.0001, H)); // close the flat summit
  kibo.add(lathe(bodyPts, TONES.slate));

  // Thin, wide flat snow table on the very top — a crisp white "roof"
  // lid slightly overhanging the rock, streaky lower edge
  const tSnow = 0.78;
  const snowOff = 0.008;
  const snowTs = [tSnow, 0.86, 0.93, 1];
  const snowPts = snowTs.map((t) => new Vector2(slopeR(t) + snowOff, t * H));
  snowPts.push(new Vector2(RT * 0.6, H + 0.009));
  snowPts.push(new Vector2(0.0001, H + 0.012));
  const snow = lathe(snowPts, TONES.snow);
  jitterRing(snow, tSnow * H, snowOff, 0.04, 1.4);
  kibo.add(snow);

  // Small ash-gray crater pit sunk into the snow table (aerial cue)
  const crater = new Mesh(
    new CylinderGeometry(0.048, 0.056, 0.006, 14),
    mat("#bdb8ac")
  );
  crater.position.set(0.015, H + 0.009, -0.01);
  kibo.add(crater);

  // Savanna-green skirt climbing the lower flank, uneven grass line
  const skirtPts = [
    new Vector2(R0 + 0.012, 0.008),
    new Vector2(R0 + 0.006, 0.014),
    new Vector2(slopeR(0.05) + 0.006, 0.05 * H),
    new Vector2(slopeR(0.1) + 0.006, 0.1 * H),
    new Vector2(slopeR(0.16) + 0.003, 0.16 * H),
  ];
  const skirt = lathe(skirtPts, TONES.forest);
  jitterRing(skirt, 0.16 * H, 0.003, 0.024, 2.8);
  kibo.add(skirt);

  g.add(kibo);

  // --- Mawenzi: chunky jagged rocky peak west of Kibo, across a saddle ---
  const mawenzi = new Group();
  mawenzi.position.set(-0.27, 0, 0.045);
  const spikeA = new Mesh(new ConeGeometry(0.095, 0.33, 6), mat("#6e7789"));
  spikeA.position.y = 0.165;
  spikeA.rotation.y = 0.45;
  spikeA.rotation.z = -0.05;
  mawenzi.add(spikeA);
  const spikeB = new Mesh(new ConeGeometry(0.065, 0.21, 5), mat(TONES.slate));
  spikeB.position.set(0.05, 0.105, 0.04);
  spikeB.rotation.z = 0.14;
  mawenzi.add(spikeB);
  const spikeC = new Mesh(new ConeGeometry(0.05, 0.15, 5), mat("#6e7789"));
  spikeC.position.set(-0.04, 0.075, -0.04);
  spikeC.rotation.z = -0.18;
  mawenzi.add(spikeC);
  const dust = new Mesh(new ConeGeometry(0.024, 0.05, 6), mat(TONES.snow));
  dust.position.y = 0.305;
  dust.rotation.y = 0.45;
  dust.rotation.z = -0.05;
  mawenzi.add(dust);
  g.add(mawenzi);

  // --- Acacia suggestion on the plain (front arc, clear of the dome) ---
  g.add(acacia(0.26, 0.25, 1.05));
  g.add(acacia(0.0, 0.33, 0.95));
  g.add(acacia(-0.19, 0.29, 0.85));
  g.add(acacia(0.35, 0.04, 0.8));

  return g;
}
