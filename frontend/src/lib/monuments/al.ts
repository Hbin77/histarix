// Berat Castle (Kalaja e Beratit) — papercraft hillside fortress: limestone
// curtain walls with battlements wrapping a flattened hilltop, square gate
// tower over an arched entrance, tiny white Ottoman houses ("city of a
// thousand windows") terracing the slope and dotting the ward inside.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const PLATEAU_Y = 0.26; // flattened hilltop height
const WALL_H = 0.095;
const WALL_T = 0.038;
const HILL_SQUASH = 0.85; // elliptical hill plan (narrow x, long z)
const COURTYARD = "#c9bd9c"; // dry-grass ward ground
const ARCH_SHADOW = "#6b6154";

/** Irregular hilltop polygon (CCW). Front (+z) segment 0→1 holds the gate. */
const PTS = [
  { x: -0.09, z: 0.21 },
  { x: 0.09, z: 0.21 },
  { x: 0.19, z: 0.09 },
  { x: 0.2, z: -0.08 },
  { x: 0.1, z: -0.22 },
  { x: -0.06, z: -0.24 },
  { x: -0.18, z: -0.14 },
  { x: -0.2, z: 0.04 },
];

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

// ---- hillside noise (shared by the lathe jitter and house placement) ----
const J_TOP = 0.24;
const J_AMP = 0.065;
const J_PHASE = 1.3;

function noise(a: number): number {
  return (
    0.45 * Math.sin(3 * a + J_PHASE) +
    0.3 * Math.sin(5 * a + 2.1 * J_PHASE) +
    0.2 * Math.sin(7 * a + 4.2 * J_PHASE) +
    0.15 * Math.sin(11 * a + 6.6 * J_PHASE)
  );
}

/** Noise scale factor at lathe angle a and height y (1 at plateau rim). */
function surfF(a: number, y: number): number {
  return 1 + Math.max(0, (J_TOP - y) / J_TOP) * J_AMP * noise(a);
}

/** Radially displace lathe vertices by angle-noise, tapering to 0 at J_TOP
 *  so the plateau rim stays put. Integer frequencies keep the seam closed. */
function jitter(mesh: Mesh): void {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (Math.hypot(x, z) < 1e-5) continue;
    const f = surfF(Math.atan2(z, x), y);
    pos.setXYZ(i, x * f, y, z * f);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

/** Curtain-wall run from a to b (top of plateau), with merlons. */
function wallRun(a: { x: number; z: number }, b: { x: number; z: number }): Group {
  const grp = new Group();
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const len = Math.hypot(dx, dz);
  grp.position.set(a.x, PLATEAU_Y, a.z);
  grp.rotation.y = Math.atan2(dx, dz); // local +z runs a → b

  const body = new Mesh(
    new BoxGeometry(WALL_T, WALL_H, len + WALL_T * 0.8),
    mat(TONES.stone)
  );
  body.position.set(0, WALL_H / 2, len / 2);
  grp.add(body);

  // battlement merlons along the top
  const n = Math.max(2, Math.floor(len / 0.052));
  for (let i = 0; i < n; i++) {
    const zi = ((i + 0.5) / n) * len;
    const m = new Mesh(new BoxGeometry(WALL_T, 0.024, 0.024), mat(TONES.stone));
    m.position.set(0, WALL_H + 0.012, zi);
    grp.add(m);
  }
  return grp;
}

/** Tiny white Ottoman house with terracotta gable roof + dark windows. */
function house(
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  rotY: number,
  roofTone: string
): Group {
  const grp = new Group();
  grp.position.set(x, y, z);
  grp.rotation.y = rotY;

  const wh = 0.042;
  const body = new Mesh(new BoxGeometry(w, wh, d), mat(TONES.white));
  body.position.y = wh / 2;
  grp.add(body);

  const rh = 0.022;
  const s = new Shape();
  s.moveTo(-d / 2 - 0.005, 0);
  s.lineTo(d / 2 + 0.005, 0);
  s.lineTo(0, rh);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: w + 0.01, bevelEnabled: false });
  geo.translate(0, 0, -(w + 0.01) / 2);
  geo.rotateY(Math.PI / 2);
  const roof = new Mesh(geo, mat(roofTone));
  roof.position.y = wh;
  grp.add(roof);

  // "thousand windows": small dark panes on the long face
  const count = w > 0.06 ? 3 : 2;
  for (let i = 0; i < count; i++) {
    const wx = (i - (count - 1) / 2) * (w / count);
    const win = new Mesh(new BoxGeometry(0.011, 0.016, 0.005), mat(TONES.ink));
    win.position.set(wx, 0.024, d / 2 + 0.001);
    grp.add(win);
  }
  return grp;
}

