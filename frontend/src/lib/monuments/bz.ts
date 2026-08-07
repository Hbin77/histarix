// Great Blue Hole (Belize) — papercraft: a shallow sea plate whose top face
// carries the aerial colour zones. Navy shaft sunk at the centre, a turquoise
// halo of shallows, then a lumpy cream coral ring broken by three tidal
// channels, all set on muted aqua ocean.

import {
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const D2R = Math.PI / 180;

const SURFACE = 0.1; // sea-surface height (deliberately low: this is a seascape)
const R_OCEAN = 0.375; // footprint 0.75
const R_HOLE = 0.132;
const FLOOR_Y = 0.026; // shaft floor — 0.074 below the surface

const AQUA = "#95cbd0"; // lighter water just outside the reef
const REEF_WATER = "#7fb0a7"; // dusty teal over the reef flat
const TURQ = "#b2e0d3"; // bright shallows ringing the hole
const HOLE_WALL = "#3f5878";
const HOLE_DEEP = "#2c3d59";

/** Surviving reef arcs (start°, end°); the gaps between them are the channels. */
const ARCS: Array<[number, number]> = [
  [322, 456],
  [126, 192],
  [222, 292],
];

/** Hollow annular slab (rectangular cross-section revolved around Y). */
function ring(
  rIn: number,
  rOut: number,
  y0: number,
  y1: number,
  m: MeshLambertMaterial,
  seg: number,
  phiStart = 0,
  phiLen = Math.PI * 2
): Mesh {
  const pts = [
    new Vector2(rOut, y0),
    new Vector2(rOut, y1),
    new Vector2(rIn, y1),
    new Vector2(rIn, y0),
    new Vector2(rOut, y0),
  ];
  return new Mesh(new LatheGeometry(pts, seg, phiStart, phiLen), m);
}

/** Wobble every vertex sitting on one edge of a lathe so water boundaries read
 *  as natural rather than machined. Integer harmonics keep the seam closed. */
function wobble(mesh: Mesh, targetR: number, amp: number, phase: number): void {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (Math.abs(r - targetR) > 1e-4) continue;
    const a = Math.atan2(z, x);
    const d =
      amp *
      (Math.sin(3 * a + phase) +
        0.62 * Math.sin(5 * a + phase * 1.7) +
        0.4 * Math.sin(7 * a + phase * 2.9));
    const nr = r + d;
    pos.setXYZ(i, (x / r) * nr, pos.getY(i), (z / r) * nr);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

export function build(): Group {
  const g = new Group();

  const cream = mat(TONES.stone);
  const creamDark = mat(TONES.stoneDark);
  const reefWater = mat(REEF_WATER);

  // ---- ocean plate: gently tapered sides, annular so the shaft stays open ----
  const oceanPts = [
    new Vector2(R_OCEAN, 0),
    new Vector2(0.366, 0.05),
    new Vector2(0.354, SURFACE),
    new Vector2(0.17, SURFACE),
    new Vector2(0.17, 0),
    new Vector2(R_OCEAN, 0),
  ];
  g.add(new Mesh(new LatheGeometry(oceanPts, 30), mat(TONES.water)));

  // ---- the shaft: navy wall sleeve + sunken floor ----
  g.add(ring(R_HOLE, 0.172, 0, SURFACE, mat(HOLE_WALL), 32));
  const floor = new Mesh(
    new CylinderGeometry(0.138, 0.12, 0.04, 24),
    mat(HOLE_DEEP)
  );
  floor.position.y = FLOOR_Y - 0.02;
  g.add(floor);

  // ---- surface colour zones: thin plates with wobbled seaward edges ----
  const halo = ring(0.134, 0.204, SURFACE - 0.004, SURFACE + 0.008, mat(TURQ), 32);
  wobble(halo, 0.204, 0.014, 0.7);
  g.add(halo);

  const flat = ring(0.198, 0.29, SURFACE - 0.005, SURFACE + 0.005, reefWater, 30);
  wobble(flat, 0.29, 0.03, 2.1);
  g.add(flat);

  const outer = ring(0.286, 0.334, SURFACE - 0.006, SURFACE + 0.003, mat(AQUA), 26);
  wobble(outer, 0.334, 0.022, 4.4);
  g.add(outer);

  // ---- reef: continuous cream banks per arc, lumpy mounds riding on top ----
  let i = 0;
  for (const [a0, a1] of ARCS) {
    g.add(
      ring(
        0.202,
        0.258,
        SURFACE + 0.003,
        SURFACE + 0.013,
        cream,
        Math.round((a1 - a0) / 8),
        a0 * D2R,
        (a1 - a0) * D2R
      )
    );
    const n = Math.round((a1 - a0) / 18);
    for (let k = 0; k <= n; k++, i++) {
      const deg = a0 + ((a1 - a0) * k) / n;
      const a = deg * D2R;
      const radius = 0.229 + 0.014 * Math.sin(3 * a + 1.1);
      const r = 0.062 + 0.013 * Math.sin(5 * a + 0.4);
      const h = 0.015 + 0.006 * Math.sin(4 * a + 2.2);
      const bank = new Mesh(
        new CylinderGeometry(r * 0.8, r, h, i % 2 ? 6 : 7),
        i % 3 === 1 ? creamDark : cream
      );
      bank.position.set(Math.sin(a) * radius, SURFACE + 0.009 + h / 2, Math.cos(a) * radius);
      bank.rotation.y = a + i;
      bank.scale.z = 0.72; // squashed radially → mounds run along the reef line
      g.add(bank);
    }
  }

  // ---- detached patch reefs out on the open ocean ----
  const patch = (deg: number, radius: number, r: number, h: number) => {
    const a = deg * D2R;
    const m = new Mesh(new CylinderGeometry(r * 0.7, r, h, 6), reefWater);
    m.position.set(Math.sin(a) * radius, SURFACE + 0.001 + h / 2, Math.cos(a) * radius);
    m.rotation.y = a;
    m.scale.z = 0.6;
    g.add(m);
  };
  patch(105, 0.344, 0.05, 0.014);
  patch(205, 0.35, 0.034, 0.011);
  patch(311, 0.34, 0.042, 0.013);

  return g;
}
