// Grand Place, Brussels — papercraft miniature. Gothic Hôtel de Ville:
// arcaded facade with steep slate roof, soaring openwork central spire
// (square base → octagonal lace tiers → thin crocketed cone) topped by a
// tiny gilded St. Michael, flanked by narrow gabled guild houses.

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
import { mat, plazaDisc, TONES } from "./materials";

const GOLD = TONES.gold;

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

/** Front-facing triangular gable: ridge runs along Z (toward the square). */
function gable(w: number, d: number, h: number, color: string): Mesh {
  const s = new Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(0, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
  geo.translate(0, 0, -d / 2);
  return new Mesh(geo, mat(color));
}

/** Narrow guild house. kind: 0 = triangular gable, 1 = stepped gable. */
function guildHouse(
  w: number,
  bodyH: number,
  kind: 0 | 1,
  wall: string,
  roof: string,
  goldTip: boolean
): Group {
  const g = new Group();
  const d = 0.1;
  g.add(box(w, bodyH, d, 0, bodyH / 2, 0, wall));
  // facade cornice
  g.add(box(w + 0.008, 0.01, d + 0.006, 0, bodyH, 0, TONES.white));
  if (kind === 0) {
    const gb = gable(w, d, w * 0.85, roof);
    gb.position.y = bodyH + 0.005;
    g.add(gb);
    if (goldTip) {
      const ball = new Mesh(new SphereGeometry(0.011, 6, 5), mat(GOLD));
      ball.position.y = bodyH + w * 0.85 + 0.014;
      g.add(ball);
    }
  } else {
    // stepped gable: shrinking slabs
    const steps = 3;
    for (let i = 0; i < steps; i++) {
      const sw = w * (1 - (i + 1) / (steps + 0.7));
      g.add(box(sw, 0.028, d, 0, bodyH + 0.019 + i * 0.028, 0, wall));
    }
    g.add(box(w * 0.2, 0.02, d, 0, bodyH + 0.019 + steps * 0.028, 0, roof));
    if (goldTip) {
      const ball = new Mesh(new SphereGeometry(0.009, 6, 5), mat(GOLD));
      ball.position.y = bodyH + 0.034 + steps * 0.028;
      g.add(ball);
    }
  }
  // window hints: two rows of small slate punches
  for (let i = 0; i < 2; i++) {
    for (const sx of [-1, 1]) {
      g.add(
        box(w * 0.22, 0.03, 0.006, sx * w * 0.2, bodyH * (0.38 + i * 0.34), d / 2, TONES.slate)
      );
    }
  }
  return g;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.36));

  const HZ = -0.1; // building row center line
  const stone = TONES.stone;
  const stoneDark = TONES.stoneDark;

  // ================= Hôtel de Ville main body =================
  const BW = 0.3; // body width
  const BH = 0.19; // body height
  const BD = 0.11;
  g.add(box(BW, BH, BD, 0, BH / 2, HZ, stone));

  // ground arcade: dark pointed-arch insets along the front
  for (let i = 0; i < 8; i++) {
    const x = -0.129 + i * 0.0369;
    if (Math.abs(x) < 0.055) continue; // tower occupies the middle
    g.add(box(0.022, 0.044, 0.008, x, 0.028, HZ + BD / 2, TONES.ink));
  }
  // upper facade: row of individual slate windows
  for (let i = 0; i < 8; i++) {
    const x = -0.129 + i * 0.0369;
    if (Math.abs(x) < 0.055) continue;
    g.add(box(0.02, 0.04, 0.008, x, 0.13, HZ + BD / 2, TONES.slate));
  }

  // parapet pinnacles along the roofline
  const pinGeo = new ConeGeometry(0.007, 0.035, 4);
  for (let i = 0; i < 8; i++) {
    const x = -0.147 + i * 0.042;
    if (Math.abs(x) < 0.055) continue;
    const p = new Mesh(pinGeo, mat(stoneDark));
    p.position.set(x, BH + 0.014, HZ + BD / 2 - 0.008);
    g.add(p);
  }

  // steep slate roof (ridge along X) with dormers
  const roof = gable(BD, BW - 0.01, 0.1, TONES.slate);
  roof.rotation.y = Math.PI / 2;
  roof.position.set(0, BH, HZ);
  g.add(roof);
  for (const sx of [-1, 1]) {
    g.add(box(0.02, 0.024, 0.02, sx * 0.09, BH + 0.026, HZ + 0.038, TONES.white));
    // gilded ridge finials
    const fin = new Mesh(new ConeGeometry(0.006, 0.03, 4), mat(GOLD));
    fin.position.set(sx * 0.135, BH + 0.11, HZ);
    g.add(fin);
  }

  // ================= Belfry tower =================
  // square base rising through the body
  g.add(box(0.085, 0.42, 0.085, 0, 0.21, HZ, stone));
  // gothic portal
  g.add(box(0.03, 0.052, 0.008, 0, 0.03, HZ + 0.0445, TONES.ink));
  // tower window slits
  for (const y of [0.24, 0.34]) {
    g.add(box(0.016, 0.046, 0.008, 0, y, HZ + 0.0445, TONES.slate));
  }
  // string-course ledges
  g.add(box(0.095, 0.012, 0.095, 0, 0.2, HZ, stoneDark));
  g.add(box(0.095, 0.012, 0.095, 0, 0.31, HZ, stoneDark));

  // balcony ledge
  g.add(box(0.108, 0.016, 0.108, 0, 0.425, HZ, stoneDark));

  // second square tier + corner pinnacles
  g.add(box(0.066, 0.13, 0.066, 0, 0.497, HZ, stone));
  for (const sx of [-1, 1]) {
    g.add(box(0.013, 0.07, 0.008, sx * 0.015, 0.5, HZ + 0.0335, TONES.slate));
  }
  const cornerPin = new ConeGeometry(0.009, 0.06, 4);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const p = new Mesh(cornerPin, mat(stoneDark));
      p.position.set(sx * 0.045, 0.585, HZ + sz * 0.045);
      g.add(p);
    }
  g.add(box(0.078, 0.012, 0.078, 0, 0.565, HZ, stoneDark));

  // octagonal lace tier 1 (openwork hinted by slate slits)
  const oct1 = new Mesh(new CylinderGeometry(0.028, 0.033, 0.095, 8, 1), mat(stone));
  oct1.position.set(0, 0.618, HZ);
  g.add(oct1);
  const ring1 = new Mesh(new CylinderGeometry(0.036, 0.036, 0.01, 8), mat(stoneDark));
  ring1.position.set(0, 0.67, HZ);
  g.add(ring1);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const slit = box(0.011, 0.06, 0.011, Math.sin(a) * 0.027, 0.617, HZ + Math.cos(a) * 0.027, TONES.slate);
    slit.rotation.y = a;
    g.add(slit);
  }

  // octagonal lace tier 2
  const oct2 = new Mesh(new CylinderGeometry(0.021, 0.026, 0.08, 8, 1), mat(stone));
  oct2.position.set(0, 0.715, HZ);
  g.add(oct2);
  const ring2 = new Mesh(new CylinderGeometry(0.028, 0.028, 0.009, 8), mat(stoneDark));
  ring2.position.set(0, 0.759, HZ);
  g.add(ring2);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const slit = box(0.009, 0.05, 0.009, Math.sin(a) * 0.021, 0.714, HZ + Math.cos(a) * 0.021, TONES.slate);
    slit.rotation.y = a;
    g.add(slit);
  }

  // openwork spire cone with crocket collars
  const spire = new Mesh(new ConeGeometry(0.025, 0.19, 8, 1), mat(stoneDark));
  spire.position.set(0, 0.858, HZ);
  g.add(spire);
  for (const [y, r] of [
    [0.8, 0.019],
    [0.85, 0.014],
    [0.9, 0.009],
  ] as const) {
    const collar = new Mesh(new CylinderGeometry(r + 0.005, r + 0.005, 0.007, 8), mat(stone));
    collar.position.set(0, y, HZ);
    g.add(collar);
  }

  // gilded St. Michael
  const ped = new Mesh(new CylinderGeometry(0.004, 0.004, 0.018, 6), mat(GOLD));
  ped.position.set(0, 0.96, HZ);
  g.add(ped);
  const statue = new Mesh(new ConeGeometry(0.008, 0.026, 5), mat(GOLD));
  statue.position.set(0, 0.982, HZ);
  g.add(statue);

  // ================= Guild-house row =================
  type HouseSpec = {
    x: number;
    z: number;
    yaw: number;
    w: number;
    h: number;
    kind: 0 | 1;
    wall: string;
    roof: string;
    tip: boolean;
  };
  const houses: HouseSpec[] = [
    { x: -0.302, z: HZ + 0.03, yaw: 0.2, w: 0.068, h: 0.15, kind: 1, wall: TONES.brick, roof: TONES.slate, tip: true },
    { x: -0.256, z: HZ, yaw: 0, w: 0.066, h: 0.18, kind: 0, wall: TONES.sand, roof: TONES.woodRed, tip: true },
    { x: -0.19, z: HZ, yaw: 0, w: 0.064, h: 0.2, kind: 1, wall: TONES.white, roof: TONES.slate, tip: false },
    { x: 0.19, z: HZ, yaw: 0, w: 0.064, h: 0.21, kind: 0, wall: TONES.sandDark, roof: TONES.slate, tip: true },
    { x: 0.256, z: HZ, yaw: 0, w: 0.066, h: 0.17, kind: 1, wall: TONES.stone, roof: TONES.woodRed, tip: true },
    { x: 0.302, z: HZ + 0.03, yaw: -0.2, w: 0.068, h: 0.19, kind: 0, wall: TONES.brickDark, roof: TONES.slate, tip: true },
  ];
  for (const s of houses) {
    const h = guildHouse(s.w, s.h, s.kind, s.wall, s.roof, s.tip);
    h.position.set(s.x, 0, s.z);
    h.rotation.y = s.yaw;
    g.add(h);
  }

  // cobble hint: slightly darker fan in front of the hall
  const cobble = new Mesh(new CylinderGeometry(0.14, 0.14, 0.01, 20), mat("#cfd6e4"));
  cobble.position.set(0, 0.009, 0.1);
  g.add(cobble);

  return g;
}
