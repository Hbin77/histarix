// Sibebe Rock (Eswatini) — papercraft: one huge bald granite whaleback dome
// in pale gray, streaked by dark rain-wash lines, swelling out of a soft
// green grassland skirt. Landform: terrain base instead of a plaza disc.

import { BoxGeometry, Group, LatheGeometry, Mesh, Vector2 } from "three";
import { mat } from "./materials";

const SEG = 28;
const D2R = Math.PI / 180;
const H = 0.43; // dome summit (before the group's y-scale of 1)
const R0 = 0.27; // dome radius at the grass line
const GRANITE = "#c7c5be";
const GRANITE_SHADE = "#adaba3";
const STREAK = "#98968f";
const GRASS = "#8e9d71";
const GRASS_DARK = "#7a8960";

/** Bornhardt profile: broad flanks, flat-ish crown. */
function domeR(t: number): number {
  const s = Math.min(Math.max(t, 0), 1);
  return R0 * Math.pow(1 - Math.pow(s, 2.9), 0.4);
}

const TS = [0, 0.1, 0.22, 0.34, 0.46, 0.58, 0.69, 0.79, 0.87, 0.93, 0.97, 1];

function lathe(
  pts: Array<[number, number]>,
  color: string,
  segs: number,
  phiStart = 0,
  phiLen = Math.PI * 2
): Mesh {
  return new Mesh(
    new LatheGeometry(
      pts.map(([r, y]) => new Vector2(r, y)),
      segs,
      phiStart,
      phiLen
    ),
    mat(color)
  );
}

/**
 * Push the vertices sitting on one lathe ring up or down by an
 * angle-dependent amount so the edge stops reading as a perfect circle.
 * Integer sine frequencies keep the lathe seam continuous.
 */
function jitterRing(mesh: Mesh, ringY: number, amp: number, phase: number): void {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    if (Math.abs(pos.getY(i) - ringY) > 1e-4) continue;
    const a = Math.atan2(pos.getZ(i), pos.getX(i));
    const d =
      amp *
      (0.5 +
        0.5 * Math.sin(2 * a + phase) +
        0.32 * Math.sin(3 * a + phase * 2.1) +
        0.24 * Math.sin(5 * a + phase * 3.7));
    pos.setY(i, Math.max(0, ringY + d));
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

export function build(): Group {
  const g = new Group();

  // ---- grassland: wide soft skirt out to a 0.74 footprint, capped so the
  //      dome never reveals the shell's inside where the two overlap ----
  const skirt = lathe(
    [
      [0.37, 0],
      [0.361, 0.014],
      [0.343, 0.031],
      [0.322, 0.047],
      [0.3, 0.058],
      [0.0001, 0.062],
    ],
    GRASS,
    SEG
  );
  jitterRing(skirt, 0, 0.013, 1.4);
  g.add(skirt);
  // darker fold in the grass on the shaded side
  g.add(
    lathe(
      [
        [0.352, 0.024],
        [0.316, 0.05],
        [0.306, 0.055],
        [0.344, 0.029],
      ],
      GRASS_DARK,
      18,
      150 * D2R,
      150 * D2R
    )
  );

  // ---- the dome: elongated so it reads as a whaleback, not a helmet ----
  const dome = new Group();
  dome.scale.set(1.2, 1, 0.9);
  g.add(dome);

  const shell = TS.map((t) => [domeR(t), t * H] as [number, number]);
  shell.unshift([R0 + 0.008, 0]); // skirt into the grass
  dome.add(lathe(shell, GRANITE, SEG));

  // shaded back-left quadrant of the granite
  dome.add(
    lathe(
      shell.map(([r, y]) => [r - 0.002, y] as [number, number]),
      GRANITE_SHADE,
      9,
      168 * D2R,
      116 * D2R
    )
  );

  // ---- dark rain-wash streaks running down the flanks ----
  for (const [deg, t0, t1, wide] of [
    [-24, 0.06, 0.92, 5],
    [16, 0.04, 0.84, 3.4],
    [58, 0.08, 0.9, 4.2],
    [-70, 0.05, 0.78, 3],
    [-116, 0.1, 0.86, 3.6],
    [128, 0.06, 0.8, 4],
    [176, 0.05, 0.88, 3.2],
  ] as const) {
    const seam: Array<[number, number]> = [];
    for (let i = 0; i <= 6; i++) {
      const t = t0 + ((t1 - t0) * i) / 6;
      seam.push([domeR(t) + 0.003, t * H]);
    }
    dome.add(lathe(seam, STREAK, 1, (deg - wide / 2) * D2R, wide * D2R));
  }

  // ---- exfoliation ledges: thin granite slabs peeling off the flanks ----
  for (const [deg, t, w] of [
    [-46, 0.16, 26],
    [86, 0.26, 20],
    [-142, 0.2, 22],
  ] as const) {
    const r = domeR(t);
    dome.add(
      lathe(
        [
          [r + 0.012, t * H],
          [r + 0.014, t * H + 0.016],
          [r - 0.002, t * H + 0.02],
          [r - 0.002, t * H],
        ],
        GRANITE_SHADE,
        6,
        (deg - w / 2) * D2R,
        w * D2R
      )
    );
  }

  // ---- shed granite slabs and boulders lying out on the grass ----
  const boulder = (x: number, z: number, s: number, ry: number, color: string) => {
    const b = new Mesh(new BoxGeometry(s, s * 0.62, s * 0.85), mat(color));
    b.position.set(x, 0.026 + s * 0.26, z);
    b.rotation.set(0.13, ry, 0.09);
    g.add(b);
  };
  boulder(-0.32, -0.05, 0.06, 0.5, GRANITE);
  boulder(0.05, 0.3, 0.046, 1.2, GRANITE_SHADE);
  boulder(0.23, 0.26, 0.05, -0.4, GRANITE);
  boulder(0.33, -0.07, 0.038, 0.9, GRANITE_SHADE);
  boulder(-0.13, -0.31, 0.042, 0.2, GRANITE);
  boulder(-0.26, 0.21, 0.035, 1.5, GRANITE);

  return g;
}
