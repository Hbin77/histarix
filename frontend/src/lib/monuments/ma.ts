// Hassan II Mosque, Casablanca — papercraft miniature. World's-tallest square
// minaret (green tile band + gold jamour finial) beside the long prayer hall
// with green pitched roof, all on a stone esplanade jutting into the Atlantic.

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

const SQ2 = Math.SQRT2;
const Y0 = 0.042; // esplanade deck level

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

/** Round-top arch panel (flat extrude), origin at bottom-center of the face. */
function archGeo(w: number, h: number, depth: number): ExtrudeGeometry {
  const r = w / 2;
  const s = new Shape();
  s.moveTo(-r, 0);
  s.lineTo(-r, h - r);
  s.absarc(0, h - r, r, Math.PI, 0, true);
  s.lineTo(r, 0);
  s.closePath();
  return new ExtrudeGeometry(s, {
    depth,
    bevelEnabled: false,
    curveSegments: 5,
  });
}

/** Square pyramid roof covering a square of half-side `a`. */
function pyramid(a: number, h: number, color: string): Mesh {
  const geo = new CylinderGeometry(0, a * SQ2, h, 4, 1);
  geo.rotateY(Math.PI / 4);
  const m = new Mesh(geo, mat(color));
  return m;
}

/** Gabled green roof: trapezoid extruded along X, ridge along X. */
function gableRoof(
  halfLen: number,
  halfDepth: number,
  h: number,
  color: string
): Mesh {
  const s = new Shape();
  s.moveTo(-halfDepth, 0);
  s.lineTo(halfDepth, 0);
  s.lineTo(0.14 * halfDepth, h);
  s.lineTo(-0.14 * halfDepth, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: halfLen * 2, bevelEnabled: false });
  geo.translate(0, 0, -halfLen);
  geo.rotateY(Math.PI / 2);
  return new Mesh(geo, mat(color));
}

