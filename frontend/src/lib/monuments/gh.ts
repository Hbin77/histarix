// Cape Coast Castle (Ghana) — papercraft coastal fort: whitewashed walls on
// a rocky promontory, seaward gun rampart with a row of black cannons,
// crenellated corner bastions, rear whitewashed blocks with muted red roofs.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
} from "three";
import { mat, TONES } from "./materials";

const SQ2 = Math.SQRT2;
const DECK = "#ddd6c4"; // sun-bleached rampart deck
const ROCK = "#6c6656"; // dark coastal rock
const FOAM = "#dceaf2"; // surf fringe along the shore
const TOWER = "#9a8d76"; // weathered stone of the sea bastion

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

/** Rectangular hip-roof frustum, base at y=0 of the mesh. */
function hipRoof(hx: number, hz: number, h: number, t: number, color: string): Mesh {
  const geo = new CylinderGeometry(t * SQ2, SQ2, 1, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, 0.5, 0);
  const m = new Mesh(geo, mat(color));
  m.scale.set(hx, h, hz);
  return m;
}

/** Extrude a flat slab from world-space (x, z) outline points; base at y=0. */
function slab(pts: [number, number][], h: number, color: string): Mesh {
  const s = new Shape();
  pts.forEach(([x, z], i) => (i === 0 ? s.moveTo(x, -z) : s.lineTo(x, -z)));
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: h, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  return new Mesh(geo, mat(color));
}

// Jagged coast line (left → right, world coords); promontory on the left
// carries the sea bastion.
const COAST: [number, number][] = [
  [-0.335, 0.09],
  [-0.27, 0.16],
  [-0.215, 0.24],
  [-0.15, 0.2],
  [-0.1, 0.145],
  [0.0, 0.125],
  [0.1, 0.15],
  [0.18, 0.115],
  [0.27, 0.14],
  [0.335, 0.075],
];
// Back edge of the landmass reaching the water-disc rim (mainland coast,
// not an island — no water ring behind the fort).
const BACK_ARC: [number, number][] = [
  [0.366, -0.04],
  [0.337, -0.147],
  [0.273, -0.242],
  [0.179, -0.315],
  [0.063, -0.363],
  [-0.063, -0.363],
  [-0.179, -0.315],
  [-0.273, -0.242],
  [-0.337, -0.147],
  [-0.366, -0.04],
];

