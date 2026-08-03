// Blue Mosque, Mazar-i-Sharif (Shrine of Hazrat Ali) — papercraft miniature.
// Twin turquoise Timurid domes on tiled drums, tall pointed-arch pishtaq
// portal, two-tone blue facade panels, four corner minarets with balconies
// and turquoise caps.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const WALL = "#c0d5d8"; // pale turquoise-tiled wall
const TURQ = "#55a3ad"; // muted turquoise dome tile
const COBALT = TONES.domeBlue;

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

/** Flat pointed-arch plate (lancet), extruded along +Z, base at y=0. */
function archPlate(w: number, h: number, depth: number, color: string): Mesh {
  const hw = w / 2;
  const s = new Shape();
  s.moveTo(-hw, 0);
  s.lineTo(hw, 0);
  s.lineTo(hw, h * 0.6);
  s.quadraticCurveTo(hw, h * 0.88, 0, h);
  s.quadraticCurveTo(-hw, h * 0.88, -hw, h * 0.6);
  s.closePath();
  const geo = new ExtrudeGeometry(s, {
    depth,
    bevelEnabled: false,
    curveSegments: 3,
  });
  return new Mesh(geo, mat(color));
}

/** Slightly bulbous Timurid dome; base radius r, apex at ~1.5r. */
function timuridDome(r: number, color: string, seg = 12): Mesh {
  const pts = [
    new Vector2(r * 0.88, 0),
    new Vector2(r, r * 0.38),
    new Vector2(r * 0.92, r * 0.8),
    new Vector2(r * 0.6, r * 1.18),
    new Vector2(r * 0.22, r * 1.42),
    new Vector2(0, r * 1.5),
  ];
  return new Mesh(new LatheGeometry(pts, seg), mat(color));
}

function minaret(g: Group, x: number, z: number): void {
  const shaft = new Mesh(new CylinderGeometry(0.018, 0.024, 0.31, 8), mat(WALL));
  shaft.position.set(x, 0.036 + 0.155, z);
  g.add(shaft);
  // cobalt tile bands
  for (const y of [0.13, 0.24]) {
    const band = new Mesh(new CylinderGeometry(0.0225, 0.0225, 0.022, 8), mat(COBALT));
    band.position.set(x, y, z);
    g.add(band);
  }
  // balcony
  const balc = new Mesh(new CylinderGeometry(0.031, 0.02, 0.02, 8), mat(COBALT));
  balc.position.set(x, 0.356, z);
  g.add(balc);
  // lantern
  const lant = new Mesh(new CylinderGeometry(0.015, 0.015, 0.05, 8), mat(WALL));
  lant.position.set(x, 0.391, z);
  g.add(lant);
  // turquoise cap + gold tip
  const cap = timuridDome(0.021, TURQ, 8);
  cap.position.set(x, 0.416, z);
  g.add(cap);
  const tip = new Mesh(new CylinderGeometry(0.003, 0.006, 0.03, 4), mat(TONES.gold));
  tip.position.set(x, 0.458, z);
  g.add(tip);
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  // ---- platform ----
  g.add(box(0.56, 0.036, 0.34, 0, 0.018, 0, TONES.white));

  // ---- main shrine block ----
  g.add(box(0.44, 0.13, 0.24, 0, 0.101, 0, WALL));
  // pale roof slab with cobalt edge trim only
  g.add(box(0.45, 0.014, 0.25, 0, 0.173, 0, WALL));
  g.add(box(0.45, 0.014, 0.018, 0, 0.173, 0.116, COBALT));
  g.add(box(0.45, 0.014, 0.018, 0, 0.173, -0.116, COBALT));
  g.add(box(0.018, 0.014, 0.25, 0.216, 0.173, 0, COBALT));
  g.add(box(0.018, 0.014, 0.25, -0.216, 0.173, 0, COBALT));

  // ---- central pishtaq portal (front, +Z) ----
  g.add(box(0.16, 0.23, 0.05, 0, 0.151, 0.115, WALL));
  g.add(box(0.17, 0.016, 0.06, 0, 0.274, 0.115, WALL));
  g.add(box(0.17, 0.024, 0.012, 0, 0.27, 0.146, COBALT));
  // cobalt frame plate + dark arch recess
  const frame = archPlate(0.13, 0.2, 0.01, COBALT);
  frame.position.set(0, 0.045, 0.14);
  g.add(frame);
  const recess = archPlate(0.09, 0.165, 0.012, TONES.ink);
  recess.position.set(0, 0.045, 0.142);
  g.add(recess);
  // small flanking turrets on the pishtaq shoulders
  for (const sx of [1, -1]) {
    const tur = new Mesh(new CylinderGeometry(0.011, 0.013, 0.05, 6), mat(WALL));
    tur.position.set(sx * 0.072, 0.303, 0.115);
    g.add(tur);
    const turCap = timuridDome(0.013, TURQ, 8);
    turCap.position.set(sx * 0.072, 0.326, 0.115);
    g.add(turCap);
  }

  // ---- rear iwan (smaller, mirrors the front) ----
  g.add(box(0.14, 0.17, 0.04, 0, 0.121, -0.115, WALL));
  g.add(box(0.15, 0.014, 0.05, 0, 0.213, -0.115, COBALT));
  const rearArch = archPlate(0.08, 0.14, 0.012, COBALT);
  rearArch.position.set(0, 0.05, -0.152);
  rearArch.rotation.y = Math.PI;
  g.add(rearArch);

  // ---- twin turquoise domes on tiled drums ----
  for (const x of [-0.13, 0.13]) {
    const drum = new Mesh(new CylinderGeometry(0.077, 0.082, 0.09, 12), mat(WALL));
    drum.position.set(x, 0.212, -0.02);
    g.add(drum);
    const drumBand = new Mesh(new CylinderGeometry(0.0835, 0.0835, 0.028, 12), mat(COBALT));
    drumBand.position.set(x, 0.222, -0.02);
    g.add(drumBand);
    const dome = timuridDome(0.082, TURQ);
    dome.position.set(x, 0.2565, -0.02);
    g.add(dome);
    const fin = new Mesh(new CylinderGeometry(0.004, 0.008, 0.045, 4), mat(TONES.gold));
    fin.position.set(x, 0.4, -0.02);
    g.add(fin);
  }

  // ---- two-tone facade: cobalt arch panels flanking the portal ----
  for (const sx of [1, -1]) {
    for (const x of [0.125, 0.18]) {
      const p = archPlate(0.038, 0.085, 0.008, COBALT);
      p.position.set(sx * x, 0.052, 0.12);
      g.add(p);
    }
    // side facades
    for (const z of [-0.06, 0, 0.06]) {
      const p = archPlate(0.038, 0.085, 0.008, COBALT);
      p.position.set(sx * 0.22, 0.052, z);
      p.rotation.y = (sx * Math.PI) / 2;
      g.add(p);
    }
  }

  // ---- corner minarets ----
  for (const sx of [1, -1])
    for (const sz of [1, -1]) minaret(g, sx * 0.25, sz * 0.145);

  return g;
}
