// Pražský hrad (Prague Castle) — papercraft miniature.
// Long low palace facade with terracotta hip roofs; St. Vitus Cathedral
// rising from the middle: twin openwork gothic spires (west), steep dark
// nave roof with a crossing flèche, and the taller Great South Tower with
// its verdigris baroque cap.

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

const SQ2 = Math.SQRT2;
const TILE = "#b06f55"; // muted Prague terracotta
const GOTHIC = "#5c5f6e"; // dark slate-gray gothic spire/roof

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

/** Rectangular hip-roof frustum, base at local y=0 (see kr.ts). */
function hipRoof(hx: number, hz: number, h: number, t: number, color: string): Mesh {
  const geo = new CylinderGeometry(t * SQ2, SQ2, 1, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, 0.5, 0);
  const m = new Mesh(geo, mat(color));
  m.scale.set(hx, h, hz);
  return m;
}

/** Steep gable roof, ridge along X. halfLen (X), halfDepth (Z), height h. */
function gableRoof(halfLen: number, halfDepth: number, h: number, color: string): Mesh {
  const s = new Shape();
  s.moveTo(-halfDepth, 0);
  s.lineTo(halfDepth, 0);
  s.lineTo(0, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: halfLen * 2, bevelEnabled: false });
  geo.translate(0, 0, -halfLen);
  geo.rotateY(Math.PI / 2);
  return new Mesh(geo, mat(color));
}

/** Small corner pinnacle (gothic). */
function pinnacle(x: number, y: number, z: number, r: number, h: number): Mesh {
  const m = new Mesh(new ConeGeometry(r, h, 4), mat(GOTHIC));
  m.rotation.y = Math.PI / 4;
  m.position.set(x, y + h / 2, z);
  return m;
}

