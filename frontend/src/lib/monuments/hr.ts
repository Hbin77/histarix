// Dubrovnik — "Pearl of the Adriatic" — papercraft miniature.
// Rocky promontory in the blue Adriatic, ring of pale stone walls with the
// round crowned Minčeta tower, corner forts, and a cluster of tiny
// orange-roofed houses packed inside around the Stradun.

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
import { mat, TONES } from "./materials";

const ROOF_A = "#c4795a"; // muted terracotta
const ROOF_B = TONES.brick; // "#c08b6c"
const ROOF_C = TONES.brickDark; // "#a06f52"
const HOUSE_WALL = "#ece4d2";
const SHALLOWS = "#b3cde1"; // pale shallow-water ring

const PLATEAU_Y = 0.095; // top of the rock promontory

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

/** Gabled roof prism: ridge along local Z, base w × d, height h. */
function gableRoof(w: number, d: number, h: number, color: string): Mesh {
  const s = new Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(0, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
  geo.translate(0, 0, -d / 2);
  return new Mesh(geo, mat(color));
}

/** One tiny town house: walls + gabled terracotta roof. */
function house(
  x: number,
  z: number,
  w: number,
  d: number,
  h: number,
  rot: number,
  roof: string
): Group {
  const g = new Group();
  g.position.set(x, PLATEAU_Y, z);
  g.rotation.y = rot;
  g.add(box(w, h, d, 0, h / 2, 0, HOUSE_WALL));
  const r = gableRoof(w * 1.08, d * 1.06, h * 0.55, roof);
  r.position.y = h;
  g.add(r);
  return g;
}

/** Wall segment from (x0,z0) to (x1,z1): stone curtain + pale parapet cap. */
function wallSeg(
  g: Group,
  x0: number,
  z0: number,
  x1: number,
  z1: number,
  h: number,
  thick: number
): void {
  const dx = x1 - x0;
  const dz = z1 - z0;
  const len = Math.hypot(dx, dz) + thick * 0.9;
  const seg = new Group();
  seg.position.set((x0 + x1) / 2, PLATEAU_Y - 0.012, (z0 + z1) / 2);
  seg.rotation.y = Math.atan2(-dz, dx);
  const wall = new Mesh(new BoxGeometry(len, h, thick), mat(TONES.stone));
  wall.position.y = h / 2;
  seg.add(wall);
  const cap = new Mesh(
    new BoxGeometry(len, 0.016, thick * 1.35),
    mat(TONES.white)
  );
  cap.position.y = h + 0.008;
  seg.add(cap);
  g.add(seg);
}

/** Ring of merlons around a tower crown. */
function merlons(
  g: Group,
  cx: number,
  cz: number,
  y: number,
  radius: number,
  count: number
): void {
  const geo = new BoxGeometry(0.02, 0.024, 0.013);
  const m = mat(TONES.white);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const mesh = new Mesh(geo, m);
    mesh.position.set(cx + Math.sin(a) * radius, y, cz + Math.cos(a) * radius);
    mesh.rotation.y = a;
    g.add(mesh);
  }
}

