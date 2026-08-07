// Dunn's River Falls — papercraft landform: a broad, shallow natural
// staircase of rounded travertine terraces, thin ribbons of white water
// spilling lip to lip, leafy banks either side, turquoise pool at the foot.
// Natural landform: no plaza disc, its own jungle-floor terrain instead.

import {
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
  SphereGeometry,
} from "three";
import { mat } from "./materials";

const R = 0.37; // terrain radius (footprint 0.74)
const GROUND = 0.05;

const LIME = "#dbcca9"; // cream-buff travertine
const LIME_DK = "#c4b48e";
const LIME_LT = "#e8dcbe";
const FILM = "#cfe4e1"; // sheet lying on a terrace
const CURTAIN = "#eaf3f1"; // white water going over a lip
const POOL = "#93c2bf"; // turquoise plunge pool
const LEAF = "#6d8a58"; // muted palm greens
const LEAF_DK = "#5a7748";
const LEAF_LT = "#809d68";

const STEPS = 7;
const yAt = (i: number) => 0.072 + i * 0.055;
const zAt = (i: number) => 0.2 - i * 0.055;
const wAt = (i: number) => 0.225 - i * 0.009;
// the channel wanders a little from step to step
const chanAt = (i: number) => Math.sin(i * 1.7) * 0.026;

/** Terrace outline (x, z): flat back, rounded travertine lip bulging forward. */
function lobe(
  w: number,
  cx: number,
  zFront: number,
  zBack: number,
  bulge: number
): Array<[number, number]> {
  return [
    [cx + w, zBack],
    [cx + w, zFront - 0.035],
    [cx + w * 0.7, zFront - 0.006],
    [cx + w * 0.36, zFront + bulge * 0.7],
    [cx, zFront + bulge],
    [cx - w * 0.36, zFront + bulge * 0.7],
    [cx - w * 0.7, zFront - 0.006],
    [cx - w, zFront - 0.035],
    [cx - w, zBack],
  ];
}

/** Extrude an XZ polygon between y0 and y1. */
function prism(
  pts: Array<[number, number]>,
  y0: number,
  y1: number,
  color: string
): Mesh {
  const s = new Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: y1 - y0, bevelEnabled: false });
  geo.rotateX(Math.PI / 2);
  geo.translate(0, y1, 0);
  return new Mesh(geo, mat(color));
}

function foliage(
  r: number,
  x: number,
  y: number,
  z: number,
  color: string
): Mesh {
  const m = new Mesh(new SphereGeometry(r, 6, 4), mat(color));
  m.position.set(x, y, z);
  m.scale.set(1.1, 0.75, 1);
  return m;
}

export function build(): Group {
  const g = new Group();

  // ---- jungle floor ----
  const ground = new Mesh(
    new CylinderGeometry(0.355, R, GROUND, 32),
    mat(LEAF_DK)
  );
  ground.position.y = GROUND / 2;
  g.add(ground);

  // ---- turquoise plunge pool at the foot ----
  const pool = new Mesh(new CylinderGeometry(0.22, 0.22, 0.03, 20), mat(POOL));
  pool.position.set(0, GROUND - 0.004, 0.215);
  pool.scale.set(1.28, 1, 0.66);
  g.add(pool);

  // ---- the staircase: broad rounded travertine terraces ----
  for (let i = 0; i < STEPS; i++) {
    const y = yAt(i);
    const z = zAt(i);
    const w = wAt(i);
    const cx = chanAt(i);
    const bulge = 0.03 - i * 0.001;

    g.add(prism(lobe(w, 0, z, z - 0.13, bulge), Math.max(0, y - 0.1), y, i % 2 ? LIME : LIME_DK));
    // sunlit rim just under the lip
    g.add(
      prism(lobe(w + 0.005, 0, z + 0.003, z - 0.055, bulge), y - 0.016, y - 0.003, LIME_LT)
    );

    // narrow channel of water lying on the terrace, then going over the lip
    const cw = w * 0.62;
    g.add(prism(lobe(cw, cx, z - 0.01, z - 0.125, bulge * 0.7), y, y + 0.008, FILM));
    const yBelow = i === 0 ? GROUND + 0.014 : yAt(i - 1) + 0.005;
    g.add(
      prism(
        lobe(cw * 0.86, cx, z + 0.013, z - 0.055, bulge * 0.7),
        yBelow,
        y + 0.01,
        CURTAIN
      )
    );
  }

  // ---- vegetated ridges walling the cascade in on both sides ----
  for (const sx of [1, -1]) {
    const ridge = new Mesh(new SphereGeometry(0.15, 8, 5), mat(LEAF_DK));
    ridge.position.set(sx * 0.298, 0.062, -0.03);
    ridge.scale.set(0.48, 0.41, 1.95);
    g.add(ridge);
  }

  // ---- leafy banks, set well out so the stone stays legible ----
  for (let i = 0; i < STEPS; i += 2) {
    const y = yAt(i);
    const z = zAt(i) - 0.045;
    const x = wAt(i) + 0.068;
    const r = 0.072 - i * 0.005;
    for (const sx of [1, -1]) {
      g.add(foliage(r, sx * x, y + 0.01, z, i % 4 ? LEAF : LEAF_LT));
      g.add(foliage(r * 0.62, sx * (x + 0.03), Math.max(0.036, y - 0.055), z + 0.05, LEAF_DK));
    }
  }

  // ---- forested head of the gorge above the top terrace ----
  const head = new Mesh(new SphereGeometry(0.19, 8, 5), mat(LEAF_DK));
  head.position.set(0, 0.24, -0.235);
  head.scale.set(1.34, 0.95, 0.72);
  g.add(head);
  g.add(foliage(0.085, -0.13, 0.4, -0.26, LEAF));
  g.add(foliage(0.076, 0.14, 0.42, -0.235, LEAF_LT));
  g.add(foliage(0.062, 0.02, 0.45, -0.295, LEAF));
  // the stream arriving at the head of the staircase
  g.add(prism(lobe(0.07, chanAt(6), -0.14, -0.26, 0.016), 0.38, 0.42, FILM));

  // ---- boulders in the pool ----
  for (const [x, z, r] of [
    [-0.2, 0.27, 0.05],
    [0.21, 0.29, 0.044],
    [0.07, 0.34, 0.034],
  ] as const) {
    const b = new Mesh(new SphereGeometry(r, 6, 4), mat(LIME_DK));
    b.position.set(x, GROUND + r * 0.2, z);
    b.scale.y = 0.58;
    g.add(b);
  }

  return g;
}
