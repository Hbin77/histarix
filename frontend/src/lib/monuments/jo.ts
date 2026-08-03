// Petra (Al-Khazneh) — papercraft: rose-red cliff slab with a carved facade.
// Lower tier of six columns + doorway + pediment; upper tier with broken
// pediment halves flanking the central tholos topped by the urn.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Shape,
  SphereGeometry,
} from "three";
import { mat, TONES } from "./materials";

function box(
  w: number,
  h: number,
  d: number,
  m: MeshLambertMaterial,
  x: number,
  y: number,
  z: number
): Mesh {
  const b = new Mesh(new BoxGeometry(w, h, d), m);
  b.position.set(x, y, z);
  return b;
}

function col(
  r: number,
  h: number,
  m: MeshLambertMaterial,
  x: number,
  y: number,
  z: number,
  seg = 8
): Mesh {
  const c = new Mesh(new CylinderGeometry(r, r, h, seg), m);
  c.position.set(x, y, z);
  return c;
}

/** Flat extruded prism from 2D outline points (CCW), facing +z. */
function prism(
  pts: Array<[number, number]>,
  depth: number,
  m: MeshLambertMaterial,
  x: number,
  y: number,
  z: number
): Mesh {
  const s = new Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  const p = new Mesh(
    new ExtrudeGeometry(s, { depth, bevelEnabled: false }),
    m
  );
  p.position.set(x, y, z);
  return p;
}

