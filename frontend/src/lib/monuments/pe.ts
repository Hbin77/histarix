// Machu Picchu — papercraft Andean saddle: staggered green terraces with gray
// retaining walls climbing the front flank, roofless stone ruins (gabled
// walls, guardhouse, Intihuatana) on the plateau, and the steep sugarloaf of
// Huayna Picchu rising right behind, granite cliff faces showing through the
// green. Natural landform: no plaza disc — the site stands on its own
// cliff-edged terrain base.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const GRASS = "#9ab077"; // sunlit terrace grass
const GRASS_DEEP = TONES.forest; // mound / peak vegetation
const WALL = "#a49b89"; // granite retaining walls
const CLIFF = "#8f8778"; // sheer rock under the site / peak faces

const BASE_TOP = 0.075; // top of the green mound (terraces start here)
const STEP_WALL = 0.022; // retaining-wall height per terrace
const STEP_LIP = 0.012; // grass plate thickness per terrace
const STEP_H = STEP_WALL + STEP_LIP;
const RADII = [0.235, 0.198, 0.163, 0.13, 0.1]; // terrace radii, bottom→top
const STEP_ZSHIFT = -0.019; // each terrace slides back toward the peak

const RIDGE_Z = 0.095; // ridge pushed front, peak sits behind
const TOP_Y = BASE_TOP + RADII.length * STEP_H; // plateau surface
const PZ = RIDGE_Z + STEP_ZSHIFT * (RADII.length - 1); // plateau center z

/** Steep Huayna Picchu profile: radius at height y (summit 0.6). */
const PEAK_PROFILE: Array<[number, number]> = [
  [0.186, 0],
  [0.168, 0.05],
  [0.139, 0.14],
  [0.111, 0.235],
  [0.089, 0.32],
  [0.074, 0.4],
  [0.063, 0.46],
  [0.055, 0.51],
  [0.046, 0.55],
  [0.034, 0.578],
  [0.018, 0.594],
  [0.0001, 0.6],
];

function ruinBlock(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  ry: number,
  color: string
): Mesh {
  const m = new Mesh(new BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y + h / 2, z);
  m.rotation.y = ry;
  return m;
}

/** Roofless house wall with the iconic triangular stone gable. */
function gableWall(
  w: number,
  wallH: number,
  gableH: number,
  x: number,
  y: number,
  z: number,
  ry: number,
  color: string
): Mesh {
  const s = new Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(w / 2, wallH);
  s.lineTo(0, wallH + gableH);
  s.lineTo(-w / 2, wallH);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: 0.008, bevelEnabled: false });
  geo.translate(0, 0, -0.004);
  const m = new Mesh(geo, mat(color));
  m.position.set(x, y, z);
  m.rotation.y = ry;
  return m;
}

/** Terraced ridge (squashed to an ellipse by the caller). */
function buildRidge(): Group {
  const ridge = new Group();

  // Cliff skirt under the site
  const cliffPts = [
    new Vector2(0.295, 0),
    new Vector2(0.286, 0.012),
    new Vector2(0.272, 0.028),
    new Vector2(0.256, 0.042),
  ];
  ridge.add(new Mesh(new LatheGeometry(cliffPts, 18), mat(CLIFF)));

  // Green mound the terraces sit on
  const mound = new Mesh(
    new CylinderGeometry(0.242, 0.27, 0.048, 16),
    mat(GRASS_DEEP)
  );
  mound.position.y = BASE_TOP - 0.024;
  ridge.add(mound);

  // Stacked terraces: gray wall + overhanging grass lip, staggered backward
  // so the wide steps face the front (the classic terraced flank).
  for (let i = 0; i < RADII.length; i++) {
    const r = RADII[i];
    const y0 = BASE_TOP + i * STEP_H;
    const zOff = STEP_ZSHIFT * i;

    const wall = new Mesh(
      new CylinderGeometry(r, r + 0.016, STEP_WALL, 16, 1, true),
      mat(WALL)
    );
    wall.position.set(0, y0 + STEP_WALL / 2, zOff);
    ridge.add(wall);

    const lip = new Mesh(
      new CylinderGeometry(r + 0.01, r + 0.005, STEP_LIP, 16),
      mat(GRASS)
    );
    lip.position.set(0, y0 + STEP_WALL + STEP_LIP / 2, zOff);
    ridge.add(lip);
  }

  return ridge;
}

/** Huayna Picchu: steep green sugarloaf with granite cliff patches. */
function buildPeak(): Group {
  const peak = new Group();

  const profile = PEAK_PROFILE.map(([r, y]) => new Vector2(r, y));
  peak.add(new Mesh(new LatheGeometry(profile, 10), mat(GRASS_DEEP)));

  // Granite streaks breaking through the vegetation (partial lathe shells).
  const D2R = Math.PI / 180;
  const facePts = (i0: number, i1: number) =>
    PEAK_PROFILE.slice(i0, i1 + 1).map(([r, y]) => new Vector2(r + 0.004, y));
  // Sheer face toward the site (front-right of the summit).
  peak.add(
    new Mesh(
      new LatheGeometry(facePts(2, 6), 3, 62 * D2R, 46 * D2R),
      mat(CLIFF)
    )
  );
  // Narrower streak on the back shoulder.
  peak.add(
    new Mesh(
      new LatheGeometry(facePts(4, 7), 2, 172 * D2R, 34 * D2R),
      mat("#98907f")
    )
  );

  // Tiny summit terraces on the front face (Huayna Picchu's famous ledges).
  for (const [y, span, start] of [
    [0.452, 58, 58],
    [0.492, 46, 66],
  ] as const) {
    const r = 0.062 + (0.452 - y) * 0.18 + 0.006;
    const ledge = new Mesh(
      new LatheGeometry(
        [new Vector2(r, y), new Vector2(r + 0.004, y + 0.011)],
        3,
        start * D2R,
        span * D2R
      ),
      mat(WALL)
    );
    peak.add(ledge);
  }

  return peak;
}

