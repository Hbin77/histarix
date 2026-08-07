// Museum of Islamic Art (Doha) — papercraft: cream limestone cubes stacked and
// spun 45° against each other so their corners ride out over the faces below,
// chamfering into a faceted octagonal head whose front carries the two dark
// slit windows. Stands on a flat pier over pale teal water.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
} from "three";
import { mat } from "./materials";

const CREAM = "#e2d7c0"; // sunlit limestone
const CREAM_D = "#c7b89c"; // shaded faces, step soffits
const CREAM_L = "#efe8d8"; // pier deck, reveals
const SLIT = "#3f4657"; // window voids
const TEAL = "#8fbfbc"; // pale gulf water

const SQ2 = Math.SQRT2;
const D45 = Math.PI / 4;

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

/** Square block, base at y0, spun about its own vertical axis. */
function cube(
  half: number,
  h: number,
  y0: number,
  spin: number,
  m: MeshLambertMaterial
): Mesh {
  const mesh = new Mesh(new BoxGeometry(half * 2, h, half * 2), m);
  mesh.position.y = y0 + h / 2;
  mesh.rotation.y = spin;
  return mesh;
}

/** Octagonal prism (flat facet facing +Z at spin 0), base at y0. */
function octa(
  rBot: number,
  rTop: number,
  h: number,
  y0: number,
  spin: number,
  m: MeshLambertMaterial
): Mesh {
  const mesh = new Mesh(new CylinderGeometry(rTop, rBot, h, 8), m);
  mesh.rotation.y = Math.PI / 8 + spin;
  mesh.position.y = y0 + h / 2;
  return mesh;
}

export function build(): Group {
  const g = new Group();
  const cream = mat(CREAM);
  const creamD = mat(CREAM_D);

  // ---- pale teal water, then the flat pier the museum sits on ----
  const water = new Mesh(new CylinderGeometry(0.355, 0.355, 0.022, 36), mat(TEAL));
  water.position.y = 0.011;
  g.add(water);

  const pier = new Mesh(new CylinderGeometry(0.278, 0.283, 0.026, 24), mat(CREAM_D));
  pier.position.y = 0.035;
  g.add(pier);
  const deck = new Mesh(new CylinderGeometry(0.273, 0.273, 0.008, 24), mat(CREAM_L));
  deck.position.y = 0.052;
  g.add(deck);
  const P = 0.056; // deck level everything stands on

  // causeway running off the front of the pier
  g.add(box(0.085, 0.026, 0.115, 0, 0.043, 0.298, CREAM_D));

  // ---- broad podium terrace ----
  g.add(box(0.44, 0.05, 0.29, 0, P + 0.025, 0, CREAM_D));
  g.add(box(0.426, 0.01, 0.278, 0, P + 0.055, 0, CREAM_L));
  const T = P + 0.06; // terrace top

  // low arcaded east wing
  const wing = new Group();
  wing.position.set(0.255, T - 0.06, 0);
  g.add(wing);
  wing.add(box(0.115, 0.095, 0.205, 0, 0.048, 0, CREAM));
  wing.add(box(0.129, 0.013, 0.219, 0, 0.102, 0, CREAM_D));
  for (const z of [-0.065, 0.0, 0.065]) {
    wing.add(box(0.016, 0.05, 0.032, 0.055, 0.048, z, SLIT));
  }

  // ---- stage A: the big square atrium block ----
  const AH = 0.15;
  g.add(cube(0.158, AH, T, 0, cream));
  // slit windows marching round all four faces of the block
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    for (const t of [-0.104, -0.076, 0.076, 0.104]) {
      const w = new Mesh(new BoxGeometry(0.016, 0.038, 0.014), mat(SLIT));
      w.position.set(
        Math.sin(a) * 0.159 + Math.cos(a) * t,
        T + 0.086,
        Math.cos(a) * 0.159 - Math.sin(a) * t
      );
      w.rotation.y = a;
      g.add(w);
    }
  }
  g.add(box(0.336, 0.014, 0.336, 0, T + AH + 0.007, 0, CREAM_D));

  // ---- stage B: the same cube spun 45°, corners riding over A's faces ----
  const BY = T + AH + 0.014;
  const BH = 0.095;
  g.add(cube(0.108, BH, BY, D45, cream));
  const bCap = new Mesh(new BoxGeometry(0.236, 0.012, 0.236), creamD);
  bCap.rotation.y = D45;
  bCap.position.y = BY + BH + 0.006;
  g.add(bCap);

  // ---- stage C: square again but chamfered — the corners start to fall away ----
  const CY = BY + BH + 0.012;
  const CH = 0.078;
  g.add(octa(0.092, 0.084, CH, CY, D45 / 2, cream));
  g.add(octa(0.09, 0.09, 0.011, CY + CH, D45 / 2, creamD));

  // ---- the veiled head: octagonal lantern with two slit windows ----
  const head = new Group();
  head.position.y = CY + CH + 0.011;
  g.add(head);
  head.add(octa(0.074, 0.069, 0.094, 0, 0, cream));
  head.add(octa(0.078, 0.074, 0.013, 0.094, 0, creamD));
  head.add(octa(0.064, 0.058, 0.02, 0.107, 0, cream));
  for (const x of [-0.023, 0.023]) {
    head.add(box(0.017, 0.044, 0.016, x, 0.05, 0.065, SLIT));
  }

  // ---- entrance: tall recessed arch centred on the atrium block ----
  g.add(box(0.072, 0.076, 0.024, 0, T + 0.038, 0.153, SLIT));
  const arch = new Mesh(
    new CylinderGeometry(0.036, 0.036, 0.024, 14, 1, false, Math.PI / 2, Math.PI),
    mat(SLIT)
  );
  arch.rotation.set(Math.PI / 2, 0, 0);
  arch.position.set(0, T + 0.076, 0.153);
  g.add(arch);
  for (const sx of [1, -1]) {
    g.add(box(0.013, 0.112, 0.016, sx * 0.045, T + 0.056, 0.156, CREAM_L));
  }

  // ---- squat piers marking the terrace edge ----
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const p = new Mesh(
        new CylinderGeometry(0.018 * SQ2, 0.02 * SQ2, 0.044, 4),
        creamD
      );
      p.rotation.y = D45;
      p.position.set(sx * 0.203, P + 0.022, sz * 0.126);
      g.add(p);
    }

  return g;
}
