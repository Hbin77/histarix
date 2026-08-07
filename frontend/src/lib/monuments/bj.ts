// Palais royaux d'Abomey — papercraft: a red-earth courtyard enclosed by long
// single-storey adobe halls under shallow straw roofs and low compound walls
// studded with round polychrome bas-relief medallions, a carved figure on its
// plinth standing in the middle.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
  SphereGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const EARTH = "#c08c66"; // beaten red-earth courtyard
const WALL = "#b8805e"; // sun-dried adobe
const WALL_DARK = "#a26f4f"; // shadowed base course, wall caps
const ROOF = "#bfa77c"; // straw / faded sheet roofing
const ROOF_DARK = "#a68f66"; // ridge caps
const DOOR = "#6d5340";
const FIGURE = "#6a5a4a"; // carved dark wood
const PIGMENTS = ["#c9a35f", "#8b9dab", "#88997a", "#c08a72"]; // faded reliefs

/** Long single-storey hall: adobe body under a shallow gable running along X. */
function hall(w: number, d: number, wallH: number, roofH: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, wallH, d), mat(WALL));
  body.position.y = wallH / 2;
  g.add(body);
  const base = new Mesh(new BoxGeometry(w + 0.01, 0.022, d + 0.01), mat(WALL_DARK));
  base.position.y = 0.011;
  g.add(base);

  const hd = d / 2 + 0.012; // eave overhang
  const s = new Shape();
  s.moveTo(-hd, 0);
  s.lineTo(hd, 0);
  s.lineTo(0, roofH);
  s.closePath();
  const len = w + 0.024;
  const geo = new ExtrudeGeometry(s, { depth: len, bevelEnabled: false });
  geo.translate(0, wallH, -len / 2);
  geo.rotateY(Math.PI / 2); // swing the gable so the ridge runs along X
  g.add(new Mesh(geo, mat(ROOF)));
  const ridge = new Mesh(new BoxGeometry(len, 0.014, 0.022), mat(ROOF_DARK));
  ridge.position.y = wallH + roofH - 0.006;
  g.add(ridge);
  return g;
}

/** Low compound wall with a darker capping course. */
function wall(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), mat(WALL));
  body.position.y = h / 2;
  g.add(body);
  const cap = new Mesh(new BoxGeometry(w + 0.008, 0.016, d + 0.008), mat(WALL_DARK));
  cap.position.y = h;
  g.add(cap);
  return g;
}

/** Round bas-relief medallion set into a wall; local +Z faces out of it. */
function medallion(x: number, y: number, z: number, ry: number, color: string): Group {
  const g = new Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  const frame = new Mesh(new CylinderGeometry(0.032, 0.032, 0.012, 10), mat(TONES.stone));
  frame.rotation.x = Math.PI / 2;
  g.add(frame);
  const field = new Mesh(new CylinderGeometry(0.022, 0.022, 0.016, 9), mat(color));
  field.rotation.x = Math.PI / 2;
  field.position.z = 0.004;
  g.add(field);
  const relief = new Mesh(new BoxGeometry(0.008, 0.022, 0.016), mat(WALL_DARK));
  relief.position.z = 0.008;
  g.add(relief);
  return g;
}

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

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.375));

  // ---- beaten-earth courtyard ----
  const yard = new Mesh(new CylinderGeometry(0.368, 0.368, 0.016, 28), mat(EARTH));
  yard.position.y = 0.014;
  g.add(yard);

  // ---- north hall: the long ceremonial range across the back ----
  const north = hall(0.5, 0.15, 0.22, 0.078);
  north.position.set(0, 0.02, -0.175);
  g.add(north);
  g.add(box(0.05, 0.11, 0.014, -0.12, 0.075, -0.101, DOOR));
  g.add(box(0.05, 0.11, 0.014, 0.12, 0.075, -0.101, DOOR));
  // veranda posts under the front eave
  for (const x of [-0.21, -0.07, 0.07, 0.21])
    g.add(box(0.016, 0.2, 0.016, x, 0.12, -0.088, WALL_DARK));

  // ---- east hall, its ridge turned to run along Z ----
  const east = hall(0.26, 0.12, 0.19, 0.07);
  east.rotation.y = Math.PI / 2;
  east.position.set(0.2, 0.02, 0);
  g.add(east);
  g.add(box(0.014, 0.095, 0.045, 0.141, 0.068, 0.02, DOOR));

  // ---- west and south compound walls, with a gate in the south ----
  const west = wall(0.03, 0.44, 0.14);
  west.position.set(-0.245, 0.02, 0);
  g.add(west);
  for (const [x, z, w] of [
    [-0.17, 0.225, 0.18],
    [0.155, 0.225, 0.13],
  ] as const) {
    const seg = wall(w, 0.03, 0.14);
    seg.position.set(x, 0.02, z);
    g.add(seg);
  }
  // gateposts flanking the opening
  for (const x of [-0.075, 0.085]) {
    g.add(box(0.038, 0.19, 0.045, x, 0.115, 0.225, WALL));
    g.add(box(0.05, 0.02, 0.057, x, 0.218, 0.225, WALL_DARK));
  }

  // ---- medallions: north hall facade, west wall, south wall ----
  let p = 0;
  const next = () => PIGMENTS[p++ % PIGMENTS.length];
  for (const x of [-0.2, -0.055, 0.055, 0.2])
    g.add(medallion(x, 0.155, -0.093, 0, next()));
  for (const z of [-0.15, -0.05, 0.05, 0.15])
    g.add(medallion(-0.228, 0.095, z, Math.PI / 2, next()));
  for (const x of [-0.228, -0.163, -0.098, 0.128, 0.193])
    g.add(medallion(x, 0.095, 0.242, 0, next()));
  for (const z of [-0.075, 0.06])
    g.add(medallion(0.139, 0.115, z, -Math.PI / 2, next()));

  // ---- carved figure on its plinth, mid-courtyard ----
  const statue = new Group();
  statue.position.set(-0.015, 0.022, 0.06);
  g.add(statue);
  statue.add(box(0.075, 0.032, 0.075, 0, 0.016, 0, TONES.stoneDark));
  statue.add(box(0.052, 0.022, 0.052, 0, 0.043, 0, TONES.stone));
  const fig = mat(FIGURE);
  const body = new Mesh(new CylinderGeometry(0.017, 0.027, 0.22, 6), fig);
  body.position.y = 0.164;
  statue.add(body);
  const shoulders = new Mesh(new BoxGeometry(0.058, 0.024, 0.028), fig);
  shoulders.position.y = 0.256;
  statue.add(shoulders);
  const head = new Mesh(new SphereGeometry(0.022, 6, 5), fig);
  head.position.y = 0.29;
  statue.add(head);
  const crest = new Mesh(new ConeGeometry(0.019, 0.052, 6), fig);
  crest.position.y = 0.332;
  statue.add(crest);

  // ---- a shade tree in the corner of the compound ----
  const tree = new Group();
  tree.position.set(-0.17, 0.022, 0.115);
  g.add(tree);
  tree.add(box(0.018, 0.16, 0.018, 0, 0.08, 0, "#8a6f52"));
  for (const [x, y, z, s] of [
    [0, 0.19, 0, 0.055],
    [-0.04, 0.17, 0.02, 0.038],
    [0.042, 0.175, -0.018, 0.04],
  ] as const) {
    const crown = new Mesh(new SphereGeometry(s, 6, 5), mat(TONES.forest));
    crown.scale.y = 0.72;
    crown.position.set(x, y, z);
    tree.add(crown);
  }

  return g;
}
