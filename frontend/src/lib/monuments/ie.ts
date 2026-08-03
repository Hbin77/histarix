// Cliffs of Moher — papercraft sea cliffs: stacked thin sedimentary slabs
// (jittered wavy headland outline) dropping to a blue sea disc, green
// pasture clifftop with field patches, Branaunmore sea stack offshore and
// O'Brien's round tower on the main headland. Natural landform: no plaza
// disc — the water disc is the base.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
} from "three";
import { mat, TONES } from "./materials";

const SEA_R = 0.36; // sea disc radius (footprint diameter 0.72)
const SEA_H = 0.022; // sea surface height
const BACK_R = 0.345; // land back-arc radius

// Cliff-face edge, left → right, as [x, worldZ]: two headlands and a notch.
// Land sits in the back ~45% of the disc so the sea reads in front.
const EDGE: [number, number][] = [
  [-0.324, -0.145],
  [-0.26, -0.055],
  [-0.185, -0.012],
  [-0.115, -0.1],
  [-0.03, -0.04],
  [0.05, 0.03],
  [0.135, -0.005],
  [0.21, -0.09],
  [0.28, -0.13],
  [0.32, -0.15],
];

// Raised green headland hill under the tower (cliffs rise to the right).
const TIER: [number, number][] = [
  [-0.04, -0.09],
  [0.03, 0.0],
  [0.1, -0.02],
  [0.18, -0.08],
  [0.24, -0.14],
];

// Muted dark shale/sandstone bands (Namurian strata).
const STRATA = ["#6b6257", "#79705f", "#5e574d", "#837968"];

/**
 * One horizontal land slab: cliff edge (pushed seaward by zOff + per-point
 * jitter) closed by an arc around the back of the disc, extruded to
 * thickness h with its bottom at y. Shape-space y = -worldZ.
 */
function slab(
  y: number,
  h: number,
  zOff: number,
  jitterOf: (k: number) => number,
  color: string,
  edge: [number, number][] = EDGE,
  arc: [number, number, number] = [-40, -145, BACK_R]
): Mesh {
  const s = new Shape();
  edge.forEach(([x, z], k) => {
    const zz = z + zOff + jitterOf(k);
    if (k === 0) s.moveTo(x, -zz);
    else s.lineTo(x, -zz);
  });
  const [a0, a1, r] = arc;
  for (let a = a0; a >= a1; a -= 15) {
    const rad = (a * Math.PI) / 180;
    s.lineTo(Math.cos(rad) * r, -Math.sin(rad) * r);
  }
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: h, bevelEnabled: false, steps: 1 });
  geo.rotateX(-Math.PI / 2); // shape flat, extrude direction → +y
  geo.translate(0, y, 0);
  return new Mesh(geo, mat(color));
}

/** Branaunmore-style sea stack: short stacked drums of alternating bands. */
function seaStack(x: number, z: number): Group {
  const g = new Group();
  const drums: [number, number, string][] = [
    [0.034, 0.055, STRATA[0]],
    [0.028, 0.045, STRATA[1]],
    [0.031, 0.05, STRATA[2]],
    [0.024, 0.038, STRATA[1]],
  ];
  let y = SEA_H - 0.006;
  for (const [r, h, c] of drums) {
    const d = new Mesh(new CylinderGeometry(r * 0.92, r, h, 9), mat(c));
    d.position.y = y + h / 2;
    g.add(d);
    y += h;
  }
  const foam = new Mesh(new CylinderGeometry(0.047, 0.05, 0.007, 12), mat(TONES.white));
  foam.position.y = SEA_H + 0.0035;
  g.add(foam);
  g.position.set(x, 0, z);
  return g;
}

