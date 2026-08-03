// Baalbek — papercraft: the six giant columns of the Temple of Jupiter
// carrying a broken entablature fragment, on a massive stepped podium with
// monumental stairs, ruined column stubs and fallen drums scattered below.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const D2R = Math.PI / 180;

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

  // Baalbek's golden-ochre limestone palette.
  const shaft = mat("#d6b487"); // sun-warmed column stone
  const capStone = mat("#c9a271"); // capitals / weathered detail
  const entab = mat("#dcbf94"); // entablature face
  const cornice = mat(TONES.sandDark);
  const podium = mat(TONES.sand);
  const podiumDark = mat("#b59a6d"); // trilithon megalith courses
  const terrace = mat(TONES.stone);
  const rubble = mat(TONES.stoneDark);

  // ---- Massive podium (two tiers + megalith course + stairs) ----
  g.add(box(0.6, 0.05, 0.31, terrace, 0, 0.025, -0.05));
  g.add(box(0.52, 0.08, 0.25, podium, 0, 0.09, -0.06));
  // Giant trilithon blocks proud of the front face.
  for (let i = 0; i < 3; i++)
    g.add(box(0.15, 0.048, 0.012, podiumDark, -0.165 + i * 0.165, 0.088, 0.066));
  // Monumental stair, back edges flush with the podium front.
  for (let i = 0; i < 5; i++) {
    const d = 0.115 - i * 0.021;
    g.add(box(0.21, 0.026, d, terrace, 0, 0.013 + i * 0.026, 0.065 + d / 2));
  }

  // ---- The six giant columns ----
  const colTop = 0.13; // podium top
  const shaftGeo = new CylinderGeometry(0.02, 0.024, 0.32, 10);
  const baseGeo = new CylinderGeometry(0.028, 0.031, 0.013, 10);
  const capGeo = new CylinderGeometry(0.029, 0.02, 0.024, 10);
  const plinthGeo = new BoxGeometry(0.054, 0.014, 0.054);
  const abacusGeo = new BoxGeometry(0.056, 0.011, 0.056);
  const colZ = -0.05;
  for (let i = 0; i < 6; i++) {
    const x = -0.18 + i * 0.072;
    const plinth = new Mesh(plinthGeo, capStone);
    plinth.position.set(x, colTop + 0.007, colZ);
    const base = new Mesh(baseGeo, capStone);
    base.position.set(x, colTop + 0.0205, colZ);
    const s = new Mesh(shaftGeo, shaft);
    s.position.set(x, colTop + 0.187, colZ);
    const cap = new Mesh(capGeo, capStone);
    cap.position.set(x, colTop + 0.359, colZ);
    const abacus = new Mesh(abacusGeo, capStone);
    abacus.position.set(x, colTop + 0.3765, colZ);
    g.add(plinth, base, s, cap, abacus);
  }

  // ---- Entablature fragment (broken, stepped-down right end) ----
  const eY = colTop + 0.382; // 0.512
  g.add(box(0.46, 0.03, 0.068, entab, 0, eY + 0.015, colZ));
  g.add(box(0.43, 0.026, 0.064, entab, -0.015, eY + 0.043, colZ));
  g.add(box(0.385, 0.017, 0.082, cornice, -0.0375, eY + 0.0645, colZ));
  // Broken chunk perched on the architrave's right end.
  g.add(box(0.045, 0.03, 0.05, capStone, 0.208, eY + 0.045, colZ, 14 * D2R));

  // ---- Ruined stubs of the lost colonnade, on the podium ----
  const stub = (x: number, z: number, h: number) => {
    const p = new Mesh(plinthGeo, capStone);
    p.position.set(x, colTop + 0.007, z);
    const c = new Mesh(new CylinderGeometry(0.024, 0.027, h, 10), shaft);
    c.position.set(x, colTop + 0.014 + h / 2, z);
    g.add(p, c);
  };
  stub(-0.21, -0.13, 0.11);
  stub(0.205, -0.135, 0.055);
  const lonePlinth = new Mesh(plinthGeo, capStone);
  lonePlinth.position.set(0.225, colTop + 0.007, -0.02);
  g.add(lonePlinth);

  // ---- Fallen column drums + rubble on the ground in front ----
  const drum = (
    x: number,
    z: number,
    r: number,
    len: number,
    rotY: number,
    m: MeshLambertMaterial
  ) => {
    const d = new Mesh(new CylinderGeometry(r, r, len, 12), m);
    d.position.set(x, r, z);
    d.rotation.set(0, rotY, Math.PI / 2);
    g.add(d);
  };
  // A collapsed column: three big drums still roughly in a line.
  drum(-0.115, 0.205, 0.032, 0.075, 6 * D2R, shaft);
  drum(-0.023, 0.212, 0.032, 0.07, -5 * D2R, capStone);
  drum(0.062, 0.222, 0.031, 0.062, 14 * D2R, shaft);
  // Loose drums, round faces angled toward the viewer.
  drum(0.195, 0.16, 0.031, 0.048, 75 * D2R, capStone);
  drum(-0.245, 0.14, 0.029, 0.052, -70 * D2R, shaft);
  // A toppled capital block and rough rubble.
  g.add(box(0.052, 0.04, 0.052, capStone, -0.2, 0.02, 0.265, 25 * D2R));
  g.add(box(0.04, 0.028, 0.055, rubble, 0.245, 0.014, 0.1, -18 * D2R));
  g.add(box(0.035, 0.022, 0.03, rubble, -0.285, 0.011, 0.04, 40 * D2R));

  return g;
}
