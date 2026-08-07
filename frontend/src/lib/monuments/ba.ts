// Stari Most (Mostar) — papercraft miniature. Steep humpbacked limestone
// arch leaping the teal Neretva between rocky banks, flanked by the stout
// Halebija and Tara gate towers with slate pyramid roofs, plus a few
// old-town stone houses.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
} from "three";
import { mat, TONES } from "./materials";

const SQ2 = Math.SQRT2;
const R = 0.34; // terrain radius (footprint 0.68)
const TEAL = "#7fada3"; // muted Neretva teal
const BANK_H = 0.13; // rocky bank top
const PAVE_H = 0.012; // pale paving layer on the banks
const HALF = 0.215; // bridge half-length
const DECK_END = 0.15; // deck height at the ends
const CREST = 0.272; // deck height at the crest
const K = (CREST - DECK_END) / (HALF * HALF);
const A = 0.115; // arch opening half-span
const SPRING = 0.115; // arch springing height
const N = 14; // deck facet count

const deckY = (x: number) => CREST - K * x * x;

/** Circle-segment slab: everything beyond |x| = chordX, following the
 *  terrain circle of the given radius. Base at y = 0, top at y = h. */
function bankSlab(chordX: number, radius: number, h: number, color: string): Mesh {
  const zc = Math.sqrt(radius * radius - chordX * chordX);
  const a = Math.atan2(zc, chordX);
  const s = new Shape();
  s.moveTo(chordX, -zc);
  s.absarc(0, 0, radius, -a, a, false);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 9 });
  geo.rotateX(-Math.PI / 2);
  return new Mesh(geo, mat(color));
}

/** Main bridge body: humpbacked deck over a near-semicircular arch. */
function bridgeBody(): Mesh {
  const s = new Shape();
  s.moveTo(-HALF, 0.05);
  s.lineTo(-HALF, DECK_END);
  for (let i = 1; i <= N; i++) {
    const x = -HALF + (i * 2 * HALF) / N;
    s.lineTo(x, deckY(x));
  }
  s.lineTo(HALF, 0.05);
  s.lineTo(A, 0.05);
  s.lineTo(A, SPRING);
  s.absarc(0, SPRING, A, 0, Math.PI, false);
  s.lineTo(-A, 0.05);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: 0.104, bevelEnabled: false, curveSegments: 14 });
  geo.translate(0, 0, -0.052);
  return new Mesh(geo, mat(TONES.stone));
}

/** Pale voussoir ring, slightly wider than the deck so it catches light. */
function archRing(): Mesh {
  const rOut = A + 0.032;
  const s = new Shape();
  s.moveTo(rOut, SPRING);
  s.absarc(0, SPRING, rOut, 0, Math.PI, false);
  s.lineTo(-A, SPRING);
  s.absarc(0, SPRING, A, Math.PI, 0, true);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: 0.114, bevelEnabled: false, curveSegments: 14 });
  geo.translate(0, 0, -0.057);
  return new Mesh(geo, mat(TONES.white));
}

/** Low parapet wall riding the deck curve. */
function parapet(zOff: number): Mesh {
  const s = new Shape();
  s.moveTo(-HALF, DECK_END);
  for (let i = 0; i <= N; i++) {
    const x = -HALF + (i * 2 * HALF) / N;
    s.lineTo(x, deckY(x) + 0.024);
  }
  s.lineTo(HALF, DECK_END);
  for (let i = N - 1; i >= 1; i--) {
    const x = -HALF + (i * 2 * HALF) / N;
    s.lineTo(x, deckY(x));
  }
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: false });
  geo.translate(0, 0, zOff);
  return new Mesh(geo, mat(TONES.white));
}

function squareTower(hwBot: number, hwTop: number, h: number, color: string): Mesh {
  const geo = new CylinderGeometry(hwTop * SQ2, hwBot * SQ2, h, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, h / 2, 0);
  return new Mesh(geo, mat(color));
}

function pyramidRoof(hw: number, h: number, color: string): Mesh {
  const geo = new ConeGeometry(hw * SQ2, h, 4);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, h / 2, 0);
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