/** Openwork gothic west spire: square shaft, belfry, 8-sided needle + pinnacles. */
function gothicSpire(x: number, z: number): Group {
  const g = new Group();
  g.position.set(x, 0, z);
  // shaft rising out of the palace roofline
  g.add(box(0.066, 0.4, 0.066, 0, 0.2, 0, TONES.stone));
  // belfry stage, slightly narrower, dark openings
  g.add(box(0.058, 0.085, 0.058, 0, 0.442, 0, TONES.stoneDark));
  g.add(box(0.02, 0.06, 0.062, 0, 0.44, 0, GOTHIC));
  g.add(box(0.062, 0.06, 0.02, 0, 0.44, 0, GOTHIC));
  // cornice
  g.add(box(0.072, 0.014, 0.072, 0, 0.492, 0, TONES.stoneDark));
  // openwork needle
  const spire = new Mesh(new ConeGeometry(0.043, 0.35, 8, 1), mat(GOTHIC));
  spire.position.y = 0.499 + 0.175;
  g.add(spire);
  // corner pinnacles
  for (const sx of [1, -1])
    for (const sz of [1, -1]) g.add(pinnacle(sx * 0.03, 0.499, sz * 0.03, 0.009, 0.062));
  // gold tip
  const tip = new Mesh(new SphereGeometry(0.007, 6, 4), mat(TONES.gold));
  tip.position.y = 0.845;
  g.add(tip);
  return g;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.375));

  // ================= long low palace facade =================
  // main wall run
  g.add(box(0.64, 0.14, 0.15, 0, 0.08, 0.05, TONES.white));
  // window strips (muted bands along the front face)
  for (const wx of [-0.25, -0.17, 0.19, 0.26]) {
    g.add(box(0.055, 0.05, 0.006, wx, 0.095, 0.126, TONES.stoneDark));
  }
  // terracotta hip roof over the full run
  const palaceRoof = hipRoof(0.335, 0.085, 0.062, 0.24, TILE);
  palaceRoof.position.set(0, 0.15, 0.05);
  g.add(palaceRoof);

  // end pavilions with pyramid caps (castle cue)
  for (const sx of [1, -1]) {
    g.add(box(0.08, 0.2, 0.165, sx * 0.295, 0.11, 0.05, TONES.white));
    const cap = new Mesh(new ConeGeometry(0.05 * SQ2, 0.07, 4), mat(TILE));
    cap.rotation.y = Math.PI / 4;
    cap.position.set(sx * 0.295, 0.245, 0.05);
    g.add(cap);
  }

  // low rampart wall at the front edge
  g.add(box(0.62, 0.045, 0.028, 0, 0.034, 0.15, TONES.stoneDark));

  // ================= St. Vitus Cathedral =================
  const CZ = -0.075; // cathedral centerline (behind palace)

  // nave body rising above the palace roof
  g.add(box(0.34, 0.24, 0.105, -0.03, 0.13, CZ, TONES.stone));
  // clerestory band
  g.add(box(0.3, 0.05, 0.115, -0.03, 0.275, CZ, TONES.stoneDark));
  // steep dark gable roof
  const nave = gableRoof(0.165, 0.062, 0.15, GOTHIC);
  nave.position.set(-0.03, 0.3, CZ);
  g.add(nave);

  // buttress pinnacle rows along both nave flanks
  for (const sz of [1, -1])
    for (let i = 0; i < 5; i++)
      g.add(pinnacle(-0.15 + i * 0.06, 0.3, CZ + sz * 0.062, 0.008, 0.05));

  // crossing flèche
  const fleche = new Mesh(new ConeGeometry(0.014, 0.17, 6), mat(GOTHIC));
  fleche.position.set(0.03, 0.45 + 0.085, CZ);
  g.add(fleche);

  // twin openwork west spires — staggered diagonally so both read from the
  // front (matching the angled postcard view from the river)
  g.add(gothicSpire(-0.27, CZ - 0.042));
  g.add(gothicSpire(-0.19, CZ + 0.042));

  // ================= Great South Tower =================
  const TX = 0.135;
  const TZ = -0.01;
  g.add(box(0.095, 0.58, 0.095, TX, 0.29, TZ, TONES.stone));
  // paired arched window slits on the upper shaft
  for (const [dx, dz, w, d] of [
    [0.02, 0.0495, 0.026, 0.004],
    [-0.02, 0.0495, 0.026, 0.004],
    [0.0495, 0.02, 0.004, 0.026],
    [0.0495, -0.02, 0.004, 0.026],
  ] as const) {
    g.add(box(w, 0.09, d, TX + dx, 0.41, TZ + dz, GOTHIC));
    g.add(box(w, 0.09, d, TX - dx, 0.41, TZ - dz, GOTHIC));
  }
  // gold clock band
  g.add(box(0.102, 0.032, 0.102, TX, 0.5, TZ, TONES.gold));
  // gallery cornice
  g.add(box(0.118, 0.018, 0.118, TX, 0.589, TZ, TONES.stoneDark));
  // verdigris baroque cap: squashed dome, lantern, onion, spike
  const dome = new Mesh(new SphereGeometry(0.058, 8, 5), mat(TONES.verdigris));
  dome.scale.set(1, 0.78, 1);
  dome.position.set(TX, 0.615, TZ);
  g.add(dome);
  const lantern = new Mesh(new CylinderGeometry(0.024, 0.028, 0.055, 8), mat(TONES.verdigris));
  lantern.position.set(TX, 0.685, TZ);
  g.add(lantern);
  const onion = new Mesh(new SphereGeometry(0.03, 8, 5), mat(TONES.verdigris));
  onion.scale.set(1, 0.85, 1);
  onion.position.set(TX, 0.73, TZ);
  g.add(onion);
  const spike = new Mesh(new ConeGeometry(0.011, 0.2, 6), mat(TONES.verdigris));
  spike.position.set(TX, 0.85, TZ);
  g.add(spike);
  const finial = new Mesh(new SphereGeometry(0.012, 6, 4), mat(TONES.gold));
  finial.position.set(TX, 0.955, TZ);
  g.add(finial);

  return g;
}
