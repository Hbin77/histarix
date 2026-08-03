// Belgrade Fortress (Kalemegdan) — papercraft miniature.
// Green terraced ridge above the Sava–Danube confluence, brick lower rampart
// and stone upper ring, twin round-tower gate (Zindan Gate), corner bastions,
// park trees and the slender white Pobednik column watching over the water.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
} from "three";
import { mat, TONES } from "./materials";

const GRASS = "#88a273"; // sunlit plateau lawn (lighter than TONES.forest)
const TREE = "#66815a"; // darker park canopy

// The ridge is an ellipse (long axis X) so it reads as a hill, not a cake.
const EX = 1.1;
const EZ = 0.94;

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

function cyl(
  rTop: number,
  rBot: number,
  h: number,
  x: number,
  y: number,
  z: number,
  color: string,
  seg = 12
): Mesh {
  const m = new Mesh(new CylinderGeometry(rTop, rBot, h, seg), mat(color));
  m.position.set(x, y, z);
  return m;
}

/** Elliptically squashed terrain tier (base radius r scaled by EX/EZ). */
function tier(
  rTop: number,
  rBot: number,
  h: number,
  y: number,
  color: string
): Mesh {
  const m = cyl(rTop, rBot, h, 0, y, 0, color, 14);
  m.scale.set(EX, 1, EZ);
  return m;
}

/** Polygonal rampart ring traced along the ellipse r*EX x r*EZ, each segment
 *  a tangent wall slab with a slightly proud darker parapet cap. */
function rampartRing(
  g: Group,
  r: number,
  yBase: number,
  h: number,
  thick: number,
  n: number,
  color: string,
  capColor: string
): void {
  const A = r * EX;
  const B = r * EZ;
  for (let i = 0; i < n; i++) {
    const a0 = (i * 2 * Math.PI) / n;
    const a1 = ((i + 1) * 2 * Math.PI) / n;
    const x0 = A * Math.sin(a0);
    const z0 = B * Math.cos(a0);
    const x1 = A * Math.sin(a1);
    const z1 = B * Math.cos(a1);
    const len = Math.hypot(x1 - x0, z1 - z0) + 0.012;
    const ry = Math.atan2(-(z1 - z0), x1 - x0);
    const mx = (x0 + x1) / 2;
    const mz = (z0 + z1) / 2;
    const wall = box(len, h, thick, mx, yBase + h / 2, mz, color);
    wall.rotation.y = ry;
    g.add(wall);
    const cap = box(len, 0.012, thick + 0.008, mx, yBase + h + 0.006, mz, capColor);
    cap.rotation.y = ry;
    g.add(cap);
  }
}

/** Round fortress tower embedded in the slope, with rim + merlon crown. */
function roundTower(
  g: Group,
  x: number,
  z: number,
  rad: number,
  yBase: number,
  yTop: number,
  color: string
): void {
  const h = yTop - yBase;
  g.add(cyl(rad, rad + 0.004, h, x, yBase + h / 2, z, color));
  g.add(cyl(rad + 0.006, rad + 0.006, 0.016, x, yTop + 0.008, z, TONES.stoneDark));
  for (let i = 0; i < 6; i++) {
    const a = (i * 2 * Math.PI) / 6 + 0.3;
    g.add(
      box(
        0.013,
        0.016,
        0.013,
        x + Math.sin(a) * (rad - 0.004),
        yTop + 0.024,
        z + Math.cos(a) * (rad - 0.004),
        color
      )
    );
  }
}

function tree(x: number, y: number, z: number, r = 0.02, h = 0.048): Mesh {
  const m = new Mesh(new ConeGeometry(r, h, 6), mat(TREE));
  m.position.set(x, y + h / 2, z);
  return m;
}

