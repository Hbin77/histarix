// Moscow Kremlin corner — papercraft miniature. Red brick wall with
// swallow-tail merlons, tiered Spasskaya clock tower with green tent roof
// and red star tip, plus one round corner tower over a Moskva water strip.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const RED = "#9a4a3d"; // muted Kremlin brick red
const RED_DARK = "#7f3c31";
const STAR_RED = "#b1483b";

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

/** Swallow-tail merlon: plate with a V-notch cut into the top edge. */
function merlon(thick: number): Mesh {
  const w = 0.044;
  const h = 0.056;
  const s = new Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(w / 2, h);
  s.lineTo(0, h - 0.026);
  s.lineTo(-w / 2, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: thick, bevelEnabled: false });
  geo.translate(0, 0, -thick / 2);
  return new Mesh(geo, mat(RED));
}

/** Flat five-pointed star, extruded thin, facing +Z. */
function star(radius: number): Mesh {
  const inner = radius * 0.42;
  const s = new Shape();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 + Math.PI / 2;
    const r = i % 2 === 0 ? radius : inner;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: 0.01, bevelEnabled: false });
  geo.translate(0, 0, -0.005);
  return new Mesh(geo, mat(STAR_RED));
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.36));

  const WALL_Z = 0.06; // river-facing wall line
  const CORNER_X = 0.24;

  // ---- Moskva river strip + stone quay in front of the wall ----
  g.add(box(0.54, 0.01, 0.085, -0.01, 0.017, 0.19, TONES.water));
  g.add(box(0.54, 0.022, 0.05, -0.01, 0.028, 0.122, TONES.stone));

  // ---- Wall A (along X) + walkway ledge ----
  g.add(box(0.54, 0.2, 0.07, -0.03, 0.1, WALL_Z, RED));
  g.add(box(0.54, 0.018, 0.088, -0.03, 0.209, WALL_Z, RED_DARK));

  // ---- Wall B (return along Z) + ledge ----
  g.add(box(0.07, 0.2, 0.26, CORNER_X, 0.1, -0.11, RED));
  g.add(box(0.088, 0.018, 0.26, CORNER_X, 0.209, -0.11, RED_DARK));

  // ---- Swallow-tail merlons ----
  for (let x = -0.28; x <= 0.13; x += 0.055) {
    if (Math.abs(x - -0.12) < 0.097) continue; // Spasskaya footprint
    const m = merlon(0.05);
    m.position.set(x, 0.218, WALL_Z);
    g.add(m);
  }
  for (let z = -0.05; z >= -0.23; z -= 0.055) {
    const m = merlon(0.05);
    m.rotation.y = Math.PI / 2;
    m.position.set(CORNER_X, 0.218, z);
    g.add(m);
  }

  // ---- narrow slit windows on the river face ----
  for (const wx of [-0.255, 0.0, 0.075]) {
    g.add(box(0.013, 0.05, 0.01, wx, 0.1, WALL_Z + 0.033, TONES.ink));
  }

  // ---- Round corner tower ----
  const shaft = new Mesh(new CylinderGeometry(0.062, 0.072, 0.34, 12), mat(RED));
  shaft.position.set(CORNER_X, 0.17, WALL_Z);
  g.add(shaft);
  const machi = new Mesh(
    new CylinderGeometry(0.078, 0.078, 0.045, 12),
    mat(RED_DARK)
  );
  machi.position.set(CORNER_X, 0.362, WALL_Z);
  g.add(machi);
  const band = new Mesh(
    new CylinderGeometry(0.079, 0.079, 0.014, 12),
    mat(TONES.white)
  );
  band.position.set(CORNER_X, 0.391, WALL_Z);
  g.add(band);
  const cone = new Mesh(
    new CylinderGeometry(0.004, 0.085, 0.17, 10),
    mat(TONES.roofGreen)
  );
  cone.position.set(CORNER_X, 0.483, WALL_Z);
  g.add(cone);
  const tipR = new Mesh(
    new CylinderGeometry(0.005, 0.005, 0.035, 6),
    mat(TONES.gold)
  );
  tipR.position.set(CORNER_X, 0.585, WALL_Z);
  g.add(tipR);

  // ---- Spasskaya tower ----
  const TX = -0.12;
  // base shaft
  g.add(box(0.15, 0.4, 0.15, TX, 0.2, WALL_Z, RED));
  // arched gate (front face)
  g.add(box(0.05, 0.075, 0.02, TX, 0.038, WALL_Z + 0.07, TONES.ink));
  const arch = new Mesh(new CylinderGeometry(0.025, 0.025, 0.02, 10), mat(TONES.ink));
  arch.rotation.x = Math.PI / 2;
  arch.position.set(TX, 0.075, WALL_Z + 0.07);
  g.add(arch);
  // white cornice bands on the shaft
  g.add(box(0.16, 0.014, 0.16, TX, 0.3, WALL_Z, TONES.white));
  g.add(box(0.168, 0.02, 0.168, TX, 0.41, WALL_Z, TONES.white));
  // four corner pinnacles on the cornice (signature Spasskaya detail)
  for (const cx of [-1, 1])
    for (const cz of [-1, 1]) {
      const px = TX + cx * 0.073;
      const pz = WALL_Z + cz * 0.073;
      g.add(box(0.02, 0.032, 0.02, px, 0.436, pz, TONES.white));
      const pin = new Mesh(
        new CylinderGeometry(0.002, 0.013, 0.03, 4),
        mat(TONES.roofGreen)
      );
      pin.rotation.y = Math.PI / 4;
      pin.position.set(px, 0.467, pz);
      g.add(pin);
    }
  // clock tier
  g.add(box(0.125, 0.13, 0.125, TX, 0.485, WALL_Z, RED));
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const face = new Group();
    face.position.set(TX, 0.49, WALL_Z);
    face.rotation.y = a;
    const rim = new Mesh(new CylinderGeometry(0.048, 0.048, 0.01, 14), mat(TONES.gold));
    rim.rotation.x = Math.PI / 2;
    rim.position.z = 0.063;
    face.add(rim);
    const dial = new Mesh(new CylinderGeometry(0.038, 0.038, 0.01, 14), mat(TONES.white));
    dial.rotation.x = Math.PI / 2;
    dial.position.z = 0.068;
    face.add(dial);
    g.add(face);
  }
  // white belfry tier with dark arched openings + cornice
  g.add(box(0.105, 0.07, 0.105, TX, 0.585, WALL_Z, TONES.white));
  for (const [dx, dz] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as const) {
    g.add(
      box(
        dx === 0 ? 0.036 : 0.008,
        0.044,
        dx === 0 ? 0.008 : 0.036,
        TX + dx * 0.051,
        0.583,
        WALL_Z + dz * 0.051,
        TONES.ink
      )
    );
  }
  g.add(box(0.122, 0.016, 0.122, TX, 0.628, WALL_Z, TONES.white));
  // octagonal drum
  const drum = new Mesh(new CylinderGeometry(0.05, 0.05, 0.055, 8), mat(RED));
  drum.position.set(TX, 0.663, WALL_Z);
  g.add(drum);
  // green tent spire
  const tent = new Mesh(
    new CylinderGeometry(0.004, 0.074, 0.24, 8),
    mat(TONES.roofGreen)
  );
  tent.position.set(TX, 0.81, WALL_Z);
  g.add(tent);
  // gold tip + ruby star
  const tipS = new Mesh(new CylinderGeometry(0.006, 0.006, 0.03, 6), mat(TONES.gold));
  tipS.position.set(TX, 0.94, WALL_Z);
  g.add(tipS);
  // crossed pair so the star reads from every camera angle (top ≈ 1.0)
  const stA = star(0.035);
  stA.position.set(TX, 0.963, WALL_Z);
  g.add(stA);
  const stB = star(0.035);
  stB.position.set(TX, 0.963, WALL_Z);
  stB.rotation.y = Math.PI / 2;
  g.add(stB);

  return g;
}
