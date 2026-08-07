// Citadelle Laferrière — papercraft: the charcoal fortress riding a green
// peak, its ship-prow bastion driving forward like a hull, battered wall
// courses pierced by gun ports, and the tall round bastion astern.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  SphereGeometry,
  Vector2,
} from "three";
import { mat } from "./materials";

const STONE = "#63666c"; // charcoal masonry
const STONE_DK = "#53565c";
const STONE_LT = "#767a83";
const PORT = "#32353b"; // gun port
const ROCK = "#7b7468"; // bare summit rock
const GRASS = "#6f8a5f"; // moss-green mountain
const GRASS_DK = "#5c7550";
const SCRUB = "#54704a";

const Y0 = 0.295; // fortress springs from the summit
const TOP = 0.55; // main rampart top
const COURSES = 4;
const BATTER = 0.115; // total inward taper of the walls

/** Ship-shaped fortress plan (x, z): prow forward at +Z, rounded stern aft. */
const PLAN: Array<[number, number]> = [
  [0, 0.24],
  [0.072, 0.115],
  [0.128, -0.005],
  [0.148, -0.09],
  [0.112, -0.158],
  [0, -0.182],
  [-0.112, -0.158],
  [-0.148, -0.09],
  [-0.128, -0.005],
  [-0.072, 0.115],
];

const sAt = (y: number) => 1 - BATTER * ((y - Y0) / (TOP - Y0));

/** Extrude an XZ polygon between y0 and y1. */
function prism(
  pts: Array<[number, number]>,
  y0: number,
  y1: number,
  color: string
): Mesh {
  const s = new Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: y1 - y0, bevelEnabled: false });
  geo.rotateX(Math.PI / 2);
  geo.translate(0, y1, 0);
  return new Mesh(geo, mat(color));
}

