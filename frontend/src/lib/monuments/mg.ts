// Allée des Baobabs — papercraft: two files of Grandidier's baobabs along a
// rust-red dirt track, each a smooth near-columnar trunk flaring into roots
// at the foot and carrying a tiny flat crown of stubby branches.
// Natural landform: terrain base, no plaza disc.

import {
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
  SphereGeometry,
} from "three";
import { mat } from "./materials";

const EARTH = "#a87765"; // muted rust-red laterite
const TRACK = "#c3a184"; // dust beaten pale by carts
const BARK = "#a3968a"; // grey-brown baobab bark
const BARK_DK = "#8d8078";
const LEAF = "#8d9469"; // dusty olive canopy
const LEAF_DK = "#7c8459";

const R_TILE = 0.362;
const GROUND = 0.02;

/**
 * One baobab: root flare, a tall smooth trunk tapering to roughly half its
 * girth, and a flat crown of stubby branches carrying thin tufts.
 */
function baobab(h: number, r: number, seed: number): Group {
  const g = new Group();
  const bark = mat(BARK);
  const barkDk = mat(BARK_DK);
  const leaf = mat(LEAF);
  const leafDk = mat(LEAF_DK);

  const flare = new Mesh(new CylinderGeometry(r, r * 1.3, 0.055, 7), barkDk);
  flare.position.y = 0.0275;
  g.add(flare);

  const trunk = new Mesh(new CylinderGeometry(r * 0.68, r, h, 8, 1), bark);
  trunk.position.y = 0.055 + h / 2;
  g.add(trunk);

  const top = 0.055 + h;
  const rTop = r * 0.68;

  // crown: branches springing out near the horizontal, as baobabs do
  const N = 6;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + seed;
    const len = rTop * (2.1 + ((i + seed) % 2) * 0.6);
    const tilt = 1.02 + ((i * 7 + seed) % 3) * 0.09; // radians from vertical

    const arm = new Group();
    arm.rotation.y = a;
    arm.position.y = top;
    g.add(arm);

    const branch = new Mesh(
      new CylinderGeometry(rTop * 0.16, rTop * 0.42, len, 4),
      bark
    );
    branch.position.set((Math.sin(tilt) * len) / 2, (Math.cos(tilt) * len) / 2, 0);
    branch.rotation.z = -tilt;
    arm.add(branch);

    const tuft = new Mesh(new SphereGeometry(rTop * 0.72, 5, 3), i % 2 ? leaf : leafDk);
    tuft.scale.set(1.2, 0.42, 1.2);
    tuft.position.set(Math.sin(tilt) * len, Math.cos(tilt) * len, 0);
    arm.add(tuft);
  }

  // central tuft closing the crown
  const core = new Mesh(new SphereGeometry(rTop * 1.05, 6, 3), leaf);
  core.scale.set(1, 0.38, 1);
  core.position.y = top + rTop * 0.4;
  g.add(core);

  return g;
}

export function build(): Group {
  const g = new Group();

  // ---- Laterite plain ----
  const earth = new Mesh(new CylinderGeometry(R_TILE, R_TILE, GROUND, 28), mat(EARTH));
  earth.position.y = GROUND / 2;
  g.add(earth);

  // ---- The track: a straight strip of the tile, running away from the eye ----
  const HW = 0.088;
  const zc = Math.sqrt(R_TILE * R_TILE - HW * HW);
  const a1 = Math.atan2(zc, HW);
  const road = new Shape();
  road.moveTo(HW, zc);
  road.absarc(0, 0, R_TILE, a1, Math.PI - a1, false);
  road.lineTo(-HW, -zc);
  road.absarc(0, 0, R_TILE, Math.PI + a1, 2 * Math.PI - a1, false);
  road.closePath();
  const roadGeo = new ExtrudeGeometry(road, { depth: 0.005, bevelEnabled: false, curveSegments: 12 });
  roadGeo.rotateX(-Math.PI / 2);
  roadGeo.translate(0, GROUND, 0);
  g.add(new Mesh(roadGeo, mat(TRACK)));

  // cart ruts worn into the track
  for (const x of [-0.032, 0.032]) {
    const rut = new Mesh(new CylinderGeometry(0.012, 0.012, 0.6, 6, 1), mat("#b28e72"));
    rut.rotation.x = Math.PI / 2;
    rut.scale.y = 0.28;
    rut.position.set(x, GROUND + 0.004, 0);
    g.add(rut);
  }

  // ---- The two files of trees ----
  const TREES: Array<[number, number, number, number, number]> = [
    [-0.152, -0.225, 0.68, 0.058, 0.3],
    [-0.158, -0.01, 0.56, 0.052, 1.1],
    [-0.148, 0.2, 0.62, 0.055, 2.0],
    [0.155, -0.15, 0.6, 0.054, 1.6],
    [0.148, 0.06, 0.7, 0.06, 0.4],
    [0.162, 0.245, 0.52, 0.05, 2.4],
  ];
  for (const [x, z, h, r, seed] of TREES) {
    const t = baobab(h, r, seed);
    t.position.set(x, GROUND, z);
    g.add(t);
  }

  // ---- Low scrub scattered off the verges ----
  const scrub = mat(LEAF_DK);
  for (const [x, z, s] of [
    [-0.29, 0.02, 1],
    [-0.26, -0.19, 0.8],
    [0.3, -0.06, 0.9],
    [0.27, 0.18, 0.75],
    [-0.06, -0.31, 0.7],
    [0.09, 0.31, 0.85],
  ] as const) {
    const bush = new Mesh(new ConeGeometry(0.026 * s, 0.03 * s, 6), scrub);
    bush.position.set(x, GROUND + 0.014 * s, z);
    g.add(bush);
  }

  return g;
}
