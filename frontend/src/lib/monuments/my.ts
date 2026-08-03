// Petronas Towers — papercraft: twin star-plan towers (two interlocked
// squares per tier), stacked tapering setbacks, crown cones + ball spires,
// skybridge on inverted-V legs, shared podium.

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
  const steel = mat(TONES.white);
  const glass = mat("#c9d2de"); // muted blue-grey glass hint
  const trim = mat("#bcc3cf"); // light silvery trim for ledges/bridge
  const stone = mat(TONES.stone);

  g.add(plazaDisc(0.34));

  // ---- Shared podium (Suria KLCC base) ----
  const podLow = new Mesh(new BoxGeometry(0.46, 0.022, 0.23), mat(TONES.stoneDark));
  podLow.position.y = 0.011;
  g.add(podLow);
  const podHigh = new Mesh(new BoxGeometry(0.38, 0.026, 0.185), stone);
  podHigh.position.y = 0.035;
  g.add(podHigh);

  // ---- One tower: stacked tiers, each = square frustum + rotated square ----
  // [yBottom, height, rBottom, rTop]
  const tiers: Array<[number, number, number, number]> = [
    [0.048, 0.292, 0.079, 0.076],
    [0.34, 0.26, 0.074, 0.071],
    [0.6, 0.1, 0.066, 0.061],
    [0.7, 0.075, 0.055, 0.049],
    [0.775, 0.045, 0.041, 0.035],
  ];

  const buildTower = (): Group => {
    const t = new Group();
    for (const [y, h, rB, rT] of tiers) {
      const a = new Mesh(new CylinderGeometry(rT, rB, h, 4, 1), steel);
      a.rotation.y = Math.PI / 4;
      a.position.y = y + h / 2;
      t.add(a);
      const b = new Mesh(
        new CylinderGeometry(rT * 0.94, rB * 0.94, h - 0.006, 4, 1),
        glass
      );
      b.position.y = y + h / 2;
      t.add(b);
      // setback ledge ring at tier top — subtle silvery, not heavy
      const ring = new Mesh(
        new CylinderGeometry(rT + 0.005, rT + 0.005, 0.008, 8, 1),
        trim
      );
      ring.position.y = y + h;
      t.add(ring);
    }
    // crown cone
    const crown = new Mesh(new ConeGeometry(0.034, 0.04, 8, 1), steel);
    crown.position.y = 0.838;
    t.add(crown);
    // pinnacle mast + ball ring + smaller ball
    const mast = new Mesh(new CylinderGeometry(0.003, 0.006, 0.115, 6, 1), steel);
    mast.position.y = 0.9075;
    t.add(mast);
    const ballLow = new Mesh(new SphereGeometry(0.011, 8, 6), trim);
    ballLow.position.y = 0.878;
    t.add(ballLow);
    const ballHigh = new Mesh(new SphereGeometry(0.007, 8, 6), trim);
    ballHigh.position.y = 0.92;
    t.add(ballHigh);
    return t;
  };

  const towerL = buildTower();
  towerL.position.x = -0.13;
  g.add(towerL);
  const towerR = buildTower();
  towerR.position.x = 0.13;
  g.add(towerR);

  // ---- Skybridge (double-deck) at ~40% height ----
  const deck = new Mesh(new BoxGeometry(0.15, 0.018, 0.034), steel);
  deck.position.y = 0.375;
  g.add(deck);
  const deckLow = new Mesh(new BoxGeometry(0.13, 0.013, 0.028), trim);
  deckLow.position.y = 0.359;
  g.add(deckLow);

  // inverted-V support legs meeting under the bridge center
  const LEG_LEN = Math.hypot(0.055, 0.11) + 0.012;
  const LEG_TILT = Math.atan2(0.055, 0.11);
  for (const s of [1, -1] as const) {
    const leg = new Mesh(new BoxGeometry(0.009, LEG_LEN, 0.014), trim);
    leg.position.set(s * 0.0275, 0.3, 0);
    leg.rotation.z = s * LEG_TILT;
    g.add(leg);
  }

  return g;
}