export function build(): Group {
  const g = new Group();

  // ---- hill: rocky limestone mass, elliptical plan, flattened top ----
  const terrain = new Group();
  terrain.scale.x = HILL_SQUASH;
  g.add(terrain);

  const hillPts = [
    new Vector2(0.34, 0),
    new Vector2(0.332, 0.012),
    new Vector2(0.316, 0.06),
    new Vector2(0.309, 0.095), // slight rocky ledge
    new Vector2(0.296, 0.13),
    new Vector2(0.291, 0.16), // ledge
    new Vector2(0.282, 0.19),
    new Vector2(0.279, 0.215),
    new Vector2(0.272, 0.245),
    new Vector2(0.272, PLATEAU_Y),
    new Vector2(0, PLATEAU_Y),
  ];
  const hill = new Mesh(new LatheGeometry(hillPts, 18), mat(TONES.stoneDark));
  jitter(hill);
  terrain.add(hill);

  // pale limestone cliff band right under the walls (sits proud of the rock)
  const cliffPts = [
    new Vector2(0.2895, 0.175),
    new Vector2(0.2825, 0.21),
    new Vector2(0.2755, 0.24),
    new Vector2(0.275, PLATEAU_Y),
  ];
  const cliff = new Mesh(new LatheGeometry(cliffPts, 18), mat("#c6bba6"));
  jitter(cliff);
  terrain.add(cliff);

  // courtyard ground cap (slightly proud of the rock top)
  const yard = new Mesh(new CylinderGeometry(0.266, 0.27, 0.008, 18), mat(COURTYARD));
  yard.position.y = PLATEAU_Y + 0.004;
  terrain.add(yard);

  // low green skirt at the very foot of the hill
  const skirtPts = [
    new Vector2(0.348, 0),
    new Vector2(0.34, 0.01),
    new Vector2(0.322, 0.045),
    new Vector2(0.31, 0.08),
    new Vector2(0.305, 0.1),
  ];
  const skirt = new Mesh(new LatheGeometry(skirtPts, 18), mat(TONES.forest));
  jitter(skirt);
  terrain.add(skirt);

  // ---- curtain walls + corner towers around the hilltop ----
  for (let i = 0; i < PTS.length; i++) {
    g.add(wallRun(PTS[i], PTS[(i + 1) % PTS.length]));
  }
  for (let i = 0; i < PTS.length; i++) {
    const p = PTS[i];
    if (i === 2 || i === 4 || i === 7) {
      // larger square towers on key corners
      const t = box(0.062, WALL_H + 0.045, 0.062, p.x, PLATEAU_Y + (WALL_H + 0.045) / 2, p.z, TONES.stone);
      g.add(t);
      for (const sx of [1, -1])
        for (const sz of [1, -1])
          g.add(
            box(0.018, 0.02, 0.018, p.x + sx * 0.022, PLATEAU_Y + WALL_H + 0.055, p.z + sz * 0.022, TONES.stone)
          );
    } else if (i === 6) {
      // one round bastion
      const b = new Mesh(new CylinderGeometry(0.034, 0.038, WALL_H + 0.035, 10), mat(TONES.stone));
      b.position.set(p.x, PLATEAU_Y + (WALL_H + 0.035) / 2, p.z);
      g.add(b);
    } else if (i !== 0 && i !== 1) {
      // small posts cover remaining joints (gate corners skip — tower covers)
      g.add(box(0.046, WALL_H + 0.018, 0.046, p.x, PLATEAU_Y + (WALL_H + 0.018) / 2, p.z, TONES.stone));
    }
  }

  // ---- gate tower (front, +z): proud of the wall, arched entrance ----
  const gateH = 0.21;
  g.add(box(0.11, gateH, 0.085, 0, PLATEAU_Y + gateH / 2, 0.222, TONES.stone));
  // parapet + merlons
  g.add(box(0.122, 0.014, 0.097, 0, PLATEAU_Y + gateH + 0.007, 0.222, TONES.stoneDark));
  for (const sx of [-0.045, 0, 0.045])
    g.add(box(0.021, 0.024, 0.021, sx, PLATEAU_Y + gateH + 0.026, 0.258, TONES.stone));
  for (const sx of [-0.045, 0.045])
    g.add(box(0.021, 0.024, 0.021, sx, PLATEAU_Y + gateH + 0.026, 0.186, TONES.stone));
  // dark arched doorway inset on the front face
  const aw = 0.048;
  const ah = 0.075;
  const arch = new Shape();
  arch.moveTo(-aw / 2, 0);
  arch.lineTo(-aw / 2, ah - aw / 2);
  arch.absarc(0, ah - aw / 2, aw / 2, Math.PI, 0, true);
  arch.lineTo(aw / 2, 0);
  arch.closePath();
  const archMesh = new Mesh(
    new ExtrudeGeometry(arch, { depth: 0.012, bevelEnabled: false, curveSegments: 7 }),
    mat(ARCH_SHADOW)
  );
  archMesh.position.set(0, PLATEAU_Y, 0.2585);
  g.add(archMesh);

  // ---- tiny white houses inside the ward ----
  g.add(house(-0.095, PLATEAU_Y, 0.07, 0.062, 0.04, 0.35, TONES.brick));
  g.add(house(0.07, PLATEAU_Y, 0.1, 0.055, 0.038, -0.3, TONES.brickDark));
  g.add(house(0.12, PLATEAU_Y, -0.03, 0.06, 0.04, 0.15, TONES.brick));
  g.add(house(-0.03, PLATEAU_Y, -0.02, 0.052, 0.036, 0.85, TONES.brickDark));
  g.add(house(-0.13, PLATEAU_Y, -0.06, 0.058, 0.038, -0.45, TONES.brick));

  // small domed church near the back of the ward
  const church = house(0.02, PLATEAU_Y, -0.14, 0.085, 0.05, 0.1, TONES.brick);
  const drum = new Mesh(new CylinderGeometry(0.017, 0.017, 0.022, 8), mat(TONES.white));
  drum.position.set(0.022, 0.062, 0);
  church.add(drum);
  const dome = new Mesh(new SphereGeometry(0.017, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), mat(TONES.brickDark));
  dome.position.set(0.022, 0.073, 0);
  church.add(dome);
  g.add(church);

  // ---- Mangalem quarter: white houses terracing the front slope ----
  // Placed on the exact jittered hill surface, each on a terrace pedestal.
  // phi = azimuth from +z (front); the terrain is squashed 0.85 in x.
  const hillR = (y: number): number => {
    for (let i = 1; i < hillPts.length - 1; i++) {
      if (y <= hillPts[i].y) {
        const a = hillPts[i - 1];
        const b = hillPts[i];
        return a.x + ((b.x - a.x) * (y - a.y)) / (b.y - a.y);
      }
    }
    return 0.272;
  };
  const mangalem = (
    phi: number,
    y: number,
    w: number,
    d: number,
    twist: number,
    roofTone: string
  ) => {
    const a = Math.atan2(Math.cos(phi), Math.sin(phi)); // lathe-space angle
    const r = hillR(y) * surfF(a, y) - 0.008;
    const x = HILL_SQUASH * r * Math.sin(phi);
    const z = r * Math.cos(phi);
    const rotY = Math.atan2(Math.sin(phi) / HILL_SQUASH, Math.cos(phi)) + twist;
    const h = house(x, y, z, w, d, rotY, roofTone);
    const ped = new Mesh(new BoxGeometry(w + 0.008, 0.07, d + 0.008), mat(TONES.stone));
    ped.position.y = -0.033;
    h.add(ped);
    g.add(h);
  };
  // lower row
  mangalem(0.15, 0.048, 0.06, 0.04, 0.1, TONES.brick);
  mangalem(0.52, 0.052, 0.055, 0.038, -0.12, TONES.brickDark);
  mangalem(-0.18, 0.05, 0.058, 0.038, -0.08, TONES.brickDark);
  mangalem(-0.48, 0.055, 0.06, 0.04, 0.14, TONES.brick);
  // middle row
  mangalem(0.05, 0.105, 0.058, 0.038, -0.1, TONES.brickDark);
  mangalem(0.38, 0.105, 0.054, 0.036, 0.12, TONES.brick);
  mangalem(-0.33, 0.105, 0.056, 0.038, 0.08, TONES.brick);
  mangalem(0.66, 0.1, 0.052, 0.036, -0.1, TONES.brickDark);
  mangalem(0.98, 0.055, 0.054, 0.038, 0.1, TONES.brick);
  // upper row, right below the cliff
  mangalem(0.2, 0.155, 0.054, 0.036, 0.1, TONES.brickDark);
  mangalem(-0.12, 0.155, 0.056, 0.038, -0.12, TONES.brick);

  return g;
}
