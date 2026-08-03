// Genghis Khan Equestrian Statue (Tsonjin Boldog) — papercraft miniature.
// Stainless-steel horseman (horse + rider with raised golden whip) standing
// on a round two-tier colonnaded rotunda. Horse faces +x.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const STEEL = "#bcc2cc"; // muted stainless
const STEEL_DARK = "#99a1af";
const GLASS = "#b3c0d0"; // glazing behind the colonnade

function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  m: MeshLambertMaterial,
  rz = 0,
  ry = 0
): Mesh {
  const b = new Mesh(new BoxGeometry(w, h, d), m);
  b.position.set(x, y, z);
  b.rotation.z = rz;
  b.rotation.y = ry;
  return b;
}

export function build(): Group {
  const g = new Group();
  const white = mat(TONES.white);
  const stone = mat(TONES.stone);
  const stoneDark = mat(TONES.stoneDark);
  const glass = mat(GLASS);
  const steel = mat(STEEL);
  const steelDark = mat(STEEL_DARK);
  const slate = mat(TONES.slate);
  const gold = mat(TONES.gold);

  g.add(plazaDisc(0.34));

  // ================= Rotunda base =================
  // Stepped stone plinth
  const step1 = new Mesh(new CylinderGeometry(0.3, 0.3, 0.025, 28), stoneDark);
  step1.position.y = 0.0125;
  g.add(step1);
  const step2 = new Mesh(new CylinderGeometry(0.275, 0.275, 0.025, 28), stone);
  step2.position.y = 0.0375;
  g.add(step2);

  // Glazed inner drum behind the colonnade
  const drum = new Mesh(new CylinderGeometry(0.215, 0.215, 0.145, 28), glass);
  drum.position.y = 0.1225;
  g.add(drum);

  // Colonnade ring — 18 white columns
  const colGeo = new CylinderGeometry(0.009, 0.011, 0.145, 6);
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const c = new Mesh(colGeo, white);
    c.position.set(Math.cos(a) * 0.248, 0.1225, Math.sin(a) * 0.248);
    g.add(c);
  }

  // Entablature over the columns
  const ent = new Mesh(new CylinderGeometry(0.272, 0.272, 0.03, 28), white);
  ent.position.y = 0.21;
  g.add(ent);
  const entTrim = new Mesh(new CylinderGeometry(0.26, 0.26, 0.012, 28), stone);
  entTrim.position.y = 0.231;
  g.add(entTrim);

  // Upper drum with a ring of slate windows
  const upper = new Mesh(new CylinderGeometry(0.2, 0.2, 0.05, 28), white);
  upper.position.y = 0.262;
  g.add(upper);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
    const w = box(
      0.01,
      0.03,
      0.02,
      Math.cos(a) * 0.198,
      0.262,
      Math.sin(a) * 0.198,
      slate,
      0,
      -a
    );
    g.add(w);
  }

  // Statue deck
  const deck = new Mesh(new CylinderGeometry(0.165, 0.175, 0.02, 28), stone);
  deck.position.y = 0.297;
  g.add(deck);
  const DECK = 0.307; // statue stands here

  // Front entrance portico + steps (+x)
  g.add(box(0.07, 0.1, 0.1, 0.265, 0.095, 0, white));
  g.add(box(0.02, 0.014, 0.11, 0.31, 0.052, 0, stone));
  g.add(box(0.026, 0.028, 0.036, 0.302, 0.073, 0, slate)); // doorway
  g.add(box(0.03, 0.02, 0.12, 0.325, 0.01, 0, stoneDark));

  // ================= Steel horse (facing +x) =================
  const s = new Group();
  s.position.y = DECK;
  s.scale.setScalar(1.07); // colossus presence over the rotunda
  g.add(s);

  // Legs + hooves
  const legGeo = new BoxGeometry(0.028, 0.16, 0.028);
  const hoofGeo = new BoxGeometry(0.032, 0.02, 0.032);
  const legPos: Array<[number, number]> = [
    [0.1, 0.035],
    [0.1, -0.035],
    [-0.115, 0.038],
    [-0.115, -0.038],
  ];
  for (const [lx, lz] of legPos) {
    const leg = new Mesh(legGeo, steel);
    leg.position.set(lx, 0.09, lz);
    s.add(leg);
    const hoof = new Mesh(hoofGeo, steelDark);
    hoof.position.set(lx, 0.01, lz);
    s.add(hoof);
  }

  // Body, chest, rump
  s.add(box(0.26, 0.115, 0.09, -0.01, 0.215, 0, steel));
  s.add(box(0.08, 0.11, 0.082, 0.105, 0.235, 0, steel));
  s.add(box(0.085, 0.1, 0.08, -0.12, 0.225, 0, steel));

  // Shoulder wedge filling the chest → neck junction
  s.add(box(0.07, 0.1, 0.07, 0.122, 0.29, 0, steel, -0.24));
  // Neck: proud, near-upright arch rising from the chest + mane slab
  s.add(box(0.06, 0.21, 0.05, 0.14, 0.35, 0, steel, -0.24));
  s.add(box(0.022, 0.17, 0.056, 0.102, 0.34, 0, steelDark, -0.24));

  // Head held high, muzzle, ears (throat filler closes the neck notch)
  s.add(box(0.05, 0.05, 0.042, 0.185, 0.43, 0, steel, -0.35));
  s.add(box(0.095, 0.05, 0.042, 0.21, 0.452, 0, steel, -0.35));
  s.add(box(0.034, 0.04, 0.034, 0.258, 0.434, 0, steelDark, -0.35));
  const earGeo = new ConeGeometry(0.01, 0.032, 4);
  for (const ez of [0.015, -0.015]) {
    const ear = new Mesh(earGeo, steelDark);
    ear.position.set(0.175, 0.5, ez);
    s.add(ear);
  }

  // Tail flowing down-back, rooted in the rump
  s.add(box(0.036, 0.15, 0.036, -0.152, 0.155, 0, steelDark, -0.25));

  // ================= Rider =================
  // Saddle + robe skirt draping over the horse's back
  s.add(box(0.095, 0.02, 0.098, -0.02, 0.282, 0, steelDark));
  s.add(box(0.085, 0.045, 0.09, -0.022, 0.305, 0, steel));
  // Rider legs hugging the flanks
  s.add(box(0.042, 0.09, 0.02, 0.0, 0.26, 0.052, steel, 0.15));
  s.add(box(0.042, 0.09, 0.02, 0.0, 0.26, -0.052, steel, 0.15));
  // Torso + shoulders
  s.add(box(0.075, 0.12, 0.068, -0.022, 0.375, 0, steel));
  s.add(box(0.066, 0.032, 0.084, -0.022, 0.42, 0, steel));
  s.add(box(0.079, 0.016, 0.072, -0.022, 0.335, 0, steelDark)); // belt
  // Cape flowing behind
  s.add(box(0.028, 0.14, 0.088, -0.078, 0.35, 0, steelDark, -0.35));
  // Whip arm raised forward (+z side toward front camera), whip in hand
  s.add(box(0.095, 0.026, 0.026, 0.028, 0.45, 0.042, steel, 0.55));
  s.add(box(0.024, 0.024, 0.024, 0.068, 0.478, 0.042, steelDark)); // fist
  const whip = new Mesh(new CylinderGeometry(0.005, 0.008, 0.1, 6), gold);
  whip.position.set(0.078, 0.53, 0.042);
  whip.rotation.z = -0.18;
  s.add(whip);
  // Resting arm on the far side
  s.add(box(0.075, 0.024, 0.024, 0.012, 0.41, -0.044, steel, -0.4));
  // Head + helmet with brim
  s.add(box(0.036, 0.038, 0.036, -0.02, 0.465, 0, steel));
  const brim = new Mesh(new CylinderGeometry(0.03, 0.033, 0.01, 10), steelDark);
  brim.position.set(-0.02, 0.487, 0);
  s.add(brim);
  const helm = new Mesh(new ConeGeometry(0.024, 0.042, 10), steel);
  helm.position.set(-0.02, 0.512, 0);
  s.add(helm);

  return g;
}
