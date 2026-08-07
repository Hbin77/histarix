// Quedas de Kalandula — papercraft: a wide gently-curved cliff carrying a
// stepped white curtain of falling water, dark rock ribs splitting it, low
// spray drifting over the plunge pool and a flat forested plateau on the rim.
// Natural landform: terrain base, no plaza disc.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const D2R = Math.PI / 180;
// The cliff is a shallow arc of a large circle centred behind the monument,
// so the lip reads as a broad crescent rather than a bowl.
const CZ = 0.14; // arc centre, pushed back
const R_IN = 0.41; // lip radius
const R_OUT = 0.45; // cliff outer radius
const R_EDGE = 0.452; // widest point of the flank (footprint 0.74)
const ARC0 = 128 * D2R;
const ARCL = 104 * D2R;
const SEG = 22;

const RIM_Y = 0.52; // plateau surface
const POOL_Y = 0.06; // plunge-pool surface
const LEDGE_Y = 0.24; // shelf where the curtain re-breaks

const ROCK = "#79839a"; // muted slate cliff
const ROCK_DARK = "#646d83"; // shadowed rock ribs and gorge floor
const PLATEAU = "#84996d"; // mossy plateau grass
const TREE = "#5f7a55"; // rim forest
const FOAM = "#f3f1ea"; // falling water
const MIST = "#e9eced"; // spray at the base
const RIVER = "#8ea9bd"; // muted river below the falls

/** Revolved band with a free profile (closed polygon in the XY half-plane). */
function band(pts: Vector2[], m: MeshLambertMaterial, pad = 0): Mesh {
  return new Mesh(
    new LatheGeometry(pts, SEG, ARC0 - pad, ARCL + pad * 2),
    m
  );
}

/** Rectangular-section ring: hollow tube between rIn and rOut, y0 → y1. */
function ring(
  rIn: number,
  rOut: number,
  y0: number,
  y1: number,
  m: MeshLambertMaterial,
  pad = 0
): Mesh {
  return band(
    [
      new Vector2(rOut, y0),
      new Vector2(rOut, y1),
      new Vector2(rIn, y1),
      new Vector2(rIn, y0),
      new Vector2(rOut, y0),
    ],
    m,
    pad
  );
}

/** Place a mesh on the arc at `deg`, facing radially outward (+Z local). */
function atArc(m: Mesh, deg: number, radius: number, y: number): Mesh {
  const a = deg * D2R;
  m.position.set(Math.sin(a) * radius, y, Math.cos(a) * radius);
  m.rotation.y = a;
  return m;
}

