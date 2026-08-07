// Kunta Kinteh Island — papercraft landform: a low flat island in the calm
// grey-green Gambia, carrying the crumbling rust-red laterite curtain walls
// and broken round bastions of James Fort, ringed by skeletal baobabs.
// Natural landform: water is the ground plane, no plaza disc.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
} from "three";
import { mat } from "./materials";

const R = 0.36; // river radius (footprint 0.72)
const SEA_H = 0.026;
const ISL_Y = 0.05; // island surface

const RIVER = "#8ea79b"; // calm grey-green water
const SHORE = "#cfc0a2";
const SAND = "#c3b08c";
const LATERITE = "#a8664c";
const LATERITE_DARK = "#7f4838";
const LATERITE_PALE = "#c68a6a";
const BARK = "#948570";
const CANOPY = "#79885f";
const WOOD = "#8a7355";
const SLOT = "#4a4034";

/** Angle-periodic wobble; integer frequencies keep the lathe seam closed. */
const wob = (a: number, p: number) =>
  0.6 * Math.sin(a + p) + 0.4 * Math.sin(2 * a + p * 1.9) + 0.25 * Math.sin(3 * a + p * 3.3);

/** Irregular flat landmass: a drum with a crumpled outline. */
function island(r: number, h: number, sides: number, p: number, color: string): Mesh {
  const geo = new CylinderGeometry(r, r * 1.04, h, sides, 1);
  geo.translate(0, h / 2, 0);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const m = 1 + 0.11 * wob(Math.atan2(z, x), p);
    pos.setX(i, x * m);
    pos.setZ(i, z * m);
  }
  geo.computeVertexNormals();
  return new Mesh(geo, mat(color));
}

/** Ruined round bastion: a drum whose top rim is bitten away unevenly. */
function bastion(r: number, h: number, p: number, color: string): Mesh {
  const geo = new CylinderGeometry(r, r * 1.1, h, 12, 1);
  geo.translate(0, h / 2, 0);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < h * 0.6) continue;
    const a = Math.atan2(pos.getZ(i), pos.getX(i));
    const bite =
      h * (0.11 + 0.09 * Math.sin(2 * a + p) + 0.07 * Math.sin(3 * a + p * 1.7));
    pos.setY(i, y - Math.max(0, bite));
  }
  geo.computeVertexNormals();
  return new Mesh(geo, mat(color));
}

function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  color: string
): Mesh {
  const m = new Mesh(new BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z);
  return m;
}

/** Skeletal baobab: swollen tapering trunk under a splay of bare limbs. */
function baobab(s: number, p: number, bark: MeshLambertMaterial): Group {
  const g = new Group();
  const flare = new Mesh(
    new CylinderGeometry(0.027 * s, 0.042 * s, 0.032 * s, 6),
    bark
  );
  flare.position.y = 0.016 * s;
  g.add(flare);
  const trunk = new Mesh(
    new CylinderGeometry(0.012 * s, 0.027 * s, 0.115 * s, 6),
    bark
  );
  trunk.position.y = 0.089 * s;
  g.add(trunk);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + p;
    const limb = new Mesh(
      new CylinderGeometry(0.003 * s, 0.009 * s, 0.078 * s, 5),
      bark
    );
    limb.position.set(Math.cos(a) * 0.024 * s, 0.168 * s, Math.sin(a) * 0.024 * s);
    limb.rotation.z = -Math.cos(a) * 0.7;
    limb.rotation.x = Math.sin(a) * 0.7;
    g.add(limb);
  }
  const crown = new Mesh(
    new CylinderGeometry(0.042 * s, 0.022 * s, 0.022 * s, 6),
    mat(CANOPY)
  );
  crown.position.y = 0.201 * s;
  g.add(crown);
  return g;
}

