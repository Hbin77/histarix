// Grand Ducal Palace, Luxembourg — papercraft: narrow 3-story Flemish
// renaissance facade, central pavilion tower with steep slate pyramid + spire,
// two slender corbelled corner turrets with conical spires.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;

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

/** 4-sided frustum with faces axis-aligned; half-extents rb→rt, base at y=0. */
function pyra(rb: number, rt: number, h: number, color: string): Mesh {
  const geo = new CylinderGeometry(rt * SQ2, rb * SQ2, h, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, h / 2, 0);
  return new Mesh(geo, mat(color));
}

/** Rectangular hip roof: eave half-extents (hx, hz), height h, taper t. */
function hip(hx: number, hz: number, h: number, t: number, color: string): Mesh {
  const geo = new CylinderGeometry(t * SQ2, SQ2, 1, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, 0.5, 0);
  const m = new Mesh(geo, mat(color));
  m.scale.set(hx, h, hz);
  return m;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.34));

  const WIN = TONES.slate;

  // ---- main block: 3-story sandstone facade ----
  g.add(box(0.46, 0.335, 0.2, 0, 0.1675, 0, TONES.stone));

  // string courses between stories + crowning cornice
  g.add(box(0.47, 0.01, 0.21, 0, 0.115, 0, TONES.stoneDark));
  g.add(box(0.47, 0.01, 0.21, 0, 0.225, 0, TONES.stoneDark));
  g.add(box(0.48, 0.014, 0.22, 0, 0.341, 0, TONES.white));

  // ---- windows (slightly proud inset panels) ----
  const stories: Array<[number, number]> = [
    [0.062, 0.06],
    [0.17, 0.062],
    [0.281, 0.052],
  ];
  for (const [wy, wh] of stories) {
    for (const wx of [-0.18, -0.115, 0.115, 0.18]) {
      g.add(box(0.03, wh, 0.012, wx, wy, 0.098, WIN)); // front
      g.add(box(0.03, wh, 0.012, wx, wy, -0.098, WIN)); // rear
    }
    for (const wz of [-0.05, 0.05]) {
      g.add(box(0.012, wh, 0.032, 0.228, wy, wz, WIN)); // right flank
      g.add(box(0.012, wh, 0.032, -0.228, wy, wz, WIN)); // left flank
    }
  }

  // ---- main hipped slate roof + ridge (steep, ridge along the facade) ----
  const roof = hip(0.25, 0.118, 0.108, 0.17, TONES.ink);
  roof.position.y = 0.347;
  g.add(roof);
  g.add(box(0.11, 0.016, 0.028, 0, 0.457, 0, TONES.ink));

  // dormers on the front slope
  for (const dx of [-0.105, -0.16, 0.105, 0.16]) {
    g.add(box(0.026, 0.036, 0.03, dx, 0.378, 0.082, TONES.stone));
    const dr = pyra(0.017, 0.002, 0.026, TONES.ink);
    dr.position.set(dx, 0.396, 0.085);
    g.add(dr);
  }

  // ---- central avant-corps pavilion tower ----
  g.add(box(0.15, 0.48, 0.24, 0, 0.24, 0.005, TONES.stone));
  g.add(box(0.16, 0.01, 0.25, 0, 0.115, 0.005, TONES.stoneDark));
  g.add(box(0.16, 0.01, 0.25, 0, 0.225, 0.005, TONES.stoneDark));
  g.add(box(0.17, 0.013, 0.26, 0, 0.486, 0.005, TONES.white));

  // arched entrance + balcony above
  g.add(box(0.052, 0.09, 0.012, 0, 0.048, 0.122, TONES.ink));
  g.add(box(0.096, 0.012, 0.026, 0, 0.128, 0.132, TONES.stoneDark));
  g.add(box(0.09, 0.022, 0.008, 0, 0.145, 0.142, TONES.white));

  // tower windows above the balcony
  g.add(box(0.05, 0.066, 0.012, 0, 0.185, 0.122, WIN));
  g.add(box(0.05, 0.06, 0.012, 0, 0.3, 0.122, WIN));
  g.add(box(0.044, 0.05, 0.012, 0, 0.415, 0.122, WIN));

  // steep pavilion roof: flared skirt, tall pyramid, spire, tricolor flag
  const skirt = pyra(0.1, 0.056, 0.048, TONES.ink);
  skirt.position.y = 0.492;
  g.add(skirt);
  const peak = pyra(0.056, 0.005, 0.15, TONES.ink);
  peak.position.y = 0.54;
  g.add(peak);
  const mast = new Mesh(new CylinderGeometry(0.004, 0.004, 0.08, 6), mat(TONES.ink));
  mast.position.y = 0.72;
  g.add(mast);
  const orb = new Mesh(new SphereGeometry(0.007, 6, 5), mat(TONES.gold));
  orb.position.y = 0.69;
  g.add(orb);
  g.add(box(0.04, 0.009, 0.004, 0.024, 0.75, 0, "#b0616c"));
  g.add(box(0.04, 0.009, 0.004, 0.024, 0.741, 0, TONES.white));
  g.add(box(0.04, 0.009, 0.004, 0.024, 0.732, 0, "#7fa3c4"));

  // ---- slender corbelled corner turrets with conical spires ----
  for (const sx of [1, -1]) {
    const t = new Group();
    t.position.set(sx * 0.245, 0, 0.108);
    const corbel = new Mesh(new CylinderGeometry(0.027, 0.008, 0.06, 8), mat(TONES.stoneDark));
    corbel.position.y = 0.19;
    t.add(corbel);
    const shaft = new Mesh(new CylinderGeometry(0.027, 0.027, 0.23, 8), mat(TONES.stone));
    shaft.position.y = 0.335;
    t.add(shaft);
    // small turret lights
    t.add(box(0.016, 0.038, 0.01, 0, 0.3, 0.025, WIN));
    t.add(box(0.016, 0.038, 0.01, 0, 0.39, 0.025, WIN));
    const collar = new Mesh(new CylinderGeometry(0.034, 0.034, 0.012, 8), mat(TONES.white));
    collar.position.y = 0.456;
    t.add(collar);
    const spire = new Mesh(new ConeGeometry(0.036, 0.19, 8), mat(TONES.ink));
    spire.position.y = 0.557;
    t.add(spire);
    const tip = new Mesh(new SphereGeometry(0.006, 6, 5), mat(TONES.gold));
    tip.position.y = 0.658;
    t.add(tip);
    g.add(t);
  }

  return g;
}
