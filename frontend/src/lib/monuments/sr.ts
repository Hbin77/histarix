// Saint Peter and Paul Cathedral (Paramaribo) — papercraft: symmetrical
// all-timber basilica. Yellow clapboard walls under grey trim, a peaked
// facade with a round window over an arcaded porch, flanked by two slender
// square towers carrying tall pointed grey spires.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
  TorusGeometry,
} from "three";
import { mat, plazaDisc } from "./materials";

const YEL = "#d6bd7a"; // sunlit clapboard
const YEL_D = "#bda263"; // shaded clapboard
const GREY = "#8d9096"; // painted trim, cornices
const GREY_D = "#767a81"; // roof slopes, spires
const DARK = "#4a5160"; // window and louvre openings
const PALE = "#e6e0d2"; // window sashes, tracery

const SQ2 = Math.SQRT2;
const D45 = Math.PI / 4;

const NAVE_HW = 0.115; // nave half-width
const WALL_H = 0.3; // eaves height
const FRONT = 0.07; // facade plane

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

/** Triangular prism: ridge runs along Z, base at y = 0 of the mesh. */
function gablePrism(halfW: number, len: number, h: number, color: string): Mesh {
  const s = new Shape();
  s.moveTo(-halfW, 0);
  s.lineTo(halfW, 0);
  s.lineTo(0, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: len, bevelEnabled: false });
  geo.translate(0, 0, -len / 2);
  return new Mesh(geo, mat(color));
}

/** Dark opening with a round head — used for porch arches and nave windows. */
function archOpening(hw: number, h: number, thick: number, color: string): Group {
  const g = new Group();
  g.add(box(hw * 2, h, thick, 0, h / 2, 0, color));
  const head = new Mesh(
    new CylinderGeometry(hw, hw, thick, 12, 1, false, Math.PI / 2, Math.PI),
    mat(color)
  );
  head.rotation.set(Math.PI / 2, 0, 0);
  head.position.y = h;
  g.add(head);
  return g;
}

/** One flanking tower: clapboard shaft, trim bands, belfry louvres,
 *  cornice and a tall pointed spire. */
