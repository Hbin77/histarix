// Fiat Tagliero (Asmara) — papercraft: Futurist service station shaped like
// an airplane. Cream stepped control tower with a glazed centre strip and a
// vertical sign fin, flanked by two enormous unsupported concrete wings
// tapering to points over a faded-terracotta service block.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const CREAM = "#e6dfcf";
const CREAM_SHADE = "#c5bca6";
const FASCIA = "#a89d85";
const GLASS = "#59627a";

/** Wing outline in plan (world x, z) for the +x side; root meets the tower.
 *  Kept to five points so the leading and trailing edges stay dead straight
 *  and the tip creases to a hard papercraft point. */
const WING: Array<[number, number]> = [
  [0.07, 0.136],
  [0.3, 0.102],
  [0.372, 0.0],
  [0.3, -0.098],
  [0.07, -0.136],
];

const WING_Y = 0.19; // underside of the cantilever

/** Flat cantilever slab: plan outline extruded upward, base at y0. */
function wingSlab(sign: number, y0: number, h: number, color: string): Mesh {
  const s = new Shape();
  WING.forEach(([x, z], i) =>
    i === 0 ? s.moveTo(sign * x, -z) : s.lineTo(sign * x, -z)
  );
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: h, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, y0, 0);
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

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.375));

  // ---- faded-terracotta service block behind the tower ----
  g.add(box(0.56, 0.145, 0.15, 0, 0.0725, -0.165, TONES.brick));
  g.add(box(0.576, 0.016, 0.166, 0, 0.153, -0.165, CREAM));
  g.add(box(0.47, 0.04, 0.006, 0, 0.09, -0.097, TONES.ink)); // window strip
  for (const x of [-0.205, 0, 0.205])
    g.add(box(0.016, 0.145, 0.006, x, 0.0725, -0.096, CREAM)); // pilasters

  // low kiosk tucked under the left wing
  g.add(box(0.14, 0.085, 0.1, -0.21, 0.0425, 0.02, TONES.brick));
  g.add(box(0.152, 0.014, 0.112, -0.21, 0.092, 0.02, CREAM));
  g.add(box(0.1, 0.032, 0.006, -0.21, 0.055, 0.072, TONES.ink));

  // ---- stepped control tower ----
  g.add(box(0.21, 0.19, 0.195, 0, 0.095, 0, CREAM));
  g.add(box(0.175, 0.13, 0.165, 0, 0.255, 0, CREAM));
  g.add(box(0.14, 0.11, 0.14, 0, 0.375, 0, CREAM));
  g.add(box(0.108, 0.08, 0.112, 0, 0.47, 0, CREAM));
  g.add(box(0.124, 0.014, 0.128, 0, 0.517, 0, CREAM_SHADE)); // roof coping

  // thin dark window strips down the tower flanks
  for (const sx of [1, -1]) {
    g.add(box(0.006, 0.12, 0.05, sx * 0.106, 0.09, 0.024, TONES.ink));
    g.add(box(0.006, 0.12, 0.05, sx * 0.106, 0.09, -0.048, TONES.ink));
    g.add(box(0.006, 0.09, 0.052, sx * 0.0912, 0.255, 0, TONES.ink));
    g.add(box(0.006, 0.07, 0.042, sx * 0.0742, 0.375, 0, TONES.ink));
  }

  // ---- glazed stair strip climbing the tower front, mullion-barred ----
  g.add(box(0.082, 0.44, 0.036, 0, 0.27, 0.104, GLASS));
  for (const y of [0.06, 0.175, 0.29, 0.4, 0.478])
    g.add(box(0.088, 0.011, 0.042, 0, y, 0.104, CREAM));
  for (const sx of [1, -1])
    g.add(box(0.008, 0.44, 0.042, sx * 0.044, 0.27, 0.104, CREAM));

  // ---- cantilevered wings: cream deck over a dark fascia ----
  for (const sign of [1, -1]) {
    g.add(wingSlab(sign, WING_Y, 0.02, FASCIA));
    g.add(wingSlab(sign, WING_Y + 0.02, 0.028, CREAM));
  }

  // ---- vertical sign fin with its red lettering panel ----
  g.add(box(0.09, 0.31, 0.022, 0, 0.665, 0.104, CREAM));
  g.add(box(0.056, 0.25, 0.008, 0, 0.665, 0.119, TONES.woodRed));
  g.add(box(0.104, 0.015, 0.032, 0, 0.828, 0.104, CREAM_SHADE));

  // twin masts flanking the fin
  for (const sx of [1, -1]) {
    const mast = new Mesh(
      new CylinderGeometry(0.004, 0.0055, 0.28, 6),
      mat(CREAM_SHADE)
    );
    mast.position.set(sx * 0.058, 0.72, 0.088);
    g.add(mast);
  }

  // ---- forecourt pumps under the right wing, for scale ----
  for (const x of [0.2, 0.272]) {
    g.add(box(0.026, 0.062, 0.026, x, 0.031, 0.03, CREAM_SHADE));
    g.add(box(0.028, 0.012, 0.028, x, 0.068, 0.03, TONES.ink));
  }

  return g;
}
