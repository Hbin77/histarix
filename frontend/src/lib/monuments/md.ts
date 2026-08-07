// Orheiul Vechi — papercraft landform: the Răut swinging round a limestone
// promontory, chalky strata banding the cliff, the cave monastery's mouths
// beneath a tiny white bell tower on the rim, terraced fields rolling away.
// Natural landform: terrain base, no plaza disc.
//
// The ridge and river are arcs struck from a centre well behind the tile
// (CZ), so they cross the terrain as gentle curves rather than ringing it.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Path,
  Shape,
  SphereGeometry,
} from "three";
import { mat, TONES } from "./materials";

const D2R = Math.PI / 180;

const FIELD = "#a3ad7c"; // near-bank meadows inside the bend
const CROP = "#b9b283"; // ochre stubble patches
const PLATEAU = "#8b9c65"; // grassed ridge top
const TERRACE = "#94a46d";
const ROCK = "#c8bca2"; // limestone cliff
const CHALK = "#e7e1d2"; // chalky white stratum
const RIVER = "#7d99b4"; // slate-blue Răut
const CAVE = "#6b6252";

const GROUND = 0.024;
const R_TILE = 0.372; // terrain radius (footprint 0.744)
const CZ = -0.5; // arc centre, pushed behind the tile
const CLIFF_TOP = 0.33;

/**
 * Annular sector struck from (0, CZ), as a Shape in extrude space. Shape
 * coords map to the world as (sx, sy) → (x, −z), so the centre sits at
 * sy = −CZ and world half-angle α about +Z becomes shape angle α − π/2.
 */
function bandShape(rIn: number, rOut: number, aHalf: number): Shape {
  const th0 = -Math.PI / 2 - aHalf;
  const th1 = -Math.PI / 2 + aHalf;
  const s = new Shape();
  s.absarc(0, -CZ, rOut, th0, th1, false);
  s.absarc(0, -CZ, rIn, th1, th0, true);
  s.closePath();
  return s;
}

