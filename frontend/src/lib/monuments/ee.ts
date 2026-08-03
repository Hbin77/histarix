// Tallinn Old Town — papercraft miniature. Limestone city wall sweeping
// across the front with round towers under red cone roofs, a cluster of
// red-gabled merchant houses, and the tall slender Oleviste church spire
// rising dark behind them.

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

const TILE = "#b06a52"; // muted tile red for house roofs (wall cones use woodRed)

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

/** Triangular prism, ridge along local Z. Base sits at y = 0 of the mesh. */
function prism(halfW: number, h: number, len: number, color: string): Mesh {
  const s = new Shape();
  s.moveTo(-halfW, 0);
  s.lineTo(halfW, 0);
  s.lineTo(0, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: len, bevelEnabled: false });
  geo.translate(0, 0, -len / 2);
  return new Mesh(geo, mat(color));
}

/** Wall segment between two ground points: limestone curtain + red coping. */
function wallSegment(
  x0: number,
  z0: number,
  x1: number,
  z1: number,
  h: number
): Group {
  const g = new Group();
  const len = Math.hypot(x1 - x0, z1 - z0) + 0.02; // tuck ends into towers
  g.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
  g.rotation.y = Math.atan2(x1 - x0, z1 - z0);
  const body = new Mesh(new BoxGeometry(0.036, h, len), mat(TONES.stone));
  body.position.y = h / 2;
  g.add(body);
  const coping = prism(0.03, 0.035, len, TONES.woodRed);
  coping.position.y = h;
  g.add(coping);
  return g;
}

/** Round wall tower: limestone drum, overhanging red cone, front window. */
function wallTower(
  x: number,
  z: number,
  r: number,
  bodyH: number,
  coneH: number,
  coneColor: string = TONES.woodRed
): Group {
  const g = new Group();
  g.position.set(x, 0, z);
  const body = new Mesh(
    new CylinderGeometry(r, r * 1.09, bodyH, 10),
    mat(TONES.white)
  );
  body.position.y = bodyH / 2;
  g.add(body);
  const cone = new Mesh(new ConeGeometry(r * 1.32, coneH, 10), mat(coneColor));
  cone.position.y = bodyH + coneH / 2;
  g.add(cone);
  // slit windows facing the viewer side
  const win = box(0.014, 0.026, 0.012, 0, bodyH * 0.62, r * 0.92, TONES.ink);
  g.add(win);
  const win2 = box(0.012, 0.02, 0.012, r * 0.55, bodyH * 0.36, r * 0.72, TONES.ink);
  g.add(win2);
  return g;
}

/** Small gabled town house, slightly rotated for a huddled medieval feel. */
function house(
  x: number,
  z: number,
  w: number,
  d: number,
  h: number,
  roofH: number,
  rotY: number,
  wallColor: string,
  roofColor: string
): Group {
  const g = new Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  g.add(box(w, h, d, 0, h / 2, 0, wallColor));
  const roof = prism(w / 2 + 0.006, roofH, d + 0.012, roofColor);
  roof.position.y = h;
  g.add(roof);
  return g;
}