/** Tiny gabled old-town house (walls + slate saddle roof). */
function house(w: number, d: number, wallH: number, roofH: number, wall: string): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, wallH, d), mat(wall));
  body.position.y = wallH / 2;
  g.add(body);
  const hw = w / 2 + 0.006;
  const s = new Shape();
  s.moveTo(-hw, 0);
  s.lineTo(hw, 0);
  s.lineTo(0, roofH);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: d + 0.012, bevelEnabled: false });
  geo.translate(0, wallH, -(d + 0.012) / 2);
  g.add(new Mesh(geo, mat(TONES.slate)));
  return g;
}

export function build(): Group {
  const g = new Group();

  // ---- teal river + rocky banks with pale paving ----
  const water = new Mesh(new CylinderGeometry(R, R, 0.026, 36), mat(TEAL));
  water.position.y = 0.013;
  g.add(water);

  for (const side of [0, Math.PI]) {
    const rock = bankSlab(0.1, R, BANK_H, TONES.stoneDark);
    rock.rotation.y = side;
    g.add(rock);
    const pave = bankSlab(0.106, R - 0.01, PAVE_H, TONES.stone);
    pave.position.y = BANK_H;
    pave.rotation.y = side;
    g.add(pave);
  }

  // boulders at the cliff feet
  const boulder = (x: number, z: number, s: number, ry: number) => {
    const b = box(s, s * 0.8, s, x, 0.03, z, TONES.stoneDark);
    b.rotation.y = ry;
    g.add(b);
  };
  boulder(-0.09, 0.17, 0.045, 0.5);
  boulder(0.088, -0.15, 0.05, 1.1);
  boulder(0.092, 0.2, 0.038, 0.2);
  boulder(-0.085, -0.21, 0.04, 0.9);

  // ---- the bridge ----
  g.add(bridgeBody());
  g.add(archRing());
  g.add(parapet(0.04));
  g.add(parapet(-0.052));

  // ---- gate towers: Halebija (taller, west) / Tara (stouter, east) ----
  const halebija = new Group();
  halebija.position.set(-0.245, BANK_H + PAVE_H, 0.07);
  halebija.add(squareTower(0.055, 0.047, 0.26, TONES.stoneDark));
  halebija.add(box(0.116, 0.02, 0.116, 0, 0.27, 0, TONES.stone));
  const hRoof = pyramidRoof(0.062, 0.085, TONES.slate);
  hRoof.position.y = 0.28;
  halebija.add(hRoof);
  halebija.add(box(0.016, 0.028, 0.006, 0.012, 0.18, 0.052, TONES.ink));
  halebija.add(box(0.006, 0.028, 0.016, 0.052, 0.11, -0.014, TONES.ink));
  g.add(halebija);

  const tara = new Group();
  tara.position.set(0.245, BANK_H + PAVE_H, -0.065);
  tara.add(squareTower(0.068, 0.059, 0.19, TONES.stoneDark));
  tara.add(box(0.142, 0.02, 0.142, 0, 0.2, 0, TONES.stone));
  const tRoof = pyramidRoof(0.078, 0.075, TONES.slate);
  tRoof.position.y = 0.21;
  tara.add(tRoof);
  tara.add(box(0.016, 0.028, 0.006, -0.015, 0.12, 0.062, TONES.ink));
  tara.add(box(0.006, 0.028, 0.016, -0.062, 0.07, 0.02, TONES.ink));
  g.add(tara);

  // ---- old-town houses on the banks ----
  const put = (
    h: Group,
    x: number,
    z: number,
    ry: number
  ) => {
    h.position.set(x, BANK_H + PAVE_H, z);
    h.rotation.y = ry;
    g.add(h);
  };
  put(house(0.09, 0.07, 0.06, 0.032, TONES.white), -0.21, -0.13, 0.35);
  put(house(0.075, 0.06, 0.05, 0.028, TONES.sand), -0.26, -0.02, -0.15);
  put(house(0.08, 0.065, 0.055, 0.03, TONES.white), 0.22, 0.13, -0.4);
  put(house(0.07, 0.058, 0.048, 0.026, TONES.stone), 0.27, 0.03, 0.2);

  return g;
}
