// Carthage — papercraft: ruins of the Antonine Baths on a seaside terrace.
// One tall re-erected column, a column pair carrying a lintel fragment,
// arched masonry wall fragments, scattered stubs and rubble, cypress trees,
// with the sea lapping the back half of the plot.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Path,
  Shape,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const D2R = Math.PI / 180;
const T = 0.052; // terrace top

function box(
  w: number,
  h: number,
  d: number,
  m: MeshLambertMaterial,
  x: number,
  y: number,
  z: number,
  rotY = 0
): Mesh {
  const b = new Mesh(new BoxGeometry(w, h, d), m);
  b.position.set(x, y, z);
  b.rotation.y = rotY;
  return b;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.36));

  const shaft = mat(TONES.stone);
  const capStone = mat(TONES.stoneDark);
  const terrace = mat(TONES.sand);
  const quay = mat(TONES.sandDark);
  const masonry = mat(TONES.brick); // Roman baths brickwork
  const masonryDark = mat(TONES.brickDark);
  const water = mat(TONES.water);
  const cypress = mat("#5f7a55"); // muted Mediterranean cypress
  const trunk = mat(TONES.ironDark);

  // ---- Sea: half-disc across the back, straight edge hidden in the terrace ----
  const sea = new Mesh(
    new CylinderGeometry(0.35, 0.35, 0.016, 26, 1, false, Math.PI / 2, Math.PI),
    water
  );
  sea.position.set(0, 0.02, 0.02);
  g.add(sea);

  // ---- Seaside terrace + quay wall ----
  g.add(box(0.56, 0.04, 0.3, terrace, 0, 0.032, 0.07));
  // Quay parapet against the sea, with a broken gap on the right.
  g.add(box(0.34, 0.032, 0.028, quay, -0.11, 0.068, -0.075));
  g.add(box(0.1, 0.024, 0.028, quay, 0.19, 0.064, -0.075));
  // Front steps down to the plaza.
  for (let i = 0; i < 3; i++)
    g.add(box(0.09, 0.014, 0.022, quay, -0.05, 0.045 - i * 0.014, 0.223 + i * 0.022));

  // ---- Columns (plinth + tapered shaft + flared capital + abacus) ----
  const column = (x: number, z: number, shaftH: number) => {
    const c = new Group();
    c.position.set(x, T, z);
    const plinth = new Mesh(new BoxGeometry(0.05, 0.016, 0.05), capStone);
    plinth.position.y = 0.008;
    const base = new Mesh(new CylinderGeometry(0.026, 0.029, 0.012, 9), capStone);
    base.position.y = 0.022;
    const s = new Mesh(new CylinderGeometry(0.017, 0.021, shaftH, 9), shaft);
    s.position.y = 0.028 + shaftH / 2;
    const cap = new Mesh(new CylinderGeometry(0.03, 0.018, 0.028, 9), capStone);
    cap.position.y = 0.028 + shaftH + 0.014;
    const abacus = new Mesh(new BoxGeometry(0.052, 0.01, 0.052), capStone);
    abacus.position.y = 0.028 + shaftH + 0.033;
    c.add(plinth, base, s, cap, abacus);
    g.add(c);
    return T + 0.028 + shaftH + 0.038; // abacus top
  };
  const stub = (x: number, z: number, h: number) => {
    const p = new Mesh(new BoxGeometry(0.046, 0.014, 0.046), capStone);
    p.position.set(x, T + 0.007, z);
    const s = new Mesh(new CylinderGeometry(0.019, 0.022, h, 9), capStone);
    s.position.set(x, T + 0.014 + h / 2, z);
    g.add(p, s);
  };

  // The landmark tall column (re-erected, ~15 m).
  column(-0.19, -0.02, 0.34);
  // Surviving pair carrying an architrave fragment.
  const pairTop = column(0.12, -0.025, 0.22);
  column(0.215, -0.025, 0.22);
  g.add(box(0.16, 0.024, 0.05, shaft, 0.1675, pairTop + 0.012, -0.025));
  // A lone mid-height column, and broken stubs.
  column(0.25, 0.12, 0.14);
  stub(-0.07, -0.06, 0.07);
  stub(0.08, 0.17, 0.045);
  stub(-0.26, 0.1, 0.09);

  // Arched wall fragment builder: jagged outline in x/y, arch holes, extruded.
  const archWall = (
    outline: [number, number][],
    arches: [number, number, number][], // [cx, springY, r]
    m: MeshLambertMaterial,
    x: number,
    z: number,
    rotY: number,
    depth: number
  ) => {
    const s = new Shape();
    outline.forEach(([u, v], k) => (k === 0 ? s.moveTo(u, v) : s.lineTo(u, v)));
    s.closePath();
    for (const [cx, springY, r] of arches) {
      const hole = new Path();
      hole.moveTo(cx - r, 0);
      hole.lineTo(cx - r, springY);
      hole.absarc(cx, springY, r, Math.PI, 0, true);
      hole.lineTo(cx + r, 0);
      hole.closePath();
      s.holes.push(hole);
    }
    const mesh = new Mesh(
      new ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 7 }),
      m
    );
    mesh.position.set(x, T, z);
    mesh.rotation.y = rotY;
    g.add(mesh);
  };

  // Main double-arcade fragment of the baths (the signature silhouette).
  archWall(
    [
      [-0.12, 0],
      [0.12, 0],
      [0.12, 0.08],
      [0.085, 0.125],
      [0.04, 0.135],
      [-0.005, 0.16],
      [-0.055, 0.155],
      [-0.09, 0.12],
      [-0.12, 0.09],
    ],
    [
      [-0.058, 0.05, 0.036],
      [0.058, 0.05, 0.036],
    ],
    masonry,
    0.0,
    0.06,
    10 * D2R,
    0.05
  );
  // Smaller single-arch fragment, tilted the other way.
  archWall(
    [
      [-0.065, 0],
      [0.065, 0],
      [0.065, 0.075],
      [0.025, 0.11],
      [-0.02, 0.095],
      [-0.065, 0.125],
    ],
    [[0, 0.04, 0.03]],
    masonryDark,
    -0.19,
    0.15,
    -44 * D2R,
    0.04
  );
  // Low ruined wall run balancing the right-front corner.
  g.add(box(0.1, 0.05, 0.02, masonry, 0.19, T + 0.025, 0.17, 16 * D2R));

  // ---- Cypress trees along the quay ----
  const tree = (x: number, z: number, h: number) => {
    const t = new Mesh(new CylinderGeometry(0.006, 0.007, 0.02, 6), trunk);
    t.position.set(x, T + 0.01, z);
    const c = new Mesh(new ConeGeometry(0.024, h, 7), cypress);
    c.position.set(x, T + 0.02 + h / 2, z);
    g.add(t, c);
  };
  tree(-0.26, -0.03, 0.17);
  tree(0.05, -0.05, 0.14);
  tree(0.26, 0.21, 0.12);

  // ---- Fallen drums + rubble ----
  const drum = (x: number, z: number, rotY: number) => {
    const d = new Mesh(new CylinderGeometry(0.019, 0.019, 0.045, 9), capStone);
    d.position.set(x, T + 0.019, z);
    d.rotation.set(0, rotY, Math.PI / 2);
    g.add(d);
  };
  drum(0.02, 0.2, 20 * D2R);
  drum(-0.08, 0.19, 75 * D2R);
  g.add(box(0.04, 0.026, 0.05, masonryDark, 0.17, T + 0.013, 0.04, 30 * D2R));
  g.add(box(0.034, 0.02, 0.028, capStone, 0.14, T + 0.01, 0.19, -25 * D2R));

  return g;
}
