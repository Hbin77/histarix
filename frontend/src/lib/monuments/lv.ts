// Brīvības piemineklis (Riga) — papercraft: red-granite stepped base, grey
// travertine relief block ringed by sculpture groups, a tall slender fluted
// shaft, and Milda in oxidized copper raising three gold stars.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  OctahedronGeometry,
  SphereGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;
const GRANITE = "#ac9b94"; // muted reddish-grey granite steps
const TRAV = "#cdc7bb"; // grey travertine
const TRAV_DK = "#b2ab9c";
const FIG = "#b8b2a6"; // sculpture-group stone, a touch cooler

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

/** Rectangular frustum: square cylinder squashed in z. Base sits at y. */
function slab(
  wBot: number,
  wTop: number,
  h: number,
  zRatio: number,
  y: number,
  m: MeshLambertMaterial
): Mesh {
  const geo = new CylinderGeometry((wTop / 2) * SQ2, (wBot / 2) * SQ2, h, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.scale(1, 1, zRatio);
  geo.translate(0, y + h / 2, 0);
  return new Mesh(geo, m);
}

/** Standing robed figure suggestion: tapering body + head, one small block. */
function statue(h: number, m: MeshLambertMaterial): Group {
  const g = new Group();
  const body = new Mesh(
    new CylinderGeometry(0.3 * h * SQ2 * 0.5, 0.42 * h * SQ2 * 0.5, h * 0.82, 4, 1),
    m
  );
  body.rotation.y = Math.PI / 4;
  body.position.y = h * 0.41;
  g.add(body);
  const head = new Mesh(new SphereGeometry(h * 0.11, 6, 4), m);
  head.position.y = h * 0.9;
  g.add(head);
  return g;
}

export function build(): Group {
  const g = new Group();
  const granite = mat(GRANITE);
  const trav = mat(TRAV);
  const travDk = mat(TRAV_DK);
  const figStone = mat(FIG);
  const copper = mat(TONES.verdigris);
  const gold = mat(TONES.gold);

  g.add(plazaDisc(0.34));

  // ---- Red-granite stepped base ----
  g.add(box(0.48, 0.026, 0.36, 0, 0.008, 0, granite));
  g.add(box(0.4, 0.026, 0.29, 0, 0.034, 0, granite));

  // ---- Travertine relief block: broad, low, panelled on all four faces ----
  const BLOCK_Y = 0.06;
  const BLOCK_H = 0.088;
  g.add(box(0.32, BLOCK_H, 0.225, 0, BLOCK_Y, 0, trav));
  // recessed relief panels, proud of the wall so they catch a shadow line
  g.add(box(0.24, 0.058, 0.006, 0, BLOCK_Y + 0.013, 0.1155, travDk));
  g.add(box(0.24, 0.058, 0.006, 0, BLOCK_Y + 0.013, -0.1155, travDk));
  g.add(box(0.006, 0.058, 0.15, 0.161, BLOCK_Y + 0.013, 0, travDk));
  g.add(box(0.006, 0.058, 0.15, -0.161, BLOCK_Y + 0.013, 0, travDk));
  // relief figures standing out of the long panels
  for (const x of [-0.075, -0.025, 0.025, 0.075]) {
    g.add(box(0.026, 0.05, 0.014, x, BLOCK_Y + 0.016, 0.119, figStone));
    g.add(box(0.026, 0.05, 0.014, x, BLOCK_Y + 0.016, -0.119, figStone));
  }

  // ---- Set-back plinth carrying the sculpture groups ----
  const PL_Y = BLOCK_Y + BLOCK_H;
  g.add(box(0.235, 0.02, 0.165, 0, PL_Y, 0, travDk));
  const GROUP_Y = PL_Y + 0.02;
  g.add(box(0.19, 0.052, 0.135, 0, GROUP_Y, 0, trav));

  // sculpture groups clustered at the four corners of the plinth
  const STAT_Y = GROUP_Y + 0.052;
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
    for (let i = 0; i < 2; i++) {
      const s = statue(0.07 + i * 0.008, figStone);
      s.position.set(sx * (0.075 - i * 0.03), STAT_Y, sz * (0.048 + i * 0.008));
      g.add(s);
    }
  }
  // low pedestal the groups stand on, tucked under them
  g.add(box(0.2, 0.012, 0.145, 0, STAT_Y - 0.004, 0, travDk));

  // ---- The shaft: tall, slender, slightly tapering, vertically fluted ----
  const SHAFT_Y = STAT_Y + 0.008;
  const SHAFT_H = 0.47;
  g.add(slab(0.086, 0.07, SHAFT_H, 0.76, SHAFT_Y, trav));
  // flutes: thin pilasters running the full height on the two wide faces
  const SHAFT_TOP = SHAFT_Y + SHAFT_H;
  for (const z of [1, -1]) {
    for (const fx of [-0.024, 0, 0.024]) {
      const f = new Mesh(new CylinderGeometry(0.0065, 0.008, SHAFT_H, 4, 1), travDk);
      f.rotation.y = Math.PI / 4;
      f.position.set(fx * 1.05, SHAFT_Y + SHAFT_H / 2, z * 0.0315);
      g.add(f);
    }
    // corner pilasters read as the shaft's crisp edges
    for (const fx of [-1, 1]) {
      const c = new Mesh(new CylinderGeometry(0.008, 0.0095, SHAFT_H, 4, 1), travDk);
      c.rotation.y = Math.PI / 4;
      c.position.set(fx * 0.04, SHAFT_Y + SHAFT_H / 2, z * 0.022);
      g.add(c);
    }
  }

  // ---- Cornice / capital ----
  g.add(box(0.104, 0.016, 0.082, 0, SHAFT_TOP - 0.004, 0, travDk));
  g.add(box(0.086, 0.012, 0.068, 0, SHAFT_TOP + 0.012, 0, trav));
  const FIG_Y = SHAFT_TOP + 0.024;

  // ---- Milda: robed copper figure, arms raised with three stars ----
  const milda = new Group();
  milda.position.y = FIG_Y;

  // flared hem, then a near-straight column of drapery
  const hem = new Mesh(new CylinderGeometry(0.032, 0.04, 0.022, 8, 1), copper);
  hem.position.y = 0.011;
  milda.add(hem);
  const robe = new Mesh(new CylinderGeometry(0.024, 0.032, 0.086, 8, 1), copper);
  robe.position.y = 0.065;
  milda.add(robe);
  const torso = new Mesh(new CylinderGeometry(0.02, 0.024, 0.05, 8, 1), copper);
  torso.position.y = 0.133;
  milda.add(torso);
  // broad shoulders give the arms something to spring from
  const shoulders = new Mesh(new BoxGeometry(0.05, 0.018, 0.023), copper);
  shoulders.position.y = 0.167;
  milda.add(shoulders);
  const head = new Mesh(new SphereGeometry(0.016, 7, 5), copper);
  head.position.y = 0.191;
  milda.add(head);

  // arms rising in a narrow V from the shoulder ends to hands over the head
  for (const sx of [1, -1]) {
    const arm = new Mesh(new BoxGeometry(0.014, 0.072, 0.014), copper);
    arm.position.set(sx * 0.019, 0.207, 0);
    arm.rotation.z = sx * 0.19;
    milda.add(arm);
  }

  // three stars held overhead, fanned wide enough to count at a glance
  const starGeo = new OctahedronGeometry(0.019, 0);
  const STARS: Array<[number, number]> = [
    [-0.031, 0.239],
    [0, 0.252],
    [0.031, 0.239],
  ];
  for (const [x, y] of STARS) {
    const star = new Mesh(starGeo, gold);
    star.position.set(x, y, 0);
    star.scale.set(1, 1.2, 0.42);
    star.rotation.y = 0.4;
    milda.add(star);
  }
  g.add(milda);

  // ---- Flanking figure groups on the granite base, front face ----
  for (const sx of [1, -1]) {
    const s = statue(0.072, figStone);
    s.position.set(sx * 0.115, 0.06, 0.14);
    g.add(s);
    const pedestal = new ConeGeometry(0.03, 0.01, 4);
    const p = new Mesh(pedestal, travDk);
    p.rotation.y = Math.PI / 4;
    p.position.set(sx * 0.115, 0.062, 0.14);
    g.add(p);
  }

  return g;
}
