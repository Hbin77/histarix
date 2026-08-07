// Lac Assal (Djibouti) — papercraft: a pale turquoise lake sunk in a rift pan,
// rimmed by a brilliant white salt crust studded with salt mounds, and backed
// by low rolling chocolate-brown volcanic hills.
// Natural landform: no plaza disc, the terrain drum is its own base.

import {
  ConeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
  Vector2,
} from "three";
import { mat } from "./materials";

const D2R = Math.PI / 180;

const GROUND = "#7a5b45"; // chocolate-brown rift floor
const HILL = "#654a38"; // darker volcanic hills
const SALT = "#f4f1e9"; // brilliant salt crust
const LAKE = "#93cdc6"; // pale turquoise brine
const LAKE_DEEP = "#78b4b1";

/** Terrain: outer drum, plateau, then down into the pan holding the lake. */
const TERRAIN: Array<[number, number]> = [
  [0.375, 0.0],
  [0.372, 0.03],
  [0.366, 0.068],
  [0.32, 0.072],
  [0.282, 0.066],
  [0.25, 0.052],
  [0.23, 0.042],
  [0.19, 0.036],
  [0.0, 0.034],
];

/** Hollow annular slab (rectangular cross-section revolved around Y). */
function ring(
  rIn: number,
  rOut: number,
  y0: number,
  y1: number,
  m: MeshLambertMaterial,
  seg: number
): Mesh {
  const pts = [
    new Vector2(rOut, y0),
    new Vector2(rOut, y1),
    new Vector2(rIn, y1),
    new Vector2(rIn, y0),
    new Vector2(rOut, y0),
  ];
  return new Mesh(new LatheGeometry(pts, seg), m);
}

/** Wobble every vertex sitting on one edge of a lathe so the shoreline and the
 *  salt margin read as natural. Integer harmonics keep the seam closed. */
function wobble(mesh: Mesh, targetR: number, amp: number, phase: number): void {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (Math.abs(r - targetR) > 1e-4) continue;
    const a = Math.atan2(z, x);
    const nr =
      r +
      amp *
        (Math.sin(2 * a + phase) +
          0.6 * Math.sin(3 * a + phase * 1.9) +
          0.35 * Math.sin(5 * a + phase * 3.1));
    pos.setXYZ(i, (x / r) * nr, pos.getY(i), (z / r) * nr);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

export function build(): Group {
  const g = new Group();
  const salt = mat(SALT);

  // ---- rift floor with the pan sunk into it ----
  g.add(
    new Mesh(
      new LatheGeometry(
        TERRAIN.map(([r, y]) => new Vector2(r, y)),
        30
      ),
      mat(GROUND)
    )
  );

  // ---- salt crust ringing the pan, ragged on both margins ----
  const crust = ring(0.15, 0.242, 0.03, 0.046, salt, 26);
  wobble(crust, 0.242, 0.022, 0.9);
  wobble(crust, 0.15, 0.016, 2.6);
  g.add(crust);

  // ---- the brine itself, lapping irregularly against the crust ----
  const lake = new Mesh(
    new LatheGeometry(
      [new Vector2(0.166, 0.028), new Vector2(0.166, 0.043), new Vector2(0, 0.043)],
      26
    ),
    mat(LAKE)
  );
  wobble(lake, 0.166, 0.02, 2.1);
  g.add(lake);
  const deep = new Mesh(
    new LatheGeometry(
      [new Vector2(0.092, 0.042), new Vector2(0.092, 0.046), new Vector2(0, 0.046)],
      18
    ),
    mat(LAKE_DEEP)
  );
  wobble(deep, 0.092, 0.016, 4.3);
  g.add(deep);

  // ---- rolling volcanic hills banked around the back of the pan ----
  const hillMat = mat(HILL);
  const bank = (
    a: number,
    radius: number,
    r: number,
    sy: number,
    y = 0.05
  ) => {
    const hill = new Mesh(new SphereGeometry(r, 8, 4), hillMat);
    hill.position.set(Math.sin(a) * radius, y, Math.cos(a) * radius);
    hill.rotation.y = a;
    hill.scale.set(1.4, sy, 0.55); // ridge-shaped, not domed
    g.add(hill);
  };
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const bell = Math.sin(Math.PI * t); // highest directly behind the lake
    bank(
      (80 + t * 200) * D2R,
      0.298 + 0.016 * Math.sin(5 * t + 0.6),
      0.1 + 0.03 * bell + 0.01 * Math.sin(7 * t + 1.2),
      0.85 + 1.45 * bell
    );
  }
  // foothills stepping down to the shore in front of the range
  for (const [deg, r] of [
    [112, 0.078],
    [156, 0.07],
    [202, 0.082],
    [248, 0.072],
  ] as const)
    bank(deg * D2R, 0.258, r, 1.05, 0.042);

  // ---- salt mounds standing on the crust ----
  for (let i = 0; i < 11; i++) {
    const a = ((i * 360) / 11 + 17) * D2R;
    const radius = 0.19 + 0.032 * Math.sin(3 * a + 1.7);
    const r = 0.013 + 0.008 * Math.sin(5 * a + 0.5);
    const h = 0.022 + 0.014 * Math.sin(2 * a + 2.4);
    const mound = new Mesh(new ConeGeometry(r, h, 6), salt);
    mound.position.set(Math.sin(a) * radius, 0.044 + h / 2, Math.cos(a) * radius);
    g.add(mound);
  }

  return g;
}
