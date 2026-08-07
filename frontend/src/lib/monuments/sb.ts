// Marovo Lagoon — papercraft landform: a broken ring of narrow dark-green
// barrier islets riding a pale reef shelf, separating the pale turquoise
// lagoon inside from the deep blue sea outside, with a small volcanic
// island rising near the middle.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  Vector2,
} from "three";
import { mat } from "./materials";

const SEA = "#3a5d87"; // deep ocean outside the barrier
const LAGOON = "#8fd0c6"; // pale turquoise inside
const SHELF = "#a6d3c9"; // sunlit reef flat under the islets
const ISLET = "#4e6c4a"; // dense island bush
const ISLET_L = "#5f8055"; // sunlit crowns
const SAND = "#ddd0ab"; // beach fringe
const SLOPE = "#607f56"; // volcanic island flank
const PEAK = "#41603f"; // forested summit

const D2R = Math.PI / 180;

/** One barrier islet: a short arc of the ring built from three chunky
 *  blocks so it stays solid from every angle. */
function islet(
  deg: number,
  spanDeg: number,
  rMid: number,
  h: number,
  bush: MeshLambertMaterial,
  crown: MeshLambertMaterial,
  sand: MeshLambertMaterial
): Group {
  const g = new Group();
  const parts = 3;
  for (let i = 0; i < parts; i++) {
    const frac = (i + 0.5) / parts - 0.5;
    const a = (deg + frac * spanDeg) * D2R;
    const arc = (spanDeg * D2R) / parts;
    const len = rMid * arc * 1.14; // slight overlap between blocks
    const taper = 1 - 0.45 * Math.abs(frac) * 2; // ends thin out
    const r = rMid + (i - 1) * 0.004;
    const px = Math.sin(a) * r;
    const pz = Math.cos(a) * r;

    const beach = new Mesh(new BoxGeometry(len * 1.12, 0.012, 0.046), sand);
    beach.position.set(px, 0.006, pz);
    beach.rotation.y = a;
    g.add(beach);

    const body = new Mesh(
      new BoxGeometry(len, h * taper, 0.028 * (0.6 + 0.4 * taper)),
      i === 1 ? crown : bush
    );
    body.position.set(px, 0.012 + (h * taper) / 2, pz);
    body.rotation.y = a;
    g.add(body);
  }
  return g;
}

export function build(): Group {
  const g = new Group();
  const bush = mat(ISLET);
  const crown = mat(ISLET_L);
  const sand = mat(SAND);

  // ---- deep sea plate ----
  const sea = new Mesh(new CylinderGeometry(0.355, 0.344, 0.1, 40), mat(SEA));
  sea.position.y = 0.05;
  g.add(sea);

  // ---- reef shelf: pale annulus the barrier sits on ----
  const shelf = new Mesh(
    new LatheGeometry(
      [
        new Vector2(0.298, 0.1),
        new Vector2(0.298, 0.108),
        new Vector2(0.208, 0.108),
        new Vector2(0.208, 0.1),
        new Vector2(0.298, 0.1),
      ],
      34
    ),
    mat(SHELF)
  );
  g.add(shelf);

  // ---- pale turquoise lagoon inside the barrier ----
  const lagoon = new Mesh(new CylinderGeometry(0.212, 0.212, 0.014, 34), mat(LAGOON));
  lagoon.position.y = 0.107;
  g.add(lagoon);

  // ---- the broken barrier ring, gaps left for the passages ----
  const ring: Array<[number, number, number, number]> = [
    [8, 46, 0.256, 0.058],
    [60, 34, 0.25, 0.048],
    [100, 40, 0.26, 0.062],
    [148, 30, 0.252, 0.046],
    [186, 44, 0.257, 0.064],
    [234, 36, 0.25, 0.052],
    [272, 26, 0.26, 0.044],
    [306, 38, 0.254, 0.056],
    [340, 22, 0.261, 0.042],
  ];
  for (const [deg, span, r, h] of ring) {
    const isle = islet(deg, span, r, h, bush, crown, sand);
    isle.position.y = 0.108;
    g.add(isle);
  }

  // ---- volcanic island rising from the lagoon floor ----
  const isle = new Group();
  isle.position.set(0.03, 0.114, -0.038);
  g.add(isle);

  const beach = new Mesh(new CylinderGeometry(0.13, 0.142, 0.014, 18), sand);
  beach.position.y = 0.007;
  isle.add(beach);
  const flank = new Mesh(
    new LatheGeometry(
      [
        new Vector2(0.124, 0.016),
        new Vector2(0.108, 0.062),
        new Vector2(0.086, 0.122),
        new Vector2(0.06, 0.182),
        new Vector2(0.032, 0.228),
        new Vector2(0.0, 0.25),
      ],
      18
    ),
    mat(SLOPE)
  );
  isle.add(flank);
  const cap = new Mesh(new ConeGeometry(0.062, 0.11, 18), mat(PEAK));
  cap.position.y = 0.19;
  isle.add(cap);

  // ---- a couple of low bush cays scattered in the lagoon ----
  for (const [x, z, r, h] of [
    [-0.142, 0.078, 0.03, 0.028],
    [-0.068, -0.142, 0.024, 0.022],
    [0.146, 0.118, 0.026, 0.024],
  ] as const) {
    const cayS = new Mesh(new CylinderGeometry(r * 1.35, r * 1.45, 0.01, 9), sand);
    cayS.position.set(x, 0.119, z);
    g.add(cayS);
    const cay = new Mesh(new ConeGeometry(r, h, 9), bush);
    cay.position.set(x, 0.124 + h / 2, z);
    g.add(cay);
  }

  return g;
}