export function build(): Group {
  const g = new Group();

  // ---- river ----
  const water = new Mesh(new CylinderGeometry(R, R, SEA_H, 36), mat(RIVER));
  water.position.y = SEA_H / 2;
  g.add(water);

  // ---- low island: pale shoal ring under a sandy flat ----
  const shoal = island(0.262, 0.03, 20, 1.4, SHORE);
  shoal.scale.z = 0.74;
  shoal.position.y = 0.014;
  g.add(shoal);
  const flat = island(0.235, 0.026, 20, 2.9, SAND);
  flat.scale.z = 0.72;
  flat.position.y = 0.024;
  g.add(flat);

  // ---- crumbling laterite curtain walls ----
  const T = 0.024;
  const walls: Array<[number, number, number, number, number, string]> = [
    // w, h, d, x, z
    [0.07, 0.155, T, -0.09, -0.095, LATERITE],
    [0.075, 0.105, T, 0.008, -0.095, LATERITE_DARK],
    [0.06, 0.19, T, 0.105, -0.095, LATERITE],
    [0.07, 0.12, T, -0.1, 0.095, LATERITE_DARK],
    [0.075, 0.17, T, 0.018, 0.095, LATERITE],
    [0.045, 0.085, T, 0.113, 0.095, LATERITE_PALE],
  ];
  for (const [w, h, d, x, z, c] of walls) g.add(box(w, h, d, x, ISL_Y + h / 2, z, c));
  const sideWalls: Array<[number, number, number, number, number, string]> = [
    [T, 0.175, 0.065, -0.135, -0.063, LATERITE],
    [T, 0.1, 0.07, -0.135, 0.06, LATERITE_PALE],
    [T, 0.14, 0.075, 0.135, -0.043, LATERITE_DARK],
    [T, 0.2, 0.06, 0.135, 0.065, LATERITE],
  ];
  for (const [w, h, d, x, z, c] of sideWalls)
    g.add(box(w, h, d, x, ISL_Y + h / 2, z, c));

  // broken teeth left standing on a few wall heads
  for (const [x, z, y, h] of [
    [-0.118, -0.095, 0.155, 0.045],
    [0.128, 0.095, 0.085, 0.038],
    [-0.135, -0.088, 0.175, 0.042],
    [0.135, 0.088, 0.2, 0.032],
  ] as const)
    g.add(box(0.021, h, 0.021, x, ISL_Y + y + h / 2, z, LATERITE_PALE));

  // ---- round bastions, both broken off ----
  const bigBastion = bastion(0.062, 0.245, 0.9, LATERITE_PALE);
  bigBastion.position.set(-0.132, ISL_Y - 0.004, 0.092);
  g.add(bigBastion);
  const smallBastion = bastion(0.042, 0.17, 3.6, LATERITE_DARK);
  smallBastion.position.set(0.138, ISL_Y - 0.004, -0.09);
  g.add(smallBastion);

  // ---- ruined central keep ----
  g.add(box(0.082, 0.275, 0.064, -0.008, ISL_Y + 0.1375, -0.012, LATERITE));
  g.add(box(0.058, 0.175, 0.054, 0.06, ISL_Y + 0.0875, 0.022, LATERITE_DARK));
  g.add(box(0.026, 0.215, 0.026, -0.062, ISL_Y + 0.1075, 0.032, LATERITE_PALE));
  // dark embrasures and doorways
  for (const [x, y, z] of [
    [-0.014, 0.19, 0.042],
    [-0.014, 0.1, 0.042],
    [0.058, 0.09, 0.047],
    [-0.09, 0.085, -0.095],
    [0.018, 0.075, 0.095],
  ] as const)
    g.add(box(0.02, 0.038, 0.01, x, ISL_Y + y, z, SLOT));

  // rubble at the wall feet
  for (const [x, z, s] of [
    [-0.175, -0.03, 0.03],
    [0.16, -0.1, 0.026],
    [-0.05, 0.135, 0.024],
    [0.075, -0.135, 0.022],
    [0.185, 0.02, 0.02],
  ] as const)
    g.add(box(s, s * 0.7, s * 0.85, x, ISL_Y + s * 0.35, z, LATERITE_PALE));

  // ---- baobabs ringing the island ----
  const bark = mat(BARK);
  const trees: Array<[number, number, number, number]> = [
    [-0.205, -0.02, 1.0, 0.3],
    [-0.185, 0.075, 0.85, 1.4],
    [-0.09, -0.145, 0.8, 2.5],
    [0.075, 0.145, 0.85, 3.6],
    [0.185, -0.06, 1.05, 4.7],
    [0.215, 0.04, 0.9, 5.8],
    [0.02, -0.15, 0.75, 0.9],
  ];
  for (const [x, z, s, p] of trees) {
    const t = baobab(s, p, bark);
    t.position.set(x, ISL_Y - 0.006, z);
    g.add(t);
  }

  // ---- timber jetty reaching into the river ----
  g.add(box(0.026, 0.008, 0.12, 0.14, 0.058, 0.23, WOOD));
  for (const z of [0.185, 0.23, 0.278])
    g.add(box(0.007, 0.05, 0.007, 0.14, 0.03, z, WOOD));

  return g;
}
