// Leptis Magna — papercraft ruin field: the four-way Arch of Septimius
// Severus (a squat block pierced on every face, capped by its broken
// pediments) standing among the surviving colonnade and fallen drums.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Path,
  Shape,
  TorusGeometry,
} from "three";
import { mat, plazaDisc } from "./materials";

const LIME = "#d2c3a0"; // weathered cream limestone
const LIME_DK = "#a89a78"; // cornices, pilasters, fallen stone
const SAND = "#e7dabb"; // pale desert sand
const SHADOW = "#776b56"; // arch soffit / deep openings

const HALF = 0.15; // arch block outer half-width
const WALL_T = 0.072; // face-wall thickness
const WALL_H = 0.25; // wall height to the first cornice
const SPRING = 0.115; // arch springing height
const OPEN = 0.078; // arch opening half-width

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

/** One face of the tetrapylon: a wall with a round-headed arch cut through. */
function archWall(m: MeshLambertMaterial): Mesh {
  const s = new Shape();
  s.moveTo(-HALF, 0);
  s.lineTo(HALF, 0);
  s.lineTo(HALF, WALL_H);
  s.lineTo(-HALF, WALL_H);
  s.closePath();

  const hole = new Path();
  hole.moveTo(-OPEN, 0);
  hole.lineTo(-OPEN, SPRING);
  hole.absarc(0, SPRING, OPEN, Math.PI, 0, true);
  hole.lineTo(OPEN, 0);
  hole.closePath();
  s.holes.push(hole);

  const geo = new ExtrudeGeometry(s, {
    depth: WALL_T,
    bevelEnabled: false,
    curveSegments: 8,
  });
  geo.translate(0, 0, -WALL_T / 2);
  return new Mesh(geo, m);
}

/**
 * Broken pediment: a solid tympanum whose apex is cut away, leaving two
 * rakes climbing toward a crown that never closes.
 */
function brokenPediment(
  hw: number,
  gap: number,
  h: number,
  notch: number,
  depth: number,
  m: MeshLambertMaterial
): Mesh {
  const rake = h * (1 - gap / hw); // rake height where the break starts
  const s = new Shape();
  s.moveTo(-hw, 0);
  s.lineTo(hw, 0);
  s.lineTo(gap, rake);
  s.lineTo(gap, rake - notch);
  s.lineTo(-gap, rake - notch);
  s.lineTo(-gap, rake);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth, bevelEnabled: false });
  geo.translate(0, 0, -depth / 2);
  return new Mesh(geo, m);
}

/** Free-standing colonnade shaft, snapped off at `h`. */
function column(h: number, m: MeshLambertMaterial, capital: boolean): Group {
  const g = new Group();
  const base = new Mesh(new CylinderGeometry(0.021, 0.024, 0.014, 6), m);
  base.position.y = 0.007;
  g.add(base);
  const shaft = new Mesh(new CylinderGeometry(0.0145, 0.017, h, 7), m);
  shaft.position.y = 0.014 + h / 2;
  g.add(shaft);
  if (capital) {
    const cap = new Mesh(new CylinderGeometry(0.024, 0.016, 0.022, 6), m);
    cap.position.y = 0.014 + h + 0.011;
    g.add(cap);
    const aba = new Mesh(new BoxGeometry(0.05, 0.01, 0.05), m);
    aba.position.y = 0.014 + h + 0.027;
    g.add(aba);
  }
  return g;
}

