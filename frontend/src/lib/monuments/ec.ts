// Mitad del Mundo — papercraft: tapering square stone tower crowned by a
// metal globe, four corner pylons with medallions, equator line across plaza.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
  TorusGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;

export function build(): Group {
  const g = new Group();
  const stone = mat("#a18a73"); // warm brown andesite
  const stoneDark = mat("#87715c");
  const trim = mat(TONES.stone);
  const line = mat(TONES.woodRed);
  const globeMat = mat("#5e6e66"); // dark weathered metal
  const band = mat(TONES.gold);

  g.add(plazaDisc(0.34));

  // ---- Equator line: red stripe crossing the plaza east-west ----
  for (const s of [1, -1] as const) {
    const stripe = new Mesh(new BoxGeometry(0.135, 0.008, 0.024), line);
    stripe.position.set(s * 0.265, 0.014, 0);
    g.add(stripe);
  }

  // ---- Stepped base platform ----
  const base1 = new Mesh(new BoxGeometry(0.4, 0.028, 0.4), stoneDark);
  base1.position.y = 0.014;
  g.add(base1);
  const base2 = new Mesh(new BoxGeometry(0.33, 0.028, 0.33), stone);
  base2.position.y = 0.042;
  g.add(base2);
  // line continues over the base steps
  const stripeTop = new Mesh(new BoxGeometry(0.4, 0.006, 0.02), line);
  stripeTop.position.y = 0.06;
  g.add(stripeTop);

  // ---- Main tower: truncated square pyramid ----
  const TOWER_Y0 = 0.056;
  const TOWER_H = 0.62;
  const HW_BOT = 0.118;
  const HW_TOP = 0.08;
  const tower = new Mesh(
    new CylinderGeometry(HW_TOP * SQ2, HW_BOT * SQ2, TOWER_H, 4, 1),
    stone
  );
  tower.rotation.y = Math.PI / 4;
  tower.position.y = TOWER_Y0 + TOWER_H / 2;
  g.add(tower);
  const towerTop = TOWER_Y0 + TOWER_H; // 0.641

  // face plaques near the top (cardinal medallions)
  const hwAt = (y: number) =>
    HW_BOT + (HW_TOP - HW_BOT) * ((y - TOWER_Y0) / TOWER_H);
  const MED_Y = 0.6;
  const medOff = hwAt(MED_Y) + 0.002;
  const medGeo = new CylinderGeometry(0.021, 0.021, 0.008, 12);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const med = new Mesh(medGeo, trim);
    if (i % 2 === 0) med.rotation.x = Math.PI / 2; // ±z faces
    else med.rotation.z = Math.PI / 2; // ±x faces
    med.position.set(Math.sin(a) * medOff, MED_Y, Math.cos(a) * medOff);
    g.add(med);
  }

  // lighter plaque panels on the lower faces
  const PLQ_Y = 0.34;
  const plqOff = hwAt(PLQ_Y) + 0.002;
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const plq = new Mesh(
      i % 2 === 0
        ? new BoxGeometry(0.072, 0.105, 0.008)
        : new BoxGeometry(0.008, 0.105, 0.072),
      trim
    );
    plq.position.set(Math.sin(a) * plqOff, PLQ_Y, Math.cos(a) * plqOff);
    g.add(plq);
  }

  // ---- Cornice + cap ----
  const cornice = new Mesh(new BoxGeometry(0.19, 0.026, 0.19), stoneDark);
  cornice.position.y = towerTop + 0.013;
  g.add(cornice);
  const cap = new Mesh(new BoxGeometry(0.152, 0.018, 0.152), stone);
  cap.position.y = towerTop + 0.026 + 0.009;
  g.add(cap);
  const capTop = towerTop + 0.044; // 0.685

  // ---- Globe with equatorial band ----
  const pedestal = new Mesh(new CylinderGeometry(0.04, 0.05, 0.022, 10), stoneDark);
  pedestal.position.y = capTop + 0.011;
  g.add(pedestal);
  const GLOBE_R = 0.105;
  const globeY = capTop + 0.022 + GLOBE_R * 0.92;
  const globe = new Mesh(new SphereGeometry(GLOBE_R, 12, 8), globeMat);
  globe.position.y = globeY;
  g.add(globe);
  const eqBand = new Mesh(new TorusGeometry(GLOBE_R * 0.99, 0.007, 6, 20), band);
  eqBand.rotation.x = Math.PI / 2;
  eqBand.position.y = globeY;
  g.add(eqBand);
  const merBand = new Mesh(new TorusGeometry(GLOBE_R * 0.99, 0.006, 6, 20), band);
  merBand.position.y = globeY;
  g.add(merBand);

  // ---- Four corner pylons with medallions, linked by low walls ----
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
    const px = sx * 0.185;
    const pz = sz * 0.185;

    // low wall running along the diagonal from the tower to the pylon
    const wall = new Mesh(new BoxGeometry(0.16, 0.05, 0.045), stoneDark);
    wall.position.set(sx * 0.12, 0.025, sz * 0.12);
    wall.rotation.y = -sx * sz * Math.PI * 0.25;
    g.add(wall);

    // pylon subgroup yawed so its flat face (+z local) points outward
    const pylon = new Group();
    pylon.position.set(px, 0, pz);
    pylon.rotation.y = Math.atan2(px, pz);
    const pad = new Mesh(new BoxGeometry(0.085, 0.02, 0.085), stoneDark);
    pad.position.y = 0.01;
    pylon.add(pad);
    const shaft = new Mesh(
      new CylinderGeometry(0.026 * SQ2, 0.036 * SQ2, 0.15, 4, 1),
      stone
    );
    shaft.rotation.y = Math.PI / 4;
    shaft.position.y = 0.02 + 0.075;
    pylon.add(shaft);
    const pcap = new Mesh(new BoxGeometry(0.062, 0.014, 0.062), stoneDark);
    pcap.position.y = 0.177;
    pylon.add(pcap);

    // medallion disc flush on the outward face
    const disc = new Mesh(new CylinderGeometry(0.018, 0.018, 0.008, 10), band);
    disc.rotation.x = Math.PI / 2;
    disc.position.set(0, 0.13, 0.03);
    pylon.add(disc);
    g.add(pylon);
  }

  return g;
}
