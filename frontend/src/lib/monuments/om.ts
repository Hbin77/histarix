// جامع السلطان قابوس الأكبر (Sultan Qaboos Grand Mosque) — papercraft: a low
// ivory marble prayer hall ringed by pointed arcades, a ribbed sand-gold
// dome over the centre, four slim corner minarets and the tall square main
// minaret standing off to one side.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;

const MARBLE = "#f1ede2"; // ivory marble
const MARBLE_SH = "#ddd7c8"; // shaded marble, cornices and paving
const GOLD = "#c9a558"; // sand gold dome
const GOLD_DK = "#ac8b42";
const ACCENT = "#a7b5c1"; // soft grey-blue tilework

const HALL_W = 0.38;
const HALL_D = 0.24;
const PLINTH = 0.03;
const HALL_H = 0.145;
const ROOF_Y = PLINTH + HALL_H;

function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  m: MeshLambertMaterial
): Mesh {
  const mesh = new Mesh(new BoxGeometry(w, h, d), m);
  mesh.position.set(x, y, z);
  return mesh;
}

/** Square shaft / frustum, base at local y = 0, corners on the diagonals. */
function shaft(hwBot: number, hwTop: number, h: number, m: MeshLambertMaterial): Mesh {
  const geo = new CylinderGeometry(hwTop * SQ2, hwBot * SQ2, h, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, h / 2, 0);
  return new Mesh(geo, m);
}

/**
 * A run of pointed arch openings: dark recesses with marble piers between,
 * laid along X and facing +Z. Returns a group to be positioned and turned.
 */
function arcade(
  n: number,
  bay: number,
  h: number,
  depth: number,
  m: MeshLambertMaterial
): Group {
  const g = new Group();
  const dark = mat(TONES.ink);
  const span = (n - 1) * bay;
  for (let i = 0; i < n; i++) {
    const x = -span / 2 + i * bay;
    g.add(box(bay * 0.58, h * 0.78, depth, x, h * 0.39, 0, dark));
    g.add(box(bay * 0.44, h * 0.2, depth, x, h * 0.8, 0, dark));
    g.add(box(bay * 0.42, h, depth * 0.9, x - bay / 2, h / 2, 0, m));
  }
  g.add(box(bay * 0.42, h, depth * 0.9, span / 2 + bay / 2, h / 2, 0, m));
  return g;
}