function tower(hw: number, shaftH: number, spireH: number): Group {
  const g = new Group();
  g.add(box(hw * 2.16, 0.022, hw * 2.16, 0, 0.011, 0, GREY_D));
  g.add(box(hw * 2, shaftH, hw * 2, 0, shaftH / 2, 0, YEL));

  // grey corner pilasters give the shaft its timber-frame read
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      g.add(box(0.018, shaftH, 0.018, sx * hw, shaftH / 2, sz * hw, GREY));
    }
  // horizontal storey bands
  for (const y of [shaftH * 0.34, shaftH * 0.63]) {
    g.add(box(hw * 2.1, 0.014, hw * 2.1, 0, y, 0, GREY));
  }
  // belfry louvres on every face, just under the cornice
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const l = archOpening(hw * 0.36, hw * 0.72, 0.016, DARK);
    l.position.set(Math.sin(a) * hw, shaftH * 0.76, Math.cos(a) * hw);
    l.rotation.y = a;
    g.add(l);
  }

  // cornice, then the spire
  g.add(box(hw * 2.34, 0.02, hw * 2.34, 0, shaftH + 0.01, 0, GREY));
  const spire = new Mesh(new ConeGeometry(hw * 1.06 * SQ2, spireH, 4), mat(GREY_D));
  spire.rotation.y = D45;
  spire.position.y = shaftH + 0.02 + spireH / 2;
  g.add(spire);
  // finial cross
  const tip = shaftH + 0.02 + spireH;
  g.add(box(0.006, 0.034, 0.006, 0, tip + 0.017, 0, GREY));
  g.add(box(0.02, 0.006, 0.006, 0, tip + 0.024, 0, GREY));
  return g;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.35));

  // ---- plinth and nave ----
  g.add(box(0.26, 0.028, 0.37, 0, 0.014, -0.105, GREY_D));
  g.add(box(NAVE_HW * 2, WALL_H, 0.35, 0, 0.028 + WALL_H / 2, -0.105, YEL));

  // clapboard courses suggested by shallow trim bands
  for (const y of [0.115, 0.2]) {
    g.add(box(NAVE_HW * 2.05, 0.01, 0.35, 0, y, -0.105, YEL_D));
  }
  // corner and bay pilasters
  for (const sx of [1, -1])
    for (const z of [-0.275, -0.185, -0.095, -0.005]) {
      g.add(box(0.014, WALL_H, 0.016, sx * NAVE_HW, 0.028 + WALL_H / 2, z, GREY));
    }
  // nave windows down both flanks
  for (const sx of [1, -1])
    for (const z of [-0.232, -0.142, -0.052]) {
      const w = archOpening(0.021, 0.09, 0.014, DARK);
      w.position.set(sx * NAVE_HW, 0.11, z);
      w.rotation.y = (sx * Math.PI) / 2;
      g.add(w);
    }

  // ---- roof: grey gable running the length of the nave ----
  const eave = 0.028 + WALL_H;
  g.add(box(0.252, 0.016, 0.362, 0, eave + 0.008, -0.105, GREY));
  const roof = gablePrism(0.128, 0.362, 0.108, GREY_D);
  roof.position.set(0, eave + 0.016, -0.105);
  g.add(roof);

  // ---- facade: peaked gable end with its round window ----
  const face = gablePrism(0.128, 0.026, 0.108, YEL);
  face.position.set(0, eave + 0.016, FRONT + 0.012);
  g.add(face);
  // raking grey barge-boards along the gable slopes
  for (const sx of [1, -1]) {
    const rake = new Mesh(new BoxGeometry(0.176, 0.014, 0.03), mat(GREY));
    rake.position.set(sx * 0.064, eave + 0.07, FRONT + 0.014);
    rake.rotation.z = sx * -0.702; // matches the 0.108 / 0.128 pitch
    g.add(rake);
  }

  // round window, centred high on the facade wall
  const rose = new Mesh(new CylinderGeometry(0.038, 0.038, 0.012, 16), mat(DARK));
  rose.rotation.x = Math.PI / 2;
  rose.position.set(0, 0.238, FRONT + 0.012);
  g.add(rose);
  const ring = new Mesh(new TorusGeometry(0.041, 0.008, 4, 18), mat(PALE));
  ring.position.set(0, 0.238, FRONT + 0.012);
  g.add(ring);
  // spokes of tracery
  for (let i = 0; i < 4; i++) {
    const spoke = new Mesh(new BoxGeometry(0.072, 0.007, 0.008), mat(PALE));
    spoke.rotation.z = (i * Math.PI) / 4;
    spoke.position.set(0, 0.238, FRONT + 0.016);
    g.add(spoke);
  }
  // small vent in the gable peak
  g.add(box(0.03, 0.026, 0.01, 0, eave + 0.052, FRONT + 0.018, DARK));

  // ---- arcaded porch across the base of the facade ----
  g.add(box(0.244, 0.018, 0.05, 0, 0.037, FRONT + 0.022, GREY_D));
  for (const x of [-0.072, 0, 0.072]) {
    const a = archOpening(0.027, 0.072, 0.016, DARK);
    a.position.set(x, 0.046, FRONT + 0.014);
    g.add(a);
  }
  for (const x of [-0.113, -0.036, 0.036, 0.113]) {
    g.add(box(0.018, 0.13, 0.026, x, 0.111, FRONT + 0.02, GREY));
  }
  g.add(box(0.25, 0.016, 0.038, 0, 0.184, FRONT + 0.018, GREY));

  // ---- the two flanking towers ----
  for (const sx of [1, -1]) {
    const t = tower(0.052, 0.6, 0.29);
    t.position.set(sx * 0.148, 0.0, FRONT - 0.008);
    g.add(t);
  }

  return g;
}
