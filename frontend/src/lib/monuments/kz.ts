// Baiterek (Astana) — papercraft: white hyperboloid lattice tower, flared
// feet pinching to a waist then blooming into a chalice of struts that
// cradles the large gold sphere near the top.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
  TorusGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

export function build(): Group {
  const g = new Group();
  const white = mat(TONES.white);
  const trim = mat("#cdd0d6");
  const gold = mat(TONES.gold);

  g.add(plazaDisc(0.32));

  // Low entrance podium
  const podium = new Mesh(new CylinderGeometry(0.105, 0.12, 0.03, 16), trim);
  podium.position.y = 0.015;
  g.add(podium);

  // ---- Lattice struts: base flare -> waist -> chalice flare (cradle) ----
  const TOP_Y = 0.82; // strut tips hug the sphere's equator
  const T_WAIST = 0.55;
  const R_BASE = 0.125;
  const R_WAIST = 0.042;
  const R_TOP = 0.142;
  const rAt = (t: number) =>
    t < T_WAIST
      ? R_WAIST + (R_BASE - R_WAIST) * Math.pow((T_WAIST - t) / T_WAIST, 2.3)
      : R_WAIST +
        (R_TOP - R_WAIST) * Math.pow((t - T_WAIST) / (1 - T_WAIST), 2.4);

  const STRUTS = 8;
  const SEGS = 7;
  for (let s = 0; s < STRUTS; s++) {
    const strut = new Group();
    strut.rotation.y = (s * Math.PI * 2) / STRUTS;
    for (let i = 0; i < SEGS; i++) {
      const t0 = i / SEGS;
      const t1 = (i + 1) / SEGS;
      const rA = rAt(t0);
      const rB = rAt(t1);
      const yA = TOP_Y * t0;
      const yB = TOP_Y * t1;
      const len = Math.hypot(rB - rA, yB - yA) + 0.012;
      const w = 0.02 - 0.006 * ((t0 + t1) / 2);
      const seg = new Mesh(new BoxGeometry(w, len, w), white);
      seg.position.set((rA + rB) / 2, (yA + yB) / 2, 0);
      seg.rotation.z = Math.atan2(-(rB - rA), yB - yA);
      strut.add(seg);
    }
    g.add(strut);
  }

  // ---- Central shaft ----
  const shaft = new Mesh(new CylinderGeometry(0.02, 0.026, 0.72, 10), white);
  shaft.position.y = 0.36;
  g.add(shaft);

  // ---- Horizontal rings tying the lattice together ----
  const rings: number[] = [0.14, T_WAIST, 0.82, 0.96];
  for (const t of rings) {
    const ring = new Mesh(
      new TorusGeometry(rAt(t) + 0.004, 0.0065, 5, 22),
      trim
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = TOP_Y * t;
    g.add(ring);
  }

  // ---- Gold sphere nested in the cradle ----
  const orb = new Mesh(new SphereGeometry(0.13, 16, 12), gold);
  orb.position.y = 0.82;
  g.add(orb);

  return g;
}
