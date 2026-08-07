// Pitch Lake (La Brea) — stylized papercraft landform: a flat charcoal disc
// of asphalt raked by wrinkled tar swirls and dotted with pale grey water
// pools, ringed by a low band of muted green scrub and a few slender palms.
// Natural landform: its own terrain apron, no plaza disc.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  TorusGeometry,
} from "three";
import { mat, TONES } from "./materials";

const TAR = "#403e3a";
const TAR_L = "#514e48";
const TAR_D = "#332f2c";
const POOL = "#9db0ba";
const SCRUB = "#7c9169";
const SCRUB_D = "#6a7f5a";
const TRUNK = "#8a7a63";
const FROND = "#6f8a5f";

const LAKE_R = 0.245;
const SURF = 0.058; // asphalt surface height

/** Slender palm: leaning trunk under a crown of drooping fronds. */
function palm(h: number, lean: number, spin: number): Group {
  const g = new Group();
  g.rotation.set(0, spin, lean);

  const trunk = new Mesh(new CylinderGeometry(0.009, 0.016, h, 6), mat(TRUNK));
  trunk.position.y = h / 2;
  g.add(trunk);

  const crown = new Group();
  crown.position.y = h;
  g.add(crown);
  const leaf = mat(FROND);
  for (let i = 0; i < 8; i++) {
    const arm = new Group();
    arm.rotation.y = (i * Math.PI) / 4 + spin * 0.3;
    const f = new Mesh(new BoxGeometry(0.024, 0.008, 0.078), leaf);
    f.position.set(0, -0.015, 0.042);
    f.rotation.x = 0.46; // fronds droop away from the crown
    arm.add(f);
    crown.add(arm);
  }
  const nut = new Mesh(new ConeGeometry(0.021, 0.03, 6), mat(SCRUB_D));
  nut.position.y = 0.008;
  crown.add(nut);
  return g;
}

export function build(): Group {
  const g = new Group();

  // ---- scrubby ground apron, then the green shore band on top of it ----
  const apron = new Mesh(new CylinderGeometry(0.37, 0.37, 0.03, 30), mat(SCRUB_D));
  apron.position.y = 0.015;
  g.add(apron);
  const scrub = new Mesh(new CylinderGeometry(0.358, 0.366, 0.026, 28), mat(SCRUB));
  scrub.position.y = 0.03;
  g.add(scrub);

  // ---- the asphalt lake: a flat charcoal disc filling the middle,
  //      its surface sitting just above the surrounding scrub ----
  const lake = new Mesh(
    new CylinderGeometry(LAKE_R, LAKE_R + 0.012, SURF, 28),
    mat(TAR)
  );
  lake.position.y = SURF / 2;
  g.add(lake);

  // ---- wrinkled tar swirls creeping across the surface ----
  const swirlL = mat(TAR_L);
  const swirlD = mat(TAR_D);
  const swirls: Array<[number, number, number, number, number, boolean]> = [
    // radius, arc length, arc start, centre x, centre z, light?
    [0.175, 4.4, 0.4, 0.018, 0.01, true],
    [0.128, 3.6, 2.3, -0.026, 0.035, false],
    [0.205, 2.2, 3.4, 0.0, -0.018, false],
    [0.084, 4.8, 1.1, 0.052, -0.044, true],
    [0.154, 2.6, 5.0, -0.044, -0.026, true],
    [0.101, 3.2, 4.1, -0.07, 0.052, false],
    [0.213, 1.8, 0.9, 0.009, 0.018, true],
  ];
  for (const [r, len, start, cx, cz, light] of swirls) {
    const t = new Mesh(
      new TorusGeometry(r, 0.011, 4, 14, len),
      light ? swirlL : swirlD
    );
    t.rotation.x = Math.PI / 2;
    t.rotation.z = -start;
    t.position.set(cx, SURF - 0.002, cz);
    g.add(t);
  }

  // ---- pale grey rainwater pools sitting in the pitch ----
  const poolMat: MeshLambertMaterial = mat(POOL);
  const pools: Array<[number, number, number, number, number]> = [
    // x, z, radius, z-squash, rotation
    [-0.088, 0.1, 0.076, 0.56, 0.4],
    [0.123, -0.048, 0.062, 0.62, 1.2],
    [0.048, 0.154, 0.044, 0.68, 2.0],
    [-0.154, -0.079, 0.05, 0.58, 0.8],
    [0.176, 0.106, 0.036, 0.72, 1.7],
  ];
  for (const [x, z, r, sz, ry] of pools) {
    const p = new Mesh(new CylinderGeometry(r, r, 0.008, 12), poolMat);
    p.position.set(x, SURF + 0.002, z);
    p.rotation.y = ry;
    p.scale.z = sz;
    g.add(p);
  }

  // ---- scrub tufts along the shoreline ----
  const tuftGeo = new ConeGeometry(0.026, 0.042, 6);
  const tuftMat = mat(SCRUB);
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI * 2) / 10 + 0.35;
    const r = 0.312 + (i % 3) * 0.014;
    const t = new Mesh(tuftGeo, tuftMat);
    t.position.set(Math.sin(a) * r, 0.05, Math.cos(a) * r);
    g.add(t);
  }

  // ---- a few slender palms breaking the flat skyline ----
  const palms: Array<[number, number, number, number]> = [
    // azimuth, radius, height, lean
    [0.55, 0.272, 0.29, -0.09],
    [2.15, 0.278, 0.24, 0.1],
    [3.5, 0.266, 0.31, -0.07],
    [4.85, 0.275, 0.26, 0.09],
    [5.75, 0.262, 0.22, -0.11],
  ];
  for (const [a, r, h, lean] of palms) {
    const p = palm(h, lean, a);
    p.position.set(Math.sin(a) * r, 0.05, Math.cos(a) * r);
    g.add(p);
  }

  // a couple of boulders of hardened pitch shouldering out of the lake edge
  for (const [x, z, s, ry] of [
    [-0.19, 0.13, 0.05, 0.6],
    [0.168, -0.152, 0.042, 1.4],
  ] as const) {
    const b = new Mesh(new BoxGeometry(s, s * 0.6, s), mat(TONES.slate));
    b.position.set(x, SURF + s * 0.2, z);
    b.rotation.set(0.1, ry, 0.08);
    g.add(b);
  }

  return g;
}