export function build(): Group {
  const g = new Group();

  // --- Terraced ridge, squashed into an ellipse, pushed toward the front ---
  const ridge = buildRidge();
  ridge.scale.set(1.2, 1, 0.84);
  ridge.position.z = RIDGE_Z;
  g.add(ridge);

  // --- Huayna Picchu behind the saddle, offset for a diagonal composition ---
  const peak = buildPeak();
  peak.scale.set(1.12, 1, 0.82);
  peak.position.set(-0.055, 0, -0.19);
  peak.rotation.x = -0.05; // slight lean away from the site
  peak.rotation.z = 0.05;
  g.add(peak);

  // Huchuy Picchu: low soft-sloped hump at the saddle before the big peak.
  const huchuy = new Mesh(new ConeGeometry(0.135, 0.2, 9), mat("#748c63"));
  huchuy.position.set(0.172, 0.08, -0.15);
  huchuy.scale.z = 0.85;
  g.add(huchuy);

  // Far rounded shoulder merging into the massif.
  const backHump = new Mesh(new SphereGeometry(0.105, 8, 5), mat("#6f875f"));
  backHump.position.set(-0.2, 0.02, -0.245);
  backHump.scale.set(1, 1.3, 0.9);
  g.add(backHump);

  // --- Ruins on the plateau (world coords, centered on the plateau) ---
  // Western cluster with a gabled house.
  g.add(ruinBlock(0.05, 0.026, 0.03, -0.068, TOP_Y, PZ + 0.012, 0.15, TONES.stone));
  g.add(gableWall(0.034, 0.02, 0.014, -0.052, TOP_Y, PZ - 0.036, 1.35, TONES.stone));
  g.add(ruinBlock(0.036, 0.022, 0.024, -0.084, TOP_Y, PZ + 0.048, 0.35, TONES.stoneDark));

  // Eastern cluster (central grass plaza left open between the two).
  g.add(ruinBlock(0.046, 0.03, 0.028, 0.058, TOP_Y, PZ + 0.03, -0.1, TONES.stone));
  g.add(gableWall(0.038, 0.022, 0.016, 0.08, TOP_Y, PZ - 0.016, -1.75, TONES.stoneDark));
  g.add(ruinBlock(0.05, 0.022, 0.026, 0.044, TOP_Y, PZ - 0.052, 0.05, TONES.stone));

  // Long back wall closing the plateau toward the peak.
  g.add(ruinBlock(0.056, 0.024, 0.02, -0.006, TOP_Y, PZ - 0.07, 0.08, TONES.stone));

  // Outlying rooms widening the city footprint across the plateau.
  g.add(ruinBlock(0.03, 0.02, 0.022, -0.098, TOP_Y, PZ - 0.008, 0.6, TONES.stone));
  g.add(ruinBlock(0.03, 0.022, 0.02, 0.1, TOP_Y, PZ + 0.006, -0.45, TONES.stoneDark));

  // Thatched guardhouse at the front edge.
  g.add(ruinBlock(0.036, 0.024, 0.026, 0.014, TOP_Y, PZ + 0.076, 0, TONES.stone));
  const roof = new Mesh(new ConeGeometry(0.028, 0.024, 4), mat(TONES.sandDark));
  roof.position.set(0.014, TOP_Y + 0.024 + 0.012, PZ + 0.076);
  roof.rotation.y = Math.PI / 4;
  roof.scale.z = 0.8;
  g.add(roof);

  // Intihuatana: tiny stepped stone with its post.
  g.add(ruinBlock(0.03, 0.016, 0.03, 0.008, TOP_Y, PZ - 0.028, 0.1, TONES.stoneDark));
  g.add(ruinBlock(0.02, 0.013, 0.02, 0.008, TOP_Y + 0.016, PZ - 0.028, 0.1, TONES.stone));
  g.add(ruinBlock(0.007, 0.017, 0.007, 0.008, TOP_Y + 0.029, PZ - 0.028, 0.1, TONES.stone));

  // --- Blocks spilling onto the terrace one step down (urban sector edge) ---
  const lowY = BASE_TOP + 4 * STEP_H;
  const lowZ = RIDGE_Z + 4 * STEP_ZSHIFT * 0.55;
  g.add(gableWall(0.03, 0.018, 0.012, 0.062, lowY, lowZ + 0.098, 0.25, TONES.stone));
  g.add(ruinBlock(0.028, 0.02, 0.022, 0.128, lowY, lowZ + 0.04, -0.3, TONES.stoneDark));
  g.add(ruinBlock(0.026, 0.02, 0.02, -0.118, lowY, lowZ + 0.062, 0.4, TONES.stone));
  g.add(ruinBlock(0.026, 0.022, 0.02, 0.138, lowY, lowZ - 0.02, 0.1, TONES.stone));
  g.add(ruinBlock(0.024, 0.018, 0.02, -0.144, lowY, lowZ - 0.008, -0.2, TONES.stoneDark));

  return g;
}
