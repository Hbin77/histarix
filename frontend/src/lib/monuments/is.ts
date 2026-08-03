// Hallgrímskirkja (Reykjavík) — papercraft: slender concrete tower with a
// ridged stepped spire, concave sweep of stepped basalt-column wings on both
// sides, long gabled nave with rounded apse behind.

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

const CONCRETE = "#dfdcd3";
const CONCRETE_ALT = "#d2cec4";
const ROOF = "#c4c9c2";

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

/** Gable-roof prism, ridge along Z. Base of the triangle sits at y = 0. */
function gablePrism(halfW: number, h: number, len: number, color: string): Mesh {
  const s = new Shape();
  s.moveTo(-halfW, 0);
  s.lineTo(halfW, 0);
  s.lineTo(0, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: len, bevelEnabled: false });
  geo.translate(0, 0, -len / 2);
  return new Mesh(geo, mat(color));
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.36));

  const TZ = 0.19; // tower center z (facade faces +Z)

  // ---- central tower body ----
  const BODY_H = 0.6;
  g.add(box(0.15, BODY_H, 0.12, 0, BODY_H / 2, TZ, CONCRETE));

  // corner ribs articulate the concrete shaft
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      g.add(
        box(0.02, BODY_H + 0.015, 0.02, sx * 0.072, (BODY_H + 0.015) / 2, TZ + sz * 0.055, CONCRETE_ALT)
      );

  // tall window strip + flanking ribs + door on the front face
  g.add(box(0.03, 0.26, 0.012, 0, 0.4, TZ + 0.062, TONES.slate));
  for (const side of [1, -1])
    g.add(box(0.014, 0.34, 0.014, side * 0.032, 0.37, TZ + 0.062, CONCRETE_ALT));
  g.add(box(0.052, 0.1, 0.014, 0, 0.05, TZ + 0.062, TONES.ink));

  // clock discs just under the spire (front + both sides)
  const clockGeo = new CylinderGeometry(0.026, 0.026, 0.008, 12);
  const clockMat = mat(TONES.white);
  const clocks: Array<[number, number, number]> = [
    [0, TZ + 0.062, 0], // front
    [0.078, TZ, Math.PI / 2], // right
    [-0.078, TZ, Math.PI / 2], // left
  ];
  for (const [cx, cz, rz] of clocks) {
    const c = new Mesh(clockGeo, clockMat);
    c.position.set(cx, 0.545, cz);
    c.rotation.x = Math.PI / 2;
    c.rotation.z = rz;
    g.add(c);
  }

  // ---- spire: stepped ridged pyramid ----
  const step1 = new Mesh(new CylinderGeometry(0.07, 0.09, 0.09, 8), mat(CONCRETE));
  step1.position.set(0, BODY_H + 0.045, TZ);
  g.add(step1);
  const step2 = new Mesh(new CylinderGeometry(0.046, 0.07, 0.09, 8), mat(CONCRETE_ALT));
  step2.position.set(0, BODY_H + 0.135, TZ);
  g.add(step2);
  const tip = new Mesh(new ConeGeometry(0.046, 0.2, 8), mat(CONCRETE));
  tip.position.set(0, BODY_H + 0.28, TZ);
  g.add(tip);

  // small corner pinnacles where the spire meets the tower top
  const pinGeo = new ConeGeometry(0.016, 0.095, 4);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const p = new Mesh(pinGeo, mat(CONCRETE_ALT));
      p.position.set(sx * 0.071, BODY_H + 0.042, TZ + sz * 0.053);
      g.add(p);
    }

  // ---- concave stepped basalt-column wings ----
  const N = 9;
  const X0 = 0.078; // inner edge (tower side)
  const X1 = 0.29; // outer edge
  const CW = (X1 - X0) / N;
  for (const side of [1, -1]) {
    for (let i = 0; i < N; i++) {
      const t = 1 - i / (N - 1); // 1 at tower, 0 at outer edge
      const h = 0.055 + 0.34 * Math.pow(t, 2.5); // concave sweep hugging the tower
      const x = side * (X0 + CW * (i + 0.5));
      g.add(box(CW * 0.92, h, 0.06, x, h / 2, TZ, i % 2 ? CONCRETE_ALT : CONCRETE));
    }
  }

  // ---- nave behind the facade ----
  const NAVE_W = 0.17;
  const NAVE_L = 0.38;
  const NAVE_Z = TZ - 0.06 - NAVE_L / 2; // starts just behind the tower
  g.add(box(NAVE_W, 0.2, NAVE_L, 0, 0.1, NAVE_Z, CONCRETE));
  const roof = gablePrism(NAVE_W / 2 + 0.01, 0.09, NAVE_L, ROOF);
  roof.position.set(0, 0.2, NAVE_Z);
  g.add(roof);

  // low stepped-column ledges along the nave sides
  for (const side of [1, -1])
    g.add(box(0.022, 0.09, NAVE_L - 0.04, side * (NAVE_W / 2 + 0.011), 0.045, NAVE_Z, CONCRETE_ALT));

  // ribbed pilasters + slim windows along the nave walls
  for (const side of [1, -1])
    for (let i = 0; i < 4; i++) {
      const z = NAVE_Z + NAVE_L / 2 - 0.075 - i * 0.085;
      g.add(box(0.012, 0.2, 0.02, side * (NAVE_W / 2 + 0.006), 0.1, z, CONCRETE_ALT));
      g.add(box(0.01, 0.085, 0.026, side * (NAVE_W / 2 + 0.005), 0.15, z + 0.0425, TONES.slate));
    }

  // ---- rounded apse with conical roof at the far end ----
  const AZ = NAVE_Z - NAVE_L / 2;
  const apse = new Mesh(new CylinderGeometry(0.075, 0.075, 0.2, 12), mat(CONCRETE));
  apse.position.set(0, 0.1, AZ);
  g.add(apse);
  const apseRoof = new Mesh(new ConeGeometry(0.082, 0.1, 12), mat(ROOF));
  apseRoof.position.set(0, 0.25, AZ);
  g.add(apseRoof);

  return g;
}
