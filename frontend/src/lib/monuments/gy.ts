// Kaieteur Falls — papercraft landform: the sheer sandstone escarpment of the
// Potaro plateau, one wide ribbon of amber water dropping clean off the lip
// into the gorge, mist boiling at the foot, rainforest along the rim.
// Natural landform: no plaza disc, its own jungle-basin terrain instead.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
  SphereGeometry,
} from "three";
import { mat, TONES } from "./materials";

const R = 0.368; // terrain radius (footprint 0.736)
const BASIN = 0.055; // gorge floor height
const RIM = 0.47; // cliff top
const LIP = 0.5; // top of the pale sandstone lip
const CANOPY = 0.535; // top of the rim forest

const REC_HALF = 0.16; // amphitheatre half-width at the back wall
const REC_Z = -0.055; // amphitheatre back wall

const CLIFF = TONES.brickDark; // rust cliff face
const BAND = "#b8886a"; // lighter strata
const FOREST = "#6d8a5e"; // muted rainforest
const FOREST_DK = "#5a7a4e";
const AMBER = "#c3a468"; // tea-coloured Potaro
const FALL = "#f3f1ea"; // the falling sheet
const MIST_A = "#f1efe9";
const MIST_B = "#e6e3db";

/**
 * Escarpment slab: everything behind the cliff edge at z = frontZ, bounded by
 * the terrain circle, with a squared amphitheatre bitten back to z = recZ
 * between |x| <= REC_HALF. Occupies y0 → y1.
 */
function escarpment(
  radius: number,
  frontZ: number,
  recZ: number,
  recHalf: number,
  y0: number,
  y1: number,
  color: string
): Mesh {
  const xc = Math.sqrt(radius * radius - frontZ * frontZ);
  const a = Math.atan2(frontZ, xc);
  const flare = 0.15; // amphitheatre mouth splays wide open
  const s = new Shape();
  s.moveTo(xc, frontZ);
  s.lineTo(recHalf + flare, frontZ);
  s.lineTo(recHalf, recZ);
  s.lineTo(-recHalf, recZ);
  s.lineTo(-(recHalf + flare), frontZ);
  s.lineTo(-xc, frontZ);
  s.absarc(0, 0, radius, Math.PI - a, 2 * Math.PI + a, false);
  s.closePath();
  const geo = new ExtrudeGeometry(s, {
    depth: y1 - y0,
    bevelEnabled: false,
    curveSegments: 14,
  });
  geo.rotateX(Math.PI / 2);
  geo.translate(0, y1, 0);
  return new Mesh(geo, mat(color));
}

/** Flat slab from an XZ polygon, occupying y0 → y1. */
function slab(
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

/** Vertical water sheet: trapezoid in XY, slightly wider at the bottom. */
function sheet(
  halfTop: number,
  halfBot: number,
  yTop: number,
  yBot: number,
  depth: number,
  color: string
): Mesh {
  const s = new Shape();
  s.moveTo(-halfBot, yBot);
  s.lineTo(halfBot, yBot);
  s.lineTo(halfTop, yTop);
  s.lineTo(-halfTop, yTop);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth, bevelEnabled: false });
  return new Mesh(geo, mat(color));
}

function blob(
  r: number,
  x: number,
  y: number,
  z: number,
  squash: number,
  color: string
): Mesh {
  const m = new Mesh(new SphereGeometry(r, 6, 4), mat(color));
  m.position.set(x, y, z);
  m.scale.set(1, squash, 0.82);
  return m;
}

