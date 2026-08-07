// Tazumal (Chalchuapa) — papercraft: broad low Mesoamerican stepped pyramid,
// six battered tiers each capped by a darker cornice, with one wide frontal
// staircase and flanking alfarda ramps climbing to a flat summit platform.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;
const TIER = "#cdc5b2"; // muted gray-tan volcanic stone
const CORNICE = "#a89d86";
const TREAD = "#d6cebb";
const RISER = "#b3a992";

/** Battered tier: rectangular frustum, base half-extents (hx, hz), top = t x. */
function tier(hx: number, hz: number, h: number, t: number, color: string): Mesh {
  const geo = new CylinderGeometry(t * SQ2, SQ2, 1, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, 0.5, 0);
  const m = new Mesh(geo, mat(color));
  m.scale.set(hx, h, hz);
  return m;
}

/** Extrude a (z, y) side profile across the stair width, centred on x = 0. */
function acrossX(shape: Shape, width: number, color: string): Mesh {
  const geo = new ExtrudeGeometry(shape, { depth: width, bevelEnabled: false });
  geo.rotateY(-Math.PI / 2); // local +x -> world +z, local +z -> world -x
  geo.translate(width / 2, 0, 0);
  return new Mesh(geo, mat(color));
}

// Tier stack: base half-extents, height, taper.
const TIERS: Array<[number, number, number, number]> = [
  [0.275, 0.215, 0.063, 0.945],
  [0.244, 0.186, 0.062, 0.94],
  [0.213, 0.158, 0.06, 0.935],
  [0.182, 0.129, 0.058, 0.93],
  [0.151, 0.101, 0.055, 0.925],
  [0.12, 0.076, 0.048, 0.92],
];

const SUMMIT_Y = 0.36; // top of the summit platform slab
const Z_FOOT = 0.345; // stair toe, on the plaza
const Z_HEAD = 0.082; // stair head, at the summit platform edge
const STEPS = 9;
const STAIR_HW = 0.078;
const ALFARDA_W = 0.03;

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.372));

  // ---- stepped mound: tier body + proud cornice band at every level ----
  let y = 0;
  for (const [hx, hz, h, t] of TIERS) {
    const body = tier(hx, hz, h, t, TIER);
    body.position.y = y;
    g.add(body);

    const cornice = new Mesh(
      new BoxGeometry((hx * t + 0.01) * 2, 0.013, (hz * t + 0.01) * 2),
      mat(CORNICE)
    );
    cornice.position.y = y + h - 0.006;
    g.add(cornice);
    y += h;
  }

  // flat summit platform
  const summit = new Mesh(new BoxGeometry(0.252, 0.016, 0.164), mat(TREAD));
  summit.position.y = y + 0.008;
  g.add(summit);

  // ---- wide frontal staircase (solid stepped mass) ----
  const stair = new Shape();
  stair.moveTo(Z_FOOT, 0);
  for (let i = 0; i < STEPS; i++) {
    const z0 = Z_FOOT + ((Z_HEAD - Z_FOOT) * i) / STEPS;
    const z1 = Z_FOOT + ((Z_HEAD - Z_FOOT) * (i + 1)) / STEPS;
    const yTop = (SUMMIT_Y * (i + 1)) / STEPS;
    stair.lineTo(z0, yTop); // riser
    stair.lineTo(z1, yTop); // tread
  }
  stair.lineTo(Z_HEAD, 0);
  stair.closePath();
  g.add(acrossX(stair, STAIR_HW * 2, TREAD));

  // darker nosing on each riser so the flight reads as steps head-on
  for (let i = 0; i < STEPS; i++) {
    const z0 = Z_FOOT + ((Z_HEAD - Z_FOOT) * i) / STEPS;
    const yTop = (SUMMIT_Y * (i + 1)) / STEPS;
    const nose = new Mesh(
      new BoxGeometry(STAIR_HW * 2, SUMMIT_Y / STEPS - 0.008, 0.008),
      mat(RISER)
    );
    nose.position.set(0, yTop - (SUMMIT_Y / STEPS - 0.008) / 2, z0 + 0.002);
    g.add(nose);
  }

  // ---- alfardas: solid sloping ramps flanking the stair ----
  const ramp = new Shape();
  ramp.moveTo(Z_FOOT + 0.012, 0);
  ramp.lineTo(Z_FOOT + 0.012, 0.014);
  ramp.lineTo(Z_HEAD, SUMMIT_Y + 0.014);
  ramp.lineTo(Z_HEAD, 0);
  ramp.closePath();
  for (const sx of [1, -1]) {
    const a = acrossX(ramp, ALFARDA_W, CORNICE);
    a.position.x = sx * (STAIR_HW + ALFARDA_W / 2);
    g.add(a);
  }

  // ---- low altar block on the plaza in front of the stair ----
  const altar = new Mesh(new BoxGeometry(0.15, 0.026, 0.06), mat(CORNICE));
  altar.position.set(0, 0.013, 0.31);
  g.add(altar);

  // ---- weathered stone stubs scattered on the plaza edge ----
  const stub = (x: number, z: number, s: number, ry: number) => {
    const m = new Mesh(new BoxGeometry(s, s * 0.55, s * 0.8), mat(CORNICE));
    m.position.set(x, s * 0.275, z);
    m.rotation.y = ry;
    g.add(m);
  };
  stub(-0.27, 0.22, 0.05, 0.4);
  stub(0.28, 0.19, 0.043, -0.6);
  stub(-0.31, 0.07, 0.038, 1.0);
  stub(0.32, 0.04, 0.045, 0.2);

  return g;
}
