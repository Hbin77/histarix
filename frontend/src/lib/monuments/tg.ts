// Koutammakou — papercraft takienta compound: a cluster of round clay-brown
// tower-huts of stepped heights, each capped by a conical straw thatch roof
// and tied together by low mud curtain walls around an earth courtyard.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
} from "three";
import { mat, plazaDisc } from "./materials";

const CLAY = "#a87c57";
const CLAY_DARK = "#87613f";
const CLAY_LIGHT = "#ba8d68";
const THATCH = "#d6bd8b";
const THATCH_DARK = "#b8a06e";
const EARTH = "#b8946c";

interface Hut {
  x: number;
  z: number;
  r: number;
  h: number;
  roof: number;
}

// Compound layout: tall turrets on the outside, granaries filling the gaps.
const HUTS: Hut[] = [
  { x: -0.07, z: 0.19, r: 0.075, h: 0.27, roof: 0.115 },
  { x: 0.185, z: 0.1, r: 0.065, h: 0.205, roof: 0.095 },
  { x: -0.215, z: -0.055, r: 0.06, h: 0.19, roof: 0.088 },
  { x: 0.115, z: -0.185, r: 0.058, h: 0.17, roof: 0.082 },
  { x: 0.055, z: 0.275, r: 0.042, h: 0.105, roof: 0.062 },
  { x: -0.225, z: 0.155, r: 0.045, h: 0.12, roof: 0.065 },
  { x: -0.09, z: -0.235, r: 0.048, h: 0.135, roof: 0.07 },
];

const LINKS: Array<[number, number]> = [
  [0, 1],
  [1, 3],
  [3, 6],
  [6, 2],
  [2, 5],
  [5, 0],
  [0, 4],
  [4, 1],
];

/** One round mud turret: battered body, doorway, layered conical thatch. */
function hut(t: Hut): Group {
  const g = new Group();
  g.position.set(t.x, 0.02, t.z);

  // splayed mud footing, then the slightly battered body
  const foot = new Mesh(
    new CylinderGeometry(t.r * 1.04, t.r * 1.14, 0.022, 12),
    mat(CLAY_DARK)
  );
  foot.position.y = 0.011;
  g.add(foot);

  const body = new Mesh(
    new CylinderGeometry(t.r * 0.94, t.r * 1.04, t.h, 12),
    mat(CLAY)
  );
  body.position.y = t.h / 2;
  g.add(body);

  // low doorway punched in the outward-facing side
  const out = Math.atan2(t.x, t.z);
  const door = new Mesh(new BoxGeometry(t.r * 0.5, t.h * 0.32, 0.024), mat(CLAY_DARK));
  door.position.set(
    Math.sin(out) * t.r * 0.94,
    t.h * 0.19,
    Math.cos(out) * t.r * 0.94
  );
  door.rotation.y = out;
  g.add(door);

  // mud collar the thatch sits on
  const collar = new Mesh(
    new CylinderGeometry(t.r * 1.0, t.r * 0.94, 0.016, 12),
    mat(CLAY_LIGHT)
  );
  collar.position.y = t.h + 0.008;
  g.add(collar);

  // thatch: a flared eave skirt with the main cone rising out of it
  const eave = new Mesh(
    new ConeGeometry(t.r * 1.42, t.roof * 0.36, 12),
    mat(THATCH_DARK)
  );
  eave.position.y = t.h + 0.016 + (t.roof * 0.36) / 2;
  g.add(eave);

  const cap = new Mesh(new ConeGeometry(t.r * 1.2, t.roof * 0.82, 12), mat(THATCH));
  cap.position.y = t.h + 0.03 + (t.roof * 0.82) / 2;
  g.add(cap);

  const finial = new Mesh(
    new CylinderGeometry(0.004, 0.009, t.roof * 0.18, 6),
    mat(THATCH_DARK)
  );
  finial.position.y = t.h + 0.03 + t.roof * 0.82;
  g.add(finial);

  return g;
}

/** Low mud curtain wall spanning the gap between two turrets. */
function link(a: Hut, b: Hut): Group {
  const g = new Group();
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const dist = Math.hypot(dx, dz);
  const span = dist - a.r * 0.85 - b.r * 0.85;
  if (span <= 0) return g;

  g.position.set((a.x + b.x) / 2, 0.02, (a.z + b.z) / 2);
  g.rotation.y = Math.atan2(dx, dz);
  const shift = (a.r * 0.85 - b.r * 0.85) / 2;

  const wall = new Mesh(new BoxGeometry(0.032, 0.092, span), mat(CLAY));
  wall.position.set(0, 0.046, -shift);
  g.add(wall);
  const coping = new Mesh(new BoxGeometry(0.04, 0.012, span), mat(CLAY_LIGHT));
  coping.position.set(0, 0.097, -shift);
  g.add(coping);
  return g;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.35));

  // beaten-earth courtyard the compound stands on
  const yard = new Mesh(new CylinderGeometry(0.31, 0.322, 0.022, 26), mat(EARTH));
  yard.position.y = 0.011;
  g.add(yard);

  for (const [i, j] of LINKS) g.add(link(HUTS[i], HUTS[j]));
  for (const h of HUTS) g.add(hut(h));

  // hearth stones and a grain mortar scattered across the courtyard
  const lump = (x: number, z: number, s: number, ry: number, color: string) => {
    const m = new Mesh(new BoxGeometry(s, s * 0.6, s * 0.85), mat(color));
    m.position.set(x, 0.02 + s * 0.3, z);
    m.rotation.y = ry;
    g.add(m);
  };
  lump(0.02, -0.02, 0.045, 0.5, CLAY_DARK);
  lump(-0.09, 0.05, 0.03, 1.2, CLAY_LIGHT);
  lump(0.11, -0.06, 0.026, -0.4, CLAY_DARK);

  return g;
}