export function build(): Group {
  const g = new Group();
  const lime = mat(LIME);
  const limeDk = mat(LIME_DK);
  const shadow = mat(SHADOW);

  g.add(plazaDisc(0.37));
  const sand = new Mesh(new CylinderGeometry(0.365, 0.365, 0.018, 26), mat(SAND));
  sand.position.y = 0.019;
  g.add(sand);
  const GROUND = 0.028;

  // ---- Stepped podium under the arch ----
  g.add(box(0.352, 0.016, 0.352, 0, GROUND, 0, limeDk));
  g.add(box(0.322, 0.016, 0.322, 0, GROUND + 0.016, 0, lime));
  const BASE = GROUND + 0.032;

  // ---- The block: four pierced walls interlocking at the corners ----
  const core = new Group();
  core.position.y = BASE;
  g.add(core);

  // dark inner shell so the crossing vaults read as depth, not daylight
  const inner = new Mesh(
    new CylinderGeometry(0.072 * Math.SQRT2, 0.072 * Math.SQRT2, WALL_H, 4, 1),
    shadow
  );
  inner.rotation.y = Math.PI / 4;
  inner.position.y = WALL_H / 2;
  core.add(inner);

  const archivolt = new TorusGeometry(OPEN + 0.009, 0.011, 4, 10, Math.PI);
  for (let i = 0; i < 4; i++) {
    const face = new Group();
    face.rotation.y = (i * Math.PI) / 2;
    core.add(face);

    const w = archWall(lime);
    w.position.z = HALF - WALL_T / 2;
    face.add(w);

    const ring = new Mesh(archivolt, limeDk);
    ring.position.set(0, SPRING, HALF + 0.002);
    face.add(ring);

    // keystone over the crown
    face.add(box(0.03, 0.036, 0.014, 0, SPRING + OPEN - 0.008, HALF + 0.005, limeDk));
    // impost band the arch springs from, running across the piers
    face.add(box(0.29, 0.012, 0.009, 0, SPRING - 0.006, HALF + 0.003, limeDk));
  }

  // pilaster strips on the corner piers
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
    core.add(box(0.03, WALL_H, 0.014, sx * 0.113, 0, sz * (HALF + 0.005), limeDk));
    core.add(box(0.014, WALL_H, 0.03, sx * (HALF + 0.005), 0, sz * 0.113, limeDk));
  }

  // ---- Cornice, attic storey with relief panels, upper cornice ----
  let y = BASE + WALL_H;
  g.add(box(0.34, 0.018, 0.34, 0, y, 0, limeDk));
  y += 0.018;
  g.add(box(0.31, 0.012, 0.31, 0, y, 0, lime));
  y += 0.012;
  const ATTIC_H = 0.082;
  g.add(box(0.285, ATTIC_H, 0.285, 0, y, 0, lime));
  for (let i = 0; i < 4; i++) {
    const face = new Group();
    face.rotation.y = (i * Math.PI) / 2;
    g.add(face);
    // recessed field with a carved procession standing proud inside it
    face.add(box(0.2, 0.058, 0.006, 0, y + 0.012, 0.1405, limeDk));
    for (const fx of [-0.072, -0.024, 0.024, 0.072]) {
      face.add(box(0.028, 0.05, 0.012, fx, y + 0.016, 0.1435, lime));
    }
  }
  y += ATTIC_H;
  g.add(box(0.312, 0.018, 0.312, 0, y, 0, limeDk));
  y += 0.018;

  // ---- Broken pediments: every face carries a raking cornice split at the
  //      crown, the arch's signature. One rake has weathered away. ----
  const PED_Y = y;
  for (let i = 0; i < 4; i++) {
    const face = new Group();
    face.rotation.y = (i * Math.PI) / 2;
    face.position.y = PED_Y;
    g.add(face);
    const p = brokenPediment(0.142, 0.03, 0.08, 0.046, 0.046, lime);
    p.position.z = 0.119;
    face.add(p);
  }
  // central plinth the crowning statue group once stood on
  g.add(box(0.06, 0.038, 0.06, 0, PED_Y, 0, limeDk));
  // the fallen rake, lying askew on the attic cornice
  const stub = box(0.07, 0.016, 0.03, 0.062, PED_Y, -0.122, limeDk);
  stub.rotation.y = 0.55;
  g.add(stub);

  // ---- Surviving colonnade flanking the arch, snapped to varied heights ----
  const COLUMNS: Array<[number, number, number, boolean]> = [
    [-0.29, -0.215, 0.235, true],
    [-0.298, -0.02, 0.235, true],
    [-0.288, 0.185, 0.14, false],
    [0.29, -0.185, 0.19, false],
    [0.298, 0.015, 0.245, true],
    [0.288, 0.215, 0.235, true],
  ];
  for (const [x, z, h, cap] of COLUMNS) {
    const c = column(h, cap ? lime : limeDk, cap);
    c.position.set(x, GROUND, z);
    g.add(c);
  }
  // the one stretch of architrave still riding a pair of standing columns
  g.add(box(0.034, 0.02, 0.215, -0.294, GROUND + 0.286, -0.118, limeDk));
  g.add(box(0.034, 0.02, 0.215, 0.293, GROUND + 0.296, 0.115, limeDk));

  // ---- Fallen drums scattered on the sand ----
  const RUBBLE: Array<[number, number, number, number]> = [
    [-0.13, 0.3, 0.03, 0.4],
    [0.15, 0.31, 0.026, 1.1],
    [0.33, -0.005, 0.028, 0.2],
    [-0.32, 0.005, 0.024, 0.9],
    [0.04, -0.31, 0.03, 0.6],
    [-0.1, -0.3, 0.022, 1.4],
  ];
  for (const [x, z, r, rot] of RUBBLE) {
    const drum = new Mesh(new CylinderGeometry(r, r, 0.022, 6), limeDk);
    drum.position.set(x, GROUND + 0.011, z);
    drum.rotation.set(Math.PI / 2, 0, rot);
    g.add(drum);
  }

  return g;
}
