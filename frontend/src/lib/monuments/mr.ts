// Chinguetti — papercraft: the square dry-stone minaret with its five
// ostrich-egg finials, ringed by the flat-roofed ksar houses and low
// courtyard walls, with the dunes creeping up behind.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
} from "three";
import { mat, plazaDisc } from "./materials";

const SQ2 = Math.SQRT2;

const STONE = "#cbad86"; // ochre dry-stone
const STONE_DK = "#b0916a";
const STONE_LT = "#ddc49b";
const SAND = "#cfb890";
const DUNE = "#e7d5b0";
const DOOR = "#6f5a44";
const EGG = "#e4dccb";

const GROUND = 0.026;

function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  m: MeshLambertMaterial
): Mesh {
  const b = new Mesh(new BoxGeometry(w, h, d), m);
  b.position.set(x, y + h / 2, z);
  return b;
}

/** Battered pier: a square frustum whose top is `shrink` of its base. */
function pier(w: number, shrink: number, h: number, m: MeshLambertMaterial): Mesh {
  const geo = new CylinderGeometry(((w * shrink) / 2) * SQ2, (w / 2) * SQ2, h, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, h / 2, 0);
  return new Mesh(geo, m);
}

/** A ksar house: flat roof behind a low parapet, one dark doorway. */
function house(
  w: number,
  d: number,
  h: number,
  wallTone: string
): Group {
  const g = new Group();
  const wall = mat(wallTone);
  g.add(box(w, h, d, 0, 0, 0, wall));
  // flat roof behind a shallow parapet
  g.add(box(w + 0.011, 0.014, d + 0.011, 0, h, 0, mat(STONE_LT)));
  g.add(box(0.018, h * 0.6, 0.008, 0, 0, d / 2 + 0.002, mat(DOOR)));
  // a rubble course halfway up, the way ksar walls are laid
  g.add(box(w + 0.005, 0.006, d + 0.005, 0, h * 0.5, 0, mat(STONE_DK)));
  return g;
}

/** Soft dune hump: an upper hemisphere squashed into a low ridge. */
function dune(rx: number, ry: number, rz: number, x: number, z: number): Mesh {
  const geo = new SphereGeometry(1, 14, 5, 0, Math.PI * 2, 0, Math.PI / 2);
  geo.scale(rx, ry, rz);
  geo.translate(x, 0, z);
  return new Mesh(geo, mat(DUNE));
}

