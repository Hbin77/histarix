// Panama Canal locks — papercraft: twin parallel lock chambers with stepped
// water levels, miter gates, a container ship transiting, gantry light towers
// on the walls and the white control building on the center wall.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
  TorusGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  const concrete = mat("#c9c2b2");
  const concreteDark = mat(TONES.stoneDark);
  const water = mat(TONES.water);
  const steel = mat(TONES.ink);
  const slate = mat(TONES.slate);
  const white = mat(TONES.white);
  const roof = mat(TONES.woodRed);
  const forest = mat(TONES.forest);

  // ---- Layout constants (canal runs along X, low Pacific side at -X) ----
  const WALL_H = 0.09; // wall top at y=0.10
  const WALL_TOP = 0.01 + WALL_H;
  const CHAMBERS: Array<[number, number]> = [
    [-0.095, -0.02], // far chamber (zMin, zMax)
    [0.02, 0.095], // near chamber
  ];

  // ---- Three long lock walls (outer, center, outer) ----
  for (const zc of [-0.115, 0, 0.115]) {
    const wall = new Mesh(new BoxGeometry(0.59, WALL_H, 0.04), concrete);
    wall.position.set(0, 0.01 + WALL_H / 2, zc);
    g.add(wall);
    // light coping strip on top (papercraft layering)
    const cap = new Mesh(new BoxGeometry(0.59, 0.008, 0.046), concreteDark);
    cap.position.set(0, WALL_TOP + 0.004, zc);
    g.add(cap);
  }

  // ---- Stepped water: low reach (-x) and high reach (+x) ----
  for (const [zMin, zMax] of CHAMBERS) {
    const zc = (zMin + zMax) / 2;
    const w = zMax - zMin;
    const low = new Mesh(new BoxGeometry(0.261, 0.028, w), water);
    low.position.set(-0.1625, 0.048 - 0.014, zc);
    g.add(low);
    const high = new Mesh(new BoxGeometry(0.287, 0.05, w), water);
    high.position.set(0.1495, 0.078 - 0.025, zc);
    g.add(high);
  }
  // Approach water opening out at both ends
  const lowApproach = new Mesh(new BoxGeometry(0.055, 0.028, 0.22), water);
  lowApproach.position.set(-0.3225, 0.048 - 0.014, 0);
  g.add(lowApproach);
  const highApproach = new Mesh(new BoxGeometry(0.055, 0.05, 0.22), water);
  highApproach.position.set(0.3225, 0.078 - 0.025, 0);
  g.add(highApproach);

  // ---- Jungle banks flanking the locks ----
  for (const s of [-1, 1]) {
    const bank = new Mesh(new BoxGeometry(0.4, 0.03, 0.055), forest);
    bank.position.set(0, 0.027, s * 0.165);
    g.add(bank);
  }

  // ---- Miter gates: paired leaves in a V pointing to the high side ----
  const addMiterGate = (xGate: number, zMin: number, zMax: number) => {
    const zc = (zMin + zMax) / 2;
    const apexX = xGate + 0.024;
    for (const hingeZ of [zMin, zMax]) {
      const dx = apexX - xGate;
      const dz = zc - hingeZ;
      const len = Math.hypot(dx, dz) + 0.006;
      const leaf = new Mesh(new BoxGeometry(0.012, 0.088, len), steel);
      leaf.position.set((xGate + apexX) / 2, 0.062, (hingeZ + zc) / 2);
      leaf.rotation.y = Math.atan2(dx, dz);
      g.add(leaf);
    }
  };
  for (const [zMin, zMax] of CHAMBERS) {
    addMiterGate(-0.28, zMin, zMax); // low entrance
    addMiterGate(-0.02, zMin, zMax); // mid step
    addMiterGate(0.28, zMin, zMax); // high entrance
  }
  // Gate machinery housings on the walls beside each gate
  for (const xGate of [-0.28, -0.02, 0.28]) {
    for (const zc of [-0.115, 0.115]) {
      const hut = new Mesh(new BoxGeometry(0.026, 0.02, 0.026), concreteDark);
      hut.position.set(xGate, WALL_TOP + 0.018, zc);
      g.add(hut);
    }
  }

  // ---- Container ship transiting the near chamber (high reach) ----
  const ship = new Group();
  ship.position.set(0.155, 0, 0.0575);
  const DECK = 0.125; // Panamax hulls loom over the low lock walls
  const hullShape = new Shape();
  hullShape.moveTo(-0.1, -0.03);
  hullShape.lineTo(0.055, -0.03);
  hullShape.lineTo(0.102, 0);
  hullShape.lineTo(0.055, 0.03);
  hullShape.lineTo(-0.1, 0.03);
  hullShape.closePath();
  const hull = new Mesh(
    new ExtrudeGeometry(hullShape, { depth: 0.04, bevelEnabled: false }),
    mat(TONES.woodRed)
  );
  hull.rotation.x = -Math.PI / 2; // extrude rises +y: hull 0.085 → deck 0.125
  hull.position.y = DECK - 0.04;
  ship.add(hull);
  // Containers: four bays, two rows, mixed muted colors
  const boxTones = [TONES.roofTeal, TONES.sandDark, TONES.slate, TONES.domeBlue];
  let tone = 0;
  for (const [bi, bx] of [-0.048, -0.016, 0.016, 0.048].entries()) {
    for (const bz of [-0.0135, 0.0135]) {
      const stack = bi === 1 || bi === 2 ? 2 : 1;
      for (let i = 0; i < stack; i++) {
        const c = new Mesh(
          new BoxGeometry(0.028, 0.016, 0.024),
          mat(boxTones[tone++ % boxTones.length])
        );
        c.position.set(bx, DECK + 0.008 + i * 0.016, bz);
        ship.add(c);
      }
    }
  }
  // Superstructure at the stern
  const castle = new Mesh(new BoxGeometry(0.028, 0.048, 0.046), white);
  castle.position.set(-0.075, DECK + 0.024, 0);
  ship.add(castle);
  const bridgeWin = new Mesh(new BoxGeometry(0.03, 0.009, 0.042), steel);
  bridgeWin.position.set(-0.075, DECK + 0.041, 0);
  ship.add(bridgeWin);
  g.add(ship);

  // ---- Gantry towers on the outer walls: two legs + beam, machinery box ----
  const addGantry = (x: number, z: number) => {
    for (const s of [-1, 1]) {
      const leg = new Mesh(new BoxGeometry(0.02, 0.19, 0.02), slate);
      leg.position.set(x + s * 0.036, WALL_TOP + 0.095, z);
      g.add(leg);
    }
    const beam = new Mesh(new BoxGeometry(0.1, 0.016, 0.024), slate);
    beam.position.set(x, WALL_TOP + 0.194, z);
    g.add(beam);
    const house = new Mesh(new BoxGeometry(0.03, 0.022, 0.026), steel);
    house.position.set(x, WALL_TOP + 0.213, z);
    g.add(house);
  };
  for (const z of [-0.115, 0.115]) {
    addGantry(-0.2, z);
    addGantry(0.15, z);
  }

  // ---- Bridge of the Americas: steel arch over the Pacific approach ----
  const arch = new Mesh(
    new TorusGeometry(0.155, 0.009, 6, 18, Math.PI),
    slate
  );
  arch.rotation.y = Math.PI / 2; // arc spans across the canal (z axis)
  arch.position.set(-0.32, 0.022, 0);
  g.add(arch);
  const deck = new Mesh(new BoxGeometry(0.018, 0.009, 0.335), slate);
  deck.position.set(-0.32, 0.082, 0);
  g.add(deck);
  for (const hz of [-0.075, 0, 0.075]) {
    const top = 0.022 + Math.sqrt(0.155 * 0.155 - hz * hz);
    const hanger = new Mesh(
      new BoxGeometry(0.005, top - 0.082, 0.005),
      slate
    );
    hanger.position.set(-0.32, (top + 0.082) / 2, hz);
    g.add(hanger);
  }
  for (const s of [-1, 1]) {
    const pier = new Mesh(new BoxGeometry(0.024, 0.08, 0.022), concreteDark);
    pier.position.set(-0.32, 0.04, s * 0.162);
    g.add(pier);
  }

  // ---- Control building on the center wall (white, red hip roof) ----
  const CB_X = -0.07; // beside the mid-step gates, like Miraflores
  const base = new Mesh(new BoxGeometry(0.09, 0.045, 0.038), white);
  base.position.set(CB_X, WALL_TOP + 0.0225, 0);
  g.add(base);
  const upper = new Mesh(new BoxGeometry(0.07, 0.03, 0.032), white);
  upper.position.set(CB_X, WALL_TOP + 0.06, 0);
  g.add(upper);
  const hip = new Mesh(new CylinderGeometry(0.004, 0.055, 0.022, 4), roof);
  hip.rotation.y = Math.PI / 4;
  hip.scale.z = 0.45;
  hip.position.set(CB_X, WALL_TOP + 0.086, 0);
  g.add(hip);
  for (const s of [-1, 1]) {
    const win = new Mesh(new BoxGeometry(0.072, 0.012, 0.002), steel);
    win.position.set(CB_X, WALL_TOP + 0.026, s * 0.0195);
    g.add(win);
  }

  return g;
}