export function build(): Group {
  const g = new Group();
  // Swing the escarpment slightly off-axis so it keeps depth from every view.
  const land = new Group();
  land.rotation.y = 0.22;
  g.add(land);

  // ---- jungle basin the gorge sits in ----
  const basin = new Mesh(
    new CylinderGeometry(0.358, R, BASIN, 34),
    mat(FOREST)
  );
  basin.position.y = BASIN / 2;
  land.add(basin);

  // ---- cliff wall, battered back in three courses with strata bands ----
  land.add(escarpment(0.366, 0.076, -0.012, 0.205, 0.03, 0.125, FOREST_DK)); // talus apron
  land.add(escarpment(0.362, 0.03, REC_Z, REC_HALF, 0.09, RIM, CLIFF));
  // strata read as colour bands, not ledges — barely proud of the wall
  for (const y of [0.2, 0.315, 0.405]) {
    land.add(
      escarpment(0.3635, 0.0315, REC_Z + 0.0015, REC_HALF - 0.0015, y, y + 0.03, BAND)
    );
  }

  // ---- pale sandstone lip, then the forest set back from it ----
  land.add(escarpment(0.364, 0.032, REC_Z - 0.002, REC_HALF + 0.002, RIM, LIP, TONES.sand));
  land.add(escarpment(0.34, -0.012, REC_Z - 0.03, REC_HALF + 0.028, LIP - 0.01, CANOPY, FOREST));

  // canopy lumps breaking the rim silhouette
  for (const [x, z, r] of [
    [-0.27, -0.09, 0.045],
    [-0.16, -0.24, 0.038],
    [0.0, -0.3, 0.042],
    [0.19, -0.22, 0.036],
    [0.28, -0.07, 0.046],
    [-0.31, -0.2, 0.034],
  ] as const) {
    land.add(blob(r, x, CANOPY + r * 0.4, z, 0.66, FOREST_DK));
  }

  // ---- the Potaro sliding across the tabletop and going over the lip ----
  land.add(
    slab(
      [
        [0.095, -0.09],
        [0.052, -0.35],
        [-0.052, -0.35],
        [-0.095, -0.09],
      ],
      LIP - 0.015,
      CANOPY + 0.002,
      AMBER
    )
  );
  const crest = new Mesh(new BoxGeometry(0.192, 0.05, 0.07), mat(AMBER));
  crest.position.set(0, CANOPY - 0.023, -0.085);
  land.add(crest);

  // ---- the fall: one wide ribbon, faintly splaying as it drops ----
  const back = sheet(0.078, 0.096, 0.5, 0.1, 0.018, MIST_B);
  back.position.z = REC_Z + 0.002;
  land.add(back);
  const water = sheet(0.092, 0.112, 0.512, 0.08, 0.05, FALL);
  water.position.z = REC_Z + 0.016;
  land.add(water);

  // ---- plunge pool spreading into the gorge ----
  const pool = new Mesh(new CylinderGeometry(0.14, 0.14, 0.03, 22), mat(AMBER));
  pool.position.set(0, BASIN - 0.004, 0.07);
  pool.scale.z = 1.35;
  land.add(pool);

  // ---- mist: one broad low bank at the foot with a plume rising off it ----
  for (const [r, x, y, z, sq, c] of [
    [0.155, -0.035, 0.06, 0.045, 0.32, MIST_A],
    [0.13, 0.075, 0.058, 0.02, 0.34, MIST_B],
    [0.115, -0.02, 0.112, 0.0, 0.36, MIST_B],
    [0.086, 0.06, 0.145, -0.02, 0.36, MIST_A],
    [0.062, -0.03, 0.2, -0.025, 0.36, MIST_A],
  ] as const) {
    land.add(blob(r, x, y, z, sq, c));
  }

  // ---- jungle spurs + boulders on the gorge floor ----
  for (const [x, z, r] of [
    [-0.25, 0.16, 0.055],
    [0.27, 0.14, 0.048],
    [-0.06, 0.29, 0.042],
    [0.13, 0.28, 0.038],
  ] as const) {
    land.add(blob(r, x, BASIN + r * 0.3, z, 0.6, FOREST_DK));
  }
  for (const [x, z, s, ry] of [
    [-0.17, 0.19, 0.046, 0.6],
    [0.18, 0.2, 0.04, 1.2],
    [-0.02, 0.24, 0.034, 0.2],
  ] as const) {
    const b = new Mesh(new BoxGeometry(s, s * 0.65, s), mat(CLIFF));
    b.position.set(x, BASIN + s * 0.26, z);
    b.rotation.y = ry;
    land.add(b);
  }

  return g;
}
