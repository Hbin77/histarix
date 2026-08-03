// Taj Mahal — papercraft miniature. White marble mausoleum on a chamfered
// octagonal plan: central onion dome on a drum, four corner chhatris, four
// detached minarets on the plinth corners, arched iwan portals, and a short
// char-bagh reflecting channel with cypresses out front.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const MARBLE = TONES.white;
const SHADOW = "#b9af9e"; // recessed arch panels (muted warm gray)
const CREAM = "#e7e1d4"; // pishtaq frames, a hair off the marble

/** Square with chamfered corners (Taj plan): half-extent `half`, cut `cham`. */
function octShape(half: number, cham: number): Shape {
  const f = half - cham;
  const s = new Shape();
  s.moveTo(-f, half);
  s.lineTo(f, half);
  s.lineTo(half, f);
  s.lineTo(half, -f);
  s.lineTo(f, -half);
  s.lineTo(-f, -half);
  s.lineTo(-half, -f);
  s.lineTo(-half, f);
  s.closePath();
  return s;
}

/** Extruded chamfered-square slab standing on baseY. */
function octSlab(half: number, cham: number, h: number, baseY: number, color: string): Mesh {
  const geo = new ExtrudeGeometry(octShape(half, cham), {
    depth: h,
    bevelEnabled: false,
  });
  geo.rotateX(-Math.PI / 2);
  const m = new Mesh(geo, mat(color));
  m.position.y = baseY;
  return m;
}

function box(
  w: number, h: number, d: number,
  x: number, y: number, z: number,
  color: string
): Mesh {
  const m = new Mesh(new BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z);
  return m;
}

/** Flat semicircular arch cap, arc up, front cap facing +z. */
function archCap(r: number, thick: number, color: string): Mesh {
  const geo = new CylinderGeometry(r, r, thick, 8, 1, false, 0, Math.PI);
  geo.rotateX(Math.PI / 2);
  geo.rotateZ(Math.PI / 2);
  return new Mesh(geo, mat(color));
}

/** Onion dome (lathe): neck radius rNeck, bulge rMax, total height h.
 *  `coarse` uses a 4-span profile for the small satellite domes. */
function onionDome(
  rNeck: number,
  rMax: number,
  h: number,
  seg: number,
  color: string,
  coarse = false
): Mesh {
  const pts = coarse
    ? [
        new Vector2(rNeck, 0),
        new Vector2(rMax, h * 0.32),
        new Vector2(rMax * 0.62, h * 0.72),
        new Vector2(rMax * 0.24, h * 0.92),
        new Vector2(0, h),
      ]
    : [
        new Vector2(rNeck, 0),
        new Vector2(rMax * 0.9, h * 0.12),
        new Vector2(rMax, h * 0.3),
        new Vector2(rMax * 0.97, h * 0.47),
        new Vector2(rMax * 0.84, h * 0.63),
        new Vector2(rMax * 0.6, h * 0.78),
        new Vector2(rMax * 0.35, h * 0.89),
        new Vector2(rMax * 0.15, h * 0.96),
        new Vector2(0, h),
      ];
  return new Mesh(new LatheGeometry(pts, seg), mat(color));
}

/** Small rooftop chhatri kiosk: open drum, eave disc, onion cap, tip. */
function chhatri(x: number, baseY: number, z: number): Group {
  const c = new Group();
  c.position.set(x, baseY, z);
  const drum = new Mesh(new CylinderGeometry(0.023, 0.026, 0.032, 6), mat(SHADOW));
  drum.position.y = 0.016;
  c.add(drum);
  const eave = new Mesh(new CylinderGeometry(0.034, 0.034, 0.007, 6), mat(MARBLE));
  eave.position.y = 0.0355;
  c.add(eave);
  const cap = onionDome(0.02, 0.03, 0.05, 8, MARBLE, true);
  cap.position.y = 0.039;
  c.add(cap);
  const tip = new Mesh(new ConeGeometry(0.004, 0.016, 5), mat(TONES.gold));
  tip.position.y = 0.094;
  c.add(tip);
  return c;
}

