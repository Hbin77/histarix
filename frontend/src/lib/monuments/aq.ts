// Mount Erebus — papercraft: broad snow-clad volcanic shield with a shoulder
// break and a steeper summit cone, rising from a flat ice shelf; charcoal rock
// bands on the flanks, dark crater rim, steam plume curling off the summit.
// Landform: ice base, no plaza disc.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const D2R = Math.PI / 180;
const SEG = 24;
const SHELF_R = 0.375;
const SHELF_Y = 0.028; // top of the ice shelf; the cone starts here

const ICE = "#e6ecf3"; // flat glacier plain
const ICE_DEEP = "#dbe3ed"; // crevasses, shadowed apron
const SNOW = TONES.snow; // snow-covered flanks
const ROCK = "#8b93a2"; // rock bands showing through the snow
const ROCK_DARK = "#616878"; // crater rim, exposed ridges
const STEAM = "#eef1f5";

/** Cone silhouette: broad shield, a shoulder near 0.28, steeper summit cone. */
const PROFILE: Array<[number, number]> = [
  [0.282, SHELF_Y],
  [0.272, 0.06],
  [0.258, 0.1],
  [0.238, 0.145],
  [0.212, 0.19],
  [0.185, 0.232],
  [0.162, 0.268],
  [0.148, 0.3],
  [0.132, 0.328],
  [0.112, 0.355],
  [0.088, 0.385],
  [0.066, 0.415],
  [0.052, 0.44],
  [0.044, 0.456],
];

/** Cone radius at height y (linear between profile samples). */
function slopeR(y: number): number {
  if (y <= PROFILE[0][1]) return PROFILE[0][0];
  for (let i = 1; i < PROFILE.length; i++) {
    const [r1, y1] = PROFILE[i];
    if (y <= y1) {
      const [r0, y0] = PROFILE[i - 1];
      return r0 + (r1 - r0) * ((y - y0) / (y1 - y0));
    }
  }
  return PROFILE[PROFILE.length - 1][0];
}

/**
 * A patch lying flush on the cone surface: a lathe arc whose profile tracks
 * the slope between two heights, nudged fractionally clear of the snow.
 */
function flankPatch(
  y0: number,
  y1: number,
  degStart: number,
  degLen: number,
  color: string
): Mesh {
  const pts: Vector2[] = [];
  for (let i = 0; i <= 5; i++) {
    const y = y0 + ((y1 - y0) * i) / 5;
    pts.push(new Vector2(slopeR(y) + 0.0025, y));
  }
  const seg = Math.max(3, Math.round(degLen / 6));
  return new Mesh(
    new LatheGeometry(pts, seg, degStart * D2R, degLen * D2R),
    mat(color)
  );
}

/**
 * Nudge the vertices sitting on one lathe ring in and out radially, so the
 * papercraft edge reads as natural rather than machined. Integer sine
 * frequencies keep the lathe seam continuous.
 */
