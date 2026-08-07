// Mont Nyiragongo (DR Congo) — papercraft: broad charcoal stratovolcano with
// concave flaring flanks, a wide flat crater rim, a benched pit holding the
// ember-orange lava lake, an olive forest skirt and a pale smoke wisp.
// Natural landform: no plaza disc, the cone flares to its own soft base.

import {
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  SphereGeometry,
  Vector2,
} from "three";
import { mat } from "./materials";

const SEG = 30; // radial segments — visible papercraft facets

const H = 0.42; // crater rim height
const R0 = 0.358; // flank radius at ground
const R_RIM = 0.162; // outer rim radius

const ASH = "#5f5a57"; // weathered lower flank
const ASH_FRESH = "#4c4745"; // fresh ash mantling the upper cone
const PIT = "#433d3b"; // shadowed crater interior
const OLIVE = "#788a5e"; // forested lower slopes
const LAVA = "#c2703a"; // lava lake crust
const LAVA_HOT = "#dc9146"; // incandescent centre
const SMOKE = "#e0ded7";

/** Concave stratovolcano profile: flank radius at normalized height t. */
function flankR(t: number): number {
  const s = Math.min(Math.max(t, 0), 1);
  const f = 0.34 * (1 - s) + 0.66 * (1 - s) * (1 - s);
  return R_RIM + (R0 - R_RIM) * f;
}

/** Ragged boundary: push every vertex on the ring at `ringY` down the slope by
 *  an angle-dependent amount, re-projecting onto the flank so the edge keeps
 *  hugging it. Integer harmonics keep the lathe seam closed. */
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
    const a = Math.atan2(z, x);
    const d =
      amp *
      (0.55 + 0.45 * Math.sin(3 * a + phase) + 0.3 * Math.sin(7 * a + phase * 2.6));
    const ny = ringY - d;
    const nr = flankR(ny / H) + offset;
    const len = Math.hypot(x, z) || 1;
    pos.setXYZ(i, (x / len) * nr, ny, (z / len) * nr);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

export function build(): Group {
  const g = new Group();

  // ---- flank, base up to the outer rim, then the flat rim crown ----
  const flankTs = [0, 0.07, 0.15, 0.25, 0.36, 0.48, 0.6, 0.72, 0.84, 0.94, 1];
  const flankPts = flankTs.map((t) => new Vector2(flankR(t), t * H));
  flankPts.push(new Vector2(0.132, H + 0.004));
  g.add(new Mesh(new LatheGeometry(flankPts, SEG), mat(ASH)));

  // ---- fresh ash mantling the upper cone, with an uneven lower edge ----
  const capTs = [0.6, 0.7, 0.8, 0.88, 0.95, 1];
  const capPts = capTs.map((t) => new Vector2(flankR(t) + 0.005, t * H));
  capPts.push(new Vector2(0.134, H + 0.005));
  const capBase = 0.6 * H;
  const cap = new Mesh(new LatheGeometry(capPts, SEG), mat(ASH_FRESH));
  ragEdge(cap, capBase, 0.005, 0.055, 2.7);
  g.add(cap);

  // ---- crater: rim lip → bench → floor. The profile runs inward-and-down,
  //      which turns the lathe normals inward so the pit reads from above. ----
  const craterPts: Array<[number, number]> = [
    [0.132, 0.424],
    [0.125, 0.408],
    [0.113, 0.382],
    [0.098, 0.376],
    [0.082, 0.354],
    [0.076, 0.347],
    [0.0, 0.345],
  ];
  g.add(
    new Mesh(
      new LatheGeometry(
        craterPts.map(([r, y]) => new Vector2(r, y)),
        SEG
      ),
      mat(PIT)
    )
  );

  // ---- lava lake on the crater floor ----
  const lake = new Mesh(new CylinderGeometry(0.07, 0.066, 0.014, 20), mat(LAVA));
  lake.position.y = 0.345;
  g.add(lake);
  const hot = new Mesh(new CylinderGeometry(0.038, 0.034, 0.012, 16), mat(LAVA_HOT));
  hot.position.y = 0.352;
  g.add(hot);

  // ---- olive forest skirt flaring to a soft base, with a ragged treeline ----
  const skirtOff = 0.008;
  const skirtTop = 0.15;
  const skirtPts = [
    new Vector2(0.372, 0),
    new Vector2(0.362, 0.014),
    new Vector2(flankR(0.06) + skirtOff, 0.06 * H),
    new Vector2(flankR(0.18) + skirtOff, 0.18 * H),
    new Vector2(flankR(skirtTop / H) + skirtOff, skirtTop),
  ];
  const skirt = new Mesh(new LatheGeometry(skirtPts, SEG), mat(OLIVE));
  ragEdge(skirt, skirtTop, skirtOff, 0.038, 0.8);
  g.add(skirt);

  // ---- smoke wisp: slim, rising off the far rim so it never veils the lake ----
  for (const [x, y, z, r] of [
    [-0.05, 0.42, -0.05, 0.036],
    [-0.068, 0.452, -0.068, 0.03],
    [-0.086, 0.478, -0.086, 0.023],
    [-0.102, 0.499, -0.102, 0.015],
  ] as const) {
    const puff = new Mesh(new SphereGeometry(r, 8, 5), mat(SMOKE));
    puff.position.set(x, y, z);
    puff.scale.set(1.15, 0.9, 0.95);
    g.add(puff);
  }

  return g;
}
