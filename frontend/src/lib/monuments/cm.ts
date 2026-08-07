// Mont Cameroun — papercraft: a broad-shouldered massif, not a cone. Long
// gentle olive slopes rise straight off a coastal plain to a broad bare basalt
// summit, with a soft cloud band caught around its shoulders. Squashed along Z
// so it reads as a ridge rather than a cone.

import { Group, LatheGeometry, Mesh, Vector2 } from "three";
import { mat, TONES } from "./materials";

const D2R = Math.PI / 180;
const SEG = 28; // radial segments — visible papercraft facets

const MASSIF = "#767b5e"; // olive-grey flanks
const BASALT = "#8b887e"; // bare rock above the vegetation line
const FOREST = "#6b8353"; // forest skirt
const PLAIN = "#93a069"; // coastal plain apron
const CLOUD = "#eeece7";

const SQUASH = 0.72; // ridge, not cone: footprint 0.76 × 0.55

/** Flank profile (radius, height): gentle at the foot, broad rounded summit. */
const FLANK: Array<[number, number]> = [
  [0.345, 0.0],
  [0.32, 0.032],
  [0.294, 0.068],
  [0.266, 0.106],
  [0.236, 0.144],
  [0.204, 0.182],
  [0.174, 0.218],
  [0.144, 0.252],
  [0.116, 0.282],
  [0.086, 0.308],
  [0.048, 0.326],
  [0.0, 0.336],
];

/** Flank radius at height y, following the FLANK profile. */
function flankR(y: number): number {
  for (let i = 1; i < FLANK.length; i++) {
    const [r1, y1] = FLANK[i];
    if (y <= y1) {
      const [r0, y0] = FLANK[i - 1];
      return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
    }
  }
  return 0;
}

/** Smooth angular weight in [0,1] — shared by the ragged edges and the cloud
 *  billow so both wobble on the same integer harmonics (seam stays closed). */
function wave(a: number, phase: number): number {
  return (
    0.55 + 0.45 * Math.sin(3 * a + phase) + 0.3 * Math.sin(7 * a + phase * 2.6)
  );
}

/** Ragged boundary: push every vertex on the ring at `ringY` down the slope,
 *  re-projecting onto the flank so the edge keeps hugging it. */
function ragEdge(
  mesh: Mesh,
  ringY: number,
  offset: number,
  amp: number,
  phase: number
): void {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (Math.abs(y - ringY) > 1e-4) continue;
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const ny = ringY - amp * wave(Math.atan2(z, x), phase);
    const nr = flankR(ny) + offset;
    const len = Math.hypot(x, z) || 1;
    pos.setXYZ(i, (x / len) * nr, ny, (z / len) * nr);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

/** Lathe following the flank between two heights, offset radially. */
function mantle(ys: number[], offset: number, color: string): Mesh {
  const pts = ys.map((y) => new Vector2(flankR(y) + offset, y));
  return new Mesh(new LatheGeometry(pts, SEG), mat(color));
}

/** Cloud collar: a lens-section ring revolved around the shoulders, then
 *  billowed so its silhouette swells and dips instead of reading as a torus. */
function cloudBand(y: number, rIn: number, rOut: number, thick: number): Mesh {
  const mid = (rIn + rOut) / 2;
  const m = new Mesh(
    new LatheGeometry(
      [
        new Vector2(rIn, y - thick * 0.3),
        new Vector2(mid, y - thick * 0.5),
        new Vector2(rOut, y + thick * 0.05),
        new Vector2(mid, y + thick * 0.5),
        new Vector2(rIn, y + thick * 0.35),
        new Vector2(rIn, y - thick * 0.3),
      ],
      26
    ),
    mat(CLOUD)
  );
  const pos = m.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 1e-5) continue;
    const w = wave(Math.atan2(z, x), 1.1);
    const nr = r * (1 + 0.085 * w);
    pos.setXYZ(i, (x / r) * nr, pos.getY(i) + 0.028 * w, (z / r) * nr);
  }
  pos.needsUpdate = true;
  m.geometry.computeVertexNormals();
  return m;
}

export function build(): Group {
  const g = new Group();
  const ridge = new Group();
  ridge.scale.z = SQUASH;
  g.add(ridge);

  // ---- coastal plain the massif rises straight out of, sea to one side ----
  ridge.add(
    new Mesh(
      new LatheGeometry(
        [
          new Vector2(0.378, 0.004),
          new Vector2(0.372, 0.012),
          new Vector2(0.345, 0.016),
        ],
        24
      ),
      mat(PLAIN)
    )
  );
  const seaPts = [
    new Vector2(0.384, 0.0),
    new Vector2(0.384, 0.012),
    new Vector2(0.336, 0.012),
    new Vector2(0.336, 0.0),
    new Vector2(0.384, 0.0),
  ];
  ridge.add(
    new Mesh(new LatheGeometry(seaPts, 12, 122 * D2R, 116 * D2R), mat(TONES.water))
  );

  // ---- the massif ----
  ridge.add(
    new Mesh(
      new LatheGeometry(
        FLANK.map(([r, y]) => new Vector2(r, y)),
        SEG
      ),
      mat(MASSIF)
    )
  );

  // ---- bare basalt above the vegetation line ----
  const basalt = mantle([0.2, 0.264, 0.312, 0.336], 0.005, BASALT);
  ragEdge(basalt, 0.2, 0.005, 0.048, 2.2);
  ridge.add(basalt);

  // ---- forest skirt with a ragged treeline ----
  const skirt = mantle([0.014, 0.058, 0.104], 0.006, FOREST);
  ragEdge(skirt, 0.104, 0.006, 0.036, 0.9);
  ridge.add(skirt);

  // ---- cloud band wrapping the shoulders just under the bare summit ----
  ridge.add(cloudBand(0.2, 0.15, 0.214, 0.062));

  return g;
}
