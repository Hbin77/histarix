// Masjid Omar Ali Saifuddien — papercraft: white marble prayer hall under a
// large ribbed golden onion dome, a slender gold-capped minaret beside it, and
// the stone ceremonial barge moored out on the pale lagoon.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const R = 0.375; // ground radius (footprint 0.75)
const MARBLE = TONES.white;
const MARBLE_SHADE = "#e1ddd2";
const GOLD = TONES.gold;
const GOLD_DARK = "#b8933f";
const SHADOW = "#8792a4"; // arcade openings
const BARGE_ROOF = "#98a3ae";

/** Circle-segment slab: the part of the ground circle beyond z = chord * side. */
function segmentSlab(
  chord: number,
  radius: number,
  h: number,
  color: string,
  side: 1 | -1
): Mesh {
  const xc = Math.sqrt(radius * radius - chord * chord);
  const a = Math.atan2(xc, chord);
  const s = new Shape();
  s.moveTo(chord, -xc);
  s.absarc(0, 0, radius, -a, a, false);
  s.closePath();
  const geo = new ExtrudeGeometry(s, {
    depth: h,
    bevelEnabled: false,
    curveSegments: 9,
  });
  geo.rotateX(-Math.PI / 2);
  geo.rotateY((-side * Math.PI) / 2);
  return new Mesh(geo, mat(color));
}

/** Onion dome of the given max radius and height, base at y = 0 of the mesh. */
function onion(rMax: number, h: number, color: string, seg = 14): Mesh {
  const shape: Array<[number, number]> = [
    [0.78, 0],
    [0.95, 0.14],
    [1.0, 0.32],
    [0.88, 0.52],
    [0.6, 0.71],
    [0.3, 0.86],
    [0.1, 0.96],
    [0.001, 1],
  ];
  return new Mesh(
    new LatheGeometry(
      shape.map(([r, t]) => new Vector2(r * rMax, t * h)),
      seg
    ),
    mat(color)
  );
}

/** Gold ball-and-spike finial, base at y = 0 of the group. */
function finial(scale: number): Group {
  const g = new Group();
  const gold = mat(GOLD);
  const ball = new Mesh(new SphereGeometry(0.014 * scale, 6, 4), gold);
  ball.position.y = 0.014 * scale;
  g.add(ball);
  const spike = new Mesh(new ConeGeometry(0.006 * scale, 0.05 * scale, 5), gold);
  spike.position.y = 0.052 * scale;
  g.add(spike);
  return g;
}

