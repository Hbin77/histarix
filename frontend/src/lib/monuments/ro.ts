// Bran Castle ("Dracula's Castle") — papercraft: craggy rock outcrop with a
// forest skirt; white walls rising from the cliff — tall square spire tower
// with corner bartizan, round tower with steep cone, and a cluster of muted
// terracotta hip roofs stepping down to the east.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
} from "three";
import { mat, TONES } from "./materials";

const ROOF = "#a5503d"; // muted terracotta tile
const ROOF_DARK = "#8a4234";
const ROCK = "#9e9284"; // gray-brown crag
const ROCK_DARK = "#8b8072";

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
  b.position.set(x, y, z);
  return b;
}

/** Rectangular hipped pyramid roof: half-extents hx/hz, height h, base y=0. */
function hipRoof(hx: number, hz: number, h: number, m: MeshLambertMaterial): Mesh {
  const geo = new ConeGeometry(Math.SQRT2, 1, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, 0.5, 0);
  const r = new Mesh(geo, m);
  r.scale.set(hx, h, hz);
  return r;
}

export function build(): Group {
  const g = new Group();
  const white = mat(TONES.white);
  const roof = mat(ROOF);
  const roofDark = mat(ROOF_DARK);
  const ink = mat(TONES.ink);

  /** Small protruding ink window. */
  const win = (x: number, y: number, z: number, ry = 0): void => {
    const w = new Mesh(new BoxGeometry(0.017, 0.028, 0.008), ink);
    w.position.set(x, y, z);
    w.rotation.y = ry;
    g.add(w);
  };

  // ---- rocky outcrop: stacked faceted frustums, elliptical footprint ----
  const rock = (
    rT: number,
    rB: number,
    h: number,
    y: number,
    seg: number,
    sx: number,
    sz: number,
    rot: number,
    color: string
  ): Mesh => {
    const m = new Mesh(new CylinderGeometry(rT, rB, h, seg), mat(color));
    m.position.y = y;
    m.scale.set(sx, 1, sz);
    m.rotation.y = rot;
    g.add(m);
    return m;
  };
  rock(0.23, 0.33, 0.16, 0.08, 9, 1.05, 0.78, 0.3, ROCK_DARK);
  rock(0.18, 0.25, 0.16, 0.2, 8, 1.1, 0.68, 0.9, ROCK);
  rock(0.16, 0.2, 0.08, 0.28, 9, 1.18, 0.62, 0.15, ROCK);
  const knob = rock(0.05, 0.1, 0.14, 0.2, 6, 1, 0.9, 0.5, ROCK_DARK);
  knob.position.x = -0.21;
  knob.position.z = -0.08;

  // ---- forest skirt hugging the crag foot + scattered papercraft trees ----
  const skirt = new Mesh(
    new CylinderGeometry(0.32, 0.36, 0.055, 12),
    mat(TONES.forest)
  );
  skirt.position.y = 0.0275;
  skirt.scale.set(1.02, 1, 0.8);
  g.add(skirt);
  const treeMat = mat(TONES.forest);
  const treeDark = mat("#69815a");
  const trees: Array<[number, number, number, number, number]> = [
    [0.3, 0.05, 0.14, 0.034, 0.08],
    [0.2, 0.06, 0.2, 0.028, 0.07],
    [-0.05, 0.055, 0.22, 0.036, 0.09],
    [-0.24, 0.06, 0.16, 0.03, 0.075],
    [-0.31, 0.05, -0.02, 0.034, 0.085],
    [-0.2, 0.06, -0.18, 0.028, 0.07],
    [0.05, 0.055, -0.22, 0.034, 0.08],
    [0.27, 0.05, -0.15, 0.03, 0.075],
  ];
  trees.forEach(([x, y, z, r, h], i) => {
    const t = new Mesh(new ConeGeometry(r, h, 6), i % 3 === 0 ? treeDark : treeMat);
    t.position.set(x, y, z);
    g.add(t);
  });

  const Y0 = 0.315; // castle floor (sinks slightly into the plateau)

  // ---- round tower (west) with tall, steep cone roof ----
  const rt = new Mesh(new CylinderGeometry(0.05, 0.058, 0.3, 10), white);
  rt.position.set(-0.15, Y0 + 0.15, 0.015);
  g.add(rt);
  const rtEave = new Mesh(new CylinderGeometry(0.064, 0.064, 0.016, 10), roofDark);
  rtEave.position.set(-0.15, Y0 + 0.305, 0.015);
  g.add(rtEave);
  const rtCone = new Mesh(new ConeGeometry(0.07, 0.25, 10), roof);
  rtCone.position.set(-0.15, Y0 + 0.438, 0.015);
  g.add(rtCone);

  // ---- connecting wing between round tower and keep ----
  g.add(box(0.13, 0.19, 0.11, -0.07, Y0 + 0.095, 0.005, white));
  const wingRoof = hipRoof(0.078, 0.07, 0.075, roof);
  wingRoof.position.set(-0.07, Y0 + 0.19, 0.005);
  g.add(wingRoof);

  // ---- main keep: white block, steep hipped roof ----
  g.add(box(0.14, 0.3, 0.14, 0.04, Y0 + 0.15, -0.005, white));
  const keepRoof = hipRoof(0.085, 0.085, 0.17, roof);
  keepRoof.position.set(0.04, Y0 + 0.3, -0.005);
  g.add(keepRoof);
  // dormer on the keep's front slope (in the gap between turret and spire)
  g.add(box(0.032, 0.034, 0.034, 0.035, Y0 + 0.322, 0.068, white));
  const keepDormer = hipRoof(0.021, 0.024, 0.032, roofDark);
  keepDormer.position.set(0.035, Y0 + 0.339, 0.069);
  g.add(keepDormer);

  // ---- tall square spire tower rising out of the keep (tallest point) ----
  g.add(box(0.066, 0.42, 0.066, 0.085, 0.6, -0.03, white));
  g.add(box(0.086, 0.02, 0.086, 0.085, 0.82, -0.03, roofDark));
  const spireGeo = new ConeGeometry(Math.SQRT2, 1, 4, 1);
  spireGeo.rotateY(Math.PI / 4);
  spireGeo.translate(0, 0.5, 0);
  const spire = new Mesh(spireGeo, roof);
  spire.scale.set(0.048, 0.14, 0.048);
  spire.position.set(0.085, 0.83, -0.03);
  g.add(spire);
  const finial = new Mesh(new ConeGeometry(0.006, 0.05, 6), roofDark);
  finial.position.set(0.085, 0.965, -0.03);
  g.add(finial);
  // corner bartizan clinging below the spire eave (Bran signature)
  const bart = new Mesh(new CylinderGeometry(0.016, 0.012, 0.08, 7), white);
  bart.position.set(0.121, 0.775, 0.005);
  g.add(bart);
  const bartCone = new Mesh(new ConeGeometry(0.022, 0.055, 7), roofDark);
  bartCone.position.set(0.121, 0.843, 0.005);
  g.add(bartCone);

  // ---- east wings: staggered masses, red hips stepping down ----
  g.add(box(0.12, 0.24, 0.15, 0.15, Y0 + 0.12, -0.015, white));
  const eastA = hipRoof(0.075, 0.09, 0.095, roof);
  eastA.position.set(0.15, Y0 + 0.24, -0.015);
  g.add(eastA);
  g.add(box(0.1, 0.17, 0.12, 0.2, Y0 + 0.085, 0.07, white));
  const eastB = hipRoof(0.063, 0.073, 0.075, roofDark);
  eastB.position.set(0.2, Y0 + 0.17, 0.07);
  g.add(eastB);
  // dormer on east wing A's front slope
  g.add(box(0.028, 0.03, 0.03, 0.155, Y0 + 0.262, 0.062, white));
  const eastDormer = hipRoof(0.018, 0.021, 0.028, roofDark);
  eastDormer.position.set(0.155, Y0 + 0.277, 0.063);
  g.add(eastDormer);
  // chimney on east A ridge
  g.add(box(0.02, 0.05, 0.02, 0.13, Y0 + 0.3, -0.05, white));
  g.add(box(0.026, 0.012, 0.026, 0.13, Y0 + 0.328, -0.05, ink));

  // ---- round bartizan on the east outer corner ----
  const eb = new Mesh(new CylinderGeometry(0.021, 0.016, 0.11, 8), white);
  eb.position.set(0.245, Y0 + 0.14, 0.115);
  g.add(eb);
  const ebCone = new Mesh(new ConeGeometry(0.028, 0.06, 8), roof);
  ebCone.position.set(0.245, Y0 + 0.225, 0.115);
  g.add(ebCone);

  // ---- small stair turret on the keep's front face ----
  const tu = new Mesh(new CylinderGeometry(0.024, 0.024, 0.2, 8), white);
  tu.position.set(-0.005, 0.52, 0.075);
  g.add(tu);
  const tuCone = new Mesh(new ConeGeometry(0.033, 0.1, 8), roofDark);
  tuCone.position.set(-0.005, 0.67, 0.075);
  g.add(tuCone);

  // ---- low parapet walls along the cliff edges (courtyard rim) ----
  g.add(box(0.18, 0.05, 0.016, -0.02, Y0 + 0.025, 0.1, white));
  g.add(box(0.34, 0.05, 0.016, 0.02, Y0 + 0.025, -0.1, white));

  // ---- windows: dark punches on the white faces ----
  win(0.01, 0.5, 0.066);
  win(0.07, 0.5, 0.066);
  win(0.01, 0.57, 0.066);
  win(-0.15, 0.5, 0.08);
  win(-0.15, 0.42, 0.08);
  win(-0.07, 0.44, 0.062);
  win(0.14, 0.47, 0.062);
  win(0.19, 0.47, 0.062);
  win(0.165, 0.53, 0.062);
  win(0.212, 0.46, 0.02, Math.PI / 2);
  win(0.212, 0.46, -0.05, Math.PI / 2);
  win(0.085, 0.73, 0.001);
  win(0.085, 0.66, 0.001);
  win(0.117, 0.7, -0.03, Math.PI / 2);

  return g;
}