export function build(): Group {
  const g = new Group();

  // ---- Atlantic: water disc the esplanade juts into ----
  const sea = new Mesh(
    new CylinderGeometry(0.36, 0.36, 0.012, 32),
    mat(TONES.water)
  );
  sea.position.y = 0.006;
  g.add(sea);

  // ---- stone esplanade platform (ocean-edge promontory) ----
  g.add(box(0.6, 0.03, 0.4, 0, 0.027, 0.01, TONES.stone));
  // thin lighter deck course on top
  g.add(box(0.56, 0.008, 0.36, 0, Y0 + 0.002, 0.01, TONES.white));
  // low white parapet along the platform edge
  for (const s of [1, -1]) {
    g.add(box(0.6, 0.016, 0.012, 0, Y0 + 0.008, 0.01 + s * 0.194, TONES.white));
    g.add(box(0.012, 0.016, 0.4, s * 0.294, Y0 + 0.008, 0.01, TONES.white));
  }

  // =========================== MINARET ===========================
  const MX = -0.17; // minaret center x
  const RELIEF = "#cfc2a4"; // subtle cream relief, barely darker than stone
  // plinth
  g.add(box(0.13, 0.05, 0.13, MX, Y0 + 0.025, 0, TONES.stoneDark));
  // main shaft
  g.add(box(0.1, 0.613, 0.1, MX, Y0 + 0.3065, 0, TONES.stone));
  // tall relief panel on each face + tile panel near top (verdigris)
  for (const s of [1, -1]) {
    g.add(box(0.054, 0.38, 0.006, MX, 0.29, s * 0.053, RELIEF));
    g.add(box(0.006, 0.38, 0.054, MX + s * 0.053, 0.29, 0, RELIEF));
    g.add(box(0.046, 0.08, 0.006, MX, 0.53, s * 0.053, TONES.verdigris));
    g.add(box(0.006, 0.08, 0.046, MX + s * 0.053, 0.53, 0, TONES.verdigris));
  }
  // green tiled band at the shaft top
  g.add(box(0.11, 0.045, 0.11, MX, 0.6, 0, TONES.verdigris));
  // white cornice
  g.add(box(0.122, 0.016, 0.122, MX, 0.663, 0, TONES.white));
  // lantern storey
  g.add(box(0.068, 0.095, 0.068, MX, 0.7185, 0, TONES.stone));
  g.add(box(0.074, 0.028, 0.074, MX, 0.744, 0, TONES.verdigris));
  g.add(box(0.082, 0.012, 0.082, MX, 0.772, 0, TONES.white));
  // green pyramid cap
  const cap = pyramid(0.041, 0.055, TONES.roofGreen);
  cap.position.set(MX, 0.8055, 0);
  g.add(cap);
  // gold jamour: rod + three diminishing spheres + tip
  const rod = new Mesh(
    new CylinderGeometry(0.0045, 0.0045, 0.07, 6),
    mat(TONES.gold)
  );
  rod.position.set(MX, 0.858, 0);
  g.add(rod);
  const goldMat = mat(TONES.gold);
  const orbs: Array<[number, number]> = [
    [0.016, 0.846],
    [0.0125, 0.876],
    [0.0095, 0.9],
  ];
  for (const [r, y] of orbs) {
    const orb = new Mesh(new SphereGeometry(r, 8, 6), goldMat);
    orb.position.set(MX, y, 0);
    g.add(orb);
  }
  const tip = new Mesh(new CylinderGeometry(0, 0.006, 0.022, 6), goldMat);
  tip.position.set(MX, 0.917, 0);
  g.add(tip);

  // ========================= PRAYER HALL =========================
  // main hall body (long axis X)
  g.add(box(0.32, 0.13, 0.19, 0.06, Y0 + 0.065, 0, TONES.stone));
  // link block between minaret and hall
  g.add(box(0.05, 0.09, 0.13, -0.125, Y0 + 0.045, 0, TONES.stone));
  // two-level arch rows on both long facades
  const arch = archGeo(0.032, 0.062, 0.006);
  const archSm = archGeo(0.018, 0.032, 0.006);
  const archMat = mat(TONES.stoneDark);
  for (const xo of [-0.125, -0.075, -0.025, 0.025, 0.075, 0.125]) {
    for (const s of [1, -1]) {
      const zo = s * 0.095 - (s === 1 ? 0 : 0.006);
      const a = new Mesh(arch, archMat);
      a.position.set(0.06 + xo, Y0 + 0.016, zo);
      g.add(a);
      const b = new Mesh(archSm, archMat);
      b.position.set(0.06 + xo, Y0 + 0.086, zo);
      g.add(b);
    }
  }
  // white eave course
  g.add(box(0.34, 0.014, 0.21, 0.06, Y0 + 0.137, 0, TONES.white));
  // green pitched roof + white ridge
  const roof = gableRoof(0.165, 0.105, 0.08, TONES.roofGreen);
  roof.position.set(0.06, Y0 + 0.144, 0);
  g.add(roof);
  g.add(box(0.3, 0.016, 0.026, 0.06, Y0 + 0.23, 0, TONES.white));

  // east low wing with hipped green roof
  g.add(box(0.08, 0.085, 0.15, 0.26, Y0 + 0.0425, 0, TONES.stone));
  const wingRoofGeo = new CylinderGeometry(0.35 * SQ2, SQ2, 1, 4, 1);
  wingRoofGeo.rotateY(Math.PI / 4);
  wingRoofGeo.translate(0, 0.5, 0);
  const wingRoof = new Mesh(wingRoofGeo, mat(TONES.roofGreen));
  wingRoof.scale.set(0.052, 0.045, 0.085);
  wingRoof.position.set(0.26, Y0 + 0.085, 0);
  g.add(wingRoof);

  // ---- courtyard corner pavilions (minaret side) ----
  for (const s of [1, -1]) {
    g.add(box(0.036, 0.07, 0.036, -0.26, Y0 + 0.035, s * 0.15, TONES.stone));
    const t = pyramid(0.024, 0.032, TONES.roofGreen);
    t.position.set(-0.26, Y0 + 0.086, s * 0.15);
    g.add(t);
  }

  return g;
}