/** Arched opening slab: a round-headed arch of width w and total height h. */
function arch(w: number, h: number, depth: number, color: string): Mesh {
  const r = w / 2;
  const s = new Shape();
  s.moveTo(-r, 0);
  s.lineTo(-r, h - r);
  s.absarc(0, h - r, r, Math.PI, 0, true);
  s.lineTo(r, 0);
  s.closePath();
  const geo = new ExtrudeGeometry(s, {
    depth,
    bevelEnabled: false,
    curveSegments: 6,
  });
  geo.translate(0, 0, -depth / 2);
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

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(R));

  // ---- lagoon in front, marble terrace behind ----
  g.add(segmentSlab(0.01, R, 0.026, TONES.water, 1));
  const terrace = segmentSlab(0.0, R - 0.005, 0.036, MARBLE_SHADE, -1);
  g.add(terrace);
  g.add(box(0.5, 0.012, 0.02, 0, 0.042, -0.004, MARBLE)); // quay edge

  const TER = 0.036; // terrace level

  // ---- prayer hall ----
  g.add(box(0.29, 0.155, 0.17, 0, TER + 0.0775, -0.155, MARBLE));
  g.add(box(0.305, 0.016, 0.185, 0, TER + 0.163, -0.155, MARBLE_SHADE));
  // arcade along the front face
  for (const x of [-0.105, -0.035, 0.035, 0.105]) {
    const a = arch(0.05, 0.1, 0.016, SHADOW);
    a.position.set(x, TER, -0.062);
    g.add(a);
  }

  // flanking wings under small white domes
  for (const sx of [-1, 1]) {
    g.add(box(0.1, 0.105, 0.13, sx * 0.185, TER + 0.0525, -0.135, MARBLE));
    g.add(box(0.11, 0.014, 0.14, sx * 0.185, TER + 0.112, -0.135, MARBLE_SHADE));
    const d = onion(0.038, 0.062, MARBLE, 10);
    d.position.set(sx * 0.185, TER + 0.119, -0.135);
    g.add(d);
    const f = finial(0.5);
    f.position.set(sx * 0.185, TER + 0.178, -0.135);
    g.add(f);
    const a = arch(0.04, 0.075, 0.014, SHADOW);
    a.position.set(sx * 0.185, TER, -0.071);
    g.add(a);
  }

  // ---- octagonal drum and the great golden dome ----
  const drum = new Mesh(
    new CylinderGeometry(0.098, 0.104, 0.048, 8),
    mat(MARBLE)
  );
  drum.position.set(0, TER + 0.195, -0.155);
  drum.rotation.y = Math.PI / 8;
  g.add(drum);
  g.add(box(0.225, 0.012, 0.225, 0, TER + 0.222, -0.155, GOLD_DARK));

  const dome = onion(0.108, 0.2, GOLD);
  dome.position.set(0, TER + 0.228, -0.155);
  g.add(dome);
  const domeFinial = finial(1);
  domeFinial.position.set(0, TER + 0.424, -0.155);
  g.add(domeFinial);

  // small golden domes on the shoulders of the hall
  for (const sx of [-1, 1]) {
    const d = onion(0.03, 0.052, GOLD, 8);
    d.position.set(sx * 0.115, TER + 0.17, -0.155);
    g.add(d);
    const f = finial(0.42);
    f.position.set(sx * 0.115, TER + 0.219, -0.155);
    g.add(f);
  }

  // ---- minaret ----
  const MX = 0.215;
  const MZ = -0.06;
  g.add(box(0.086, 0.03, 0.086, MX, TER + 0.015, MZ, MARBLE_SHADE));
  const shaft = new Mesh(new CylinderGeometry(0.028, 0.036, 0.44, 8), mat(MARBLE));
  shaft.position.set(MX, TER + 0.25, MZ);
  g.add(shaft);
  // lower gallery
  const gal1 = new Mesh(new CylinderGeometry(0.05, 0.05, 0.02, 8), mat(MARBLE_SHADE));
  gal1.position.set(MX, TER + 0.48, MZ);
  g.add(gal1);
  g.add(box(0.088, 0.008, 0.088, MX, TER + 0.494, MZ, GOLD_DARK));

  const shaft2 = new Mesh(new CylinderGeometry(0.023, 0.027, 0.19, 8), mat(MARBLE));
  shaft2.position.set(MX, TER + 0.595, MZ);
  g.add(shaft2);
  // upper gallery
  const gal2 = new Mesh(new CylinderGeometry(0.041, 0.041, 0.018, 8), mat(MARBLE_SHADE));
  gal2.position.set(MX, TER + 0.699, MZ);
  g.add(gal2);
  g.add(box(0.072, 0.007, 0.072, MX, TER + 0.712, MZ, GOLD_DARK));

  const lantern = new Mesh(new CylinderGeometry(0.026, 0.029, 0.062, 8), mat(MARBLE));
  lantern.position.set(MX, TER + 0.747, MZ);
  g.add(lantern);
  const cap = onion(0.033, 0.058, GOLD, 10);
  cap.position.set(MX, TER + 0.778, MZ);
  g.add(cap);
  const capFinial = finial(0.6);
  capFinial.position.set(MX, TER + 0.834, MZ);
  g.add(capFinial);

  // ---- causeway out to the barge ----
  const walk = box(0.215, 0.014, 0.03, -0.138, 0.038, 0.088, MARBLE);
  walk.rotation.y = -2.2;
  g.add(walk);

  // ---- the ceremonial barge, moored on the lagoon ----
  const barge = new Group();
  barge.position.set(-0.205, 0.02, 0.185);
  barge.rotation.y = 0.35;
  g.add(barge);

  const hullShape = new Shape();
  hullShape.moveTo(-0.115, 0);
  hullShape.quadraticCurveTo(0, 0.05, 0.115, 0);
  hullShape.quadraticCurveTo(0, -0.05, -0.115, 0);
  const hullGeo = new ExtrudeGeometry(hullShape, {
    depth: 0.042,
    bevelEnabled: false,
    curveSegments: 6,
  });
  hullGeo.rotateX(-Math.PI / 2);
  barge.add(new Mesh(hullGeo, mat(MARBLE_SHADE)));
  barge.add(box(0.19, 0.012, 0.066, 0, 0.048, 0, MARBLE));

  // central pavilion, two tiers of pyramid roof
  barge.add(box(0.078, 0.05, 0.05, -0.005, 0.079, 0, MARBLE));
  for (const [w, h, y] of [
    [0.112, 0.034, 0.104],
    [0.08, 0.032, 0.136],
  ] as const) {
    const roof = new Mesh(new ConeGeometry(w * 0.72, h, 4), mat(BARGE_ROOF));
    roof.rotation.y = Math.PI / 4;
    roof.position.set(-0.005, y + h / 2, 0);
    barge.add(roof);
    barge.add(box(w * 1.02, 0.007, w * 0.62, -0.005, y, 0, GOLD_DARK));
  }
  const bargeFinial = finial(0.42);
  bargeFinial.position.set(-0.005, 0.167, 0);
  barge.add(bargeFinial);

  // smaller pavilion toward the stern
  barge.add(box(0.05, 0.036, 0.04, 0.082, 0.072, 0, MARBLE));
  const sternRoof = new Mesh(new ConeGeometry(0.05, 0.028, 4), mat(BARGE_ROOF));
  sternRoof.rotation.y = Math.PI / 4;
  sternRoof.position.set(0.082, 0.104, 0);
  barge.add(sternRoof);

  // raised prow ornament
  const prow = new Mesh(new ConeGeometry(0.014, 0.06, 5), mat(MARBLE));
  prow.position.set(-0.1, 0.072, 0);
  prow.rotation.z = 0.35;
  barge.add(prow);

  return g;
}