export function build(): Group {
  const g = new Group();

  // ---- blue Adriatic + pale shallows ring ----
  const sea = new Mesh(
    new CylinderGeometry(0.37, 0.37, 0.012, 30),
    mat(TONES.water)
  );
  sea.position.y = 0.006;
  g.add(sea);
  const shallows = new Mesh(
    new CylinderGeometry(0.292, 0.292, 0.01, 11),
    mat(SHALLOWS)
  );
  shallows.position.y = 0.011;
  shallows.rotation.y = 0.3;
  g.add(shallows);

  // ---- faceted rock promontory (cliffs drop straight to the water) ----
  const rock = new Mesh(
    new CylinderGeometry(0.27, 0.228, PLATEAU_Y, 10),
    mat("#a5977f")
  );
  rock.position.y = PLATEAU_Y / 2;
  rock.rotation.y = 0.3;
  g.add(rock);
  // angular cliff chunks tucked against the waterline
  for (const [x, z, r, h, a] of [
    [-0.185, 0.125, 0.045, 0.065, 0.4],
    [0.045, 0.22, 0.04, 0.05, 1.2],
    [0.215, 0.055, 0.036, 0.048, 2.1],
  ] as const) {
    const chunk = new Mesh(new ConeGeometry(r, h, 4), mat("#b4a78d"));
    chunk.position.set(x, h / 2 + 0.006, z);
    chunk.rotation.y = a;
    g.add(chunk);
  }

  // ---- ring of city walls (irregular polygon) ----
  // P0 back-left = Minčeta corner (landward), going clockwise.
  // Land walls (back) tall; seaward curtain (front) low so the orange
  // roofscape reads over it — like the view from Srđ hill.
  const P: [number, number][] = [
    [-0.09, -0.225], // P0 Minčeta
    [0.11, -0.205], // P1
    [0.225, -0.055], // P2 square tower
    [0.185, 0.13], // P3 Fort St. John
    [0.02, 0.215], // P4
    [-0.165, 0.16], // P5 Fort Bokar
    [-0.23, -0.04], // P6
  ];
  const wallH = [0.155, 0.125, 0.105, 0.08, 0.08, 0.115, 0.155];
  for (let i = 0; i < P.length; i++) {
    const [x0, z0] = P[i];
    const [x1, z1] = P[(i + 1) % P.length];
    wallSeg(g, x0, z0, x1, z1, wallH[i], 0.032);
  }

  // small round corner turrets at plain vertices (flush stone caps)
  for (const [i, h] of [
    [1, 0.15],
    [6, 0.175],
  ] as const) {
    const [x, z] = P[i];
    const t = new Mesh(
      new CylinderGeometry(0.023, 0.027, h, 8),
      mat(TONES.stone)
    );
    t.position.set(x, PLATEAU_Y + h / 2 - 0.01, z);
    g.add(t);
    const cap = new Mesh(
      new CylinderGeometry(0.027, 0.025, 0.013, 8),
      mat(TONES.stoneDark)
    );
    cap.position.set(x, PLATEAU_Y + h - 0.008, z);
    g.add(cap);
  }

  // ---- Minčeta tower: round shaft + wide crenellated crown ----
  const [mx, mz] = P[0];
  const shaft = new Mesh(
    new CylinderGeometry(0.046, 0.054, 0.3, 10),
    mat(TONES.stone)
  );
  shaft.position.set(mx, PLATEAU_Y + 0.15, mz);
  g.add(shaft);
  const crown = new Mesh(
    new CylinderGeometry(0.064, 0.056, 0.055, 10),
    mat(TONES.stone)
  );
  crown.position.set(mx, PLATEAU_Y + 0.3275, mz);
  g.add(crown);
  const crownFloor = new Mesh(
    new CylinderGeometry(0.06, 0.06, 0.012, 10),
    mat(TONES.stoneDark)
  );
  crownFloor.position.set(mx, PLATEAU_Y + 0.36, mz);
  g.add(crownFloor);
  merlons(g, mx, mz, PLATEAU_Y + 0.372, 0.056, 10);

  // ---- Fort Bokar: low round bastion on the seaward corner ----
  const [bx, bz] = P[5];
  const bokar = new Mesh(
    new CylinderGeometry(0.046, 0.054, 0.16, 10),
    mat(TONES.stone)
  );
  bokar.position.set(bx, PLATEAU_Y + 0.068, bz);
  g.add(bokar);
  merlons(g, bx, bz, PLATEAU_Y + 0.158, 0.042, 8);

  // ---- Fort St. John: stout round tower guarding the old port ----
  const [jx, jz] = P[3];
  const stJohn = new Mesh(
    new CylinderGeometry(0.042, 0.05, 0.125, 10),
    mat(TONES.stone)
  );
  stJohn.position.set(jx, PLATEAU_Y + 0.051, jz);
  g.add(stJohn);
  merlons(g, jx, jz, PLATEAU_Y + 0.12, 0.037, 8);

  // ---- square wall tower on the east curtain ----
  const [sx, sz] = P[2];
  g.add(box(0.055, 0.16, 0.055, sx, PLATEAU_Y + 0.068, sz, TONES.stone));
  g.add(box(0.065, 0.015, 0.065, sx, PLATEAU_Y + 0.155, sz, TONES.white));

  // ---- Stradun: pale limestone street between the two house bands ----
  const stradun = box(0.3, 0.006, 0.026, -0.01, PLATEAU_Y + 0.003, -0.01, TONES.white);
  stradun.rotation.y = -0.06;
  g.add(stradun);

  // ---- old-port breakwater (Porporela) reaching into the sea ----
  const pier = box(0.085, 0.02, 0.028, 0.27, 0.014, 0.075, TONES.stoneDark);
  pier.rotation.y = -0.35;
  g.add(pier);

  // ---- packed orange-roofed houses (two bands, Stradun gap between) ----
  const H: [number, number, number, number, number, number, string][] = [
    // north band (behind the Stradun)
    [-0.135, -0.13, 0.052, 0.048, 0.05, 0.1, ROOF_A],
    [-0.06, -0.155, 0.055, 0.045, 0.058, -0.05, ROOF_B],
    [0.03, -0.145, 0.05, 0.048, 0.052, 0.08, ROOF_C],
    [0.11, -0.115, 0.048, 0.052, 0.046, -0.1, ROOF_A],
    [-0.14, -0.06, 0.048, 0.048, 0.044, -0.08, ROOF_B],
    [-0.05, -0.075, 0.06, 0.048, 0.06, 0, ROOF_A],
    [0.05, -0.065, 0.052, 0.044, 0.052, 0.12, ROOF_B],
    [0.14, -0.04, 0.044, 0.048, 0.046, 0, ROOF_C],
    [0.08, -0.13, 0.04, 0.04, 0.04, 0.05, ROOF_B],
    // south band (seaward of the Stradun)
    [-0.12, 0.045, 0.052, 0.048, 0.05, 0.05, ROOF_B],
    [0.075, 0.045, 0.048, 0.044, 0.046, 0.1, ROOF_A],
    [-0.09, 0.12, 0.048, 0.044, 0.044, -0.1, ROOF_C],
    [0.015, 0.135, 0.052, 0.048, 0.048, 0.06, ROOF_A],
    [0.1, 0.115, 0.044, 0.044, 0.042, 0, ROOF_B],
    [-0.045, 0.09, 0.046, 0.042, 0.042, -0.04, ROOF_B],
    [0.13, 0.06, 0.04, 0.04, 0.038, 0.08, ROOF_C],
    [-0.15, 0.1, 0.04, 0.04, 0.04, 0.15, ROOF_A],
    [-0.06, 0.165, 0.042, 0.04, 0.038, 0.02, ROOF_B],
  ];
  for (const [x, z, w, d, h, rot, roof] of H) g.add(house(x, z, w, d, h, rot, roof));

  // ---- cathedral: nave + gray dome on a drum ----
  const church = new Group();
  church.position.set(-0.035, PLATEAU_Y, 0.005);
  church.rotation.y = 0.08;
  church.add(box(0.065, 0.05, 0.05, 0, 0.025, 0, HOUSE_WALL));
  const nave = gableRoof(0.052, 0.068, 0.024, ROOF_B);
  nave.position.y = 0.05;
  nave.rotation.y = Math.PI / 2;
  church.add(nave);
  const drum = new Mesh(new CylinderGeometry(0.024, 0.024, 0.032, 8), mat(HOUSE_WALL));
  drum.position.y = 0.07;
  church.add(drum);
  const dome = new Mesh(
    new SphereGeometry(0.028, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(TONES.slate)
  );
  dome.position.y = 0.086;
  church.add(dome);
  g.add(church);

  // ---- campanile: slim bell tower at the east end of the Stradun ----
  const bell = new Group();
  bell.position.set(0.155, PLATEAU_Y, 0.005);
  bell.add(box(0.028, 0.2, 0.028, 0, 0.1, 0, HOUSE_WALL));
  bell.add(box(0.036, 0.014, 0.036, 0, 0.207, 0, TONES.stone));
  const spire = new Mesh(new ConeGeometry(0.024, 0.05, 4), mat(ROOF_C));
  spire.position.y = 0.238;
  spire.rotation.y = Math.PI / 4;
  bell.add(spire);
  g.add(bell);

  return g;
}