/** Slim corner minaret: tapered shaft, balcony ring, small ribbed cap. */
function cornerMinaret(h: number, m: MeshLambertMaterial): Group {
  const g = new Group();
  g.add(shaft(0.024, 0.018, h, m));
  g.add(box(0.05, 0.01, 0.05, 0, h - 0.055, 0, mat(MARBLE_SH)));
  g.add(box(0.042, 0.024, 0.042, 0, h - 0.038, 0, mat(ACCENT)));
  const upper = shaft(0.017, 0.013, 0.042, m);
  upper.position.y = h - 0.026;
  g.add(upper);
  const cap = new Mesh(
    new SphereGeometry(0.019, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(GOLD)
  );
  cap.scale.y = 1.15;
  cap.position.y = h + 0.016;
  g.add(cap);
  const spike = new Mesh(new CylinderGeometry(0.0015, 0.004, 0.026, 5), mat(GOLD_DK));
  spike.position.y = h + 0.043;
  g.add(spike);
  return g;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.36));

  const marble = mat(MARBLE);
  const shade = mat(MARBLE_SH);
  const gold = mat(GOLD);
  const accent = mat(ACCENT);

  // ---- marble paving ----
  const paving = new Mesh(new CylinderGeometry(0.34, 0.34, 0.018, 28), shade);
  paving.position.y = 0.009;
  g.add(paving);

  // ---- prayer hall ----
  g.add(box(HALL_W + 0.05, PLINTH, HALL_D + 0.05, 0, PLINTH / 2, -0.03, shade));
  g.add(box(HALL_W, HALL_H, HALL_D, 0, PLINTH + HALL_H / 2, -0.03, marble));
  g.add(box(HALL_W + 0.03, 0.016, HALL_D + 0.03, 0, ROOF_Y + 0.008, -0.03, shade));
  // low parapet with a band of grey-blue tile
  g.add(box(HALL_W + 0.01, 0.022, HALL_D + 0.01, 0, ROOF_Y + 0.027, -0.03, marble));
  g.add(box(HALL_W + 0.016, 0.007, HALL_D + 0.016, 0, ROOF_Y + 0.02, -0.03, accent));

  // arcades on the hall's four sides
  const front = arcade(7, 0.05, 0.105, 0.016, marble);
  front.position.set(0, PLINTH, -0.03 + HALL_D / 2);
  g.add(front);
  const back = arcade(7, 0.05, 0.105, 0.016, marble);
  back.position.set(0, PLINTH, -0.03 - HALL_D / 2);
  back.rotation.y = Math.PI;
  g.add(back);
  for (const sx of [-1, 1]) {
    const side = arcade(3, 0.05, 0.105, 0.016, marble);
    side.position.set((sx * HALL_W) / 2, PLINTH, -0.03);
    side.rotation.y = (sx * Math.PI) / 2;
    g.add(side);
  }

  // ---- ribbed sand-gold dome over the centre ----
  const DRUM_Y = ROOF_Y + 0.038;
  const drum = new Mesh(new CylinderGeometry(0.082, 0.088, 0.068, 16), marble);
  drum.position.set(0, DRUM_Y + 0.034, -0.03);
  g.add(drum);
  const drumWin = new BoxGeometry(0.018, 0.028, 0.012);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const w = new Mesh(drumWin, accent);
    w.position.set(Math.sin(a) * 0.08, DRUM_Y + 0.03, -0.03 + Math.cos(a) * 0.08);
    w.rotation.y = a;
    g.add(w);
  }
  g.add(box(0.195, 0.012, 0.195, 0, DRUM_Y + 0.072, -0.03, shade));

  const domePts = [
    [0.092, 0],
    [0.094, 0.02],
    [0.09, 0.048],
    [0.079, 0.074],
    [0.063, 0.098],
    [0.04, 0.119],
    [0.018, 0.133],
    [0.0001, 0.141],
  ].map(([r, y]) => new Vector2(r, y));
  const domeGeo = new LatheGeometry(domePts, 24);
  const pos = domeGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 1e-5) continue;
    const flute = 1 + 0.055 * Math.cos(12 * Math.atan2(z, x));
    pos.setXYZ(i, x * flute, pos.getY(i), z * flute);
  }
  pos.needsUpdate = true;
  domeGeo.computeVertexNormals();
  const dome = new Mesh(domeGeo, gold);
  dome.position.set(0, DRUM_Y + 0.078, -0.03);
  g.add(dome);

  const finial = new Mesh(new CylinderGeometry(0.003, 0.006, 0.038, 6), mat(GOLD_DK));
  finial.position.set(0, DRUM_Y + 0.237, -0.03);
  g.add(finial);
  const orb = new Mesh(new SphereGeometry(0.011, 6, 4), gold);
  orb.position.set(0, DRUM_Y + 0.222, -0.03);
  g.add(orb);

  // ---- four slim corner minarets ----
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const cm = cornerMinaret(0.4, marble);
      cm.position.set(sx * 0.175, PLINTH * 0.6, -0.03 + sz * 0.105);
      g.add(cm);
    }

  // ---- the tall main minaret ----
  const mn = new Group();
  mn.position.set(0.275, 0, 0.075);
  g.add(mn);
  mn.add(box(0.115, 0.026, 0.115, 0, 0.013, 0, shade));
  const mnShaft = shaft(0.05, 0.04, 0.6, marble);
  mnShaft.position.y = 0.026;
  mn.add(mnShaft);
  // slim grey-blue pilaster strips running the height of the shaft
  for (const [sx, sz] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const)
    mn.add(
      box(
        0.008 + 0.014 * Math.abs(sz),
        0.46,
        0.008 + 0.014 * Math.abs(sx),
        sx * 0.046,
        0.28,
        sz * 0.046,
        accent
      )
    );

  // muezzin's balcony
  mn.add(box(0.116, 0.014, 0.116, 0, 0.633, 0, shade));
  mn.add(box(0.106, 0.026, 0.106, 0, 0.653, 0, marble));
  mn.add(box(0.11, 0.005, 0.11, 0, 0.668, 0, accent));
  // upper stage, then the gold cap
  const mnUpper = shaft(0.036, 0.03, 0.135, marble);
  mnUpper.position.y = 0.671;
  mn.add(mnUpper);
  mn.add(box(0.02, 0.09, 0.012, 0, 0.716, 0.031, mat(TONES.ink)));
  mn.add(box(0.012, 0.09, 0.02, 0.031, 0.716, 0, mat(TONES.ink)));
  mn.add(box(0.084, 0.012, 0.084, 0, 0.812, 0, shade));

  const capPts = [
    [0.042, 0],
    [0.043, 0.012],
    [0.038, 0.03],
    [0.028, 0.046],
    [0.014, 0.058],
    [0.0001, 0.064],
  ].map(([r, y]) => new Vector2(r, y));
  const cap = new Mesh(new LatheGeometry(capPts, 12), gold);
  cap.position.y = 0.818;
  mn.add(cap);
  const mnSpike = new Mesh(new CylinderGeometry(0.002, 0.005, 0.048, 6), mat(GOLD_DK));
  mnSpike.position.y = 0.906;
  mn.add(mnSpike);

  return g;
}