/** Round-ish papercraft tree: cone canopy on a stub trunk. */
function tree(x: number, z: number, s: number): Group {
  const g = new Group();
  g.position.set(x, 0, z);
  g.add(box(0.014 * s, 0.03 * s, 0.014 * s, 0, 0.015 * s, 0, TONES.ironDark));
  const canopy = new Mesh(
    new ConeGeometry(0.038 * s, 0.085 * s, 7),
    mat(TONES.forest)
  );
  canopy.position.y = (0.03 + 0.042) * s;
  g.add(canopy);
  return g;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  // ---- city wall: shallow arc across the front, three round towers ----
  const T1 = { x: -0.29, z: 0.02 };
  const T2 = { x: -0.08, z: 0.185 };
  const T3 = { x: 0.21, z: 0.135 };
  const WALL_H = 0.115;
  g.add(wallSegment(T1.x, T1.z, T2.x, T2.z, WALL_H));
  g.add(wallSegment(T2.x, T2.z, T3.x, T3.z, WALL_H));
  g.add(wallSegment(T3.x, T3.z, 0.345, -0.045, WALL_H)); // trails to the rim
  g.add(wallTower(T1.x, T1.z, 0.046, 0.2, 0.115));
  g.add(wallTower(T2.x, T2.z, 0.052, 0.24, 0.135)); // stoutest, mid-front
  g.add(wallTower(T3.x, T3.z, 0.042, 0.185, 0.105, TILE));

  // ---- huddled red-roofed houses between wall and church ----
  g.add(house(-0.21, -0.1, 0.1, 0.075, 0.07, 0.05, 0.35, TONES.white, TILE));
  g.add(house(-0.13, 0.0, 0.075, 0.058, 0.05, 0.04, -0.25, TONES.sand, TONES.woodRed));
  g.add(house(0.02, 0.05, 0.095, 0.07, 0.075, 0.05, 0.15, TONES.stone, TILE));
  g.add(house(0.13, -0.02, 0.08, 0.06, 0.055, 0.042, -0.4, TONES.white, TONES.woodRed));
  g.add(house(0.25, -0.09, 0.09, 0.07, 0.065, 0.048, 0.5, TONES.sand, TILE));
  g.add(house(0.14, -0.16, 0.1, 0.08, 0.08, 0.055, -0.15, TONES.white, TILE));
  g.add(house(-0.24, -0.22, 0.095, 0.075, 0.07, 0.05, -0.5, TONES.stone, TONES.woodRed));
  g.add(house(-0.13, -0.3, 0.085, 0.065, 0.06, 0.045, 0.3, TONES.white, TILE));

  // ---- Oleviste (St. Olaf's): white tower, dark needle spire ----
  const OX = -0.03;
  const OZ = -0.14;
  // tower shaft
  g.add(box(0.085, 0.44, 0.085, OX, 0.22, OZ, TONES.white));
  // stacked slit windows on the front face
  for (const y of [0.14, 0.24, 0.34]) {
    g.add(box(0.02, 0.05, 0.012, OX, y, OZ + 0.041, TONES.ink));
  }
  // cornice + octagonal belfry drum
  g.add(box(0.102, 0.02, 0.102, OX, 0.45, OZ, TONES.stone));
  const drum = new Mesh(new CylinderGeometry(0.046, 0.049, 0.1, 8), mat(TONES.white));
  drum.position.set(OX, 0.51, OZ);
  g.add(drum);
  // verdigris balcony skirt where the spire meets the drum
  const skirt = new Mesh(
    new CylinderGeometry(0.033, 0.06, 0.032, 8),
    mat(TONES.verdigris)
  );
  skirt.position.set(OX, 0.576, OZ);
  g.add(skirt);
  // the long dark needle — very slender, the defining Oleviste stroke
  const spire = new Mesh(new ConeGeometry(0.042, 0.38, 8), mat(TONES.ink));
  spire.position.set(OX, 0.78, OZ);
  g.add(spire);
  // gold finial
  const ball = new Mesh(new SphereGeometry(0.011, 8, 6), mat(TONES.gold));
  ball.position.set(OX, 0.977, OZ);
  g.add(ball);

  // ---- church nave behind the tower: white walls, tall dark roof ----
  g.add(box(0.105, 0.1, 0.15, OX, 0.05, OZ - 0.117, TONES.white));
  const naveRoof = prism(0.06, 0.085, 0.16, TONES.ink);
  naveRoof.position.set(OX, 0.1, OZ - 0.117);
  g.add(naveRoof);

  // ---- greenery at the plaza rim (Patkuli slopes) ----
  g.add(tree(-0.325, -0.11, 1));
  g.add(tree(0.315, -0.16, 0.85));
  g.add(tree(0.28, 0.02, 0.7));
  g.add(tree(-0.3, -0.28, 0.8));

  return g;
}
