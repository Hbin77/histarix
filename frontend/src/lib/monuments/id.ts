// Borobudur — papercraft: broad stepped stone mandala pyramid. Square lower
// terraces with balustrade rims, axial stairways on all four faces, three
// round upper terraces ringed with perforated bell stupas, big central stupa.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

// Muted volcanic-andesite greys: dark square galleries, sun-bleached crown.
const SLAB_A = mat("#8a7f6d");
const SLAB_B = mat("#7f7463");
const RIM = mat("#6f665a");
const ROUND = mat("#c7bba1");
const STUPA = mat("#b3a68c");
const STAIR = mat("#9d9180");

/** Low-poly bell stupa (lathe): flared base, domed bell, small spire tip. */
function bellStupa(r: number, h: number, m: MeshLambertMaterial): Group {
  const g = new Group();
  const pts = [
    new Vector2(r * 0.8, 0),
    new Vector2(r, h * 0.42),
    new Vector2(r * 0.58, h * 0.85),
    new Vector2(0.001, h),
  ];
  g.add(new Mesh(new LatheGeometry(pts, 6), m));
  const tip = new Mesh(new ConeGeometry(r * 0.24, h * 0.34, 4, 1, true), m);
  tip.position.y = h * 1.05;
  g.add(tip);
  return g;
}

function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  m: MeshLambertMaterial
): Mesh {
  const b = new Mesh(new BoxGeometry(w, h, d), m);
  b.position.set(x, y, z);
  return b;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.36));

  // ---- broad processional base platform ----
  const baseHalf = 0.26;
  g.add(box(0.52, 0.04, 0.52, 0, 0.02, 0, SLAB_B));

  // ---- five square terraces, each rimmed by a balustrade wall with axial
  //      gate gaps where the stairways cross ----
  const sides = [0.45, 0.395, 0.34, 0.285, 0.23];
  const slabH = 0.042;
  const rimH = 0.022;
  const rimT = 0.012;
  const gap = 0.062;
  let topY = 0.04;
  for (let i = 0; i < sides.length; i++) {
    const s = sides[i];
    g.add(box(s, slabH, s, 0, topY + slabH / 2, 0, i % 2 ? SLAB_B : SLAB_A));
    topY += slabH;
    // balustrade: each side split in two, leaving a stair gap at center
    const segLen = (s - gap) / 2 - rimT;
    const off = gap / 2 + segLen / 2;
    const edge = s / 2 - rimT / 2;
    const ry = topY + rimH / 2;
    for (const sgn of [1, -1]) {
      g.add(box(segLen, rimH, rimT, sgn * off, ry, edge, RIM));
      g.add(box(segLen, rimH, rimT, sgn * off, ry, -edge, RIM));
      g.add(box(rimT, rimH, segLen, edge, ry, sgn * off, RIM));
      g.add(box(rimT, rimH, segLen, -edge, ry, sgn * off, RIM));
    }
    // corner pinnacles on the balustrade
    for (const sx of [1, -1])
      for (const sz of [1, -1]) {
        const p = new Mesh(new ConeGeometry(0.011, 0.03, 4, 1, true), RIM);
        p.position.set(sx * edge, topY + 0.015, sz * edge);
        g.add(p);
      }
  }

  // ---- four axial stairways: stacked flights riding proud of each face ----
  const flightW = 0.058;
  const flightD = 0.032;
  // [wall x position, flight bottom y, flight top y]
  const flights: Array<[number, number, number]> = [[baseHalf, 0, 0.04]];
  for (let i = 0; i < sides.length; i++)
    flights.push([sides[i] / 2, 0.04 + i * slabH, 0.04 + (i + 1) * slabH + rimH]);
  for (let k = 0; k < 4; k++) {
    const holder = new Group();
    holder.rotation.y = (k * Math.PI) / 2;
    for (const [wx, yA, yB] of flights)
      holder.add(
        box(flightD, yB - yA, flightW, wx + flightD / 2 - 0.004, (yA + yB) / 2, 0, STAIR)
      );
    g.add(holder);
  }

  // ---- three round terraces (the light, open crown) ----
  const rounds: Array<[number, number]> = [
    [0.126, 0.028],
    [0.096, 0.028],
    [0.066, 0.028],
  ];
  for (const [r, h] of rounds) {
    const c = new Mesh(new CylinderGeometry(r, r, h, 14), ROUND);
    c.position.y = topY + h / 2;
    g.add(c);
    topY += h;
  }

  // ---- rings of small bell stupas on the round terraces ----
  const rings: Array<[number, number, number]> = [
    [12, 0.099, 0.278], // count, ring radius, terrace top y
    [8, 0.072, 0.306],
    [6, 0.046, 0.334],
  ];
  for (const [n, rr, y] of rings) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.PI / n;
      const s = bellStupa(0.0155, 0.04, STUPA);
      s.position.set(Math.cos(a) * rr, y, Math.sin(a) * rr);
      g.add(s);
    }
  }

  // ---- great central stupa ----
  const plinth = new Mesh(new CylinderGeometry(0.046, 0.05, 0.013, 12), ROUND);
  plinth.position.y = topY + 0.0065;
  g.add(plinth);
  const bellPts = [
    new Vector2(0.046, 0),
    new Vector2(0.052, 0.03),
    new Vector2(0.038, 0.066),
    new Vector2(0.015, 0.084),
    new Vector2(0.001, 0.088),
  ];
  const bell = new Mesh(new LatheGeometry(bellPts, 12), STUPA);
  bell.position.y = topY + 0.013;
  g.add(bell);
  const spire = new Mesh(new ConeGeometry(0.013, 0.042, 6), mat(TONES.stoneDark));
  spire.position.y = topY + 0.013 + 0.088 + 0.014;
  g.add(spire);

  return g;
}
