// Palacio Salvo (Montevideo) — papercraft: a chunky arcaded corner base with
// two lower wings, a stepped eclectic mass narrowing into a slender shaft,
// and the landmark bulbous ribbed crown carrying a lantern turret and mast.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const STONE = "#d3c3a4"; // muted sand-beige
const STONE_D = "#b8a684";
const GLASS = "#79736a"; // shadowed window band
const GREEN = "#7b9188"; // grey-green dome accent
const GREEN_D = "#677d74";

/** Block spanning y0..y1, centred on (x, z). */
function box(
  w: number,
  d: number,
  y0: number,
  y1: number,
  color: string,
  x = 0,
  z = 0
): Mesh {
  const m = new Mesh(new BoxGeometry(w, y1 - y0, d), mat(color));
  m.position.set(x, (y0 + y1) / 2, z);
  return m;
}

/** Recessed window band wrapping all four faces of a block. */
function band(w: number, d: number, y: number, h: number, x = 0): Mesh {
  return box(w, d, y - h / 2, y + h / 2, GLASS, x);
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.36));

  // ---- arcaded podium ----
  g.add(box(0.54, 0.34, 0.0, 0.105, STONE));
  g.add(box(0.53, 0.35, 0.028, 0.09, GLASS)); // arcade void
  // piers chopping the void into arches (each spans two opposite faces)
  for (const x of [-0.225, -0.135, -0.045, 0.045, 0.135, 0.225])
    g.add(box(0.018, 0.36, 0.028, 0.09, STONE_D, x));
  for (const z of [-0.115, -0.04, 0.04, 0.115])
    g.add(box(0.55, 0.018, 0.028, 0.09, STONE_D, 0, z));
  g.add(box(0.56, 0.36, 0.105, 0.123, STONE_D));

  // ---- two lower wings flanking the corner tower ----
  for (const s of [-1, 1]) {
    const x = s * 0.185;
    g.add(box(0.17, 0.3, 0.123, 0.271, STONE, x));
    g.add(band(0.174, 0.304, 0.168, 0.026, x));
    g.add(band(0.174, 0.304, 0.228, 0.026, x));
    g.add(box(0.186, 0.316, 0.271, 0.289, STONE_D, x));
    // stubby corner turrets on the wing parapets
    for (const sz of [-1, 1]) {
      const t = new Mesh(new CylinderGeometry(0.019, 0.022, 0.05, 8), mat(STONE));
      t.position.set(x + s * 0.07, 0.314, sz * 0.13);
      g.add(t);
      const c = new Mesh(new ConeGeometry(0.024, 0.03, 8), mat(GREEN));
      c.position.set(x + s * 0.07, 0.354, sz * 0.13);
      g.add(c);
    }
  }

  // ---- central mass rising between the wings ----
  g.add(box(0.24, 0.26, 0.123, 0.401, STONE));
  for (const y of [0.175, 0.238, 0.301, 0.364]) g.add(band(0.244, 0.264, y, 0.024));
  // pilaster strips give the eclectic verticality
  for (const x of [-0.088, -0.03, 0.03, 0.088])
    g.add(box(0.016, 0.268, 0.123, 0.401, STONE_D, x));
  g.add(box(0.266, 0.286, 0.401, 0.421, STONE_D));

  // ---- stepped setback ----
  g.add(box(0.175, 0.19, 0.421, 0.56, STONE));
  for (const y of [0.468, 0.524]) g.add(band(0.179, 0.194, y, 0.026));
  for (const x of [-0.06, 0, 0.06]) g.add(box(0.014, 0.196, 0.421, 0.56, STONE_D, x));
  g.add(box(0.196, 0.211, 0.56, 0.577, STONE_D));

  // ---- slender shaft ----
  g.add(box(0.125, 0.135, 0.577, 0.73, STONE));
  for (const y of [0.622, 0.674]) g.add(band(0.129, 0.139, y, 0.024));
  for (const x of [-0.042, 0.042]) g.add(box(0.013, 0.14, 0.577, 0.73, STONE_D, x));
  g.add(box(0.152, 0.162, 0.73, 0.748, STONE_D));

  // ---- octagonal drum under the crown ----
  const drum = new Mesh(new CylinderGeometry(0.055, 0.06, 0.047, 8), mat(STONE));
  drum.rotation.y = Math.PI / 8;
  drum.position.y = 0.7715;
  g.add(drum);
  const drumWin = new Mesh(new CylinderGeometry(0.049, 0.052, 0.028, 8), mat(GLASS));
  drumWin.rotation.y = Math.PI / 8;
  drumWin.position.y = 0.7715;
  g.add(drumWin);

  // ---- bulbous ribbed crown: 10 facets read as the melon ribs ----
  const prof: Array<[number, number]> = [
    [0.058, 0.0],
    [0.07, 0.022],
    [0.07, 0.042],
    [0.062, 0.062],
    [0.045, 0.08],
    [0.025, 0.092],
    [0.0001, 0.099],
  ];
  const crown = new Mesh(
    new LatheGeometry(
      prof.map(([r, y]) => new Vector2(r, y)),
      10
    ),
    mat(GREEN)
  );
  crown.rotation.y = Math.PI / 10;
  crown.position.y = 0.793;
  g.add(crown);

  // ---- lantern turret and mast ----
  const lantBase = new Mesh(new CylinderGeometry(0.027, 0.03, 0.013, 8), mat(STONE_D));
  lantBase.position.y = 0.888;
  g.add(lantBase);
  const lantern = new Mesh(new CylinderGeometry(0.02, 0.023, 0.05, 8), mat(STONE));
  lantern.position.y = 0.92;
  g.add(lantern);
  const lantWin = new Mesh(new CylinderGeometry(0.017, 0.019, 0.03, 8), mat(GLASS));
  lantWin.position.y = 0.92;
  g.add(lantWin);
  const lantCap = new Mesh(new ConeGeometry(0.026, 0.03, 10), mat(GREEN_D));
  lantCap.position.y = 0.952;
  g.add(lantCap);
  const mast = new Mesh(new CylinderGeometry(0.003, 0.006, 0.044, 6), mat(TONES.ironDark));
  mast.position.y = 0.96;
  g.add(mast);

  return g;
}
