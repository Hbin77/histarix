// Ayasofya — papercraft: massive shallow lead dome on a dusty-rose boxy
// body, two semi-domes cascading on the main axis, corner exedrae and
// four slender pencil minarets (one historic brick).

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.35));

  const rose = mat("#c59486"); // dusty rose walls
  const roseDark = mat("#ab7a6b"); // buttresses / recesses
  const lead = mat(TONES.slate); // lead-sheet domes
  const stone = mat(TONES.white); // minaret shafts
  const drumTone = mat(TONES.stone);
  const ink = mat(TONES.ink);
  const gold = mat(TONES.gold);
  const brick = mat(TONES.brick); // the old brick minaret

  // ---- Massing tiers (long axis = x) ----
  const tier1 = new Mesh(new BoxGeometry(0.48, 0.13, 0.35), rose);
  tier1.position.y = 0.065;
  g.add(tier1);

  const tier2 = new Mesh(new BoxGeometry(0.39, 0.11, 0.28), rose);
  tier2.position.y = 0.155;
  g.add(tier2);

  const core = new Mesh(new BoxGeometry(0.26, 0.16, 0.26), rose);
  core.position.y = 0.23;
  g.add(core);

  // Pale stone cornice bands capping the tiers.
  for (const [w, d, y] of [
    [0.484, 0.354, 0.128],
    [0.394, 0.284, 0.208],
  ] as const) {
    const band = new Mesh(new BoxGeometry(w, 0.008, d), drumTone);
    band.position.y = y;
    g.add(band);
  }

  // Shoulder blocks carrying the semi-domes (east / west).
  for (const sx of [1, -1]) {
    const shoulder = new Mesh(new BoxGeometry(0.16, 0.13, 0.19), rose);
    shoulder.position.set(sx * 0.135, 0.195, 0);
    g.add(shoulder);
  }

  // Tympanum walls (north / south), flanking the drum.
  for (const sz of [1, -1]) {
    const tymp = new Mesh(new BoxGeometry(0.22, 0.1, 0.03), roseDark);
    tymp.position.set(0, 0.3, sz * 0.125);
    g.add(tymp);
    // arched window row on the tympanum face
    for (let i = -2; i <= 2; i++) {
      const w = new Mesh(new BoxGeometry(0.018, 0.032, 0.008), ink);
      w.position.set(i * 0.04, 0.302, sz * 0.142);
      g.add(w);
    }
  }

  // Chunky stepped buttresses protruding on the north / south fronts.
  for (const sz of [1, -1]) {
    for (const sx of [1, -1]) {
      const but = new Mesh(new BoxGeometry(0.055, 0.2, 0.05), rose);
      but.position.set(sx * 0.072, 0.1, sz * 0.185);
      g.add(but);
      const butCap = new Mesh(new BoxGeometry(0.055, 0.05, 0.036), roseDark);
      butCap.position.set(sx * 0.072, 0.225, sz * 0.178);
      g.add(butCap);
    }
  }

  // ---- Drum + central dome (broad and shallow — the hallmark) ----
  const drum = new Mesh(new CylinderGeometry(0.135, 0.141, 0.048, 16), drumTone);
  drum.position.y = 0.334;
  g.add(drum);
  // drum window studs
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const w = new Mesh(new BoxGeometry(0.014, 0.026, 0.012), ink);
    w.position.set(Math.sin(a) * 0.137, 0.334, Math.cos(a) * 0.137);
    w.rotation.y = a;
    g.add(w);
  }

  const dome = new Mesh(
    new SphereGeometry(0.152, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    lead
  );
  dome.scale.y = 0.64;
  dome.position.y = 0.352;
  g.add(dome);

  // Gold crescent finial.
  const mast = new Mesh(new CylinderGeometry(0.004, 0.004, 0.035, 6), gold);
  mast.position.y = 0.464;
  g.add(mast);
  const crescent = new Mesh(new SphereGeometry(0.009, 6, 4), gold);
  crescent.position.y = 0.486;
  g.add(crescent);

  // ---- Semi-domes on the main axis (half sunk into the core) ----
  for (const sx of [1, -1]) {
    const semi = new Mesh(
      new SphereGeometry(0.095, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      lead
    );
    semi.scale.y = 0.78;
    semi.position.set(sx * 0.135, 0.255, 0);
    g.add(semi);
  }

  // Small exedra semi-domes at the diagonals.
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      const ex = new Mesh(
        new SphereGeometry(0.052, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2),
        lead
      );
      ex.scale.y = 0.8;
      ex.position.set(sx * 0.175, 0.19, sz * 0.082);
      g.add(ex);
    }
  }

  // Corner weight turrets with small lead caps.
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      const turret = new Mesh(new BoxGeometry(0.036, 0.1, 0.036), rose);
      turret.position.set(sx * 0.112, 0.3, sz * 0.112);
      g.add(turret);
      const cap = new Mesh(
        new SphereGeometry(0.024, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2),
        lead
      );
      cap.position.set(sx * 0.112, 0.35, sz * 0.112);
      g.add(cap);
    }
  }

  // ---- Four pencil minarets (SE one in old brick, notably fatter) ----
  const minaretAt = (x: number, z: number, shaftMat = stone, fat = 1) => {
    const m = new Group();
    m.position.set(x, 0, z);

    const pedestal = new Mesh(
      new BoxGeometry(0.046 * fat, 0.08, 0.046 * fat),
      shaftMat
    );
    pedestal.position.y = 0.04;
    m.add(pedestal);

    const taper = new Mesh(
      new CylinderGeometry(0.014 * fat, 0.028 * fat, 0.035, 8),
      shaftMat
    );
    taper.position.y = 0.095;
    m.add(taper);

    const shaft = new Mesh(
      new CylinderGeometry(0.012 * fat, 0.014 * fat, 0.38, 8),
      shaftMat
    );
    shaft.position.y = 0.3;
    m.add(shaft);

    for (const y of [0.37, 0.46]) {
      const balcony = new Mesh(
        new CylinderGeometry(0.021 * fat, 0.021 * fat, 0.01, 8),
        roseDark
      );
      balcony.position.y = y;
      m.add(balcony);
    }

    const upper = new Mesh(
      new CylinderGeometry(0.0095 * fat, 0.0115 * fat, 0.09, 8),
      shaftMat
    );
    upper.position.y = 0.53;
    m.add(upper);

    const cap = new Mesh(new ConeGeometry(0.018 * fat, 0.11, 8), lead);
    cap.position.y = 0.63;
    m.add(cap);

    const tip = new Mesh(new CylinderGeometry(0.0025, 0.0025, 0.022, 5), gold);
    tip.position.y = 0.694;
    m.add(tip);

    g.add(m);
  };

  minaretAt(0.215, 0.155);
  minaretAt(0.215, -0.155, brick, 1.35);
  minaretAt(-0.215, 0.155);
  minaretAt(-0.215, -0.155);

  return g;
}
