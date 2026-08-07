// Arche d'Aloba (Ennedi, Chad) — papercraft: an impossibly slender ochre
// sandstone ribbon soaring from the desert floor and landing on a rugged
// cliff buttress, spanning a tall opening over pale wind-blown sand.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Vector2,
} from "three";
import { mat } from "./materials";

const ROCK = "#bd8a5c"; // ochre-orange sandstone
const ROCK_DARK = "#a1704a";
const ROCK_LIGHT = "#cb9d6c";
const SAND = "#e0cba3";

// Arch centreline. t runs -1 (desert foot) -> 0 (crown) -> 1 (cliff landing).
const CROWN_X = -0.035;
const CROWN_Y = 0.86;
const SPAN_L = 0.265; // crown to the free-standing foot
const SPAN_R = 0.225; // crown to the cliff landing
const FOOT_Y = 0.014; // the free foot beds into its own footing
const LAND_Y = 0.2; // height of the ledge the arch lands on
const SEGS = 26;

function archPoint(t: number): [number, number] {
  if (t <= 0) {
    const u = -t;
    return [CROWN_X - SPAN_L * u, FOOT_Y + (CROWN_Y - FOOT_Y) * (1 - Math.pow(u, 2.3))];
  }
  return [CROWN_X + SPAN_R * t, LAND_Y + (CROWN_Y - LAND_Y) * (1 - Math.pow(t, 2.3))];
}

/** Ribbon cross-section: razor-thin at the crown, stouter at the springings. */
const archThick = (t: number) => 0.026 + 0.062 * Math.pow(Math.abs(t), 2.4);
const archWidth = (t: number) => 0.07 + 0.055 * Math.pow(Math.abs(t), 2);

/** Rugged sandstone block: battered prism with a broken, tilted top. */
function crag(
  x: number,
  z: number,
  r: number,
  h: number,
  sides: number,
  ry: number,
  tilt: number,
  color: string
): Mesh {
  const m = new Mesh(new CylinderGeometry(r * 0.9, r, h, sides), mat(color));
  // a tilted prism drops a corner, so lift it back onto the sand
  m.position.set(x, h / 2 + r * Math.abs(tilt) * 1.7, z);
  m.rotation.set(tilt, ry, tilt * 0.7);
  return m;
}

function slab(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  ry: number,
  rz: number,
  color: string
): Mesh {
  const m = new Mesh(new BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z);
  m.rotation.set(0, ry, rz);
  return m;
}

export function build(): Group {
  const g = new Group();

  // ---- desert floor: pale sand pan with a soft, uneven edge ----
  const pan = new Mesh(
    new LatheGeometry(
      [
        new Vector2(0.368, 0),
        new Vector2(0.364, 0.012),
        new Vector2(0.348, 0.024),
        new Vector2(0.0001, 0.028),
      ],
      30
    ),
    mat(SAND)
  );
  const pos = pan.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    if (Math.abs(pos.getY(i)) > 1e-4) continue;
    const a = Math.atan2(pos.getZ(i), pos.getX(i));
    pos.setY(i, Math.max(0, 0.008 * (0.5 + 0.5 * Math.sin(3 * a + 1.2) + 0.3 * Math.sin(5 * a))));
  }
  pos.needsUpdate = true;
  pan.geometry.computeVertexNormals();
  g.add(pan);

  // ---- the arch ribbon ----
  for (let i = 0; i < SEGS; i++) {
    const t0 = -1 + (2 * i) / SEGS;
    const t1 = -1 + (2 * (i + 1)) / SEGS;
    const [x0, y0] = archPoint(t0);
    const [x1, y1] = archPoint(t1);
    const tm = (t0 + t1) / 2;
    const len = Math.hypot(x1 - x0, y1 - y0) + 0.008; // overlap the joints
    const rough = 1 + 0.09 * Math.sin(9 * tm + 1.3) + 0.06 * Math.sin(15 * tm);
    const seg = new Mesh(
      new BoxGeometry(len, archThick(tm) * rough, archWidth(tm) * rough),
      mat(tm > 0.15 || tm < -0.55 ? ROCK : ROCK_LIGHT)
    );
    seg.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0);
    seg.rotation.z = Math.atan2(y1 - y0, x1 - x0);
    g.add(seg);
  }

  // ---- footing of the free-standing leg ----
  g.add(crag(-0.284, 0.0, 0.07, 0.15, 6, 0.4, 0.05, ROCK));
  g.add(crag(-0.302, 0.072, 0.043, 0.085, 5, 1.1, 0.09, ROCK_DARK));
  g.add(crag(-0.258, -0.082, 0.042, 0.062, 5, 0.7, 0.06, ROCK_LIGHT));

  // ---- cliff buttress: stacked broken masses, no two tops alike ----
  g.add(crag(0.236, -0.015, 0.13, 0.19, 6, 0.3, 0, ROCK_DARK)); // plinth
  g.add(crag(0.24, -0.03, 0.112, 0.42, 5, 0.9, 0.03, ROCK)); // main mass
  g.add(slab(0.18, 0.1, 0.16, 0.234, 0.45, -0.03, 0.55, 0.08, ROCK_LIGHT));
  g.add(slab(0.125, 0.07, 0.105, 0.212, 0.52, 0.01, -0.3, -0.11, ROCK));
  g.add(crag(0.292, 0.08, 0.056, 0.31, 5, 1.4, 0.04, ROCK_DARK));
  g.add(crag(0.282, -0.118, 0.054, 0.26, 5, 0.5, -0.05, ROCK_DARK));
  g.add(crag(0.185, 0.12, 0.05, 0.22, 5, 0.2, 0.07, ROCK_LIGHT));
  g.add(crag(0.19, -0.115, 0.046, 0.17, 5, 1.0, -0.06, ROCK));

  // shoulder ledge the arch lands on
  g.add(crag(0.178, 0.0, 0.062, 0.21, 6, 0.7, 0, ROCK_LIGHT));
  g.add(slab(0.11, 0.028, 0.13, 0.185, 0.207, 0, 0.25, 0, ROCK));

  // ---- slender pinnacle standing inside the opening ----
  const pinnacle = new Group();
  pinnacle.position.set(-0.01, 0.024, 0.09);
  const shaft = new Mesh(new CylinderGeometry(0.02, 0.04, 0.17, 6), mat(ROCK_DARK));
  shaft.position.y = 0.085;
  pinnacle.add(shaft);
  const tip = new Mesh(new ConeGeometry(0.022, 0.065, 6), mat(ROCK));
  tip.position.y = 0.2;
  pinnacle.add(tip);
  g.add(pinnacle);

  // scattered boulders on the pan
  g.add(crag(-0.14, 0.2, 0.034, 0.042, 5, 0.9, 0.12, ROCK_DARK));
  g.add(crag(0.06, -0.25, 0.04, 0.048, 5, 0.3, 0.08, ROCK));
  g.add(crag(-0.09, -0.17, 0.028, 0.032, 5, 1.3, 0.15, ROCK_DARK));

  return g;
}