export function build(): Group {
  const g = new Group();

  // ---- river confluence: water sheet pushed toward the front so the
  //      promontory nose juts into it (Sava meeting Danube) ----
  const water = cyl(0.37, 0.37, 0.014, 0, 0.007, 0.02, TONES.water, 28);
  water.scale.z = 0.935;
  g.add(water);

  // Ridge is pushed back so the water wraps the promontory nose
  const hill = new Group();
  hill.position.z = -0.028;
  g.add(hill);

  // ---- green terraced ridge with a sandy shoreline ----
  hill.add(tier(0.302, 0.315, 0.03, 0.015, TONES.sand)); // shore
  hill.add(tier(0.275, 0.305, 0.09, 0.045, TONES.forest)); // lower ward
  hill.add(tier(0.17, 0.215, 0.11, 0.145, GRASS)); // upper plateau

  // ---- ramparts: warm brick outer ring, pale stone inner ring ----
  rampartRing(hill, 0.26, 0.09, 0.062, 0.026, 12, TONES.brick, TONES.brickDark);
  rampartRing(hill, 0.155, 0.2, 0.05, 0.024, 10, TONES.stone, TONES.stoneDark);

  // ---- Zindan Gate: twin round towers flanking an arched gatehouse ----
  const GZ = EZ; // gate sits on the ellipse's front (minor) axis
  roundTower(hill, -0.06, 0.26 * GZ, 0.037, 0.05, 0.25, TONES.stone);
  roundTower(hill, 0.06, 0.26 * GZ, 0.037, 0.05, 0.25, TONES.stone);
  hill.add(box(0.082, 0.15, 0.05, 0, 0.145, 0.252 * GZ, TONES.stone));
  hill.add(box(0.09, 0.012, 0.056, 0, 0.226, 0.252 * GZ, TONES.stoneDark));
  // arched doorway (dark rect + half-buried disc = rounded arch)
  hill.add(box(0.032, 0.05, 0.006, 0, 0.115, 0.252 * GZ + 0.026, TONES.ink));
  const arch = new Mesh(new CylinderGeometry(0.016, 0.016, 0.006, 12), mat(TONES.ink));
  arch.rotation.x = Math.PI / 2;
  arch.position.set(0, 0.14, 0.252 * GZ + 0.026);
  hill.add(arch);
  // stone steps descending from the gate toward the shore
  hill.add(box(0.052, 0.048, 0.032, 0, 0.066, 0.272, TONES.stone));
  hill.add(box(0.052, 0.028, 0.03, 0, 0.044, 0.298, TONES.stone));

  // ---- corner bastions on the outer wall ----
  const bastions = [65, 145, 215, 295];
  for (const deg of bastions) {
    const a = (deg * Math.PI) / 180;
    roundTower(
      hill,
      Math.sin(a) * 0.262 * EX,
      Math.cos(a) * 0.262 * EZ,
      0.033,
      0.04,
      0.2,
      TONES.stoneDark
    );
  }

  // ---- Sahat kula: small clock tower inside the upper ward ----
  hill.add(box(0.05, 0.11, 0.05, -0.075, 0.255, -0.035, TONES.stone));
  hill.add(box(0.016, 0.016, 0.006, -0.075, 0.288, -0.008, TONES.white));
  const spire = new Mesh(new ConeGeometry(0.038, 0.05, 4), mat(TONES.brickDark));
  spire.rotation.y = Math.PI / 4;
  spire.position.set(-0.075, 0.335, -0.035);
  hill.add(spire);

  // ---- Pobednik: tall white victory column at the promontory edge ----
  const px = 0.055;
  const pz = 0.105;
  hill.add(box(0.062, 0.04, 0.062, px, 0.22, pz, TONES.stoneDark));
  hill.add(box(0.046, 0.045, 0.046, px, 0.2625, pz, TONES.stone));
  hill.add(cyl(0.0145, 0.0175, 0.21, px, 0.39, pz, TONES.white, 10));
  hill.add(box(0.036, 0.013, 0.036, px, 0.5015, pz, TONES.stone));
  // bronze figure with outstretched falcon arm
  hill.add(box(0.012, 0.05, 0.012, px, 0.533, pz, TONES.ironDark));
  hill.add(box(0.03, 0.005, 0.005, px + 0.015, 0.545, pz, TONES.ironDark));
  const head = new Mesh(new SphereGeometry(0.006, 8, 6), mat(TONES.ironDark));
  head.position.set(px, 0.564, pz);
  hill.add(head);

  // ---- Kalemegdan park canopy ----
  const shelfTrees = [100, 165, 245, 330, 195];
  for (const deg of shelfTrees) {
    const a = (deg * Math.PI) / 180;
    hill.add(tree(Math.sin(a) * 0.23 * EX, 0.09, Math.cos(a) * 0.23 * EZ));
  }
  hill.add(tree(-0.03, 0.2, -0.12, 0.018, 0.044));
  hill.add(tree(0.115, 0.2, -0.06, 0.017, 0.042));
  hill.add(tree(-0.13, 0.2, 0.045, 0.016, 0.04));

  return g;
}
