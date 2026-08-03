// Cristo Redentor — papercraft: pale soapstone Christ with wide outstretched
// arms (T-silhouette) on a dark pedestal, atop the green Corcovado peak with
// a gray granite cliff crown and viewing terrace. Landform base: no plaza.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

// Mountain profile table: [y, radius]
const PROFILE: Array<[number, number]> = [
  [0, 0.27],
  [0.05, 0.26],
  [0.11, 0.243],
  [0.17, 0.218],
  [0.23, 0.185],
  [0.29, 0.148],
  [0.34, 0.118],
  [0.375, 0.1],
  [0.4, 0.092],
];

function lathePts(rows: Array<[number, number]>, offset: number): Vector2[] {
  return rows.map(([y, r]) => new Vector2(r + offset, y));
}

export function build(): Group {
  const g = new Group();
  const soap = mat("#dcd8c9"); // pale soapstone
  const green = mat(TONES.forest);
  const rock = mat("#a3a49a"); // warm granite gray
  const dark = mat(TONES.ironDark);

  // ---- Corcovado: green body with a one-sided granite cliff scar ----
  const bodyPts = lathePts(PROFILE, 0);
  bodyPts.push(new Vector2(0.0001, 0.402));
  g.add(new Mesh(new LatheGeometry(bodyPts, 22), green));

  // Bare rock face on the front flank only (partial lathe shell), top edge
  // tucked under the terrace slab.
  const cliffRows = PROFILE.filter(([y]) => y >= 0.23);
  const cliffPts = lathePts(cliffRows, 0.006);
  g.add(new Mesh(new LatheGeometry(cliffPts, 9, -1.0, 2.0), rock));

  // Small forested side mounds around the foot
  const moundGeo = new CylinderGeometry(0.02, 0.08, 0.1, 8);
  for (const [x, z, s] of [
    [0.2, 0.12, 1],
    [-0.18, 0.15, 0.85],
    [-0.04, -0.22, 0.9],
  ] as const) {
    const m = new Mesh(moundGeo, green);
    m.scale.setScalar(s);
    m.position.set(x, 0.05 * s, z);
    g.add(m);
  }

  // ---- Viewing terrace on the summit ----
  const terraceLow = new Mesh(
    new CylinderGeometry(0.112, 0.116, 0.012, 20),
    mat(TONES.plaza)
  );
  terraceLow.position.y = 0.398;
  g.add(terraceLow);
  const terrace = new Mesh(
    new CylinderGeometry(0.088, 0.092, 0.016, 20),
    mat(TONES.stone)
  );
  terrace.position.y = 0.412;
  g.add(terrace);

  // ---- Pedestal (dark stone) ----
  const pedBase = new Mesh(new BoxGeometry(0.105, 0.024, 0.105), dark);
  pedBase.position.y = 0.432;
  g.add(pedBase);
  const pedestal = new Mesh(new BoxGeometry(0.078, 0.08, 0.078), dark);
  pedestal.position.y = 0.482;
  g.add(pedestal);

  // ---- Robe: 8-sided frustum, flares at the hem ----
  const robe = new Mesh(new CylinderGeometry(0.048, 0.075, 0.32, 8), soap);
  robe.position.y = 0.682;
  g.add(robe);

  // ---- Chest / shoulders ----
  const chest = new Mesh(new BoxGeometry(0.115, 0.052, 0.062), soap);
  chest.position.y = 0.858;
  g.add(chest);

  // ---- Arms: near-horizontal T, slight droop, hands at the tips ----
  const armGeo = new BoxGeometry(0.185, 0.03, 0.044);
  const handGeo = new BoxGeometry(0.03, 0.022, 0.038);
  for (const s of [1, -1] as const) {
    const arm = new Mesh(armGeo, soap);
    arm.position.set(s * 0.125, 0.868, 0);
    arm.rotation.z = -s * 0.06;
    g.add(arm);
    const hand = new Mesh(handGeo, soap);
    hand.position.set(s * 0.229, 0.86, 0);
    g.add(hand);
    // Sleeve drape: wide shallow cloth wedge tucked under the arm
    const drape = new Mesh(new CylinderGeometry(0.036, 0.008, 0.05, 4), soap);
    drape.scale.z = 0.42;
    drape.position.set(s * 0.092, 0.836, 0);
    g.add(drape);
  }

  // ---- Head: slightly bowed forward, small neck below ----
  const neck = new Mesh(new CylinderGeometry(0.016, 0.02, 0.03, 8), soap);
  neck.position.y = 0.892;
  g.add(neck);
  const head = new Mesh(new SphereGeometry(0.033, 8, 6), soap);
  head.position.set(0, 0.917, 0.007);
  head.rotation.x = 0.25;
  g.add(head);

  return g;
}
