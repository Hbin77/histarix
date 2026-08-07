// Catedral de León — papercraft: a wide, low chalk-white baroque facade
// between two squat paired bell towers, its parapet lined with statues and
// the great flat roof behind studded with a procession of little white
// domes and cupolas.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const CHALK = "#f8f5ed"; // limewashed white
const CREAM = "#ece5d4"; // pale cream trim
const GREY = "#d3d6d4"; // soft grey cornices
const STEP = "#dcd7ca";

const BODY_Y = 0.045; // top of the platform steps
const BODY_H = 0.245; // nave block height
const CORNICE_Y = BODY_Y + BODY_H;
const NAVE_W = 0.56;
const NAVE_D = 0.28;
const TOWER_X = 0.255;
const FRONT = NAVE_D / 2; // facade plane

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

/** Little white cupola: drum, hemisphere and lantern, base at local y = 0. */
function cupola(
  r: number,
  drumH: number,
  lantern: boolean,
  m: MeshLambertMaterial
): Group {
  const g = new Group();
  const drum = new Mesh(new CylinderGeometry(r, r * 1.06, drumH, 10), m);
  drum.position.y = drumH / 2;
  g.add(drum);
  const dome = new Mesh(
    new SphereGeometry(r * 1.05, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2),
    m
  );
  dome.scale.y = 0.82;
  dome.position.y = drumH;
  g.add(dome);
  if (lantern) {
    const lant = new Mesh(new CylinderGeometry(r * 0.3, r * 0.34, r * 0.5, 8), m);
    lant.position.y = drumH + r * 0.9;
    g.add(lant);
    const knob = new Mesh(new SphereGeometry(r * 0.2, 6, 4), m);
    knob.position.y = drumH + r * 1.24;
    g.add(knob);
  }
  return g;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.36));

  const chalk = mat(CHALK);
  const cream = mat(CREAM);
  const grey = mat(GREY);
  const dark = mat(TONES.ink);

  // ---- platform steps ----
  g.add(box(0.7, 0.024, 0.34, 0, 0.018, 0, mat(STEP)));
  g.add(box(0.66, 0.022, 0.31, 0, 0.041, 0, grey));

  // ---- nave block ----
  g.add(box(NAVE_W, BODY_H, NAVE_D, 0, BODY_Y + BODY_H / 2, 0, chalk));
  g.add(box(NAVE_W + 0.022, 0.022, NAVE_D + 0.022, 0, CORNICE_Y + 0.011, 0, grey));
  // storey band across the facade
  g.add(box(NAVE_W + 0.004, 0.014, NAVE_D + 0.004, 0, BODY_Y + 0.14, 0, cream));

  // pilaster rhythm across the front and the flanks
  for (const x of [-0.185, -0.11, -0.038, 0.038, 0.11, 0.185]) {
    g.add(box(0.018, BODY_H - 0.02, 0.014, x, BODY_Y + BODY_H / 2 - 0.01, FRONT, cream));
  }
  for (const z of [-0.09, 0.02]) {
    for (const sx of [-1, 1])
      g.add(
        box(0.014, BODY_H - 0.02, 0.018, sx * (NAVE_W / 2), BODY_Y + BODY_H / 2 - 0.01, z, cream)
      );
  }

  // ---- central projecting bay ----
  const BAY_W = 0.215;
  const BAY_H = BODY_H + 0.055;
  const BAY_Z = FRONT + 0.028;
  g.add(box(BAY_W, BAY_H, 0.058, 0, BODY_Y + BAY_H / 2, BAY_Z, chalk));
  g.add(box(BAY_W + 0.022, 0.02, 0.074, 0, BODY_Y + BAY_H + 0.01, BAY_Z, grey));
  for (const x of [-0.088, 0.088])
    g.add(box(0.02, BAY_H - 0.03, 0.014, x, BODY_Y + BAY_H / 2 - 0.015, BAY_Z + 0.03, cream));

  // portals: a tall central arch flanked by two lower doors
  g.add(box(0.07, 0.125, 0.018, 0, BODY_Y + 0.062, BAY_Z + 0.03, dark));
  for (const x of [-0.115, 0.115])
    g.add(box(0.055, 0.095, 0.016, x, BODY_Y + 0.047, FRONT + 0.006, dark));
  for (const x of [-0.115, 0.115])
    g.add(box(0.073, 0.014, 0.02, x, BODY_Y + 0.102, FRONT + 0.008, cream));

  // oculus and flanking niches over the main door
  const oculus = new Mesh(new CylinderGeometry(0.028, 0.028, 0.016, 12), dark);
  oculus.rotation.x = Math.PI / 2;
  oculus.position.set(0, BODY_Y + 0.178, BAY_Z + 0.029);
  g.add(oculus);
  for (const x of [-0.072, 0.072])
    g.add(box(0.032, 0.054, 0.014, x, BODY_Y + 0.176, BAY_Z + 0.029, cream));

  // scrolled crest with a saint, crowning the bay
  g.add(box(0.14, 0.032, 0.052, 0, BODY_Y + BAY_H + 0.036, BAY_Z, chalk));
  g.add(box(0.078, 0.028, 0.046, 0, BODY_Y + BAY_H + 0.066, BAY_Z, cream));
  const saint = new Mesh(new CylinderGeometry(0.009, 0.012, 0.044, 6), chalk);
  saint.position.set(0, BODY_Y + BAY_H + 0.102, BAY_Z);
  g.add(saint);

  // ---- parapet balustrade with its row of statues ----
  g.add(box(NAVE_W, 0.03, 0.022, 0, CORNICE_Y + 0.037, FRONT - 0.006, cream));
  const statueGeo = new CylinderGeometry(0.008, 0.011, 0.04, 6);
  for (const x of [-0.19, -0.12, -0.048, 0.048, 0.12, 0.19]) {
    const st = new Mesh(statueGeo, chalk);
    st.position.set(x, CORNICE_Y + 0.072, FRONT - 0.006);
    g.add(st);
  }

  // ---- paired bell towers ----
  for (const sx of [-1, 1]) {
    const t = new Group();
    t.position.set(sx * TOWER_X, 0, 0);
    g.add(t);

    const TB_H = 0.29;
    t.add(box(0.132, TB_H, 0.2, 0, BODY_Y + TB_H / 2, 0, chalk));
    for (const cz of [-0.1, 0.1])
      t.add(box(0.016, TB_H - 0.02, 0.014, sx * 0.056, BODY_Y + TB_H / 2 - 0.01, cz, cream));
    t.add(box(0.148, 0.02, 0.216, 0, BODY_Y + TB_H + 0.01, 0, grey));

    // belfry stage, open arches on every face
    const BELF_Y = BODY_Y + TB_H + 0.02;
    t.add(box(0.108, 0.085, 0.16, 0, BELF_Y + 0.0425, 0, chalk));
    t.add(box(0.046, 0.062, 0.014, 0, BELF_Y + 0.031, 0.08, dark));
    t.add(box(0.046, 0.062, 0.014, 0, BELF_Y + 0.031, -0.08, dark));
    t.add(box(0.014, 0.062, 0.056, sx * 0.054, BELF_Y + 0.031, 0, dark));
    for (const cx of [-0.054, 0.054])
      for (const cz of [-0.08, 0.08])
        t.add(box(0.018, 0.085, 0.018, cx, BELF_Y + 0.0425, cz, cream));
    t.add(box(0.128, 0.016, 0.18, 0, BELF_Y + 0.093, 0, grey));

    const cap = cupola(0.052, 0.028, true, chalk);
    cap.position.y = BELF_Y + 0.101;
    t.add(cap);
  }

  // ---- the roof: a field of little white domes ----
  const roofDomes: Array<[number, number, number]> = [
    [-0.155, -0.07, 0.033],
    [-0.052, -0.07, 0.033],
    [0.052, -0.07, 0.033],
    [0.155, -0.07, 0.033],
    [-0.115, 0.02, 0.027],
    [0.115, 0.02, 0.027],
    [-0.195, 0.02, 0.025],
    [0.195, 0.02, 0.025],
  ];
  for (const [x, z, r] of roofDomes) {
    const c = cupola(r, 0.022, false, chalk);
    c.position.set(x, CORNICE_Y + 0.02, z);
    g.add(c);
  }
  // larger crossing dome behind the facade
  const crossing = cupola(0.06, 0.042, true, chalk);
  crossing.position.set(0, CORNICE_Y + 0.02, -0.06);
  g.add(crossing);

  return g;
}