/** The same sector as a solid slab rising from y0 to y0 + h. */
function band(
  rIn: number,
  rOut: number,
  aHalf: number,
  y0: number,
  h: number,
  m: MeshLambertMaterial
): Mesh {
  const geo = new ExtrudeGeometry(bandShape(rIn, rOut, aHalf), {
    depth: h,
    bevelEnabled: false,
    curveSegments: 7,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, y0, 0);
  return new Mesh(geo, m);
}

/** World position on the arc at radius r, half-angle a (radians about +Z). */
function onArc(r: number, a: number): [number, number] {
  return [r * Math.sin(a), CZ + r * Math.cos(a)];
}

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

/** The cave monastery's bell tower: white, square, small cupola and cross. */
function bellTower(): Group {
  const g = new Group();
  const white = mat(TONES.white);
  const roof = mat("#9aa3ae");

  g.add(box(0.046, 0.012, 0.046, 0, 0, 0, white));
  g.add(box(0.038, 0.056, 0.038, 0, 0.012, 0, white));
  g.add(box(0.015, 0.022, 0.005, 0, 0.038, 0.0195, mat(CAVE)));
  g.add(box(0.044, 0.008, 0.044, 0, 0.068, 0, roof));
  g.add(box(0.03, 0.028, 0.03, 0, 0.076, 0, white));

  const cupola = new Mesh(
    new SphereGeometry(0.018, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2),
    roof
  );
  cupola.position.y = 0.104;
  g.add(cupola);
  const spirelet = new Mesh(new ConeGeometry(0.009, 0.018, 6), roof);
  spirelet.position.y = 0.121;
  g.add(spirelet);
  const gold = mat(TONES.gold);
  g.add(box(0.003, 0.018, 0.003, 0, 0.129, 0, gold));
  g.add(box(0.012, 0.003, 0.003, 0, 0.137, 0, gold));
  return g;
}

export function build(): Group {
  const g = new Group();

  // ---- Terrain tile with the river channel carved out ----
  const land = new Shape();
  land.absarc(0, 0, R_TILE, 0, Math.PI * 2, false);
  const channel = bandShape(0.494, 0.556, 40 * D2R);
  const hole = new Path();
  hole.setFromPoints(channel.getPoints(22));
  land.holes.push(hole);
  const landGeo = new ExtrudeGeometry(land, {
    depth: GROUND,
    bevelEnabled: false,
    curveSegments: 16,
  });
  landGeo.rotateX(-Math.PI / 2);
  g.add(new Mesh(landGeo, mat(FIELD)));

  // ---- The Răut, sitting a little below its banks ----
  g.add(band(0.494, 0.556, 40 * D2R, 0, 0.016, mat(RIVER)));

  // ---- Ridge: limestone cliff facing the bend, grassed terraces behind ----
  g.add(band(0.2, 0.272, 40 * D2R, 0, 0.11, mat(TERRACE)));
  g.add(band(0.26, 0.318, 43 * D2R, 0, 0.235, mat(TERRACE)));
  g.add(band(0.3, 0.428, 44 * D2R, 0, 0.345, mat(PLATEAU)));
  g.add(band(0.4, 0.468, 44 * D2R, 0, CLIFF_TOP, mat(ROCK)));
  // scree fanning out from the cliff foot down to the water's edge
  g.add(band(0.462, 0.482, 43 * D2R, 0, 0.082, mat("#b1a68e")));
  g.add(band(0.476, 0.494, 42 * D2R, 0, 0.04, mat("#bdb298")));

  // chalky strata standing proud of the cliff face
  g.add(band(0.455, 0.474, 42 * D2R, 0.208, 0.062, mat(CHALK)));
  g.add(band(0.452, 0.472, 36 * D2R, 0.098, 0.036, mat(CHALK)));
  g.add(band(0.457, 0.473, 39 * D2R, 0.288, 0.03, mat("#d9d1bd")));

  // ---- Cave mouths of the rock monastery ----
  const cave = mat(CAVE);
  for (const [deg, y, w] of [
    [-26, 0.222, 0.03],
    [-11, 0.236, 0.024],
    [10, 0.226, 0.028],
    [24, 0.238, 0.022],
  ] as const) {
    const a = deg * D2R;
    const [x, z] = onArc(0.469, a);
    const c = box(w, 0.034, 0.014, x, y, z, cave);
    c.rotation.y = a;
    g.add(c);
  }

  // ---- Bell tower and chapel on the rock shelf at the cliff edge ----
  const TOWER_A = 7 * D2R;
  const [tx, tz] = onArc(0.448, TOWER_A);
  const tower = bellTower();
  tower.position.set(tx, CLIFF_TOP, tz);
  tower.rotation.y = TOWER_A;
  g.add(tower);

  const CHAPEL_A = -15 * D2R;
  const [cx, cz] = onArc(0.45, CHAPEL_A);
  const chapel = new Group();
  chapel.position.set(cx, CLIFF_TOP, cz);
  chapel.rotation.y = CHAPEL_A;
  chapel.add(box(0.054, 0.032, 0.034, 0, 0, 0, mat(TONES.white)));
  const gable = new Mesh(new ConeGeometry(0.033, 0.02, 4), mat("#9aa3ae"));
  gable.rotation.y = Math.PI / 4;
  gable.position.y = 0.042;
  chapel.add(gable);
  g.add(chapel);

  // ---- Ochre stubble patches on the meadows inside the bend ----
  const crop = mat(CROP);
  for (const [x, z, rx, rz, rot] of [
    [-0.12, 0.19, 0.11, 0.06, 0.3],
    [0.14, 0.16, 0.09, 0.05, -0.4],
    [0.01, 0.29, 0.08, 0.04, 0.1],
  ] as const) {
    const patch = new Mesh(new CylinderGeometry(1, 1, 0.004, 10), crop);
    patch.scale.set(rx, 1, rz);
    patch.position.set(x, GROUND + 0.002, z);
    patch.rotation.y = rot;
    g.add(patch);
  }

  // ---- Trees: a line along the plateau, scattered clumps on the near bank ----
  const trunk = mat("#8b7a5e");
  const leaf = mat(TONES.forest);
  const tree = (x: number, y: number, z: number, s: number) => {
    const t = new Group();
    t.position.set(x, y, z);
    const stem = new Mesh(new CylinderGeometry(0.0035, 0.005, 0.02 * s, 4), trunk);
    stem.position.y = 0.01 * s;
    t.add(stem);
    const crown = new Mesh(new ConeGeometry(0.019 * s, 0.046 * s, 5), leaf);
    crown.position.y = 0.042 * s;
    t.add(crown);
    g.add(t);
  };
  for (const [deg, s] of [[-36, 0.9], [-24, 1.05], [30, 0.95], [40, 0.85]] as const) {
    const [x, z] = onArc(0.41, deg * D2R);
    tree(x, 0.345, z, s);
  }
  tree(0.06, GROUND, 0.1, 0.9);
  tree(-0.05, GROUND, 0.08, 0.75);
  tree(0.25, GROUND, 0.16, 0.85);
  tree(-0.26, GROUND, 0.13, 0.8);
  tree(-0.02, GROUND, 0.34, 0.7);

  return g;
}
