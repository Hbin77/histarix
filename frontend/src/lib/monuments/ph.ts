// Chocolate Hills (Bohol) — papercraft cluster of rounded cone-dome hills
// in dry-season grass-brown, rising from a lush green plain.
// Natural landform: no plaza disc — irregular green terrain plate instead.

import { Group, LatheGeometry, Mesh, SphereGeometry, Vector2 } from "three";
import { mat, TONES } from "./materials";

const HILL = "#bd9a60"; // sun-dried grass brown
const HILL_DARK = "#a5824c";
const HILL_GREEN = "#9c9a63"; // half-turned hill, still greenish
const PLAIN = TONES.forest;
const SHRUB = "#6b8258";

const PLATE_R = 0.355; // plain radius before edge jitter (±0.02)
const PLATE_H = 0.045; // plain plateau height (slight highland block)

/** Rounded cone-dome "chocolate drop" mound — the signature hill shape:
 *  a gently conical flank blended into a fully rounded crown. */
const MOUND_TS = [0, 0.18, 0.36, 0.52, 0.66, 0.78, 0.88, 0.95, 0.985, 1];
function mound(r: number, h: number, color: string): Mesh {
  const pts = MOUND_TS.map((t) => {
    const radius = r * (0.25 * (1 - t) + 0.75 * Math.sqrt(1 - t * t));
    return new Vector2(Math.max(radius, 0.0001), t * h);
  });
  return new Mesh(new LatheGeometry(pts, 9), mat(color));
}

/** Low green plateau with an organically jittered coastline edge. */
function plain(): Mesh {
  const pts = [
    new Vector2(PLATE_R, 0),
    new Vector2(PLATE_R - 0.004, 0.018),
    new Vector2(PLATE_R - 0.024, 0.036),
    new Vector2(PLATE_R * 0.8, PLATE_H),
    new Vector2(0.0001, PLATE_H),
  ];
  const mesh = new Mesh(new LatheGeometry(pts, 30), mat(PLAIN));
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const rad = Math.hypot(x, z);
    if (rad < PLATE_R * 0.6) continue; // keep the interior flat
    const a = Math.atan2(z, x);
    // integer sine frequencies keep the lathe seam continuous
    const wob =
      1 +
      (0.032 * Math.sin(4 * a + 0.7) + 0.022 * Math.sin(7 * a + 2.1)) *
        ((rad / PLATE_R) ** 2);
    pos.setX(i, x * wob);
    pos.setZ(i, z * wob);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
  return mesh;
}

/** Tiny flattened shrub/copse blob dotting the plain between hills. */
function shrub(x: number, z: number, r: number): Mesh {
  const m = new Mesh(new SphereGeometry(r, 7, 4), mat(SHRUB));
  m.scale.y = 0.45;
  m.position.set(x, PLATE_H - 0.002, z);
  return m;
}

// x, z, radius, height, tone — a dense cluster of 12 hills, tallest center.
const HILLS: Array<[number, number, number, number, string]> = [
  [0.0, 0.02, 0.152, 0.32, HILL],
  [0.2, -0.113, 0.115, 0.23, HILL_DARK],
  [-0.2, -0.123, 0.11, 0.21, HILL],
  [0.157, 0.211, 0.1, 0.195, HILL],
  [-0.186, 0.172, 0.094, 0.185, HILL_GREEN],
  [0.284, 0.059, 0.068, 0.135, HILL],
  [-0.054, -0.26, 0.089, 0.175, HILL_DARK],
  [-0.289, 0.025, 0.065, 0.13, HILL],
  [-0.025, 0.289, 0.063, 0.125, HILL_DARK],
  [0.093, -0.289, 0.058, 0.11, HILL_GREEN],
  [0.088, 0.137, 0.052, 0.1, HILL_DARK],
  [-0.113, -0.059, 0.058, 0.105, HILL_GREEN],
];

export function build(): Group {
  const g = new Group();

  g.add(plain());

  let seam = 0;
  for (const [x, z, r, h, tone] of HILLS) {
    const hill = mound(r, h, tone);
    hill.position.set(x, PLATE_H - 0.008, z);
    hill.rotation.y = seam += 1.7; // stagger facet seams between hills
    g.add(hill);
  }

  // sparse vegetation between the mounds
  g.add(shrub(0.24, -0.22, 0.026));
  g.add(shrub(-0.28, 0.14, 0.022));
  g.add(shrub(0.29, -0.03, 0.024));

  return g;
}
