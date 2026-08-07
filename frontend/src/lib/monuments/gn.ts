// Mont Nimba — papercraft landform: a long ridge of overlapping grassy crests
// in muted olive and rust rising to one sharp summit, standing above dark
// green forest slopes with a thin band of white mist caught at its foot.
// Natural landform: no plaza disc, the forest plateau is its own base.

import {
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Vector2,
} from "three";
import { mat } from "./materials";

const R = 0.35; // plateau radius (footprint 0.70)
const BASE_H = 0.055;

const OLIVE = "#9a9760";
const OLIVE_DEEP = "#868852";
const RUST = "#9b8452";
const FOREST = "#456141";
const FOREST_MID = "#4f6d47";
const MIST = "#edf0f1";

/** Rounded crest profile: radius fraction at normalized height t. */
const crest = (t: number) => Math.sqrt(Math.max(0, 1 - Math.pow(t, 2.6)));
/** Sharp summit profile: full flanks converging on a distinct apex. */
const peak = (t: number) => Math.pow(1 - t, 0.75);

/** Unit dome (radius 1, height 1); scale it into an elliptical hill. */
function dome(seg: number, sharp: boolean, N: number, color: string): Mesh {
  const f = sharp ? peak : crest;
  const pts: Vector2[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push(new Vector2(f(t), t));
  }
  return new Mesh(new LatheGeometry(pts, seg), mat(color));
}

export function build(): Group {
  const g = new Group();

  // ---- forested plateau ----
  const base = new Mesh(
    new CylinderGeometry(R * 0.985, R, BASE_H, 30),
    mat(FOREST)
  );
  base.position.y = BASE_H / 2;
  g.add(base);

  // ---- the ridge: overlapping crests climbing to one sharp summit ----
  const ridge: Array<[number, number, number, number, number, boolean, string]> =
    [
      // x, z, rx, rz, h, sharp, colour
      [-0.245, -0.085, 0.095, 0.085, 0.17, false, RUST],
      [-0.14, -0.105, 0.125, 0.1, 0.27, false, OLIVE_DEEP],
      [-0.015, -0.125, 0.175, 0.13, 0.46, true, OLIVE],
      [0.115, -0.12, 0.115, 0.095, 0.29, false, RUST],
      [0.225, -0.105, 0.095, 0.08, 0.2, false, OLIVE_DEEP],
      [0.29, -0.085, 0.055, 0.05, 0.13, false, RUST],
    ];
  for (const [x, z, rx, rz, h, sharp, color] of ridge) {
    const m = dome(sharp ? 14 : 12, sharp, 8, color);
    m.scale.set(rx, h, rz);
    m.position.set(x, BASE_H - 0.004, z);
    g.add(m);
  }

  // ---- dark forest lumping across the near slopes ----
  const trees: Array<[number, number, number, number, string]> = [
    [-0.28, 0.05, 0.075, 0.062, FOREST_MID],
    [-0.19, 0.11, 0.085, 0.072, FOREST],
    [-0.09, 0.06, 0.09, 0.08, FOREST_MID],
    [0.01, 0.13, 0.082, 0.07, FOREST],
    [0.11, 0.05, 0.088, 0.076, FOREST_MID],
    [0.21, 0.1, 0.078, 0.064, FOREST],
    [0.27, 0.04, 0.068, 0.056, FOREST_MID],
    [-0.06, 0.25, 0.07, 0.058, FOREST],
    [0.13, 0.24, 0.065, 0.052, FOREST_MID],
    [-0.22, 0.22, 0.06, 0.05, FOREST_MID],
    [0.27, 0.19, 0.055, 0.046, FOREST],
  ];
  for (const [x, z, r, h, color] of trees) {
    const m = dome(8, false, 5, color);
    m.scale.set(r, h, r);
    m.position.set(x, BASE_H - 0.01, z);
    g.add(m);
  }

  // ---- thin mist caught in gaps along the foot of the ridge ----
  for (const [x, y, z, r] of [
    [-0.245, 0.112, -0.005, 0.048],
    [-0.145, 0.126, -0.012, 0.042],
    [-0.045, 0.121, -0.02, 0.082],
    [0.085, 0.117, -0.015, 0.058],
    [0.2, 0.108, -0.005, 0.04],
  ] as const) {
    const puff = dome(7, false, 3, MIST);
    puff.scale.set(r, 0.024, r * 0.32);
    puff.position.set(x, y, z);
    g.add(puff);
  }

  return g;
}
