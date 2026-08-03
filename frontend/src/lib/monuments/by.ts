// Мірскі замак (Mir Castle) — papercraft miniature.
// Red-brick rectangular courtyard fortress: four corner towers plus a taller
// central gate tower, each a square base rising into an octagonal drum under
// a steep tented roof; white ornamental trim bands; white renaissance palace
// range with a red gable roof inside the walls.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const BRICK = TONES.brick;
const BRICK_DK = TONES.brickDark;
const ROOF = TONES.woodRed;

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

/** Gable prism roof: ridge runs along X. */
function gable(len: number, halfW: number, h: number, color: string): Mesh {
  const s = new Shape();
  s.moveTo(-halfW, 0);
  s.lineTo(halfW, 0);
  s.lineTo(0, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: len, bevelEnabled: false });
  geo.translate(0, 0, -len / 2);
  geo.rotateY(Math.PI / 2);
  return new Mesh(geo, mat(color));
}

/** Brick tower: square base → white band → octagonal drum → white corbel →
 *  steep 8-sided tented roof. Group origin at ground level. */
function tower(
  x: number,
  z: number,
  baseW: number,
  baseH: number,
  drumR: number,
  drumH: number,
  roofR: number,
  roofH: number
): Group {
  const t = new Group();
  t.position.set(x, 0, z);

  // square brick base with plinth
  t.add(box(baseW + 0.012, 0.03, baseW + 0.012, 0, 0.015, 0, BRICK_DK));
  t.add(box(baseW, baseH, baseW, 0, baseH / 2, 0, BRICK));
  // white ornamental niche band mid-base + cornice band at base top
  t.add(box(baseW + 0.006, 0.014, baseW + 0.006, 0, baseH * 0.58, 0, TONES.white));
  t.add(box(baseW + 0.01, 0.018, baseW + 0.01, 0, baseH - 0.009, 0, TONES.white));

  // paired white niches on each base face (Mir's ornamental brickwork)
  const nh = baseH * 0.28;
  const ny = baseH * 0.79;
  const f = baseW / 2 + 0.002;
  for (const off of [-baseW * 0.22, baseW * 0.22])
    for (const s of [1, -1]) {
      t.add(box(0.013, nh, 0.005, off, ny, s * f, TONES.white));
      t.add(box(0.005, nh, 0.013, s * f, ny, off, TONES.white));
    }

  // octagonal drum with a thin white string course
  const drum = new Mesh(
    new CylinderGeometry(drumR * 0.94, drumR, drumH, 8),
    mat(BRICK)
  );
  drum.rotation.y = Math.PI / 8;
  drum.position.y = baseH + drumH / 2;
  t.add(drum);
  const stringCourse = new Mesh(
    new CylinderGeometry(drumR * 0.985, drumR * 1.005, 0.012, 8),
    mat(TONES.white)
  );
  stringCourse.rotation.y = Math.PI / 8;
  stringCourse.position.y = baseH + drumH * 0.55;
  t.add(stringCourse);
  // white machicolation/corbel band under the eave
  const corbel = new Mesh(
    new CylinderGeometry(drumR + 0.009, drumR * 0.92, 0.016, 8),
    mat(TONES.white)
  );
  corbel.rotation.y = Math.PI / 8;
  corbel.position.y = baseH + drumH + 0.008;
  t.add(corbel);

  // steep tented roof
  const roof = new Mesh(new CylinderGeometry(0.0045, roofR, roofH, 8), mat(ROOF));
  roof.rotation.y = Math.PI / 8;
  roof.position.y = baseH + drumH + 0.016 + roofH / 2;
  t.add(roof);
  // finial spike
  const spike = new Mesh(new CylinderGeometry(0.0016, 0.004, 0.035, 6), mat(TONES.iron));
  spike.position.y = baseH + drumH + 0.016 + roofH + 0.014;
  t.add(spike);

  return t;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.36));

  const wallH = 0.16;
  const wallT = 0.036;
  const hx = 0.23; // wall half-extent X
  const hz = 0.19; // wall half-extent Z

  // ---- curtain walls (front split by the gate tower) ----
  const wall = (w: number, d: number, x: number, z: number) => {
    g.add(box(w, wallH, d, x, wallH / 2, z, BRICK));
    // darker battered plinth + white trim band near the wall top
    g.add(box(w + 0.006, 0.034, d + 0.006, x, 0.017, z, BRICK_DK));
    g.add(box(w + 0.004, 0.016, d + 0.004, x, wallH - 0.024, z, TONES.white));
  };
  wall(0.17, wallT, -0.145, hz); // front left
  wall(0.17, wallT, 0.145, hz); // front right
  wall(2 * hx, wallT, 0, -hz); // back
  wall(wallT, 2 * hz - 0.06, -hx, 0); // west
  wall(wallT, 2 * hz - 0.06, hx, 0); // east

  // red gable caps along the wall walks
  const capF1 = gable(0.17, 0.028, 0.026, ROOF);
  capF1.position.set(-0.145, wallH, hz);
  g.add(capF1);
  const capF2 = gable(0.17, 0.028, 0.026, ROOF);
  capF2.position.set(0.145, wallH, hz);
  g.add(capF2);
  const capB = gable(2 * hx, 0.028, 0.026, ROOF);
  capB.position.set(0, wallH, -hz);
  g.add(capB);
  for (const sx of [1, -1]) {
    const capS = gable(2 * hz - 0.06, 0.028, 0.026, ROOF);
    capS.rotation.y = Math.PI / 2;
    capS.position.set(sx * hx, wallH, 0);
    g.add(capS);
  }

  // ---- four corner towers ----
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      g.add(tower(sx * hx, sz * hz, 0.1, 0.17, 0.05, 0.13, 0.064, 0.17));

  // ---- central gate tower (tallest) ----
  g.add(tower(0, hz, 0.12, 0.22, 0.057, 0.15, 0.073, 0.2));
  // gate arch: white surround + dark opening on the front face
  g.add(box(0.066, 0.085, 0.008, 0, 0.0425, hz + 0.062, TONES.white));
  g.add(box(0.044, 0.062, 0.006, 0, 0.031, hz + 0.0665, TONES.ink));

  // ---- white renaissance palace range along the back wall ----
  const palW = 0.36;
  g.add(box(palW, 0.19, 0.1, 0, 0.095, -0.125, TONES.white));
  const palRoof = gable(palW, 0.056, 0.055, ROOF);
  palRoof.position.set(0, 0.19, -0.125);
  g.add(palRoof);
  // white gable ends peeking under the roof edges
  for (const sx of [1, -1]) {
    const end = gable(0.012, 0.05, 0.048, TONES.white);
    end.position.set(sx * (palW / 2 - 0.008), 0.19, -0.125);
    g.add(end);
  }
  // window rows on both long faces
  for (const zf of [-0.176, -0.074]) {
    for (let i = 0; i < 6; i++) {
      const wx = -0.145 + i * 0.058;
      g.add(box(0.02, 0.032, 0.004, wx, 0.148, zf, TONES.slate));
      g.add(box(0.02, 0.032, 0.004, wx, 0.09, zf, TONES.slate));
    }
  }

  return g;
}