function course(scale: number, y0: number, y1: number, color: string): Mesh {
  return prism(
    PLAN.map(([x, z]) => [x * scale, z * scale] as [number, number]),
    y0,
    y1,
    color
  );
}

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

  // ---- the green peak (natural landform: its own terrain, no plaza) ----
  const profile: Array<[number, number]> = [
    [0.345, 0],
    [0.326, 0.06],
    [0.302, 0.125],
    [0.281, 0.19],
    [0.264, 0.25],
    [0.254, 0.29],
    [0.249, 0.306],
    [0.0001, 0.312],
  ];
  g.add(
    new Mesh(
      new LatheGeometry(profile.map(([r, y]) => new Vector2(r, y)), 24),
      mat(GRASS)
    )
  );
  // darker grassy apron around the foot
  g.add(
    new Mesh(
      new LatheGeometry(
        [
          [0.357, 0],
          [0.337, 0.055],
          [0.313, 0.105],
        ].map(([r, y]) => new Vector2(r, y)),
        24
      ),
      mat(GRASS_DK)
    )
  );

  // scrub clumps and rock outcrops scattered down the slope
  for (let i = 0; i < 9; i++) {
    const a = i * 0.698 + 0.4;
    const t = 0.22 + ((i * 7) % 5) * 0.13;
    const r = 0.352 - 0.108 * t;
    const y = 0.312 * t;
    const s = 0.035 + ((i * 3) % 4) * 0.008;
    const b = new Mesh(new SphereGeometry(s, 6, 4), mat(SCRUB));
    b.position.set(Math.cos(a) * r, y + s * 0.35, Math.sin(a) * r);
    b.scale.y = 0.7;
    g.add(b);
  }
  for (const [deg, t, s] of [
    [40, 0.55, 0.05],
    [150, 0.72, 0.042],
    [255, 0.6, 0.046],
    [325, 0.8, 0.038],
  ] as const) {
    const a = (deg * Math.PI) / 180;
    const r = 0.352 - 0.108 * t;
    const rk = box(s, s * 0.7, s, Math.cos(a) * r, 0.312 * t, Math.sin(a) * r, ROCK);
    rk.rotation.y = a;
    g.add(rk);
  }

  // asymmetric grassy shoulder so the peak is not a perfect dome
  const spur = new Mesh(new SphereGeometry(0.17, 8, 5), mat(GRASS_DK));
  spur.position.set(0.175, 0.072, 0.145);
  spur.scale.set(1, 0.42, 0.85);
  g.add(spur);

  // ---- rubble collar bedding the fortress into the summit ----
  g.add(
    prism(
      PLAN.map(([x, z]) => [x * 1.1, z * 1.1] as [number, number]),
      0.255,
      0.308,
      ROCK
    )
  );

  // ---- battered rampart courses ----
  const step = (TOP - Y0) / COURSES;
  for (let i = 0; i < COURSES; i++) {
    const y = Y0 + i * step;
    g.add(course(sAt(y), y, y + step + 0.002, i % 2 ? STONE : STONE_DK));
  }
  // cornice + recessed roof terrace
  g.add(course(sAt(TOP) + 0.02, TOP, TOP + 0.026, STONE_LT));
  g.add(course(sAt(TOP) - 0.05, TOP + 0.02, TOP + 0.04, STONE_DK));

  // ---- gun ports along the starboard and port faces ----
  const edges: Array<[number, number]> = [
    [0, 1],
    [1, 2],
    [2, 3],
  ];
  for (const [i0, i1] of edges) {
    const p0 = PLAN[i0];
    const p1 = PLAN[i1];
    const dx = p1[0] - p0[0];
    const dz = p1[1] - p0[1];
    const len = Math.hypot(dx, dz);
    const nx = -dz / len;
    const nz = dx / len;
    for (const t of [0.34, 0.72]) {
      for (const y of [0.375, 0.485]) {
        const s = sAt(y);
        const px = (p0[0] + dx * t) * s;
        const pz = (p0[1] + dz * t) * s;
        for (const sx of [1, -1]) {
          const m = box(0.028, 0.02, 0.01, sx * px + nx * 0.004 * sx, y, pz + nz * 0.004, PORT);
          m.rotation.y = Math.atan2(sx * nx, nz);
          g.add(m);
        }
      }
    }
  }

  // ---- the prow: a sharp wedge bastion driving forward, rising above the
  //      ramparts so the hull silhouette reads as a ship's bow ----
  const prow = (k: number): Array<[number, number]> => [
    [0, 0.252 * k],
    [0.108 * k, 0.03 * k],
    [-0.108 * k, 0.03 * k],
  ];
  g.add(prism(prow(1.0), Y0 - 0.02, 0.42, STONE));
  g.add(prism(prow(0.955), 0.42, 0.585, STONE_DK));
  g.add(prism(prow(0.99), 0.585, 0.612, STONE_LT));

  // ---- tall round bastion astern ----
  const bastion = new Mesh(
    new CylinderGeometry(0.086, 0.099, 0.42, 14),
    mat(STONE)
  );
  bastion.position.set(0.04, 0.5, -0.052);
  g.add(bastion);
  const bCap = new Mesh(new CylinderGeometry(0.098, 0.098, 0.026, 14), mat(STONE_LT));
  bCap.position.set(0.04, 0.723, -0.052);
  g.add(bCap);
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 + 0.3;
    const m = box(0.024, 0.018, 0.01, 0.04 + Math.sin(a) * 0.088, 0.61, -0.052 + Math.cos(a) * 0.088, PORT);
    m.rotation.y = a;
    g.add(m);
  }

  // ---- squat flanking battery to port ----
  g.add(box(0.09, 0.225, 0.11, -0.138, 0.4, -0.07, STONE_DK));
  g.add(box(0.104, 0.022, 0.124, -0.138, 0.523, -0.07, STONE_LT));
  g.add(box(0.024, 0.018, 0.01, -0.186, 0.455, -0.07, PORT));

  return g;
}
