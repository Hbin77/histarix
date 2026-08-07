// Ruinas de Trinidad — papercraft: roofless Jesuit mission church in rust-red
// sandstone. Broken nave walls pierced by round-headed windows, a freestanding
// arcade row set to one side, and a squat domed bell block on a grass plot.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Path,
  Shape,
  SphereGeometry,
} from "three";
import { mat } from "./materials";

const RUST = "#bc866d"; // sun-bleached red sandstone
const RUST_D = "#9a6552"; // shaded / inner faces
const SANDY = "#d8bf9b"; // mortar courses, sills, cornices
const GRASS = "#93a97b";
const SHADE = "#5d4638"; // openings read as dark voids
const DUST = "#a98d70"; // trodden earth floor inside the shell

type Arch = { cx: number; hw: number; sill: number; spring: number };

/** Masonry panel in the XY plane, extruded through Z. `outline` runs
 *  counter-clockwise (bottom edge first) so the top edge can be jagged. */
function panel(
  outline: Array<[number, number]>,
  arches: Arch[],
  thick: number,
  color: string
): Mesh {
  const s = new Shape();
  s.moveTo(outline[0][0], outline[0][1]);
  for (let i = 1; i < outline.length; i++) s.lineTo(outline[i][0], outline[i][1]);
  s.closePath();
  for (const a of arches) {
    const p = new Path();
    p.moveTo(a.cx - a.hw, a.sill);
    p.lineTo(a.cx - a.hw, a.spring);
    p.absarc(a.cx, a.spring, a.hw, Math.PI, 0, true);
    p.lineTo(a.cx + a.hw, a.sill);
    p.closePath();
    s.holes.push(p);
  }
  const geo = new ExtrudeGeometry(s, {
    depth: thick,
    bevelEnabled: false,
    curveSegments: 6,
  });
  geo.translate(0, 0, -thick / 2);
  return new Mesh(geo, mat(color));
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

/** Grass plot the ruin stands on (base at y = 0). */
function grassPlot(radius: number): Mesh {
  const m = new Mesh(new CylinderGeometry(radius, radius, 0.016, 30), mat(GRASS));
  m.position.y = 0.008;
  return m;
}

export function build(): Group {
  const g = new Group();
  g.add(grassPlot(0.35));

  const m = new Group();
  m.position.set(0.024, 0, -0.028);
  g.add(m);

  // ---- nave floor: bare earth inside the roofless shell ----
  m.add(box(0.36, 0.024, 0.225, 0.055, 0.012, -0.05, DUST));

  // ---- long nave walls, broken tops, three round-headed windows each ----
  const navWins: Arch[] = [
    { cx: -0.108, hw: 0.032, sill: 0.078, spring: 0.148 },
    { cx: 0.0, hw: 0.032, sill: 0.078, spring: 0.148 },
    { cx: 0.108, hw: 0.032, sill: 0.078, spring: 0.148 },
  ];

  const south = panel(
    [
      [-0.175, 0],
      [0.175, 0],
      [0.175, 0.243],
      [0.112, 0.243],
      [0.112, 0.284],
      [0.056, 0.295],
      [0.019, 0.252],
      [-0.033, 0.259],
      [-0.06, 0.322],
      [-0.175, 0.328],
    ],
    navWins,
    0.026,
    RUST
  );
  south.position.set(0.055, 0, 0.05);
  m.add(south);

  const north = panel(
    [
      [-0.175, 0],
      [0.175, 0],
      [0.175, 0.212],
      [0.123, 0.271],
      [0.064, 0.25],
      [0.011, 0.303],
      [-0.049, 0.277],
      [-0.093, 0.315],
      [-0.175, 0.309],
    ],
    navWins,
    0.026,
    RUST_D
  );
  north.position.set(0.055, 0, -0.15);
  m.add(north);

  // ---- east end wall: taller fragment with a single deep arch ----
  const east = panel(
    [
      [-0.1, 0],
      [0.1, 0],
      [0.1, 0.298],
      [0.04, 0.344],
      [-0.03, 0.328],
      [-0.1, 0.281],
    ],
    [{ cx: 0, hw: 0.043, sill: 0.03, spring: 0.15 }],
    0.026,
    RUST
  );
  east.rotation.y = Math.PI / 2;
  east.position.set(0.23, 0, -0.05);
  m.add(east);

  // sandy mortar courses + pilaster buttresses banding the nave walls
  for (const z of [0.052, -0.152]) {
    m.add(box(0.358, 0.009, 0.031, 0.055, 0.069, z, SANDY));
    m.add(box(0.358, 0.008, 0.031, 0.055, 0.196, z, SANDY));
  }
  for (const x of [-0.066, 0.043, 0.152]) {
    m.add(box(0.022, 0.2, 0.038, x, 0.1, 0.052, RUST_D));
  }

  // ---- squat bell block with a shallow dome, closing the west end ----
  const bell = new Group();
  bell.position.set(-0.205, 0, -0.05);
  m.add(bell);

  bell.add(box(0.166, 0.028, 0.166, 0, 0.014, 0, RUST_D));
  const shaft = new Mesh(new CylinderGeometry(0.1, 0.112, 0.35, 4, 1), mat(RUST));
  shaft.rotation.y = Math.PI / 4;
  shaft.position.y = 0.203;
  bell.add(shaft);

  // belfry openings on all four faces
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const opening = new Mesh(new BoxGeometry(0.046, 0.07, 0.02), mat(SHADE));
    opening.position.set(Math.sin(a) * 0.064, 0.29, Math.cos(a) * 0.064);
    opening.rotation.y = a;
    bell.add(opening);
  }
  bell.add(box(0.158, 0.012, 0.158, 0, 0.185, 0, SANDY));

  // cornice, drum, dome, finial
  bell.add(box(0.182, 0.019, 0.182, 0, 0.387, 0, SANDY));
  const drum = new Mesh(new CylinderGeometry(0.074, 0.08, 0.03, 10), mat(RUST_D));
  drum.position.y = 0.411;
  bell.add(drum);
  const dome = new Mesh(
    new SphereGeometry(0.074, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(RUST)
  );
  dome.scale.y = 0.74;
  dome.position.y = 0.425;
  bell.add(dome);
  const finial = new Mesh(new CylinderGeometry(0.005, 0.013, 0.034, 6), mat(SANDY));
  finial.position.y = 0.494;
  bell.add(finial);

  // ---- freestanding arcade row standing off the church's south side ----
  m.add(box(0.26, 0.022, 0.07, 0.132, 0.011, 0.198, SANDY));
  const arcade = panel(
    [
      [-0.118, 0],
      [0.118, 0],
      [0.118, 0.178],
      [0.06, 0.196],
      [0.005, 0.183],
      [-0.055, 0.207],
      [-0.118, 0.201],
    ],
    [
      { cx: -0.072, hw: 0.031, sill: 0.005, spring: 0.1 },
      { cx: 0.0, hw: 0.031, sill: 0.005, spring: 0.1 },
      { cx: 0.072, hw: 0.031, sill: 0.005, spring: 0.1 },
    ],
    0.03,
    RUST
  );
  arcade.position.set(0.132, 0.022, 0.198);
  m.add(arcade);
  m.add(box(0.244, 0.009, 0.036, 0.132, 0.207, 0.198, SANDY));

  // ---- toppled foundation blocks scattered on the grass ----
  for (const [x, z, s, ry] of [
    [-0.24, 0.17, 0.05, 0.4],
    [-0.13, 0.225, 0.042, -0.3],
    [0.25, 0.14, 0.046, 0.9],
    [0.14, -0.245, 0.04, 0.2],
  ] as const) {
    const b = box(s, s * 0.44, s * 0.8, x, s * 0.22, z, RUST_D);
    b.rotation.y = ry;
    m.add(b);
  }

  return g;
}
