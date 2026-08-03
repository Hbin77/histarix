// Brandenburger Tor — papercraft miniature. Six Doric columns (two rows)
// framing five pass-through openings, Doric entablature with triglyph ticks,
// tall plain attic, verdigris quadriga (4 horses + chariot + Victoria),
// low colonnaded wings flanking each side.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

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
  g.add(plazaDisc(0.37));

  const sand = mat(TONES.sand);
  const green = mat(TONES.verdigris);

  // ---- stepped stylobate ----
  g.add(box(0.48, 0.016, 0.19, 0, 0.008, 0, TONES.sandDark));
  g.add(box(0.44, 0.022, 0.16, 0, 0.027, 0, TONES.sand));

  // ---- five passages: darker piers between the column pairs ----
  // (central passage slightly wider than the side ones, as on the real gate)
  const COL_X = [-0.195, -0.121, -0.047, 0.047, 0.121, 0.195];
  const COL_H = 0.24;
  const COL_Y = 0.038 + COL_H / 2; // 0.158
  for (const x of COL_X) {
    g.add(box(0.026, COL_H, 0.082, x, COL_Y, 0, TONES.sandDark));
  }

  // ---- two rows of six Doric columns, slight taper ----
  const colGeo = new CylinderGeometry(0.0135, 0.017, COL_H, 6);
  for (const x of COL_X) {
    for (const z of [0.056, -0.056]) {
      const c = new Mesh(colGeo, sand);
      c.position.set(x, COL_Y, z);
      g.add(c);
      g.add(box(0.03, 0.012, 0.03, x, 0.284, z, TONES.sandDark));
    }
  }

  // ---- entablature: architrave, triglyph frieze, projecting cornice ----
  g.add(box(0.44, 0.026, 0.136, 0, 0.303, 0, TONES.sand));
  g.add(box(0.44, 0.03, 0.136, 0, 0.331, 0, TONES.stone));
  // triglyph ticks over each column and each intercolumn midpoint
  const trigX: number[] = [];
  for (let i = 0; i < COL_X.length; i++) {
    trigX.push(COL_X[i]);
    if (i < COL_X.length - 1) trigX.push((COL_X[i] + COL_X[i + 1]) / 2);
  }
  for (const x of trigX) {
    for (const z of [0.0705, -0.0705]) {
      g.add(box(0.012, 0.022, 0.005, x, 0.331, z, TONES.sandDark));
    }
  }
  g.add(box(0.47, 0.016, 0.156, 0, 0.354, 0, TONES.sandDark));

  // ---- attic: tall plain block with slim relief band ----
  g.add(box(0.415, 0.078, 0.118, 0, 0.401, 0, TONES.sand));
  for (const z of [0.0615, -0.0615]) {
    g.add(box(0.24, 0.02, 0.006, 0, 0.385, z, TONES.stone));
  }
  g.add(box(0.43, 0.012, 0.132, 0, 0.446, 0, TONES.sandDark));

  // ---- quadriga: 4 horses, chariot with wheels, Victoria with standard ----
  // Built in a local group (origin at the attic top) so it can be scaled up
  // to stay readable from the globe's aerial quarter view.
  const quad = new Group();
  quad.position.y = 0.452;
  quad.scale.setScalar(1.32);
  g.add(quad);

  const qbox = (
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number
  ) => {
    const m = new Mesh(new BoxGeometry(w, h, d), green);
    m.position.set(x, y, z);
    quad.add(m);
  };

  const pedestal = box(0.128, 0.01, 0.066, 0, 0.005, 0, TONES.stoneDark);
  quad.add(pedestal);

  for (const x of [-0.048, -0.016, 0.016, 0.048]) {
    // legs (front + back pair), body, arched neck + head
    qbox(0.012, 0.015, 0.008, x, 0.0175, 0.03);
    qbox(0.012, 0.015, 0.008, x, 0.0175, 0.004);
    qbox(0.016, 0.019, 0.042, x, 0.0345, 0.017);
    const neck = new Mesh(new BoxGeometry(0.009, 0.03, 0.011), green);
    neck.position.set(x, 0.053, 0.038);
    neck.rotation.x = -0.35;
    quad.add(neck);
  }

  // chariot body behind the team
  qbox(0.05, 0.022, 0.024, 0, 0.028, -0.028);
  const wheelGeo = new CylinderGeometry(0.014, 0.014, 0.005, 8);
  for (const x of [-0.029, 0.029]) {
    const wheel = new Mesh(wheelGeo, green);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.021, -0.028);
    quad.add(wheel);
  }

  // Victoria: body, head, standard pole with small wreath — kept clearly
  // taller than the horse necks so the figure reads from a distance
  const body = new Mesh(new CylinderGeometry(0.0055, 0.009, 0.042, 6), green);
  body.position.set(0, 0.06, -0.029);
  quad.add(body);
  const head = new Mesh(new SphereGeometry(0.0052, 6, 4), green);
  head.position.set(0, 0.087, -0.029);
  quad.add(head);
  const pole = new Mesh(new CylinderGeometry(0.0018, 0.0018, 0.05, 4), green);
  pole.position.set(0.009, 0.082, -0.023);
  pole.rotation.x = 0.12;
  quad.add(pole);
  const wreath = new Mesh(new SphereGeometry(0.0052, 6, 4), green);
  wreath.position.set(0.009, 0.108, -0.02);
  quad.add(wreath);

  // ---- flanking wings: low colonnaded halls on each side ----
  for (const sx of [1, -1]) {
    const cx = sx * 0.28;
    g.add(box(0.15, 0.018, 0.13, cx, 0.009, 0, TONES.sandDark));
    g.add(box(0.12, 0.125, 0.105, cx, 0.0805, 0, TONES.sandDark));
    // three small columns on the front face
    const wingCol = new CylinderGeometry(0.007, 0.009, 0.1, 6);
    for (const dx of [-0.036, 0, 0.036]) {
      const c = new Mesh(wingCol, sand);
      c.position.set(cx + dx, 0.078, 0.0605);
      g.add(c);
    }
    g.add(box(0.135, 0.014, 0.125, cx, 0.15, 0, TONES.sand));
    g.add(box(0.115, 0.014, 0.1, cx, 0.164, 0, TONES.sandDark));
  }

  return g;
}
