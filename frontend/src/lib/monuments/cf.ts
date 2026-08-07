// Cathédrale Notre-Dame de Bangui (Central African Republic) — papercraft:
// symmetrical red-brick front, twin pointed towers with belfry arcades and
// cream string courses flanking a gabled centre with a rose window, arcaded
// porch below, all on a dusty tan platform.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
  TorusGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;

const BRICK = "#b0725a"; // muted red brick
const BRICK_DARK = "#98604a"; // shaded brick: porch, recesses
const TRIM = TONES.white; // cream string courses and cornices
const ROOF = "#6f625b"; // dark warm-grey tower caps and nave roof
const TAN = TONES.sandDark; // dusty base platform
const OPENING = TONES.ink;

const TX = 0.163; // tower centre, x
const TZ = 0.075; // tower centre, z

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

/** Round-headed opening: a plate whose top is a semicircle, base at local y=0,
 *  centred in x, extruded along +Z so it faces the viewer. */
function arch(w: number, h: number, depth: number, color: string): Mesh {
  const hw = w / 2;
  const s = new Shape();
  s.moveTo(-hw, 0);
  s.lineTo(-hw, h - hw);
  s.absarc(0, h - hw, hw, Math.PI, 0, true);
  s.lineTo(hw, 0);
  s.closePath();
  const geo = new ExtrudeGeometry(s, {
    depth,
    bevelEnabled: false,
    curveSegments: 5,
  });
  return new Mesh(geo, mat(color));
}

/** Round-headed opening; the big front-facing ones get a cream surround. */
function openArch(
  w: number,
  h: number,
  x: number,
  y: number,
  z: number,
  ry = 0,
  surround = false
): Group {
  const g = new Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  if (surround) {
    const trim = arch(w + 0.016, h + 0.01, 0.006, TRIM);
    trim.position.set(0, -0.005, -0.004);
    g.add(trim);
  }
  g.add(arch(w, h, 0.006, OPENING));
  return g;
}

function pyramidRoof(hw: number, h: number, color: string): Mesh {
  const geo = new ConeGeometry(hw * SQ2, h, 4);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, h / 2, 0);
  return new Mesh(geo, mat(color));
}

/** Latin cross finial. */
function cross(h: number): Group {
  const g = new Group();
  g.add(box(0.006, h, 0.006, 0, h / 2, 0, TRIM));
  g.add(box(h * 0.42, 0.006, 0.006, 0, h * 0.72, 0, TRIM));
  return g;
}

/** Gable / saddle-roof prism: ridge runs along Z, apex height h. */
function gable(halfW: number, h: number, depth: number, color: string): Mesh {
  const s = new Shape();
  s.moveTo(-halfW, 0);
  s.lineTo(halfW, 0);
  s.lineTo(0, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth, bevelEnabled: false });
  return new Mesh(geo, mat(color));
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.32));

  // ---- dusty tan platform the church stands on ----
  g.add(box(0.5, 0.026, 0.44, 0, 0.013, -0.015, TAN));
  g.add(box(0.46, 0.016, 0.4, 0, 0.034, -0.015, TAN));

  // ---- nave behind the front, with a saddle roof ----
  g.add(box(0.22, 0.29, 0.21, 0, 0.187, -0.085, BRICK));
  const naveRoof = gable(0.122, 0.085, 0.222, ROOF);
  naveRoof.position.set(0, 0.332, -0.192);
  g.add(naveRoof);
  for (const sx of [1, -1])
    for (const dz of [-0.16, -0.085, -0.01])
      g.add(openArch(0.03, 0.075, sx * 0.111, 0.17, dz, (sx * Math.PI) / 2));

  // ---- central bay: brick block, cornice, gable with the rose window ----
  g.add(box(0.21, 0.36, 0.11, 0, 0.222, 0.075, BRICK));
  g.add(box(0.222, 0.014, 0.122, 0, 0.409, 0.075, TRIM));
  const centreGable = gable(0.111, 0.14, 0.112, BRICK);
  centreGable.position.set(0, 0.416, 0.019);
  g.add(centreGable);
  for (const sx of [1, -1]) {
    const rake = box(0.016, 0.178, 0.016, sx * 0.0555, 0.486, 0.132, TRIM);
    rake.rotation.z = sx * Math.atan2(0.111, 0.14); // aligned to the gable edge
    g.add(rake);
  }
  g.add(box(0.032, 0.016, 0.018, 0, 0.552, 0.132, TRIM));
  const apex = cross(0.06);
  apex.position.set(0, 0.556, 0.075);
  g.add(apex);

  // rose window: cream ring, dark glass, cream spokes
  const ring = new Mesh(new TorusGeometry(0.043, 0.009, 5, 14), mat(TRIM));
  ring.position.set(0, 0.322, 0.131);
  g.add(ring);
  const glass = new Mesh(new CylinderGeometry(0.037, 0.037, 0.008, 14), mat(OPENING));
  glass.rotation.x = Math.PI / 2;
  glass.position.set(0, 0.322, 0.129);
  g.add(glass);
  for (let i = 0; i < 3; i++) {
    const spoke = box(0.076, 0.006, 0.006, 0, 0.322, 0.133, TRIM);
    spoke.rotation.z = (i * Math.PI) / 3;
    g.add(spoke);
  }

  // string course and the row of windows under the rose
  g.add(box(0.216, 0.012, 0.116, 0, 0.256, 0.075, TRIM));
  for (const dx of [-0.062, 0, 0.062])
    g.add(openArch(0.032, 0.06, dx, 0.184, 0.131, 0, true));

  // ---- arcaded porch: three round-headed openings ----
  g.add(box(0.196, 0.16, 0.036, 0, 0.088, 0.148, BRICK_DARK));
  g.add(box(0.208, 0.014, 0.046, 0, 0.175, 0.148, TRIM));
  g.add(openArch(0.058, 0.118, 0, 0.03, 0.167, 0, true));
  for (const dx of [-0.07, 0.07])
    g.add(openArch(0.04, 0.088, dx, 0.03, 0.167, 0, true));

  // ---- twin towers ----
  for (const sx of [1, -1]) {
    const x = sx * TX;
    g.add(box(0.116, 0.44, 0.116, x, 0.22, TZ, BRICK));
    for (const y of [0.19, 0.31]) g.add(box(0.124, 0.012, 0.124, x, y, TZ, TRIM));

    // belfry stage, slightly inset, with tall louvred openings
    g.add(box(0.126, 0.016, 0.126, x, 0.448, TZ, TRIM));
    g.add(box(0.104, 0.112, 0.104, x, 0.512, TZ, BRICK));
    for (const dx of [-0.026, 0.026])
      g.add(openArch(0.028, 0.078, x + dx, 0.472, TZ + 0.053));
    g.add(openArch(0.028, 0.078, sx * (TX + 0.053), 0.472, TZ + 0.026, (sx * Math.PI) / 2));
    g.add(openArch(0.028, 0.078, sx * (TX + 0.053), 0.472, TZ - 0.026, (sx * Math.PI) / 2));

    // cornice, pointed cap, finial
    g.add(box(0.132, 0.018, 0.132, x, 0.577, TZ, TRIM));
    const cap = pyramidRoof(0.066, 0.155, ROOF);
    cap.position.set(x, 0.586, TZ);
    g.add(cap);
    const tip = cross(0.05);
    tip.position.set(x, 0.741, TZ);
    g.add(tip);
  }

  return g;
}
