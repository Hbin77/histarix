// Alcázar de Colón (Santo Domingo) — papercraft: a long two-storey coral
// limestone block, five-arch loggias stacked one above the other behind a
// balustrade, solid end wings, and a flat roofline with small square corner
// turrets, facing its wide paved forecourt.

import {
  BoxGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const D2R = Math.PI / 180;

const STONE = "#d9cbae"; // warm sandy-beige coral limestone
const STONE_DARK = "#c1b090"; // set-back loggia wall, plinth
const SHADOW = "#544b40"; // deep-shadowed openings
const PAVE = "#cfc9bc"; // forecourt paving

const BAYS = [-0.136, -0.068, 0, 0.068, 0.136]; // five arches per storey
const PIERS = [-0.17, -0.102, -0.034, 0.034, 0.102, 0.17];

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
function arch(w: number, h: number, color: string): Mesh {
  const hw = w / 2;
  const s = new Shape();
  s.moveTo(-hw, 0);
  s.lineTo(-hw, h - hw);
  s.absarc(0, h - hw, hw, Math.PI, 0, true);
  s.lineTo(hw, 0);
  s.closePath();
  const geo = new ExtrudeGeometry(s, {
    depth: 0.008,
    bevelEnabled: false,
    curveSegments: 5,
  });
  return new Mesh(geo, mat(color));
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.35));

  // ---- paved forecourt fanning out in front ----
  const pave = [
    new Vector2(0.348, 0.012),
    new Vector2(0.348, 0.021),
    new Vector2(0.13, 0.021),
    new Vector2(0.13, 0.012),
    new Vector2(0.348, 0.012),
  ];
  g.add(new Mesh(new LatheGeometry(pave, 14, -56 * D2R, 112 * D2R), mat(PAVE)));

  // ---- plinth and the long two-storey block ----
  g.add(box(0.632, 0.022, 0.24, 0, 0.011, 0, STONE_DARK));
  g.add(box(0.6, 0.29, 0.21, 0, 0.167, 0, STONE));

  // loggia set back between the solid end wings
  g.add(box(0.352, 0.262, 0.014, 0, 0.181, 0.1, STONE_DARK));

  // ---- ground-floor arcade ----
  for (const x of BAYS) {
    const a = arch(0.052, 0.122, SHADOW);
    a.position.set(x, 0.03, 0.103);
    g.add(a);
  }
  for (const x of PIERS) g.add(box(0.017, 0.122, 0.014, x, 0.091, 0.108, STONE));

  // string course dividing the storeys
  g.add(box(0.608, 0.018, 0.218, 0, 0.167, 0, STONE_DARK));

  // ---- upper loggia, its openings half-veiled by the balustrade ----
  for (const x of BAYS) {
    const a = arch(0.052, 0.116, SHADOW);
    a.position.set(x, 0.182, 0.103);
    g.add(a);
  }
  for (const x of PIERS) g.add(box(0.015, 0.116, 0.014, x, 0.24, 0.108, STONE));

  g.add(box(0.356, 0.011, 0.022, 0, 0.185, 0.114, STONE));
  g.add(box(0.356, 0.011, 0.022, 0, 0.211, 0.114, STONE));
  for (let i = 0; i < 9; i++)
    g.add(box(0.01, 0.019, 0.016, -0.144 + i * 0.036, 0.198, 0.114, STONE));

  // ---- end-wing windows, front and returns ----
  for (const sx of [1, -1]) {
    for (const y of [0.09, 0.244])
      g.add(box(0.032, 0.046, 0.009, sx * 0.246, y, 0.106, SHADOW));
    for (const y of [0.09, 0.244])
      g.add(box(0.009, 0.046, 0.032, sx * 0.301, y, 0, SHADOW));
  }

  // ---- cornice, parapet, and the small square corner turrets ----
  g.add(box(0.622, 0.014, 0.224, 0, 0.319, 0, STONE_DARK));
  g.add(box(0.606, 0.026, 0.208, 0, 0.339, 0, STONE));
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      g.add(box(0.064, 0.042, 0.062, sx * 0.271, 0.373, sz * 0.072, STONE));
      g.add(box(0.072, 0.011, 0.07, sx * 0.271, 0.4, sz * 0.072, STONE_DARK));
    }

  return g;
}
