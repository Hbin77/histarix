// Kasubi Tombs (Muzibu Azaala Mpanga) — papercraft: one enormous dome-conical
// thatched roof sweeping almost to the ground, built from stacked overlapping
// straw rings, with the pole-fronted entrance porch and a low reed fence on
// reddish beaten earth.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Vector2,
} from "three";
import { mat, plazaDisc } from "./materials";

const H = 0.53; // apex height
const R = 0.305; // roof radius at the ground
const SEG = 20; // radial facets
const STRAW = "#cdae80";
const STRAW_D = "#b2925e";
const EARTH = "#b07f5e";
const POLE = "#6a5541";

/** Roof silhouette: broad shoulders rolling over into a rounded apex. */
function roofR(t: number): number {
  const s = Math.min(Math.max(t, 0), 1);
  return R * Math.pow(Math.cos((s * Math.PI) / 2), 0.8);
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.375));

  // ---- beaten reddish earth courtyard ----
  const earth = new Mesh(new CylinderGeometry(0.36, 0.36, 0.022, 30), mat(EARTH));
  earth.position.y = 0.011;
  g.add(earth);
  const path = new Mesh(new BoxGeometry(0.075, 0.008, 0.13), mat("#c6ac8d"));
  path.position.set(0, 0.026, 0.31);
  g.add(path);

  // ---- the great thatched roof: overlapping straw rings ----
  const ts = [0, 0.11, 0.22, 0.33, 0.44, 0.55, 0.66, 0.76, 0.85, 0.93];
  for (let i = 0; i < ts.length - 1; i++) {
    const t0 = ts[i];
    const t1 = ts[i + 1];
    const ring = new Mesh(
      new CylinderGeometry(
        roofR(t1),
        roofR(t0) + 0.006, // each layer overhangs the one below
        (t1 - t0) * H + 0.004,
        SEG,
        1,
        true
      ),
      mat(i % 2 ? STRAW_D : STRAW)
    );
    ring.position.y = ((t0 + t1) / 2) * H + (i === 0 ? 0.002 : 0);
    g.add(ring);
  }
  const apex = new Mesh(
    new ConeGeometry(roofR(0.93) + 0.008, (1 - 0.93) * H + 0.01, SEG),
    mat(STRAW_D)
  );
  apex.position.y = 0.93 * H + ((1 - 0.93) * H) / 2;
  g.add(apex);

  // finial spike
  const finial = new Mesh(new CylinderGeometry(0.005, 0.007, 0.055, 6), mat(POLE));
  finial.position.y = H + 0.025;
  g.add(finial);

  // ---- entrance porch: a dark opening cut into the thatch, hooded above
  //      and screened by a row of vertical poles ----
  const DOOR_H = 0.21;
  const HALF_A = 0.46; // half angular width of the porch
  const notch = new Mesh(
    new CylinderGeometry(
      roofR(DOOR_H / H) + 0.004,
      roofR(0) + 0.004,
      DOOR_H,
      14,
      1,
      true,
      -HALF_A,
      HALF_A * 2
    ),
    mat("#54432f")
  );
  notch.position.y = DOOR_H / 2;
  g.add(notch);

  const hood = new Mesh(
    new CylinderGeometry(
      roofR((DOOR_H + 0.05) / H) + 0.014,
      roofR(DOOR_H / H) + 0.017,
      0.05,
      14,
      1,
      true,
      -HALF_A - 0.05,
      (HALF_A + 0.05) * 2
    ),
    mat(STRAW_D)
  );
  hood.position.y = DOOR_H + 0.025;
  g.add(hood);

  const poleGeo = new CylinderGeometry(0.0085, 0.0095, DOOR_H - 0.02, 6);
  const poleMat = mat(POLE);
  for (let i = 0; i < 9; i++) {
    const a = -0.36 + (i * 0.72) / 8;
    const p = new Mesh(poleGeo, poleMat);
    p.position.set(Math.sin(a) * 0.298, (DOOR_H - 0.02) / 2 + 0.008, Math.cos(a) * 0.298);
    g.add(p);
  }

  // ---- low reed fence ringing the courtyard, open at the front ----
  const fencePts = [
    new Vector2(0.355, 0),
    new Vector2(0.355, 0.058),
    new Vector2(0.344, 0.058),
    new Vector2(0.344, 0),
    new Vector2(0.355, 0),
  ];
  const fence = new Mesh(
    new LatheGeometry(fencePts, 20, (42 * Math.PI) / 180, (276 * Math.PI) / 180),
    mat("#a89372")
  );
  g.add(fence);
  const rail = new Mesh(
    new LatheGeometry(
      [
        new Vector2(0.359, 0.058),
        new Vector2(0.359, 0.07),
        new Vector2(0.34, 0.07),
        new Vector2(0.34, 0.058),
        new Vector2(0.359, 0.058),
      ],
      20,
      (42 * Math.PI) / 180,
      (276 * Math.PI) / 180
    ),
    mat("#8d7959")
  );
  g.add(rail);

  return g;
}
