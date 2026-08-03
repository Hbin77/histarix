// Schönbrunn Palace (Vienna) — papercraft miniature.
// Long symmetric Schönbrunn-yellow baroque range with taller central risalit
// (attic row + white pediment) and corner end-pavilions — the five-part
// baroque rhythm — plus lower U-shaped Ehrenhof wings, dark window insets,
// low slate hip roofs, paved forecourt with twin fountains, obelisk gate
// posts and clipped trees.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;
const YELLOW = "#e3ca90"; // muted Schönbrunn yellow

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

/** Rectangular hip-roof frustum: eave half-extents (hx, hz), height h,
 *  taper ratio t (top = t * bottom). Base sits at y = 0 of the mesh. */
function hipRoof(hx: number, hz: number, h: number, t: number, color: string): Mesh {
  const geo = new CylinderGeometry(t * SQ2, SQ2, 1, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, 0.5, 0);
  const m = new Mesh(geo, mat(color));
  m.scale.set(hx, h, hz);
  return m;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  const STOREYS = [0.055, 0.115, 0.175]; // window row centres

  // ---- palace massing: long range + central risalit + end pavilions ----
  g.add(box(0.68, 0.21, 0.13, 0, 0.105, -0.06, YELLOW)); // main range
  g.add(box(0.24, 0.285, 0.17, 0, 0.1425, -0.045, YELLOW)); // central risalit
  for (const sx of [1, -1])
    g.add(box(0.09, 0.23, 0.15, sx * 0.3, 0.115, -0.055, YELLOW)); // end pavilions
  // lower Ehrenhof wings reaching toward the forecourt
  for (const sx of [1, -1])
    g.add(box(0.11, 0.145, 0.22, sx * 0.285, 0.0725, 0.025, YELLOW));

  // white cornices capping each block
  g.add(box(0.69, 0.012, 0.145, 0, 0.216, -0.06, TONES.white));
  g.add(box(0.255, 0.012, 0.185, 0, 0.291, -0.045, TONES.white));
  for (const sx of [1, -1]) {
    g.add(box(0.105, 0.012, 0.165, sx * 0.3, 0.236, -0.055, TONES.white));
    g.add(box(0.125, 0.012, 0.235, sx * 0.285, 0.151, 0.025, TONES.white));
  }

  // white pilaster strips on the risalit + wing front corners
  for (const x of [-0.113, -0.037, 0.037, 0.113])
    g.add(box(0.016, 0.285, 0.014, x, 0.1425, 0.036, TONES.white));
  for (const sx of [1, -1])
    for (const dx of [-0.048, 0.048])
      g.add(box(0.014, 0.145, 0.014, sx * 0.285 + dx, 0.0725, 0.131, TONES.white));

  // ---- low slate hip roofs (facade dominates, not the roof) ----
  const mainRoof = hipRoof(0.345, 0.062, 0.04, 0.3, TONES.slate);
  mainRoof.position.set(0, 0.222, -0.06);
  g.add(mainRoof);
  const midRoof = hipRoof(0.122, 0.088, 0.045, 0.3, TONES.slate);
  midRoof.position.set(0, 0.297, -0.045);
  g.add(midRoof);
  for (const sx of [1, -1]) {
    const pavRoof = hipRoof(0.052, 0.082, 0.04, 0.3, TONES.slate);
    pavRoof.position.set(sx * 0.3, 0.242, -0.055);
    g.add(pavRoof);
    const wingRoof = hipRoof(0.06, 0.115, 0.032, 0.3, TONES.slate);
    wingRoof.position.set(sx * 0.285, 0.157, 0.025);
    g.add(wingRoof);
  }

  // ---- white pediment standing proud on the central risalit ----
  const ped = new Shape();
  ped.moveTo(-0.1, 0);
  ped.lineTo(0.1, 0);
  ped.lineTo(0, 0.055);
  ped.closePath();
  const pedGeo = new ExtrudeGeometry(ped, { depth: 0.032, bevelEnabled: false });
  pedGeo.translate(0, 0, -0.016);
  const pedM = new Mesh(pedGeo, mat(TONES.white));
  pedM.position.set(0, 0.297, 0.026);
  g.add(pedM);

  // ---- windows: small dark insets ----
  const winF = new BoxGeometry(0.021, 0.035, 0.008); // faces ±Z
  const winS = new BoxGeometry(0.008, 0.035, 0.021); // faces ±X
  const winA = new BoxGeometry(0.018, 0.024, 0.008); // attic row
  const inkM = mat(TONES.ink);
  const addWin = (geo: BoxGeometry, x: number, y: number, z: number) => {
    const m = new Mesh(geo, inkM);
    m.position.set(x, y, z);
    g.add(m);
  };

  // main range front, between risalit and pavilions
  for (const sx of [1, -1])
    for (const x of [0.145, 0.1825, 0.22])
      for (const y of STOREYS) addWin(winF, sx * x, y, 0.005);
  // risalit front: arched doors below, windows above, small attic row
  for (const x of [-0.075, 0, 0.075]) {
    addWin(winF, x, STOREYS[1], 0.04);
    addWin(winF, x, STOREYS[2], 0.04);
    addWin(winA, x, 0.243, 0.04);
    const door = new Mesh(new BoxGeometry(0.028, 0.065, 0.008), inkM);
    door.position.set(x, 0.0375, 0.04);
    g.add(door);
  }
  // end pavilions: front, outer end and back faces
  for (const sx of [1, -1])
    for (const d of [-0.02, 0.02]) {
      for (const y of STOREYS) addWin(winF, sx * (0.3 + d), y, 0.02);
      for (const y of STOREYS) addWin(winS, sx * 0.345, y, -0.055 + d * 2);
      for (const y of STOREYS) addWin(winF, sx * (0.3 + d), y, -0.13);
    }
  // lower wings: front, inner (courtyard) and outer faces — two storeys
  for (const sx of [1, -1]) {
    for (const dx of [-0.026, 0.026])
      for (const y of [0.045, 0.105]) addWin(winF, sx * (0.285 + dx), y, 0.135);
    for (const z of [0.045, 0.1])
      for (const y of [0.045, 0.105]) addWin(winS, sx * 0.23, y, z);
    for (const z of [0.0, 0.07])
      for (const y of [0.045, 0.105]) addWin(winS, sx * 0.34, y, z);
  }
  // back facade of the main range
  for (const x of [-0.225, -0.135, -0.045, 0.045, 0.135, 0.225])
    for (const y of STOREYS) addWin(winF, x, y, -0.125);

  // ---- Ehrenhof forecourt ----
  // paved path up the axis
  g.add(box(0.09, 0.008, 0.19, 0, 0.01, 0.25, TONES.stone));
  // twin fountains: stone basin + water disc
  for (const sx of [1, -1]) {
    const basin = new Mesh(new CylinderGeometry(0.042, 0.046, 0.014, 12), mat(TONES.stone));
    basin.position.set(sx * 0.13, 0.013, 0.235);
    g.add(basin);
    const water = new Mesh(new CylinderGeometry(0.032, 0.032, 0.01, 12), mat(TONES.water));
    water.position.set(sx * 0.13, 0.021, 0.235);
    g.add(water);
  }
  // obelisk gate posts at the court entrance
  for (const sx of [1, -1]) {
    g.add(box(0.024, 0.03, 0.024, sx * 0.085, 0.015, 0.33, TONES.white));
    const ob = new Mesh(new CylinderGeometry(0.004, 0.012, 0.07, 4), mat(TONES.white));
    ob.position.set(sx * 0.085, 0.065, 0.33);
    g.add(ob);
  }
  // clipped trees flanking the court
  const coneGeo = new ConeGeometry(0.028, 0.07, 8);
  const treeM = mat(TONES.forest);
  const trunkGeo = new CylinderGeometry(0.006, 0.007, 0.02, 6);
  const trunkM = mat(TONES.ironDark);
  for (const [x, z] of [
    [0.3, 0.18],
    [-0.3, 0.18],
    [0.23, 0.26],
    [-0.23, 0.26],
  ] as const) {
    const trunk = new Mesh(trunkGeo, trunkM);
    trunk.position.set(x, 0.01, z);
    g.add(trunk);
    const cone = new Mesh(coneGeo, treeM);
    cone.position.set(x, 0.055, z);
    g.add(cone);
  }

  return g;
}
