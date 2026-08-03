// Masjid al-Haram — papercraft: black Kaaba cube (gold band) centered in a
// white octagonal colonnaded courtyard ring, front gate block, 3 slender
// minarets with balconies and pointed spires.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const D2R = Math.PI / 180;
const PHI0 = -22.5 * D2R; // octagon face centered on +z (front)

/** Octagonal annular wall (rectangular cross-section revolved, 8 segments). */
function ring(
  rIn: number,
  rOut: number,
  y0: number,
  y1: number,
  m: MeshLambertMaterial
): Mesh {
  const pts = [
    new Vector2(rOut, y0),
    new Vector2(rOut, y1),
    new Vector2(rIn, y1),
    new Vector2(rIn, y0),
    new Vector2(rOut, y0),
  ];
  return new Mesh(new LatheGeometry(pts, 8, PHI0, Math.PI * 2), m);
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  const facade = mat("#e8e0cf"); // warm cream arcade
  const parapet = mat(TONES.white);
  const trim = mat(TONES.stone);
  const trimDark = mat(TONES.stoneDark);
  const white = mat(TONES.white);
  const floorMat = mat(TONES.snow);
  const arch = mat("#6f6a5e"); // shadowed openings
  const kiswa = mat("#35333a"); // near-black cloth, muted
  const gold = mat(TONES.gold);

  // ---- Mataf courtyard floor (bright octagon) ----
  const floor = new Mesh(new CylinderGeometry(0.26, 0.26, 0.02, 8), floorMat);
  floor.rotation.y = PHI0;
  floor.position.y = 0.01;
  g.add(floor);
  // Warm stone band framing the bright Mataf floor.
  g.add(ring(0.183, 0.222, 0.02, 0.0255, trim));

  // ---- Colonnaded ring: two arcade tiers + string-course + parapet ----
  g.add(ring(0.25, 0.34, 0.0, 0.062, facade));
  g.add(ring(0.258, 0.342, 0.058, 0.067, trim));
  g.add(ring(0.26, 0.325, 0.062, 0.112, facade));
  g.add(ring(0.255, 0.335, 0.112, 0.127, parapet));

  // ---- Arched openings on the octagon faces ----
  const OUT_AP = 0.34 * Math.cos(22.5 * D2R); // outer apothem
  const IN_AP = 0.25 * Math.cos(22.5 * D2R); // inner apothem
  const archLow = new BoxGeometry(0.036, 0.042, 0.012);
  const archHigh = new BoxGeometry(0.028, 0.03, 0.012);
  const addArch = (
    geo: BoxGeometry,
    faceDeg: number,
    offset: number,
    r: number,
    y: number
  ) => {
    const a = faceDeg * D2R;
    const box = new Mesh(geo, arch);
    box.position.set(
      Math.sin(a) * r + Math.cos(a) * offset,
      y,
      Math.cos(a) * r - Math.sin(a) * offset
    );
    box.rotation.y = a;
    g.add(box);
  };
  for (let k = 1; k < 8; k++) {
    // front face (k=0) hosts the gate block
    for (const off of [-0.056, 0, 0.056]) {
      addArch(archLow, k * 45, off, OUT_AP - 0.004, 0.032);
      addArch(archHigh, k * 45, off, 0.325 * Math.cos(22.5 * D2R) - 0.004, 0.088);
    }
    // inner colonnade facing the courtyard
    for (const off of [-0.032, 0.032])
      addArch(archLow, k * 45, off, IN_AP + 0.001, 0.032);
  }

  // ---- Front gate block (protrudes from the ring, small dome on top) ----
  const gate = new Mesh(new BoxGeometry(0.16, 0.15, 0.08), facade);
  gate.position.set(0, 0.075, 0.305);
  g.add(gate);
  const gateTrim = new Mesh(new BoxGeometry(0.166, 0.012, 0.086), parapet);
  gateTrim.position.set(0, 0.156, 0.305);
  g.add(gateTrim);
  const gateDrum = new Mesh(new CylinderGeometry(0.026, 0.026, 0.02, 8), white);
  gateDrum.position.set(0, 0.172, 0.305);
  g.add(gateDrum);
  const gateDome = new Mesh(
    new SphereGeometry(0.032, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2),
    trim
  );
  gateDome.position.set(0, 0.182, 0.305);
  g.add(gateDome);
  const doorway = new Mesh(new BoxGeometry(0.06, 0.1, 0.015), arch);
  doorway.position.set(0, 0.05, 0.342);
  g.add(doorway);

  // ---- Small domes along the ring roof ----
  const RING_MID = 0.2725;
  for (const deg of [90, 135, 225, 270]) {
    const a = deg * D2R;
    const x = Math.sin(a) * RING_MID;
    const z = Math.cos(a) * RING_MID;
    const drum = new Mesh(new CylinderGeometry(0.02, 0.02, 0.014, 8), white);
    drum.position.set(x, 0.134, z);
    g.add(drum);
    const dome = new Mesh(
      new SphereGeometry(0.024, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2),
      trim
    );
    dome.position.set(x, 0.141, z);
    g.add(dome);
  }

  // ---- Kaaba: near-black cube, gold band, gold door ----
  const kaaba = new Group();
  kaaba.rotation.y = 30 * D2R;
  g.add(kaaba);
  const plinth = new Mesh(new CylinderGeometry(0.085, 0.085, 0.012, 8), white);
  plinth.position.y = 0.026;
  kaaba.add(plinth);
  const cube = new Mesh(new BoxGeometry(0.095, 0.092, 0.095), kiswa);
  cube.position.y = 0.032 + 0.046;
  kaaba.add(cube);
  const band = new Mesh(new BoxGeometry(0.099, 0.011, 0.099), gold);
  band.position.y = 0.102;
  kaaba.add(band);
  const door = new Mesh(new BoxGeometry(0.02, 0.034, 0.004), gold);
  door.position.set(0.024, 0.052, 0.0495);
  kaaba.add(door);
  // Hijr Ismail: low semicircular wall hugging one face of the Kaaba.
  const hijrPts = [
    new Vector2(0.056, 0.02),
    new Vector2(0.056, 0.056),
    new Vector2(0.046, 0.056),
    new Vector2(0.046, 0.02),
    new Vector2(0.056, 0.02),
  ];
  const hijr = new Mesh(
    new LatheGeometry(hijrPts, 10, -Math.PI / 2, Math.PI),
    white
  );
  hijr.position.set(0, 0, 0.044);
  kaaba.add(hijr);

  // ---- Three slender minarets: pair flanking the gate + one at the rear ----
  const minaret = (): Group => {
    const m = new Group();
    const add = (mesh: Mesh, y: number) => {
      mesh.position.y = y;
      m.add(mesh);
    };
    add(new Mesh(new BoxGeometry(0.036, 0.06, 0.036), white), 0.03);
    add(new Mesh(new CylinderGeometry(0.0135, 0.0155, 0.17, 6), white), 0.145);
    add(new Mesh(new CylinderGeometry(0.023, 0.017, 0.012, 6), trim), 0.236);
    add(new Mesh(new CylinderGeometry(0.011, 0.0125, 0.13, 6), white), 0.307);
    add(new Mesh(new CylinderGeometry(0.019, 0.014, 0.011, 6), trim), 0.378);
    add(new Mesh(new CylinderGeometry(0.0085, 0.01, 0.075, 6), white), 0.42);
    add(new Mesh(new ConeGeometry(0.017, 0.095, 6), trimDark), 0.505);
    add(new Mesh(new SphereGeometry(0.007, 6, 4), gold), 0.558);
    return m;
  };
  for (const [x, z] of [
    [0.105, 0.315],
    [-0.105, 0.315],
    [0, -0.29],
  ] as const) {
    const mnrt = minaret();
    mnrt.position.set(x, 0, z);
    g.add(mnrt);
  }

  return g;
}
