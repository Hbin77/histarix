// Tatev Monastery (Տաթևի վանք) — papercraft miniature.
// Clifftop Armenian monastery: the gabled basilica of Sts. Paul & Peter with
// its faceted drum and conical "umbrella" roof, a smaller domed chapel,
// fortress rampart with a round bastion, and the Gavazan column — all perched
// on a basalt cliff block above the Vorotan gorge.

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

const ROCK = "#8e8272"; // muted basalt gray-brown
const ROCK_DARK = "#746a5b";
const PLAT = 0.208; // plateau (courtyard) surface height

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

/** Triangular gable-roof prism, ridge running along X. Base sits at y = 0. */
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

/** Faceted Armenian drum + conical umbrella roof + small cross finial. */
function drumCone(
  g: Group,
  r: number,
  drumH: number,
  coneH: number,
  x: number,
  baseY: number,
  z: number
): void {
  const drum = new Mesh(new CylinderGeometry(r, r, drumH, 8), mat(TONES.stone));
  drum.position.set(x, baseY + drumH / 2, z);
  g.add(drum);
  // narrow dark window slits on the drum
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 8;
    const slit = box(
      0.009,
      drumH * 0.38,
      0.009,
      x + Math.cos(a) * r,
      baseY + drumH * 0.5,
      z + Math.sin(a) * r,
      TONES.ink
    );
    slit.rotation.y = -a;
    g.add(slit);
  }
  const cone = new Mesh(new ConeGeometry(r * 1.24, coneH, 8), mat(TONES.slate));
  cone.position.set(x, baseY + drumH + coneH / 2, z);
  g.add(cone);
  // cross finial
  const top = baseY + drumH + coneH;
  g.add(box(0.006, 0.03, 0.006, x, top + 0.014, z, TONES.ironDark));
  g.add(box(0.016, 0.006, 0.006, x, top + 0.019, z, TONES.ironDark));
}

export function build(): Group {
  const g = new Group();

  // ---- basalt cliff block (landform base — no plaza disc) ----
  const cliff = new Mesh(new CylinderGeometry(0.262, 0.288, 0.19, 9, 1), mat(ROCK));
  cliff.scale.set(1.18, 1, 0.85);
  cliff.rotation.y = 0.25;
  cliff.position.y = 0.095;
  g.add(cliff);

  // darker rocky skirt flaring at the foot
  const skirt = new Mesh(new CylinderGeometry(0.292, 0.318, 0.05, 9, 1), mat(ROCK_DARK));
  skirt.scale.set(1.15, 1, 0.85);
  skirt.rotation.y = 0.62;
  skirt.position.y = 0.025;
  g.add(skirt);

  // craggy spur jutting toward the gorge (front, +Z)
  const spur = new Mesh(new CylinderGeometry(0.085, 0.115, 0.14, 6, 1), mat(ROCK_DARK));
  spur.scale.set(1.3, 1, 0.8);
  spur.rotation.y = 0.5;
  spur.position.set(0.15, 0.07, 0.2);
  g.add(spur);

  // green ledge atop the spur (vegetated cliff shelf)
  const ledge = new Mesh(new CylinderGeometry(0.082, 0.078, 0.014, 6, 1), mat(TONES.forest));
  ledge.scale.set(1.3, 1, 0.8);
  ledge.rotation.y = 0.5;
  ledge.position.set(0.15, 0.145, 0.2);
  g.add(ledge);

  // grassy plateau cap
  const grass = new Mesh(new CylinderGeometry(0.27, 0.26, 0.018, 9, 1), mat(TONES.forest));
  grass.scale.set(1.18, 1, 0.85);
  grass.rotation.y = 0.25;
  grass.position.y = 0.199;
  g.add(grass);

  // ---- fortress rampart rising straight out of the cliff face (+Z side),
  //      same basalt as the cliff so wall and rock read as one plane ----
  g.add(box(0.36, 0.2, 0.045, 0.0, 0.153, 0.172, ROCK));
  g.add(box(0.38, 0.02, 0.055, 0.0, 0.263, 0.172, TONES.stoneDark)); // parapet cap
  // low walls on the remaining edges
  g.add(box(0.44, 0.045, 0.028, 0.0, PLAT + 0.02, -0.175, ROCK));
  g.add(box(0.028, 0.045, 0.28, -0.26, PLAT + 0.02, -0.01, ROCK));
  g.add(box(0.028, 0.045, 0.24, 0.26, PLAT + 0.02, 0.0, ROCK));
  // round corner bastion over the gorge
  const bastion = new Mesh(new CylinderGeometry(0.036, 0.042, 0.19, 8), mat(ROCK));
  bastion.position.set(0.22, 0.185, 0.16);
  g.add(bastion);
  const bastionCap = new Mesh(new CylinderGeometry(0.043, 0.043, 0.014, 8), mat(TONES.stoneDark));
  bastionCap.position.set(0.22, 0.287, 0.16);
  g.add(bastionCap);

  // ---- basilica of Sts. Paul & Peter (long axis along X) ----
  g.add(box(0.26, 0.15, 0.13, -0.04, PLAT + 0.075, -0.055, TONES.stone));
  const nave = gableRoof(0.14, 0.075, 0.07, TONES.slate);
  nave.position.set(-0.04, PLAT + 0.15, -0.055);
  g.add(nave);
  // west belfry annex with pyramid roof
  g.add(box(0.065, 0.17, 0.1, -0.2, PLAT + 0.085, -0.055, TONES.stone));
  const belfryRoof = new Mesh(new ConeGeometry(0.062, 0.06, 4), mat(TONES.slate));
  belfryRoof.rotation.y = Math.PI / 4;
  belfryRoof.position.set(-0.2, PLAT + 0.2, -0.055);
  g.add(belfryRoof);
  // arched belfry openings (dark)
  g.add(box(0.03, 0.045, 0.075, -0.2, PLAT + 0.135, -0.055, TONES.ink));
  // main portal on the south face
  g.add(box(0.045, 0.06, 0.012, -0.04, PLAT + 0.03, 0.011, TONES.ink));
  // central drum + umbrella cone over the crossing
  drumCone(g, 0.06, 0.16, 0.14, 0.02, 0.37, -0.055);

  // ---- St. Gregory chapel (smaller, adjoining to the southeast) ----
  g.add(box(0.1, 0.09, 0.08, 0.16, PLAT + 0.045, 0.055, TONES.stone));
  const chapelRoof = gableRoof(0.055, 0.046, 0.04, TONES.slate);
  chapelRoof.position.set(0.16, PLAT + 0.09, 0.055);
  g.add(chapelRoof);
  drumCone(g, 0.032, 0.075, 0.07, 0.16, PLAT + 0.115, 0.055);

  // ---- Gavazan swinging column in the courtyard ----
  const gav = new Mesh(new CylinderGeometry(0.01, 0.012, 0.1, 8), mat(TONES.stone));
  gav.position.set(-0.13, PLAT + 0.05, 0.09);
  g.add(gav);
  g.add(box(0.026, 0.014, 0.026, -0.13, PLAT + 0.107, 0.09, TONES.stoneDark));
  g.add(box(0.016, 0.026, 0.008, -0.13, PLAT + 0.127, 0.09, TONES.stone)); // khachkar

  // ---- ancillary monastic range along the north wall ----
  g.add(box(0.28, 0.06, 0.055, 0.06, PLAT + 0.03, -0.15, TONES.stoneDark));
  const rangeRoof = gableRoof(0.15, 0.034, 0.026, TONES.brickDark);
  rangeRoof.position.set(0.06, PLAT + 0.06, -0.15);
  g.add(rangeRoof);

  return g;
}
