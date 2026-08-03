// Helsinki Cathedral (Helsingin tuomiokirkko) — papercraft miniature.
// White neoclassical Greek-cross body on a monumental granite stair podium,
// six-column porticos with pediments on every face, tall colonnaded drum
// carrying a verdigris dome, and four small corner dome towers.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
  SphereGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const GRANITE = "#a8a297"; // muted grey granite of the Senate Square stairs
const SHADE = "#ddd7c9"; // shaded white for walls recessed behind columns

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

/** Triangular pediment: width along X, apex height h, thin depth along Z. */
function pediment(w: number, h: number, depth: number, color: string): Mesh {
  const s = new Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(0, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth, bevelEnabled: false });
  geo.translate(0, 0, -depth / 2);
  return new Mesh(geo, mat(color));
}

/** Gable-roof prism running along Z: base width w, ridge height h, length len. */
function gablePrism(w: number, h: number, len: number, color: string): Mesh {
  const s = new Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(0, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: len, bevelEnabled: false });
  geo.translate(0, 0, -len / 2);
  return new Mesh(geo, mat(color));
}

/** Hemispherical dome, base at local y = 0. */
function dome(r: number, segs: number, color: string): Mesh {
  const geo = new SphereGeometry(r, segs, Math.max(4, segs / 2), 0, Math.PI * 2, 0, Math.PI / 2);
  return new Mesh(geo, mat(color));
}

/** One cross arm facing +Z: white body, shaded wall recess, six-column
 *  portico, cornice, pediment and verdigris gable roof back to the attic. */
function arm(): Group {
  const a = new Group();

  // arm body (from core edge z=0.10 out to the portico face z=0.19)
  a.add(box(0.17, 0.19, 0.09, 0, 0.165, 0.145, TONES.white));

  // shaded panel so the colonnade reads against the facade
  a.add(box(0.158, 0.17, 0.012, 0, 0.163, 0.189, SHADE));

  // portico colonnade (open-ended: caps hide under cornice / in terrace)
  const colGeo = new CylinderGeometry(0.01, 0.01, 0.19, 6, 1, true);
  const colMat = mat(TONES.white);
  for (const x of [-0.0675, -0.0405, -0.0135, 0.0135, 0.0405, 0.0675]) {
    const c = new Mesh(colGeo, colMat);
    c.position.set(x, 0.165, 0.196);
    a.add(c);
  }

  // recessed doorway hint behind the columns
  a.add(box(0.044, 0.09, 0.012, 0, 0.125, 0.191, TONES.slate));

  // cornice over the arm
  a.add(box(0.19, 0.018, 0.108, 0, 0.269, 0.148, TONES.white));

  // pediment above the portico (proud of the facade, deep enough to shadow)
  const ped = pediment(0.21, 0.055, 0.055, TONES.white);
  ped.position.set(0, 0.278, 0.175);
  a.add(ped);
  // shaded tympanum inset so the triangle reads against the white facade
  const tym = pediment(0.16, 0.042, 0.008, SHADE);
  tym.position.set(0, 0.281, 0.2);
  a.add(tym);

  // copper gable roof sloping back toward the attic (kept shallow)
  const roof = gablePrism(0.172, 0.03, 0.08, TONES.verdigris);
  roof.position.set(0, 0.278, 0.12);
  a.add(roof);

  return a;
}

/** Small corner dome pavilion rising from the main cornice at a cross corner. */
function cornerTower(x: number, z: number): Group {
  const t = new Group();
  t.position.set(x, 0, z);
  t.add(box(0.06, 0.08, 0.06, 0, 0.318, 0, TONES.white));
  t.add(box(0.068, 0.012, 0.068, 0, 0.364, 0, TONES.white));
  const drum = new Mesh(new CylinderGeometry(0.022, 0.022, 0.024, 10, 1, true), mat(TONES.white));
  drum.position.y = 0.382;
  t.add(drum);
  const d = dome(0.032, 10, TONES.verdigris);
  d.position.y = 0.394;
  t.add(d);
  t.add(box(0.004, 0.02, 0.004, 0, 0.434, 0, TONES.gold));
  return t;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  // Building sits back on the disc so the great stair can spill forward (+Z).
  const s = new Group();
  s.position.z = -0.05;
  g.add(s);

  // ---- granite terrace + monumental front stair ----
  s.add(box(0.52, 0.07, 0.42, 0, 0.035, 0, GRANITE));
  for (let i = 0; i < 4; i++) {
    const depth = (i + 1) * 0.03;
    s.add(
      box(0.46, 0.0175, depth, 0, 0.061 - 0.0175 * i, 0.21 + depth / 2, GRANITE)
    );
  }

  // ---- Greek-cross body: core + four identical portico arms ----
  s.add(box(0.26, 0.19, 0.26, 0, 0.165, 0, TONES.white));
  s.add(box(0.28, 0.018, 0.28, 0, 0.269, 0, TONES.white));
  for (let k = 0; k < 4; k++) {
    const a = arm();
    a.rotation.y = (k * Math.PI) / 2;
    s.add(a);
  }

  // ---- attic block + corner dome pavilions at the cross corners ----
  s.add(box(0.22, 0.06, 0.22, 0, 0.308, 0, TONES.white));
  for (const sx of [1, -1])
    for (const sz of [1, -1]) s.add(cornerTower(sx * 0.105, sz * 0.105));

  // ---- central drum: plinth, colonnaded cylinder, windows, cornice ----
  s.add(box(0.17, 0.02, 0.17, 0, 0.348, 0, TONES.white));
  const drum = new Mesh(new CylinderGeometry(0.08, 0.08, 0.16, 16, 1, true), mat(TONES.white));
  drum.position.y = 0.438;
  s.add(drum);

  const pilGeo = new CylinderGeometry(0.0055, 0.0055, 0.165, 6, 1, true);
  const pilMat = mat(TONES.white);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const p = new Mesh(pilGeo, pilMat);
    p.position.set(Math.cos(a) * 0.083, 0.4405, Math.sin(a) * 0.083);
    s.add(p);
  }
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    const w = box(0.016, 0.06, 0.006, 0, 0.438, 0, TONES.slate);
    w.position.set(Math.cos(a) * 0.0805, 0.438, Math.sin(a) * 0.0805);
    w.rotation.y = -a + Math.PI / 2;
    s.add(w);
  }

  const drumCornice = new Mesh(new CylinderGeometry(0.095, 0.095, 0.018, 16), mat(TONES.white));
  drumCornice.position.y = 0.527;
  s.add(drumCornice);
  const domeBase = new Mesh(new CylinderGeometry(0.088, 0.088, 0.014, 16), mat(TONES.white));
  domeBase.position.y = 0.543;
  s.add(domeBase);

  // ---- great verdigris dome + lantern + gold cross ----
  const mainDome = dome(0.1, 16, TONES.verdigris);
  mainDome.position.y = 0.55;
  mainDome.scale.y = 1.08;
  s.add(mainDome);

  const lantern = new Mesh(new CylinderGeometry(0.02, 0.02, 0.04, 10, 1, true), mat(TONES.white));
  lantern.position.y = 0.672;
  s.add(lantern);
  const cap = dome(0.027, 10, TONES.verdigris);
  cap.position.y = 0.69;
  cap.scale.y = 0.9;
  s.add(cap);
  s.add(box(0.005, 0.045, 0.005, 0, 0.737, 0, TONES.gold));
  s.add(box(0.02, 0.005, 0.005, 0, 0.744, 0, TONES.gold));

  return g;
}