/** Detached minaret: tapered shaft, three balcony discs, domed cupola. */
function minaret(x: number, baseY: number, z: number): Group {
  const m = new Group();
  m.position.set(x, baseY, z);
  const foot = new Mesh(new CylinderGeometry(0.026, 0.03, 0.014, 8), mat(MARBLE));
  foot.position.y = 0.007;
  m.add(foot);
  const shaft = new Mesh(new CylinderGeometry(0.013, 0.021, 0.27, 8), mat(MARBLE));
  shaft.position.y = 0.149;
  m.add(shaft);
  for (const [y, r] of [
    [0.104, 0.028],
    [0.194, 0.025],
    [0.284, 0.022],
  ] as const) {
    const ring = new Mesh(new CylinderGeometry(r, r, 0.008, 6), mat(CREAM));
    ring.position.y = y;
    m.add(ring);
  }
  const cupDrum = new Mesh(new CylinderGeometry(0.014, 0.014, 0.018, 6), mat(SHADOW));
  cupDrum.position.y = 0.297;
  m.add(cupDrum);
  const cupEave = new Mesh(new CylinderGeometry(0.021, 0.021, 0.006, 6), mat(MARBLE));
  cupEave.position.y = 0.308;
  m.add(cupEave);
  const cap = onionDome(0.013, 0.019, 0.034, 7, MARBLE, true);
  cap.position.y = 0.311;
  m.add(cap);
  return m;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  // ---- red sandstone terrace + white marble plinth ----
  g.add(box(0.5, 0.022, 0.5, 0, 0.011, 0, TONES.brick));
  g.add(box(0.44, 0.048, 0.44, 0, 0.046, 0, MARBLE));

  const PLINTH_TOP = 0.07;

  // ---- mausoleum body: chamfered square, pishtaq portal on each face ----
  const BODY_H = 0.19;
  g.add(octSlab(0.14, 0.055, BODY_H, PLINTH_TOP, MARBLE));

  for (let i = 0; i < 4; i++) {
    const face = new Group();
    face.rotation.y = (i * Math.PI) / 2;
    g.add(face);

    // projecting pishtaq frame, rising just past the parapet
    const frame = box(0.124, 0.215, 0.02, 0, PLINTH_TOP + 0.1075, 0.135, CREAM);
    face.add(frame);
    // recessed iwan: dark panel + semicircular arch head
    const panel = box(0.068, 0.128, 0.008, 0, PLINTH_TOP + 0.07, 0.146, SHADOW);
    face.add(panel);
    const arch = archCap(0.034, 0.008, SHADOW);
    arch.position.set(0, PLINTH_TOP + 0.134, 0.146);
    face.add(arch);

    // two-storey niches on both chamfer faces (45° corner planes)
    for (const s of [1, -1]) {
      const ng = new Group();
      ng.position.set(s * 0.1125, 0, 0.1125);
      ng.rotation.y = s * -Math.PI / 4;
      for (const ny of [0.055, 0.135]) {
        ng.add(box(0.042, 0.06, 0.008, 0, PLINTH_TOP + ny, 0.0475, SHADOW));
      }
      face.add(ng);
    }
  }

  // ---- parapet cornice ----
  const ROOF_Y = PLINTH_TOP + BODY_H; // 0.265
  g.add(octSlab(0.148, 0.058, 0.014, ROOF_Y, MARBLE));
  const ROOF_TOP = ROOF_Y + 0.014; // 0.279

  // ---- central drum + great onion dome + gold finial ----
  const drum = new Mesh(new CylinderGeometry(0.073, 0.077, 0.068, 12), mat(MARBLE));
  drum.position.y = ROOF_TOP + 0.034;
  g.add(drum);
  const dome = onionDome(0.073, 0.108, 0.215, 12, MARBLE);
  dome.position.y = ROOF_TOP + 0.068;
  g.add(dome);
  const mast = new Mesh(new CylinderGeometry(0.004, 0.006, 0.042, 6), mat(TONES.gold));
  mast.position.y = ROOF_TOP + 0.294;
  g.add(mast);
  const orb = new Mesh(new SphereGeometry(0.009, 6, 4), mat(TONES.gold));
  orb.position.y = ROOF_TOP + 0.318;
  g.add(orb);

  // ---- four rooftop chhatris around the dome ----
  for (const sx of [1, -1])
    for (const sz of [1, -1]) g.add(chhatri(sx * 0.099, ROOF_TOP, sz * 0.099));

  // ---- four detached minarets at the plinth corners ----
  for (const sx of [1, -1])
    for (const sz of [1, -1]) g.add(minaret(sx * 0.193, PLINTH_TOP, sz * 0.193));

  // ---- char-bagh forecourt: reflecting channel + cypress rows (+z) ----
  g.add(box(0.068, 0.008, 0.115, 0, 0.012, 0.3075, TONES.stone));
  g.add(box(0.046, 0.007, 0.105, 0, 0.0175, 0.3075, TONES.water));
  for (const s of [1, -1])
    for (const z of [0.275, 0.315]) {
      const tree = new Mesh(new ConeGeometry(0.012, 0.05, 7), mat(TONES.forest));
      tree.position.set(s * 0.052, 0.037, z);
      g.add(tree);
    }

  return g;
}