export function build(): Group {
  const g = new Group();
  const stone = mat(STONE);

  g.add(plazaDisc(0.37));
  const sand = new Mesh(new CylinderGeometry(0.365, 0.365, 0.018, 32), mat(SAND));
  sand.position.y = 0.019;
  g.add(sand);

  // ---- Dunes banked against the back of the settlement ----
  const d1 = dune(0.22, 0.175, 0.125, -0.05, -0.22);
  d1.position.y = GROUND - 0.006;
  g.add(d1);
  const d2 = dune(0.13, 0.105, 0.095, 0.2, -0.2);
  d2.position.y = GROUND - 0.006;
  g.add(d2);

  // ---- The minaret ----
  const minaret = new Group();
  minaret.position.set(-0.01, GROUND, -0.03);
  g.add(minaret);

  minaret.add(box(0.12, 0.02, 0.12, 0, 0, 0, mat(STONE_DK)));
  const shaft = pier(0.108, 0.74, 0.285, stone);
  shaft.position.y = 0.02;
  minaret.add(shaft);
  // rough coursing bands up the shaft
  for (const [y, w] of [[0.086, 0.103], [0.16, 0.095], [0.234, 0.087]] as const) {
    minaret.add(box(w, 0.008, w, 0, y, 0, mat(STONE_DK)));
  }
  minaret.add(box(0.09, 0.012, 0.09, 0, 0.305, 0, mat(STONE_LT)));
  const upper = pier(0.082, 0.88, 0.06, stone);
  upper.position.y = 0.317;
  minaret.add(upper);
  minaret.add(box(0.084, 0.011, 0.084, 0, 0.377, 0, mat(STONE_DK)));

  // small openings under the parapet
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const win = box(0.015, 0.024, 0.008, 0, 0.333, 0, mat(DOOR));
    win.position.set(Math.sin(a) * 0.038, 0.345, Math.cos(a) * 0.038);
    win.rotation.y = a;
    minaret.add(win);
  }

  // ---- Five ostrich eggs on their posts, the minaret's signature ----
  const eggOn = (x: number, z: number, s: number) => {
    const post = box(0.015 * s, 0.022 * s, 0.015 * s, x, 0.388, z, mat(STONE_LT));
    minaret.add(post);
    const egg = new Mesh(new SphereGeometry(0.012 * s, 6, 4), mat(EGG));
    egg.scale.y = 1.35;
    egg.position.set(x, 0.388 + 0.022 * s + 0.014 * s, z);
    minaret.add(egg);
  };
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
    eggOn(sx * 0.031, sz * 0.031, 0.85);
  }
  eggOn(0, 0, 1.15);

  // ---- The ksar: flat-roofed houses crowding round the minaret ----
  const HOUSES: Array<[number, number, number, number, number, number, string]> = [
    [-0.185, 0.1, 0.135, 0.1, 0.072, 0.12, STONE],
    [-0.045, 0.175, 0.12, 0.09, 0.058, -0.08, STONE_LT],
    [0.105, 0.14, 0.13, 0.095, 0.066, 0.05, STONE],
    [0.245, 0.025, 0.1, 0.12, 0.054, -0.18, STONE_DK],
    [0.25, -0.16, 0.115, 0.09, 0.07, 0.1, STONE],
    [-0.265, -0.055, 0.11, 0.11, 0.062, -0.12, STONE_LT],
    [-0.225, -0.195, 0.105, 0.085, 0.05, 0.16, STONE],
    [0.06, -0.2, 0.1, 0.08, 0.046, -0.06, STONE_DK],
    [-0.095, -0.105, 0.09, 0.075, 0.042, 0.2, STONE_LT],
    [0.175, -0.065, 0.085, 0.07, 0.04, -0.04, STONE],
  ];
  for (const [x, z, w, d, h, rot, tone] of HOUSES) {
    const hs = house(w, d, h, tone);
    hs.position.set(x, GROUND, z);
    hs.rotation.y = rot;
    g.add(hs);
  }

  // ---- Low courtyard walls threading between the houses ----
  const wallStone = mat(STONE_DK);
  for (const [x, z, len, rot] of [
    [-0.12, 0.23, 0.13, 0.2],
    [0.19, 0.19, 0.12, -0.6],
    [0.31, -0.06, 0.11, 0.1],
    [-0.31, -0.15, 0.1, 0.4],
    [-0.03, -0.27, 0.14, -0.15],
  ] as const) {
    const w = box(len, 0.026, 0.014, x, GROUND, z, wallStone);
    w.rotation.y = rot;
    g.add(w);
  }

  // ---- A couple of date palms in the oasis gardens ----
  const trunk = mat("#9a8158");
  const frond = mat("#7f8a5c");
  for (const [x, z, s] of [
    [0.3, 0.16, 1],
    [-0.31, 0.14, 0.85],
  ] as const) {
    const t = new Group();
    t.position.set(x, GROUND, z);
    const stem = new Mesh(new CylinderGeometry(0.006, 0.009, 0.075 * s, 6), trunk);
    stem.position.y = 0.037 * s;
    t.add(stem);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const arm = new Group();
      arm.rotation.y = a;
      arm.position.y = 0.075 * s;
      const leaf = box(0.045 * s, 0.005, 0.014 * s, 0.022 * s, -0.004, 0, frond);
      leaf.rotation.z = -0.5;
      arm.add(leaf);
      t.add(arm);
    }
    g.add(t);
  }

  return g;
}
