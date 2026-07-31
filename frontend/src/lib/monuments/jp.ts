// Mount Fuji — stylized papercraft volcano: gently concave lathe cone,
// irregular snow cap on the top ~28%, forest-green skirt at the foot.
// Natural landform: no plaza disc, soft wide base instead.

import { Group, LatheGeometry, Mesh, Vector2 } from "three";
import { mat, TONES } from "./materials";

const H = 0.55; // summit height
const R0 = 0.35; // cone radius at ground
const R_TOP = 0.072; // crater rim radius
const SEG = 30; // radial segments (visible papercraft facets)

/** Concave "Hokusai" slope profile: cone radius at normalized height t. */
function slopeR(t: number): number {
  const s = Math.min(Math.max(t, 0), 1);
  const f = 0.78 * (1 - s) + 0.22 * (1 - s) * (1 - s);
  return R_TOP + (R0 - R_TOP) * f;
}

function lathe(pts: Vector2[], color: string): Mesh {
  return new Mesh(new LatheGeometry(pts, SEG), mat(color));
}

/**
 * Displace every vertex sitting on the ring at height `ringY` down (or up)
 * the slope by an angle-dependent amount, re-projecting onto the cone
 * surface (+offset) so the edge hugs the mountainside. Integer sine
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
        0.3 * Math.sin(8 * a + phase * 4.1));
    const ny = ringY - d;
    const nr = slopeR(ny / H) + radialOffset;
    const len = Math.hypot(x, z) || 1;
    pos.setXYZ(i, (x / len) * nr, ny, (z / len) * nr);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

export function build(): Group {
  const g = new Group();

  // --- Main cone body (blue-gray volcanic slope) ---
  const bodyTs = [0, 0.08, 0.17, 0.27, 0.38, 0.5, 0.62, 0.73, 0.83, 0.91, 0.97, 1];
  const bodyPts = bodyTs.map((t) => new Vector2(slopeR(t), t * H));
  g.add(lathe(bodyPts, TONES.slate));

  // --- Snow cap: top ~28%, follows the slope with a slight outward offset,
  //     crater rim folding inward at the summit. ---
  const tSnow = 0.68;
  const snowOff = 0.004;
  const snowTs = [tSnow, 0.76, 0.84, 0.91, 0.96, 1];
  const snowPts = snowTs.map((t) => new Vector2(slopeR(t) + snowOff, t * H));
  snowPts.push(new Vector2(R_TOP * 0.55, H - 0.008));
  snowPts.push(new Vector2(0.0001, H - 0.016));
  const snow = lathe(snowPts, TONES.snow);
  jitterRing(snow, tSnow * H, snowOff, 0.038, 0.9); // irregular snow line
  g.add(snow);

  // --- Forest skirt: green foothills fading out partway up, flaring to a
  //     soft wide base (footprint diameter 0.75). ---
  const skirtOff = 0.006;
  const skirtPts = [
    new Vector2(0.373, 0),
    new Vector2(0.362, 0.005),
    new Vector2(slopeR(0.04) + skirtOff, 0.04 * H),
    new Vector2(slopeR(0.085) + skirtOff, 0.085 * H),
    new Vector2(slopeR(0.13) + skirtOff * 0.5, 0.13 * H),
  ];
  const skirt = lathe(skirtPts, TONES.forest);
  jitterRing(skirt, 0.13 * H, skirtOff * 0.5, 0.018, 2.6); // uneven treeline
  g.add(skirt);

  return g;
}
