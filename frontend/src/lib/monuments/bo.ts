// Salar de Uyuni — papercraft: a dead-flat salt crust scored into an irregular
// polygon mosaic by raised white ridges, one cactus-studded rock island, a
// shallow brine sheet reflecting sky, and the brown Andean range far behind.
// Natural landform: salt pan base, no plaza disc.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
} from "three";
import { mat } from "./materials";

const D2R = Math.PI / 180;
const R = 0.375; // pan radius (footprint 0.75)
const SALT_Y = 0.032; // crust surface
const HEX = 0.09; // polygon circumradius

const CRUST = "#eeedea";
const RIDGE = "#fcfbf8";
const BRINE = "#e3eaf1"; // sky reflected in a thin sheet of water
const HILL = "#9a8d7d";
const HILL_DARK = "#877b6c";
const ROCK = "#b8ab98";
const ROCK_DARK = "#9d9080";
const CACTUS = "#7d9068";

/**
 * Displace a lattice point by a hash of its own coordinates, so both polygons
 * sharing an edge agree on where its ends are and the mosaic stays watertight.
 */
function warp(x: number, z: number): [number, number] {
  const kx = Math.round(x * 1000);
  const kz = Math.round(z * 1000);
  return [
    x + 0.016 * Math.sin(kx * 0.0731 + kz * 0.0417),
    z + 0.016 * Math.sin(kx * 0.0523 - kz * 0.0619 + 2.1),
  ];
}

export function build(): Group {
  const g = new Group();

  // ---- the pan itself ----
  const pan = new Mesh(new CylinderGeometry(R, R, SALT_Y, 32), mat(CRUST));
  pan.position.y = SALT_Y / 2;
  g.add(pan);

  // ---- brine sheets lying in shallow depressions ----
  for (const [x, z, rx, rz, rot] of [
    [-0.17, 0.15, 0.19, 0.12, 0.4],
    [0.02, -0.16, 0.15, 0.09, -0.6],
  ] as const) {
    const pool = new Mesh(new CylinderGeometry(1, 1, 0.004, 13), mat(BRINE));
    pool.scale.set(rx, 1, rz);
    pool.position.set(x, SALT_Y, z);
    pool.rotation.y = rot;
    g.add(pool);
  }

  // ---- the polygon mosaic: raised salt ridges between crust plates ----
  const ridgeMat = mat(RIDGE);
  const dx = HEX * Math.sqrt(3);
  const dz = HEX * 1.5;
  for (let j = -3; j <= 3; j++)
    for (let i = -4; i <= 4; i++) {
      const cx = dx * (i + j / 2);
      const cz = dz * j;
      if (Math.hypot(cx, cz) > R + HEX) continue;
      for (let k = 0; k < 3; k++) {
        const a0 = (30 + k * 60) * D2R;
        const a1 = (30 + (k + 1) * 60) * D2R;
        const [x0, z0] = warp(cx + HEX * Math.cos(a0), cz + HEX * Math.sin(a0));
        const [x1, z1] = warp(cx + HEX * Math.cos(a1), cz + HEX * Math.sin(a1));
        if (Math.hypot(x0, z0) > R - 0.02 || Math.hypot(x1, z1) > R - 0.02) continue;
        const mx = (x0 + x1) / 2;
        const mz = (z0 + z1) / 2;
        const len = Math.hypot(x1 - x0, z1 - z0);
        const seg = new Mesh(
          new BoxGeometry(len + 0.008, 0.013, 0.018),
          ridgeMat
        );
        seg.position.set(mx, SALT_Y, mz);
        seg.rotation.y = Math.atan2(-(z1 - z0), x1 - x0);
        g.add(seg);
      }
    }

  // ---- the Andean range on the horizon ----
  for (const [deg, r, w, h] of [
    [148, 0.28, 0.1, 0.07],
    [168, 0.29, 0.13, 0.1],
    [186, 0.285, 0.09, 0.062],
    [204, 0.29, 0.12, 0.088],
    [224, 0.28, 0.095, 0.058],
    [242, 0.285, 0.085, 0.048],
  ] as const) {
    const a = deg * D2R;
    const hill = new Mesh(new ConeGeometry(w, h, 5), mat(deg % 4 ? HILL : HILL_DARK));
    hill.scale.z = 0.45;
    hill.position.set(Math.sin(a) * r, SALT_Y + h / 2 - 0.008, Math.cos(a) * r);
    hill.rotation.y = a;
    g.add(hill);
  }

  // ---- Isla Incahuasi: a rough coral rock rising out of the salt ----
  const island = new Group();
  island.position.set(0.13, SALT_Y - 0.004, 0.04);
  g.add(island);

  const mound = new CylinderGeometry(0.078, 0.145, 0.19, 7, 2);
  const pos = mound.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const rr = Math.hypot(x, z);
    if (rr < 1e-5) continue;
    const a = Math.atan2(z, x);
    const t = (y + 0.095) / 0.19;
    const k = 1 + 0.2 * Math.sin(3 * a + 1.4) + 0.13 * Math.sin(5 * a + 2.9 * t);
    pos.setXYZ(i, x * k, t > 0.02 ? y + 0.018 * Math.sin(4 * a - 1.1) : y, z * k);
  }
  mound.translate(0, 0.095, 0);
  mound.computeVertexNormals();
  island.add(new Mesh(mound, mat(ROCK)));
  // boulders spilling round the foot
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.7;
    const s = 0.022 + 0.01 * Math.sin(i * 2.7);
    const b = new Mesh(new SphereGeometry(s, 5, 4), mat(ROCK_DARK));
    b.scale.y = 0.6;
    b.position.set(Math.sin(a) * 0.152, s * 0.3, Math.cos(a) * 0.152);
    island.add(b);
  }

  // ---- giant cacti bristling off the island ----
  const cactusMat = mat(CACTUS);
  for (const [x, z, y0, h, r] of [
    [0.0, 0.0, 0.196, 0.19, 0.013],
    [-0.05, 0.032, 0.158, 0.14, 0.011],
    [0.055, -0.022, 0.163, 0.125, 0.011],
    [0.025, 0.055, 0.15, 0.108, 0.009],
    [-0.034, -0.05, 0.153, 0.115, 0.01],
    [0.078, 0.04, 0.122, 0.088, 0.008],
    [-0.08, -0.012, 0.122, 0.092, 0.009],
    [0.012, -0.072, 0.128, 0.082, 0.008],
    [-0.012, 0.086, 0.12, 0.076, 0.008],
  ] as const) {
    const trunk = new Mesh(new CylinderGeometry(r * 0.8, r, h, 6), cactusMat);
    trunk.position.set(x, y0 + h / 2, z);
    island.add(trunk);
    const tip = new Mesh(new SphereGeometry(r * 0.8, 6, 4), cactusMat);
    tip.position.set(x, y0 + h, z);
    island.add(tip);
    if (h < 0.09) continue;
    const arm = new Mesh(new CylinderGeometry(r * 0.6, r * 0.6, h * 0.4, 5), cactusMat);
    arm.position.set(x + r * 1.6, y0 + h * 0.72, z);
    island.add(arm);
    const elbow = new Mesh(new BoxGeometry(r * 2.4, r * 1.2, r * 1.2), cactusMat);
    elbow.position.set(x + r * 0.9, y0 + h * 0.52, z);
    island.add(elbow);
  }

  return g;
}