/** O'Brien's Tower: round castellated tower with a small annex turret. */
function obrienTower(x: number, z: number, baseY: number): Group {
  const g = new Group();
  const body = new Mesh(new CylinderGeometry(0.03, 0.034, 0.095, 12), mat("#8f8779"));
  body.position.y = 0.0475;
  g.add(body);
  const parapet = new Mesh(new CylinderGeometry(0.04, 0.036, 0.02, 12), mat("#9a9284"));
  parapet.position.y = 0.105;
  g.add(parapet);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const m = new Mesh(new BoxGeometry(0.015, 0.012, 0.008), mat("#9a9284"));
    m.position.set(Math.cos(a) * 0.035, 0.121, Math.sin(a) * 0.035);
    m.rotation.y = -a;
    g.add(m);
  }
  const annex = new Mesh(new CylinderGeometry(0.016, 0.019, 0.055, 10), mat("#87806f"));
  annex.position.set(0.042, 0.0275, 0.016);
  g.add(annex);
  g.scale.setScalar(1.15);
  g.position.set(x, baseY, z);
  return g;
}

export function build(): Group {
  const g = new Group();

  // --- Sea base disc ---
  const sea = new Mesh(new CylinderGeometry(SEA_R, SEA_R, SEA_H, 36), mat(TONES.water));
  sea.position.y = SEA_H / 2;
  g.add(sea);

  // --- Surf line hugging the cliff base ---
  g.add(
    slab(SEA_H, 0.008, 0.016, (k) => 0.004 * Math.sin(k * 2.1), TONES.white)
  );

  // --- Stacked sedimentary strata (main cliff) ---
  const heights = [0.05, 0.034, 0.047, 0.032, 0.049, 0.035, 0.046, 0.033];
  let y = 0.012;
  heights.forEach((h, i) => {
    const jit = (k: number) =>
      0.009 * Math.sin(i * 1.9 + k * 1.35) + 0.005 * Math.sin(i * 3.1 + k * 0.7);
    g.add(slab(y, h, 0, jit, STRATA[i % STRATA.length]));
    y += h;
  });

  // --- Green pasture cap, slight overhang ---
  const capY = y;
  g.add(
    slab(capY, 0.03, 0.006, (k) => 0.006 * Math.sin(k * 1.7 + 0.8), TONES.forest)
  );
  const topY = capY + 0.03;

  // --- Upper tier: grassy headland hill rising toward the tower ---
  const tierArc: [number, number, number] = [-45, -135, 0.33];
  const tierY = topY - 0.006;
  g.add(
    slab(tierY, 0.075, 0, (k) => 0.006 * Math.sin(k * 2.1 + 0.5), TONES.forest, TIER, tierArc)
  );
  const tierTopY = tierY + 0.075;

  // --- Field patches (hedgerow-divided pasture, aerial charm) ---
  const fields: [number, number, number, number, number, string][] = [
    [-0.22, -0.2, 0.1, 0.065, topY, "#88a06f"],
    [-0.13, -0.11, 0.07, 0.05, topY, "#6f8a5e"],
    [0.12, -0.2, 0.08, 0.06, tierTopY, "#8aa578"],
  ];
  for (const [fx, fz, w, d, fy, c] of fields) {
    const f = new Mesh(new BoxGeometry(w, 0.005, d), mat(c));
    f.position.set(fx, fy + 0.0025, fz);
    f.rotation.y = fx * 1.4;
    g.add(f);
  }

  // --- Branaunmore sea stack off the notch ---
  g.add(seaStack(-0.12, 0.1));

  // --- White wave chips on the open Atlantic ---
  const waves: [number, number, number][] = [
    [0.19, 0.18, 0.6],
    [-0.24, 0.14, -0.4],
    [0.03, 0.26, 0.2],
    [-0.05, 0.16, -0.7],
  ];
  for (const [wx, wz, ry] of waves) {
    const w = new Mesh(new BoxGeometry(0.03, 0.004, 0.009), mat(TONES.white));
    w.position.set(wx, SEA_H + 0.002, wz);
    w.rotation.y = ry;
    g.add(w);
  }

  // --- O'Brien's Tower at the edge of the high headland ---
  g.add(obrienTower(0.03, -0.045, tierTopY));

  return g;
}
