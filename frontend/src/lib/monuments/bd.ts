// Ahsan Manzil ("Pink Palace", Dhaka) — papercraft: long rose-pink two-story
// facade, projecting central bay with octagonal drum + ribbed dome, arched
// veranda openings, corner turrets, grand front staircase over a lawn.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

export function build(): Group {
  const g = new Group();

  const pink = mat("#e29c8b"); // muted rose-pink facade
  const pinkDark = mat("#c67f6f"); // plinth / shaded pink
  const roofPink = mat("#d68e7e"); // flat rooftops
  const domeM = mat("#cd8474"); // slightly deeper rose dome
  const trim = mat(TONES.white); // cornices, string courses
  const opening = mat("#7c5148"); // shadowed veranda arches
  const stepM = mat(TONES.sandDark); // grand staircase
  const lawn = mat(TONES.forest);

  g.add(plazaDisc(0.36));

  // ---- Lawn patches flanking the staircase ----
  for (const sx of [-1, 1]) {
    const grass = new Mesh(new BoxGeometry(0.14, 0.008, 0.12), lawn);
    grass.position.set(sx * 0.16, 0.014, 0.2);
    g.add(grass);
  }

  // ---- Raised plinth ----
  const plinth = new Mesh(new BoxGeometry(0.64, 0.05, 0.27), pinkDark);
  plinth.position.y = 0.025;
  g.add(plinth);

  // ---- Main two-story block ----
  const block = new Mesh(new BoxGeometry(0.6, 0.19, 0.22), pink);
  block.position.y = 0.145;
  g.add(block);

  // ---- End pavilions: slightly taller, projecting front and back ----
  for (const sx of [-1, 1]) {
    const pav = new Mesh(new BoxGeometry(0.12, 0.21, 0.25), pink);
    pav.position.set(sx * 0.24, 0.155, 0);
    g.add(pav);
    const cor = new Mesh(new BoxGeometry(0.13, 0.012, 0.26), trim);
    cor.position.set(sx * 0.24, 0.266, 0);
    g.add(cor);
    const pavRoof = new Mesh(new BoxGeometry(0.115, 0.01, 0.245), roofPink);
    pavRoof.position.set(sx * 0.24, 0.277, 0);
    g.add(pavRoof);
    // pinnacles on the pavilion corners
    for (const [px, pz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
      const pin = new Mesh(new CylinderGeometry(0.009, 0.009, 0.034, 6), pink);
      pin.position.set(sx * 0.24 + px * 0.048, 0.296, pz * 0.108);
      g.add(pin);
      const cap = new Mesh(new CylinderGeometry(0.001, 0.013, 0.02, 6), domeM);
      cap.position.set(sx * 0.24 + px * 0.048, 0.322, pz * 0.108);
      g.add(cap);
    }
  }

  // ---- Central projecting bay ----
  const bay = new Mesh(new BoxGeometry(0.17, 0.22, 0.28), pink);
  bay.position.y = 0.16;
  g.add(bay);

  // ---- Cornices + string courses (white papercraft trim) ----
  const mainCor = new Mesh(new BoxGeometry(0.61, 0.012, 0.23), trim);
  mainCor.position.y = 0.246;
  g.add(mainCor);
  const mainRoof = new Mesh(new BoxGeometry(0.585, 0.01, 0.21), roofPink);
  mainRoof.position.y = 0.257;
  g.add(mainRoof);
  const bayCor = new Mesh(new BoxGeometry(0.18, 0.014, 0.29), trim);
  bayCor.position.y = 0.277;
  g.add(bayCor);
  const bayRoof = new Mesh(new BoxGeometry(0.165, 0.01, 0.275), roofPink);
  bayRoof.position.y = 0.289;
  g.add(bayRoof);
  const string1 = new Mesh(new BoxGeometry(0.605, 0.01, 0.225), trim);
  string1.position.y = 0.145;
  g.add(string1);
  const string2 = new Mesh(new BoxGeometry(0.175, 0.01, 0.285), trim);
  string2.position.y = 0.15;
  g.add(string2);

  // ---- Arched veranda openings (dark box + rounded head on the front) ----
  const addArch = (x: number, y: number, z: number) => {
    const body = new Mesh(new BoxGeometry(0.028, 0.05, 0.012), opening);
    body.position.set(x, y, z);
    g.add(body);
    const head = new Mesh(
      new CylinderGeometry(0.014, 0.014, 0.012, 6),
      opening
    );
    head.rotation.x = Math.PI / 2;
    head.position.set(x, y + 0.025, z);
    g.add(head);
  };
  // plain rectangular openings for rear + side faces (cheaper)
  const addSlot = (x: number, y: number, z: number, rotY = 0) => {
    const body = new Mesh(new BoxGeometry(0.026, 0.06, 0.012), opening);
    body.position.set(x, y, z);
    body.rotation.y = rotY;
    g.add(body);
  };
  const FLOORS = [0.093, 0.188]; // arch body centers, per story
  for (const y of FLOORS) {
    // wings (main block front face z=0.11)
    for (const ax of [0.115, 0.145, 0.175]) {
      addArch(ax, y, 0.111);
      addArch(-ax, y, 0.111);
    }
    // central bay front (z=0.14)
    for (const ax of [-0.05, 0, 0.05]) addArch(ax, y, 0.141);
    // end pavilions front (z=0.125)
    addArch(0.24, y, 0.126);
    addArch(-0.24, y, 0.126);
    // rear faces mirror the rhythm with plain slots
    for (const ax of [0.115, 0.145, 0.175]) {
      addSlot(ax, y + 0.005, -0.111);
      addSlot(-ax, y + 0.005, -0.111);
    }
    for (const ax of [-0.05, 0, 0.05]) addSlot(ax, y + 0.005, -0.141);
    addSlot(0.24, y + 0.005, -0.126);
    addSlot(-0.24, y + 0.005, -0.126);
    // end pavilion outer side faces (x = ±0.30)
    for (const az of [-0.05, 0.05]) {
      addSlot(0.301, y + 0.005, az, Math.PI / 2);
      addSlot(-0.301, y + 0.005, az, Math.PI / 2);
    }
  }

  // ---- Turrets around the drum (four mini domed kiosks) ----
  for (const [px, pz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
    const tur = new Mesh(new CylinderGeometry(0.016, 0.016, 0.06, 8), pink);
    tur.position.set(px * 0.072, 0.3, pz * 0.122);
    g.add(tur);
    const cap = new Mesh(new CylinderGeometry(0.001, 0.021, 0.028, 8), domeM);
    cap.position.set(px * 0.072, 0.342, pz * 0.122);
    g.add(cap);
  }

  // ---- Octagonal drum + white ring + ribbed dome ----
  const drum = new Mesh(new CylinderGeometry(0.056, 0.056, 0.082, 8), pink);
  drum.position.y = 0.33;
  g.add(drum);
  // small dark windows on drum cardinal faces
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const w = new Mesh(new BoxGeometry(0.016, 0.034, 0.01), opening);
    w.position.set(Math.sin(a) * 0.055, 0.332, Math.cos(a) * 0.055);
    w.rotation.y = a;
    g.add(w);
  }
  const drumRing = new Mesh(new CylinderGeometry(0.062, 0.062, 0.012, 8), trim);
  drumRing.position.y = 0.373;
  g.add(drumRing);

  const domeProfile = [
    new Vector2(0.052, 0),
    new Vector2(0.071, 0.028),
    new Vector2(0.072, 0.056),
    new Vector2(0.059, 0.088),
    new Vector2(0.034, 0.114),
    new Vector2(0.013, 0.13),
    new Vector2(0, 0.135),
  ];
  const dome = new Mesh(new LatheGeometry(domeProfile, 8), domeM);
  dome.position.y = 0.376;
  g.add(dome);
  const finial = new Mesh(new CylinderGeometry(0.0025, 0.007, 0.055, 6), trim);
  finial.position.y = 0.53;
  g.add(finial);

  // ---- Grand front staircase (widens toward the ground) ----
  const N = 7;
  for (let k = 0; k < N; k++) {
    const h = 0.132 - k * 0.018;
    const w = 0.16 + k * 0.008;
    const step = new Mesh(new BoxGeometry(w, h, 0.02), stepM);
    step.position.set(0, h / 2, 0.15 + k * 0.02);
    g.add(step);
  }

  return g;
}