export function build(): Group {
  const g = new Group();

  const cliff = mat(TONES.brick);
  const cliffDark = mat(TONES.brickDark);
  const cliffRose = mat("#b97f63");
  const carved = mat("#d9ab8b"); // lighter rose, catches light on the relief
  const recess = mat("#8f5f47"); // shadowed back wall of the carving
  const dark = mat("#5e4033"); // doorway void
  const sand = mat(TONES.sand);

  // ---- Sandy canyon floor (landform base — no plaza disc) ----
  const floor = new Mesh(new CylinderGeometry(0.34, 0.34, 0.014, 26), sand);
  floor.position.set(0, 0.007, 0.03);
  g.add(floor);

  // ---- Cliff massif ----
  g.add(box(0.48, 0.64, 0.34, cliff, 0, 0.32, -0.11)); // main slab, face z=0.06
  const capL = new Mesh(new CylinderGeometry(0.105, 0.155, 0.11, 6), cliffRose);
  capL.position.set(-0.09, 0.655, -0.13);
  capL.scale.z = 0.85;
  capL.rotation.y = 0.5;
  g.add(capL);
  const capR = new Mesh(new CylinderGeometry(0.065, 0.105, 0.09, 7), cliffDark);
  capR.position.set(0.13, 0.64, -0.1);
  capR.scale.z = 0.9;
  capR.rotation.y = 1.4;
  g.add(capR);
  const backLump = new Mesh(new CylinderGeometry(0.1, 0.16, 0.3, 6), cliffDark);
  backLump.position.set(-0.05, 0.55, -0.22);
  backLump.scale.z = 0.75;
  backLump.rotation.y = 1.1;
  g.add(backLump);
  const ledgeR = new Mesh(new CylinderGeometry(0.05, 0.085, 0.22, 6), cliffRose);
  ledgeR.position.set(0.21, 0.5, -0.17);
  ledgeR.scale.z = 0.9;
  ledgeR.rotation.y = 0.2;
  g.add(ledgeR);
  const flankL = new Mesh(new CylinderGeometry(0.075, 0.11, 0.52, 6), cliffRose);
  flankL.position.set(-0.255, 0.25, 0.0);
  flankL.scale.z = 0.9;
  flankL.rotation.y = 0.4;
  g.add(flankL);
  const flankR = new Mesh(new CylinderGeometry(0.06, 0.105, 0.42, 7), cliffDark);
  flankR.position.set(0.255, 0.2, -0.02);
  flankR.scale.z = 0.85;
  flankR.rotation.y = 0.9;
  g.add(flankR);
  // small fallen boulders framing the forecourt
  const bd1 = new Mesh(new CylinderGeometry(0.03, 0.045, 0.05, 5), cliffDark);
  bd1.position.set(-0.21, 0.02, 0.14);
  bd1.rotation.y = 0.7;
  g.add(bd1);
  const bd2 = new Mesh(new CylinderGeometry(0.022, 0.036, 0.04, 5), cliffRose);
  bd2.position.set(0.23, 0.016, 0.11);
  bd2.rotation.y = 1.8;
  g.add(bd2);

  // ---- Carved recess: shadow wall + rock jambs + brow overhang ----
  g.add(box(0.37, 0.58, 0.012, recess, 0, 0.305, 0.066));
  g.add(box(0.05, 0.595, 0.06, cliff, -0.205, 0.2975, 0.075));
  g.add(box(0.05, 0.595, 0.06, cliff, 0.205, 0.2975, 0.075));
  g.add(box(0.46, 0.085, 0.1, cliff, 0, 0.6375, 0.055)); // brow over facade

  // ---- Lower tier: stylobate, six columns, doorway, entablature, pediment ----
  g.add(box(0.34, 0.025, 0.05, carved, 0, 0.0125, 0.085));
  g.add(box(0.1, 0.015, 0.06, carved, 0, 0.0075, 0.115)); // entry step
  const lowerX = [-0.15, -0.09, -0.03, 0.03, 0.09, 0.15];
  for (const x of lowerX) {
    g.add(col(0.0135, 0.185, carved, x, 0.1175, 0.088));
    g.add(box(0.028, 0.012, 0.028, carved, x, 0.216, 0.088));
  }
  g.add(box(0.056, 0.13, 0.02, dark, 0, 0.09, 0.07)); // doorway void
  g.add(box(0.34, 0.03, 0.035, carved, 0, 0.237, 0.085)); // entablature
  g.add(
    prism([[-0.105, 0], [0.105, 0], [0, 0.048]], 0.03, carved, 0, 0.252, 0.072)
  );

  // ---- Upper tier: side wings + broken pediment + tholos with urn ----
  const wingX = [-0.155, -0.095, 0.095, 0.155];
  for (const x of wingX) {
    g.add(col(0.012, 0.165, carved, x, 0.3975, 0.086));
    g.add(box(0.025, 0.011, 0.025, carved, x, 0.4855, 0.086));
  }
  g.add(box(0.11, 0.024, 0.032, carved, -0.125, 0.503, 0.084));
  g.add(box(0.11, 0.024, 0.032, carved, 0.125, 0.503, 0.084));
  g.add(box(0.03, 0.095, 0.012, dark, -0.125, 0.395, 0.073)); // wing niches
  g.add(box(0.03, 0.095, 0.012, dark, 0.125, 0.395, 0.073));
  // broken pediment halves — raked edges rise toward the central tholos
  g.add(
    prism(
      [[-0.178, 0], [-0.068, 0], [-0.068, 0.052]],
      0.026,
      carved,
      0,
      0.515,
      0.072
    )
  );
  g.add(
    prism(
      [[0.068, 0], [0.178, 0], [0.068, 0.052]],
      0.026,
      carved,
      0,
      0.515,
      0.072
    )
  );

  // tholos: round kiosk, cornice, conical roof, crowning urn
  g.add(col(0.048, 0.16, carved, 0, 0.39, 0.075, 10));
  const tholosCols = [-0.9, -0.35, 0.35, 0.9];
  for (const a of tholosCols) {
    g.add(
      col(0.006, 0.15, cliffDark, Math.sin(a) * 0.05, 0.385, 0.075 + Math.cos(a) * 0.05, 5)
    );
  }
  g.add(col(0.058, 0.016, carved, 0, 0.478, 0.075, 10));
  const roof = new Mesh(new ConeGeometry(0.056, 0.058, 10), carved);
  roof.position.set(0, 0.515, 0.075);
  g.add(roof);
  const urn = new Mesh(new SphereGeometry(0.021, 8, 6), carved);
  urn.position.set(0, 0.552, 0.075);
  g.add(urn);
  const finial = new Mesh(new ConeGeometry(0.008, 0.03, 6), carved);
  finial.position.set(0, 0.578, 0.075);
  g.add(finial);

  return g;
}
