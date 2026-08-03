// Torre de Belém — papercraft: white fortified tower rising behind a broad
// elongated hexagonal bastion that prows into the Tagus, corner bartizans
// with domed caps, Manueline loggia + crenellated crown, footbridge to shore.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
} from "three";
import { mat, TONES } from "./materials";

const ZS = 1.35; // bastion hexagon elongation toward the river
const BASTION_Z = 0.045; // bastion center (prow points +z)
const TOWER_Z = -0.1; // tower center (landward side)

/** Scaled hexagon vertex i (0 = prow at +z) at radius r, world coords. */
function hexV(i: number, r: number): [number, number] {
  const a = (i * Math.PI) / 3;
  return [Math.sin(a) * r, Math.cos(a) * r * ZS + BASTION_Z];
}

/** Small crenellation merlon oriented along a wall tangent. */
function merlon(
  m: MeshLambertMaterial,
  x: number,
  y: number,
  z: number,
  rotY: number
): Mesh {
  const b = new Mesh(new BoxGeometry(0.022, 0.026, 0.011), m);
  b.position.set(x, y, z);
  b.rotation.y = rotY;
  return b;
}

/** Corner turret: corbel, cylindrical body, domed cap, finial. */
function bartizan(
  r: number,
  bodyH: number,
  baseY: number,
  body: MeshLambertMaterial,
  cap: MeshLambertMaterial
): Group {
  const t = new Group();
  const corbel = new Mesh(new CylinderGeometry(r * 0.92, r * 0.35, 0.024, 6), cap);
  corbel.position.y = baseY + 0.012;
  const shaft = new Mesh(new CylinderGeometry(r, r * 0.92, bodyH, 6), body);
  shaft.position.y = baseY + 0.024 + bodyH / 2;
  const dome = new Mesh(
    new SphereGeometry(r * 1.08, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2),
    cap
  );
  dome.position.y = baseY + 0.024 + bodyH;
  const tip = new Mesh(new CylinderGeometry(0.001, r * 0.3, 0.026, 5), cap);
  tip.position.y = baseY + 0.024 + bodyH + r * 1.08 + 0.008;
  t.add(corbel, shaft, dome, tip);
  return t;
}