function wobbleRing(mesh: Mesh, ringY: number, amp: number, phase: number): void {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    if (Math.abs(pos.getY(i) - ringY) > 1e-4) continue;
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const a = Math.atan2(z, x);
    const len = Math.hypot(x, z) || 1;
    const d =
      amp * (Math.sin(3 * a + phase) + 0.6 * Math.sin(5 * a + phase * 2.1));
    pos.setXYZ(i, (x / len) * (len + d), ringY, (z / len) * (len + d));
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

export function build(): Group {
  const g = new Group();

  // ---- flat ice shelf ----
  const shelf = new Mesh(
    new CylinderGeometry(SHELF_R, SHELF_R, SHELF_Y, 32),
    mat(ICE)
  );
  shelf.position.y = SHELF_Y / 2;
  g.add(shelf);

  // crevasse slivers scoring the plain
  const crevasse = mat(ICE_DEEP);
  for (const [deg, r, len, rot] of [
    [12, 0.3, 0.15, 0.6],
    [74, 0.32, 0.11, -0.4],
    [148, 0.295, 0.17, 0.25],
    [212, 0.315, 0.12, -0.7],
    [292, 0.305, 0.14, 0.45],
  ] as const) {
    const a = deg * D2R;
    const c = new Mesh(new BoxGeometry(len, 0.008, 0.016), crevasse);
    c.position.set(Math.sin(a) * r, SHELF_Y - 0.002, Math.cos(a) * r);
    c.rotation.y = a + rot;
    g.add(c);
  }

  // ---- glacier apron blending the cone foot into the shelf ----
  const apron = new Mesh(
    new LatheGeometry(
      [new Vector2(0.318, SHELF_Y), new Vector2(0.278, 0.075)],
      SEG
    ),
    mat(ICE_DEEP)
  );
  g.add(apron);
  wobbleRing(apron, SHELF_Y, 0.013, 0.8);

  // ---- main snow cone ----
  const conePts = PROFILE.map(([r, y]) => new Vector2(r, y));
  conePts.push(new Vector2(0.03, 0.452)); // crater rim, folding inward
  conePts.push(new Vector2(0.024, 0.437)); // crater floor
  conePts.push(new Vector2(0.0001, 0.435));
  const cone = new Mesh(new LatheGeometry(conePts, SEG), mat(SNOW));
  g.add(cone);
  wobbleRing(cone, 0.145, 0.009, 2.2);
  wobbleRing(cone, 0.268, 0.007, 1.1);

  // ---- dark crater rim capping the summit ----
  g.add(
    new Mesh(
      new LatheGeometry(
        [
          new Vector2(0.055, 0.44),
          new Vector2(0.047, 0.458),
          new Vector2(0.03, 0.454),
          new Vector2(0.025, 0.439),
        ],
        SEG
      ),
      mat(ROCK_DARK)
    )
  );

  // ---- thin rock streaks running down the snow flanks ----
  for (const [y0, y1, deg, len] of [
    [0.05, 0.3, 16, 10],
    [0.09, 0.26, 62, 8],
    [0.05, 0.22, 112, 12],
    [0.12, 0.32, 168, 9],
    [0.06, 0.28, 216, 11],
    [0.08, 0.2, 268, 8],
    [0.05, 0.24, 322, 10],
  ] as const)
    g.add(flankPatch(y0, y1, deg, len, ROCK));
  // a few darker scree fans right at the foot
  for (const [y0, y1, deg, len] of [
    [0.03, 0.1, 44, 9],
    [0.03, 0.09, 190, 7],
    [0.03, 0.11, 296, 8],
  ] as const)
    g.add(flankPatch(y0, y1, deg, len, ROCK_DARK));

  // ---- bare rocky outcrops poking through the ice shelf ----
  const outcrop = mat(ROCK_DARK);
  for (const [deg, r, w, h, tilt] of [
    [34, 0.33, 0.075, 0.032, 0.35],
    [128, 0.34, 0.055, 0.024, -0.5],
    [206, 0.318, 0.065, 0.028, 0.2],
    [300, 0.335, 0.06, 0.026, 0.45],
  ] as const) {
    const a = deg * D2R;
    const rock = new Mesh(new CylinderGeometry(0, w, h, 5), outcrop);
    rock.scale.z = 0.55;
    rock.position.set(Math.sin(a) * r, SHELF_Y + h * 0.25, Math.cos(a) * r);
    rock.rotation.set(tilt * 0.35, a + tilt, tilt * 0.45);
    g.add(rock);
  }

  // ---- steam plume curling off the crater ----
  const steam = mat(STEAM);
  const plume: Array<[number, number, number, number]> = [
    [0.0, 0.462, 0.0, 0.032],
    [0.016, 0.487, -0.008, 0.036],
    [0.038, 0.512, 0.014, 0.042],
    [0.058, 0.539, -0.004, 0.046],
    [0.09, 0.562, 0.022, 0.051],
    [0.126, 0.583, 0.008, 0.049],
    [0.162, 0.601, 0.034, 0.043],
    [0.196, 0.615, 0.016, 0.034],
  ];
  plume.forEach(([x, y, z, s], i) => {
    const puff = new Mesh(new SphereGeometry(s, 6, 5), steam);
    puff.scale.set(1.25, 0.8 + 0.12 * Math.sin(i * 2.3), 1.15);
    puff.position.set(x, y, z);
    puff.rotation.set(i * 1.1, i * 0.73, i * 0.41);
    g.add(puff);
  });

  return g;
}
