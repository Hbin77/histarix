// Burana Tower — papercraft: a stout tapering brick minaret on a wide
// octagonal base of arched niches, ringed by bands of patterned brickwork
// and stopped abruptly at a flat truncated top, on a dry steppe mound.

import { BoxGeometry, CylinderGeometry, Group, Mesh } from "three";
import { mat, plazaDisc, TONES } from "./materials";

const BRICK = "#c08b6c"; // warm sand-brown brick
const BRICK_DK = "#a06f52";
const BRICK_LT = "#d09b7b";
const NICHE = "#77543f"; // shadowed arched recess
const GRASS = "#b2ad80"; // dry steppe grass

const R_OCT = 0.196; // base circumradius
const APO = R_OCT * Math.cos(Math.PI / 8); // face centre distance
const BASE_Y0 = 0.05;
const BASE_Y1 = 0.25;
const SHAFT_Y0 = 0.272;
const SHAFT_Y1 = 0.9;
const R_BOT = 0.14;
const R_TOP = 0.101;

const shaftR = (y: number) =>
  R_BOT + (R_TOP - R_BOT) * ((y - SHAFT_Y0) / (SHAFT_Y1 - SHAFT_Y0));

/** Octagonal prism with a flat face squared to +Z. */
function octagon(
  rBot: number,
  rTop: number,
  y0: number,
  y1: number,
  color: string
): Mesh {
  const geo = new CylinderGeometry(rTop, rBot, y1 - y0, 8);
  geo.rotateY(Math.PI / 8);
  geo.translate(0, (y0 + y1) / 2, 0);
  return new Mesh(geo, mat(color));
}

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

/** Flat disc standing upright, used for the round heads of the niches. */
function archHead(r: number, color: string): Mesh {
  const geo = new CylinderGeometry(r, r, 0.008, 12);
  geo.rotateX(Math.PI / 2);
  return new Mesh(geo, mat(color));
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.35));

  // ---- dry steppe mound the tower stands on ----
  const mound = new Mesh(new CylinderGeometry(0.3, 0.335, 0.038, 26), mat(GRASS));
  mound.position.y = 0.029;
  g.add(mound);
  g.add(octagon(0.232, 0.225, 0.044, 0.062, TONES.stone)); // stone plinth

  // ---- octagonal base with an arched niche on every face ----
  g.add(octagon(R_OCT, R_OCT * 0.965, BASE_Y0, BASE_Y1, BRICK));
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const put = (m: Mesh, out: number, y: number) => {
      m.position.set(Math.sin(a) * (APO + out), y, Math.cos(a) * (APO + out));
      m.rotation.y = a;
      g.add(m);
    };
    put(box(0.116, 0.158, 0.012, 0, 0, 0, BRICK_LT), 0.004, 0.15); // panel frame
    const isDoor = k === 0;
    const h = isDoor ? 0.128 : 0.094;
    put(box(0.076, h, 0.01, 0, 0, 0, NICHE), 0.009, 0.076 + h / 2);
    put(archHead(0.038, NICHE), 0.009, 0.076 + h);
  }
  // cornice capping the base
  g.add(octagon(0.216, 0.212, BASE_Y1, BASE_Y1 + 0.024, BRICK_DK));

  // ---- tapering brick shaft ----
  const shaft = new Mesh(
    new CylinderGeometry(R_TOP, R_BOT, SHAFT_Y1 - SHAFT_Y0, 16),
    mat(BRICK)
  );
  shaft.position.y = (SHAFT_Y0 + SHAFT_Y1) / 2;
  g.add(shaft);
  // flared skirt where the shaft meets the base
  g.add(
    new Mesh(
      new CylinderGeometry(R_BOT, R_BOT + 0.014, 0.03, 16),
      mat(BRICK_DK)
    ).translateY(SHAFT_Y0 + 0.015)
  );

  // ---- horizontal bands of patterned brickwork ----
  const bands: Array<[number, boolean]> = [
    [0.35, true],
    [0.45, false],
    [0.545, true],
    [0.64, false],
    [0.73, true],
    [0.815, false],
  ];
  for (const [y, patterned] of bands) {
    const r = shaftR(y) + 0.006;
    const ring = new Mesh(new CylinderGeometry(r - 0.002, r, 0.044, 16), mat(BRICK_DK));
    ring.position.y = y;
    g.add(ring);
    if (!patterned) continue;
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      const b = box(0.028, 0.028, 0.006, Math.sin(a) * (r + 0.001), y, Math.cos(a) * (r + 0.001), BRICK_LT);
      b.rotation.y = a;
      g.add(b);
    }
  }

  // ---- abrupt truncated top: broken rim over a flat crown ----
  const rim = new Mesh(new CylinderGeometry(0.112, 0.104, 0.024, 16), mat(BRICK_DK));
  rim.position.y = SHAFT_Y1 + 0.012;
  g.add(rim);
  const crown = new Mesh(new CylinderGeometry(0.104, 0.104, 0.01, 16), mat(BRICK_LT));
  crown.position.y = SHAFT_Y1 + 0.026;
  g.add(crown);

  return g;
}