export function build(): Group {
  const g = new Group();

  const white = mat(TONES.white);
  const stone = mat(TONES.stone);
  const dark = mat("#8b7d66"); // window / arch openings
  const wood = mat(TONES.sandDark);
  const flagRed = mat(TONES.woodRed);

  // ---- Tagus water + sandy shore + wooden footbridge ----
  const sea = new Mesh(new CylinderGeometry(0.36, 0.36, 0.012, 24), mat(TONES.water));
  sea.position.y = 0.006;
  g.add(sea);
  const quay = new Mesh(new BoxGeometry(0.15, 0.036, 0.1), mat(TONES.sand));
  quay.position.set(0, 0.018, -0.3);
  g.add(quay);
  // Footbridge spanning water from shore to the tower's land face.
  const bridge = new Mesh(new BoxGeometry(0.05, 0.01, 0.1), wood);
  bridge.position.set(0, 0.048, -0.255);
  g.add(bridge);
  for (const dz of [-0.28, -0.235]) {
    for (const dx of [0.017, -0.017]) {
      const leg = new Mesh(new BoxGeometry(0.008, 0.045, 0.008), wood);
      leg.position.set(dx, 0.024, dz);
      g.add(leg);
    }
  }

  // ---- Bastion: broad battered hex prism + corbelled cornice + deck ----
  const bastionBody = new Mesh(new CylinderGeometry(0.185, 0.2, 0.14, 6), white);
  bastionBody.position.set(0, 0.07, BASTION_Z);
  bastionBody.scale.z = ZS;
  g.add(bastionBody);
  const bastionCornice = new Mesh(new CylinderGeometry(0.202, 0.192, 0.026, 6), stone);
  bastionCornice.position.set(0, 0.153, BASTION_Z);
  bastionCornice.scale.z = ZS;
  g.add(bastionCornice);
  const deck = new Mesh(new CylinderGeometry(0.182, 0.182, 0.012, 6), white);
  deck.position.set(0, 0.172, BASTION_Z);
  deck.scale.z = ZS;
  g.add(deck);

  // Bastion crenellation along the scaled hexagon rim (skip tower zone).
  for (let i = 0; i < 6; i++) {
    const [x0, z0] = hexV(i, 0.192);
    const [x1, z1] = hexV(i + 1, 0.192);
    const len = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.max(2, Math.round(len / 0.044));
    const rot = Math.atan2(-(z1 - z0), x1 - x0);
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      const x = x0 + (x1 - x0) * t;
      const z = z0 + (z1 - z0) * t;
      if (Math.abs(x) < 0.14 && z < 0.03 && z > -0.26) continue; // tower
      g.add(merlon(white, x, 0.179, z, rot));
    }
  }

  // Bastion bartizans at the five river-facing hex corners.
  for (const i of [0, 1, 2, 4, 5]) {
    const [x, z] = hexV(i, 0.194);
    const b = bartizan(0.021, 0.055, 0.166, white, stone);
    b.position.set(x, 0, z);
    g.add(b);
  }

  // Casemate ports on the two prow-side walls.
  for (const i of [0, 5]) {
    const [x0, z0] = hexV(i, 0.19);
    const [x1, z1] = hexV(i + 1, 0.19);
    const rot = Math.atan2(-(z1 - z0), x1 - x0);
    for (const t of [0.3, 0.55, 0.8]) {
      const p = new Mesh(new BoxGeometry(0.024, 0.028, 0.018), dark);
      p.position.set(x0 + (x1 - x0) * t, 0.1, z0 + (z1 - z0) * t);
      p.rotation.y = rot;
      g.add(p);
    }
  }

  // ---- Tower: plinth, shaft, cornice, parapet, corner bartizans ----
  const plinth = new Mesh(new BoxGeometry(0.24, 0.05, 0.24), stone);
  plinth.position.set(0, 0.025, TOWER_Z);
  g.add(plinth);
  const shaft = new Mesh(new BoxGeometry(0.215, 0.58, 0.215), white);
  shaft.position.set(0, 0.31, TOWER_Z);
  g.add(shaft);
  const cornice = new Mesh(new BoxGeometry(0.24, 0.02, 0.24), stone);
  cornice.position.set(0, 0.61, TOWER_Z);
  g.add(cornice);

  // Parapet merlons on the main terrace (corners left for bartizans).
  for (const s of [1, -1]) {
    for (const c of [-0.066, -0.022, 0.022, 0.066]) {
      g.add(merlon(white, c, 0.632, TOWER_Z + s * 0.12, 0));
      g.add(merlon(white, s * 0.12, 0.632, TOWER_Z + c, Math.PI / 2));
    }
  }

  // Tower corner bartizans (the four iconic domed turrets).
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      const b = bartizan(0.028, 0.13, 0.5, white, stone);
      b.position.set(sx * 0.108, 0, TOWER_Z + sz * 0.108);
      g.add(b);
    }
  }

  // ---- Upper storey with pinnacles + flag ----
  const upper = new Mesh(new BoxGeometry(0.14, 0.16, 0.14), white);
  upper.position.set(0, 0.7, TOWER_Z);
  g.add(upper);
  const upperCornice = new Mesh(new BoxGeometry(0.16, 0.016, 0.16), stone);
  upperCornice.position.set(0, 0.786, TOWER_Z);
  g.add(upperCornice);
  for (const s of [1, -1]) {
    for (const c of [-0.044, 0, 0.044]) {
      g.add(merlon(white, c, 0.807, TOWER_Z + s * 0.077, 0));
      g.add(merlon(white, s * 0.077, 0.807, TOWER_Z + c, Math.PI / 2));
    }
  }
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      const pin = new Mesh(new CylinderGeometry(0.001, 0.012, 0.04, 6), stone);
      pin.position.set(sx * 0.07, 0.814, TOWER_Z + sz * 0.07);
      g.add(pin);
    }
  }
  const pole = new Mesh(new CylinderGeometry(0.0035, 0.0035, 0.13, 5), stone);
  pole.position.set(0, 0.85, TOWER_Z);
  g.add(pole);
  const flag = new Mesh(new BoxGeometry(0.048, 0.03, 0.005), flagRed);
  flag.position.set(0.027, 0.895, TOWER_Z);
  g.add(flag);

  // ---- Manueline facade details (front face toward the river) ----
  const FZ = TOWER_Z + 0.1075; // front wall plane
  // Loggia: balcony ledge, arcade of arches, canopy ledge.
  const balcony = new Mesh(new BoxGeometry(0.18, 0.014, 0.026), stone);
  balcony.position.set(0, 0.4, FZ + 0.008);
  g.add(balcony);
  for (const x of [-0.068, -0.034, 0, 0.034, 0.068]) {
    const arch = new Mesh(new BoxGeometry(0.021, 0.052, 0.012), dark);
    arch.position.set(x, 0.437, FZ + 0.004);
    g.add(arch);
  }
  const canopy = new Mesh(new BoxGeometry(0.18, 0.012, 0.02), stone);
  canopy.position.set(0, 0.472, FZ + 0.006);
  g.add(canopy);
  // Twin windows above the loggia, portal below it.
  for (const x of [-0.034, 0.034]) {
    const w = new Mesh(new BoxGeometry(0.026, 0.042, 0.012), dark);
    w.position.set(x, 0.55, FZ + 0.004);
    g.add(w);
  }
  const portal = new Mesh(new BoxGeometry(0.038, 0.052, 0.012), dark);
  portal.position.set(0, 0.27, FZ + 0.004);
  g.add(portal);
  // Upper-storey front window.
  const uw = new Mesh(new BoxGeometry(0.022, 0.038, 0.012), dark);
  uw.position.set(0, 0.7, TOWER_Z + 0.067);
  g.add(uw);
  // Side + rear windows.
  for (const s of [1, -1]) {
    const w1 = new Mesh(new BoxGeometry(0.012, 0.042, 0.026), dark);
    w1.position.set(s * 0.105, 0.35, TOWER_Z + 0.032);
    g.add(w1);
    const w2 = new Mesh(new BoxGeometry(0.012, 0.042, 0.026), dark);
    w2.position.set(s * 0.105, 0.52, TOWER_Z - 0.032);
    g.add(w2);
  }
  const back = new Mesh(new BoxGeometry(0.026, 0.042, 0.012), dark);
  back.position.set(0, 0.45, TOWER_Z - 0.105);
  g.add(back);

  return g;
}