export function build(): Group {
  const g = new Group();

  const rock = mat(ROCK);
  const rockDark = mat(ROCK_DARK);
  const foam = mat(FOAM);

  // ---- plunge pool, narrowing into the outflow gorge ----
  const pool = new Mesh(new CylinderGeometry(0.25, 0.25, POOL_Y, 22), mat(RIVER));
  pool.scale.z = 0.82;
  pool.position.set(0, POOL_Y / 2, -0.05);
  g.add(pool);
  const outflow = new Mesh(new BoxGeometry(0.17, POOL_Y, 0.24), mat(RIVER));
  outflow.position.set(0, POOL_Y / 2, 0.12);
  g.add(outflow);

  // low rock apron hugging the pool, so the base doesn't read as a round dish
  for (const [deg, s] of [
    [-88, 0.09],
    [-64, 0.07],
    [-40, 0.06],
    [-16, 0.055],
    [16, 0.055],
    [40, 0.065],
    [64, 0.075],
    [88, 0.085],
  ] as const) {
    const a = deg * D2R;
    const b = new Mesh(new BoxGeometry(s, 0.05, s * 0.85), rockDark);
    b.position.set(Math.sin(a) * 0.235, 0.025, -0.05 + Math.cos(a) * 0.2);
    b.rotation.y = a * 0.6;
    g.add(b);
  }

  // Everything from here on belongs to the arc, whose centre sits at z = CZ.
  const cliff = new Group();
  cliff.position.z = CZ;
  g.add(cliff);

  // ---- cliff: inner face, sloping vegetated flank, capped arc ends ----
  cliff.add(ring(R_IN, R_OUT, 0, RIM_Y, rock));
  cliff.add(
    band(
      [
        new Vector2(R_EDGE, 0),
        new Vector2(0.446, 0.24),
        new Vector2(0.438, RIM_Y),
        new Vector2(0.432, RIM_Y),
        new Vector2(0.432, 0),
        new Vector2(R_EDGE, 0),
      ],
      mat(TONES.forest),
      3 * D2R
    )
  );
  for (const deg of [128, 232])
    cliff.add(
      atArc(
        new Mesh(new BoxGeometry(0.02, RIM_Y, R_OUT - R_IN + 0.02), rock),
        deg,
        (R_IN + R_OUT) / 2,
        RIM_Y / 2
      )
    );

  // ---- plateau: flat grassy shelf overhanging the lip ----
  cliff.add(
    ring(R_IN - 0.015, R_EDGE - 0.004, RIM_Y, RIM_Y + 0.032, mat(PLATEAU), 3 * D2R)
  );

  // ---- the falls: one broad sheet of full-height drops, a few of them
  //      re-breaking onto a lower step. [centre°, width°, stepped] ----
  const curtains: Array<[number, number, boolean]> = [
    [133, 7, false],
    [146, 17, true],
    [160, 9, false],
    [172, 12, true],
    [185, 8, false],
    [197, 15, true],
    [211, 10, false],
    [225, 13, true],
  ];
  const TOP = RIM_Y + 0.016;
  for (const [deg, wdeg, stepped] of curtains) {
    const w = R_IN * wdeg * D2R;
    cliff.add(
      atArc(
        new Mesh(new BoxGeometry(w, TOP - POOL_Y, 0.05), foam),
        deg,
        R_IN - 0.026,
        POOL_Y + (TOP - POOL_Y) / 2
      )
    );
    if (!stepped) continue;
    const hLow = LEDGE_Y + 0.02 - POOL_Y;
    cliff.add(
      atArc(
        new Mesh(new BoxGeometry(w * 0.72, hLow, 0.048), foam),
        deg,
        R_IN - 0.072,
        POOL_Y + hLow / 2
      )
    );
    // splash where the sheet hits the step
    const a = deg * D2R;
    const splash = new Mesh(new SphereGeometry(0.034, 6, 4), mat(MIST));
    splash.scale.set(1.7, 0.5, 0.8);
    splash.position.set(
      Math.sin(a) * (R_IN - 0.046),
      LEDGE_Y + 0.016,
      Math.cos(a) * (R_IN - 0.046)
    );
    cliff.add(splash);
  }
  // a few bare rock ribs splitting the sheet
  for (const deg of [140, 166, 191, 217])
    cliff.add(
      atArc(
        new Mesh(new BoxGeometry(0.017, RIM_Y - 0.06, 0.058), rockDark),
        deg,
        R_IN - 0.028,
        0.06 + (RIM_Y - 0.06) / 2
      )
    );
  // sheet of water tipping over the crest
  cliff.add(ring(R_IN - 0.058, R_IN + 0.01, RIM_Y - 0.03, RIM_Y + 0.026, foam));

  // ---- spray: a continuous low bank hugging the foot of the falls ----
  const mist = mat(MIST);
  for (let i = 0; i < 15; i++) {
    const deg = 131 + (i * 98) / 14;
    const a = deg * D2R;
    const r = 0.318 + 0.022 * Math.sin(i * 2.1);
    const s = 0.052 + 0.014 * Math.sin(i * 1.3 + 0.7);
    const puff = new Mesh(new SphereGeometry(s, 6, 4), mist);
    puff.scale.set(1.5, 0.5, 1.1);
    puff.position.set(
      Math.sin(a) * r,
      0.058 + 0.018 * Math.sin(i * 1.7),
      Math.cos(a) * r
    );
    cliff.add(puff);
  }

  // ---- forest clumps on the plateau rim ----
  const tree = mat(TREE);
  for (const [deg, r, s] of [
    [131, 0.424, 0.03],
    [145, 0.429, 0.024],
    [160, 0.421, 0.032],
    [178, 0.431, 0.027],
    [196, 0.422, 0.03],
    [214, 0.429, 0.025],
    [229, 0.423, 0.029],
  ] as const) {
    const a = deg * D2R;
    const clump = new Mesh(new SphereGeometry(s, 6, 4), tree);
    clump.scale.y = 0.8;
    clump.position.set(Math.sin(a) * r, RIM_Y + 0.036 + s * 0.5, Math.cos(a) * r);
    cliff.add(clump);
  }

  return g;
}