export function build(): Group {
  const root = new Group();
  const g = new Group();
  root.add(g);
  // Slight turn so the seaward rampart + cannon row read from the front and
  // aerial-quarter views instead of being seen dead-on.
  g.rotation.y = -0.38;

  // ---- ocean ground + shoreline ----
  const water = new Mesh(new CylinderGeometry(0.37, 0.37, 0.016, 28), mat(TONES.water));
  water.position.y = 0.008;
  g.add(water);

  const foamPts: [number, number][] = COAST.map(([x, z]) => [x * 1.04, z + 0.03]);
  g.add(slab([...foamPts, ...BACK_ARC], 0.022, FOAM));
  g.add(slab([...COAST, ...BACK_ARC], 0.042, TONES.sand));

  // scattered dark rocks at the surf line
  const rocks: [number, number, number, number, number][] = [
    [-0.245, 0.265, 0.05, 0.045, 0.4],
    [-0.3, 0.15, 0.045, 0.04, 1.1],
    [-0.05, 0.165, 0.04, 0.03, 0.7],
    [0.14, 0.185, 0.045, 0.035, 1.9],
    [0.3, 0.115, 0.05, 0.04, 0.2],
  ];
  for (const [x, z, w, h, ry] of rocks) {
    const r = box(w, h, w * 0.85, x, h * 0.35, z, ROCK);
    r.rotation.y = ry;
    g.add(r);
  }

  // ---- seaward gun rampart (long white platform + parapet) ----
  const deckY = 0.117; // platform top
  g.add(box(0.46, 0.075, 0.17, 0, 0.0795, 0.035, TONES.white));
  g.add(box(0.44, 0.008, 0.155, 0, deckY + 0.004, 0.035, DECK));
  // parapet along the seaward edge + merlons leaving embrasures for the guns
  g.add(box(0.46, 0.026, 0.018, 0, deckY + 0.017, 0.111, TONES.white));
  for (let i = 0; i < 8; i++)
    g.add(box(0.026, 0.022, 0.02, -0.21 + i * 0.06, deckY + 0.041, 0.111, TONES.white));
  // low side walls
  g.add(box(0.016, 0.024, 0.16, -0.222, deckY + 0.016, 0.03, TONES.white));
  g.add(box(0.016, 0.024, 0.16, 0.222, deckY + 0.016, 0.03, TONES.white));

  // ---- row of black cannons firing through the embrasures ----
  const barrelGeo = new CylinderGeometry(0.005, 0.009, 0.072, 6);
  barrelGeo.rotateX(Math.PI / 2 + 0.09); // muzzle (+z) dips over the parapet
  const barrelMat = mat(TONES.ink);
  const carriageMat = mat(TONES.ironDark);
  for (let i = 0; i < 7; i++) {
    const x = -0.18 + i * 0.06; // centred between merlons
    const b = new Mesh(barrelGeo, barrelMat);
    b.position.set(x, deckY + 0.032, 0.1);
    g.add(b);
    const c = new Mesh(new BoxGeometry(0.02, 0.016, 0.028), carriageMat);
    c.position.set(x, deckY + 0.013, 0.082);
    g.add(c);
  }

  // ---- corner bastions ----
  // weathered stone sea-tower on the promontory rocks
  const seaTower = new Mesh(new CylinderGeometry(0.066, 0.078, 0.13, 12), mat(TOWER));
  seaTower.position.set(-0.21, 0.085, 0.185);
  g.add(seaTower);
  const seaRim = new Mesh(new CylinderGeometry(0.074, 0.07, 0.02, 12), mat(TONES.white));
  seaRim.position.set(-0.21, 0.158, 0.185);
  g.add(seaRim);
  // white corner bastion on the fort's right shoulder
  const bastion = new Mesh(new CylinderGeometry(0.055, 0.065, 0.115, 12), mat(TONES.white));
  bastion.position.set(0.245, 0.095, 0.06);
  g.add(bastion);
  const bastionRim = new Mesh(new CylinderGeometry(0.062, 0.058, 0.018, 12), mat(TONES.white));
  bastionRim.position.set(0.245, 0.16, 0.06);
  g.add(bastionRim);
  // merlons around both bastion rims
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const m1 = box(0.018, 0.016, 0.012, -0.21 + Math.sin(a) * 0.068, 0.176, 0.185 + Math.cos(a) * 0.068, TONES.white);
    m1.rotation.y = a;
    g.add(m1);
    const m2 = box(0.016, 0.014, 0.011, 0.245 + Math.sin(a) * 0.056, 0.176, 0.06 + Math.cos(a) * 0.056, TONES.white);
    m2.rotation.y = a;
    g.add(m2);
  }

  // ---- landward enclosure: wall from the right bastion to a rear turret ----
  const landWall = box(0.016, 0.05, 0.285, 0.2465, 0.067, -0.1075, TONES.white);
  landWall.rotation.y = 0.259;
  g.add(landWall);
  const turret = new Mesh(new CylinderGeometry(0.034, 0.04, 0.075, 10), mat(TONES.white));
  turret.position.set(0.21, 0.079, -0.245);
  g.add(turret);
  const turretRim = new Mesh(new CylinderGeometry(0.04, 0.036, 0.014, 10), mat(TONES.white));
  turretRim.position.set(0.21, 0.122, -0.245);
  g.add(turretRim);

  // ---- coconut palms on the back-left shore ----
  for (const [px, pz, lean] of [
    [-0.24, -0.17, 0.16],
    [-0.295, -0.05, -0.12],
  ] as const) {
    const trunk = new Mesh(new CylinderGeometry(0.005, 0.008, 0.095, 5), mat(TONES.ironDark));
    trunk.position.set(px, 0.088, pz);
    trunk.rotation.z = lean;
    g.add(trunk);
    // drooping frond umbrella anchored on the trunk top
    const tx = px - Math.sin(lean) * 0.0475;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.4;
      const frond = box(0.048, 0.005, 0.015, tx, 0.138, pz, TONES.forest);
      frond.rotation.set(0, a, -0.42);
      frond.translateX(0.02);
      g.add(frond);
    }
  }

  // ---- rear whitewashed buildings with muted red roofs ----
  // courtyard base platform
  g.add(box(0.4, 0.09, 0.24, 0.01, 0.087, -0.17, TONES.white));
  // arched openings along the courtyard front
  for (const x of [-0.09, 0.01, 0.11])
    g.add(box(0.032, 0.04, 0.008, x, 0.09, -0.048, TONES.ink));

  // main block (tallest, right of centre) + hipped red roof
  g.add(box(0.2, 0.2, 0.14, 0.1, 0.232, -0.17, TONES.white));
  const roofA = hipRoof(0.115, 0.085, 0.06, 0.25, TONES.brick);
  roofA.position.set(0.1, 0.33, -0.17);
  g.add(roofA);
  // lookout + flag on the ridge
  g.add(box(0.05, 0.04, 0.045, 0.1, 0.405, -0.17, TONES.white));
  const cap = hipRoof(0.032, 0.03, 0.02, 0.2, TONES.brick);
  cap.position.set(0.1, 0.425, -0.17);
  g.add(cap);
  const pole = new Mesh(new CylinderGeometry(0.003, 0.003, 0.07, 5), mat(TONES.slate));
  pole.position.set(0.1, 0.46, -0.17);
  g.add(pole);
  g.add(box(0.022, 0.013, 0.003, 0.113, 0.482, -0.17, TONES.woodRed));

  // lower left wing + roof
  g.add(box(0.18, 0.14, 0.13, -0.13, 0.202, -0.18, TONES.white));
  const roofB = hipRoof(0.102, 0.078, 0.05, 0.3, TONES.brickDark);
  roofB.position.set(-0.13, 0.27, -0.18);
  g.add(roofB);

  // windows (dark, slightly proud of the seaward facades)
  for (let i = 0; i < 4; i++) {
    const x = 0.045 + i * 0.037;
    g.add(box(0.017, 0.026, 0.006, x, 0.27, -0.098, TONES.ink));
    g.add(box(0.017, 0.026, 0.006, x, 0.2, -0.098, TONES.ink));
  }
  for (let i = 0; i < 3; i++)
    g.add(box(0.017, 0.024, 0.006, -0.185 + i * 0.055, 0.22, -0.113, TONES.ink));

  // twin exterior staircase up the main block's seaward face
  g.add(box(0.05, 0.012, 0.03, 0.1, 0.19, -0.115, TONES.white));
  g.add(box(0.026, 0.036, 0.006, 0.1, 0.22, -0.098, TONES.ink));
  for (const s of [1, -1]) {
    const stair = box(0.085, 0.012, 0.024, 0.1 + s * 0.065, 0.16, -0.115, TONES.white);
    stair.rotation.z = s * 0.42;
    g.add(stair);
  }

  return root;
}
