// Persepolis (Takht-e Jamshid) — papercraft miniature ruin field.
// Broad stone terrace with monumental double stair around a relief bastion,
// a cluster of tall slender Apadana columns (several broken), the Gate of
// All Nations as two lamassu jamb blocks (head + swept wing), and lone
// stone door portals of the palaces.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Shape,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const T = 0.115; // terrace top height

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

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  const wall = mat("#b9a988"); // terrace retaining wall
  const pave = mat(TONES.stone);
  const dark = mat(TONES.stoneDark);
  const shaftM = mat("#c8c0ac"); // grey limestone columns
  const gateM = mat("#b0a58e"); // weathered gate blocks
  const mud = mat(TONES.sandDark); // eroded mudbrick wall stubs
  const relief = mat(TONES.sandDark);

  // ---- terrace platform (Takht): foundation, wall block, pavement lip ----
  g.add(box(0.6, 0.03, 0.42, 0, 0.015, 0, dark));
  g.add(box(0.56, 0.07, 0.38, 0, 0.065, 0, wall));
  g.add(box(0.58, 0.015, 0.4, 0, 0.1075, 0, pave));

  // ---- monumental double stair (front, +Z): central relief bastion ----
  g.add(box(0.18, 0.115, 0.05, 0, 0.0575, 0.215, wall));
  g.add(box(0.17, 0.04, 0.006, 0, 0.062, 0.2425, relief)); // frieze band
  g.add(box(0.17, 0.014, 0.006, 0, 0.028, 0.2425, relief));
  for (const mx of [-0.064, -0.032, 0, 0.032, 0.064])
    g.add(box(0.016, 0.02, 0.012, mx, 0.125, 0.234, pave)); // crenellation
  for (const sx of [1, -1])
    for (const mx of [0.205, 0.24, 0.275])
      g.add(box(0.014, 0.018, 0.012, sx * mx, 0.124, 0.192, pave)); // parapet

  // two flights ascending toward the center (stacked step layers)
  const stepH = T / 4;
  for (const sx of [1, -1])
    for (let j = 0; j < 4; j++) {
      const w = 0.16 - j * 0.04;
      g.add(
        box(w, stepH, 0.05, sx * (0.09 + w / 2), stepH * (j + 0.5), 0.215, pave)
      );
    }

  // ---- Apadana column field (left / rear): tall + broken shafts ----
  const xs = [-0.235, -0.16, -0.085, -0.01];
  const zs = [-0.14, -0.065, 0.01];
  const TALL = 0.37;
  // shaft heights per [row][col]; TALL columns get a double-bull capital
  const plan = [
    [TALL, 0.11, TALL, 0.22],
    [0.19, TALL, TALL, TALL],
    [TALL, 0.14, TALL, 0.08],
  ];
  const bellGeo = new CylinderGeometry(0.012, 0.021, 0.022, 7);
  const tallGeo = new CylinderGeometry(0.011, 0.013, TALL, 7);
  const column = (x: number, z: number, h: number) => {
    g.add(box(0.036, 0.016, 0.036, x, T + 0.008, z, dark));
    const bell = new Mesh(bellGeo, dark);
    bell.position.set(x, T + 0.027, z);
    g.add(bell);
    const shaft = new Mesh(
      h === TALL ? tallGeo : new CylinderGeometry(0.0115, 0.013, h, 7),
      shaftM
    );
    shaft.position.set(x, T + 0.038 + h / 2, z);
    g.add(shaft);
    if (h === TALL) {
      const yCap = T + 0.038 + h;
      g.add(box(0.052, 0.014, 0.018, x, yCap + 0.007, z, dark));
      g.add(box(0.016, 0.02, 0.02, x - 0.02, yCap + 0.017, z, dark));
      g.add(box(0.016, 0.02, 0.02, x + 0.02, yCap + 0.017, z, dark));
    }
  };
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 4; c++) column(xs[c], zs[r], plan[r][c]);

  // ---- Gate of All Nations (front right): lamassu jamb blocks ----
  const wingShape = new Shape();
  wingShape.moveTo(0.008, 0.015);
  wingShape.lineTo(0.04, 0.0);
  wingShape.lineTo(0.092, 0.082);
  wingShape.lineTo(0.078, 0.112);
  wingShape.lineTo(0.035, 0.092);
  wingShape.closePath();
  const wingGeo = new ExtrudeGeometry(wingShape, {
    depth: 0.011,
    bevelEnabled: false,
  });
  wingGeo.rotateY(Math.PI / 2); // shape +x -> world -z (wing sweeps rearward)
  for (const sx of [1, -1]) {
    const jx = 0.19 + sx * 0.05;
    g.add(box(0.04, 0.17, 0.08, jx, T + 0.085, 0.1, gateM)); // body block
    g.add(box(0.028, 0.052, 0.034, jx, T + 0.15, 0.15, gateM)); // fore head
    g.add(box(0.02, 0.016, 0.02, jx, T + 0.184, 0.152, gateM)); // crown
    const wing = new Mesh(wingGeo, gateM);
    wing.position.set(jx - 0.0055, T + 0.115, 0.1);
    g.add(wing);
  }
  column(0.15, -0.05, TALL - 0.04); // surviving gate-hall columns
  column(0.23, -0.05, TALL - 0.04);

  // ---- lone palace door portals (rear right) ----
  g.add(box(0.02, 0.15, 0.026, 0.18, T + 0.075, -0.15, dark));
  g.add(box(0.02, 0.15, 0.026, 0.24, T + 0.075, -0.15, dark));
  g.add(box(0.084, 0.022, 0.03, 0.21, T + 0.161, -0.15, dark));
  g.add(box(0.026, 0.12, 0.02, 0.08, T + 0.06, -0.193, dark));
  g.add(box(0.026, 0.12, 0.02, 0.08, T + 0.06, -0.137, dark));
  g.add(box(0.03, 0.02, 0.076, 0.08, T + 0.13, -0.165, dark));

  // ---- ruin scatter: eroded wall stubs + fallen column drums ----
  g.add(box(0.1, 0.045, 0.02, -0.17, T + 0.0225, 0.115, mud));
  g.add(box(0.02, 0.06, 0.08, -0.245, T + 0.03, 0.1, mud));
  g.add(box(0.07, 0.03, 0.018, 0.02, T + 0.015, -0.182, mud));
  const drumGeo = new CylinderGeometry(0.013, 0.013, 0.045, 7);
  for (const [x, z, rot] of [
    [-0.13, 0.16, 0.4],
    [0.04, 0.14, 1.8],
    [-0.05, -0.185, 0.9],
  ] as const) {
    const d = new Mesh(drumGeo, shaftM);
    d.rotation.set(Math.PI / 2, 0, rot);
    d.position.set(x, T + 0.013, z);
    g.add(d);
  }

  return g;
}
