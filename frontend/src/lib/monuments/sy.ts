// Palmyra — papercraft: the Great Colonnade avenue (two parallel column rows
// with Palmyrene brackets and broken entablature runs) leading to the triple
// Monumental Arch with one ruined flank, in warm desert sandstone, with
// fallen drums and rubble scattered on the sand.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Path,
  Shape,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const GROUND = 0.024; // avenue surface
const ROW_Z = 0.068; // colonnade rows at z = ±ROW_Z
const X0 = -0.3; // first column
const STEP = 0.046; // intercolumniation
const ARCH_X = 0.2; // arch wall center
const ARCH_T = 0.055; // arch wall thickness

const xAt = (i: number) => X0 + i * STEP;

function box(
  w: number,
  h: number,
  d: number,
  m: MeshLambertMaterial,
  x: number,
  y: number,
  z: number,
  rotY = 0
): Mesh {
  const b = new Mesh(new BoxGeometry(w, h, d), m);
  b.position.set(x, y, z);
  b.rotation.y = rotY;
  return b;
}

/** Round-headed opening for the arch facade (shape coords: x = world z). */
function archHole(cz: number, halfW: number, spring: number): Path {
  const p = new Path();
  p.moveTo(cz + halfW, 0);
  p.lineTo(cz + halfW, spring);
  p.absarc(cz, spring, halfW, 0, Math.PI, false);
  p.lineTo(cz - halfW, 0);
  p.closePath();
  return p;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  // Palmyra's golden desert limestone palette.
  const shaft = mat("#d9b98c"); // sun-warmed column stone
  const capStone = mat("#c4a271"); // plinths / capitals / brackets
  const entab = mat("#e0c79b"); // entablature runs
  const archFace = mat("#d5b083"); // monumental arch masonry
  const cornice = mat(TONES.sandDark);
  const avenue = mat("#e3d3a8"); // paved avenue
  const desert = mat(TONES.sand); // sand shoulders
  const rubble = mat(TONES.stoneDark);
  const broken = mat("#b39a6f"); // snapped column stubs

  // ---- Ground: paved avenue with sand shoulders ----
  g.add(box(0.66, 0.014, 0.175, avenue, 0.005, 0.017, 0));
  g.add(box(0.6, 0.008, 0.09, desert, -0.02, 0.016, -0.135));
  g.add(box(0.56, 0.008, 0.09, desert, 0.01, 0.016, 0.135));
  g.add(box(0.09, 0.008, 0.055, desert, -0.25, 0.016, 0.16));
  g.add(box(0.09, 0.008, 0.05, desert, 0.24, 0.016, -0.19));

  // ---- Columns (plinth + tapered shaft + capital + Palmyrene bracket) ----
  const shaftGeo = new CylinderGeometry(0.0085, 0.0105, 0.185, 7);
  const plinthGeo = new BoxGeometry(0.026, 0.012, 0.026);
  const capGeo = new BoxGeometry(0.022, 0.011, 0.022);
  const bracketGeo = new BoxGeometry(0.013, 0.011, 0.011);

  const addColumn = (x: number, z: number) => {
    const plinth = new Mesh(plinthGeo, capStone);
    plinth.position.set(x, GROUND + 0.006, z);
    const s = new Mesh(shaftGeo, shaft);
    s.position.set(x, GROUND + 0.1045, z);
    const cap = new Mesh(capGeo, capStone);
    cap.position.set(x, GROUND + 0.2025, z);
    // Console bracket partway up, facing the avenue — Palmyra's signature.
    const br = new Mesh(bracketGeo, capStone);
    br.position.set(x, GROUND + 0.122, z - Math.sign(z) * 0.0135);
    g.add(plinth, s, cap, br);
  };
  const addStub = (x: number, z: number, h: number) => {
    const plinth = new Mesh(plinthGeo, capStone);
    plinth.position.set(x, GROUND + 0.006, z);
    const stub = new Mesh(new CylinderGeometry(0.009, 0.0105, h, 7), broken);
    stub.position.set(x, GROUND + 0.012 + h / 2, z);
    g.add(plinth, stub);
  };

  // Ruin plan per row: index → true = standing, number = stub height.
  const rowA: Record<number, number | true> = {
    0: true, 1: true, 2: true, 3: true, 4: true, 5: 0.055, 7: true, 8: true, 9: true,
  };
  const rowB: Record<number, number | true> = {
    0: 0.075, 1: true, 2: true, 3: true, 5: true, 6: true, 7: true, 8: true, 9: 0.04,
  };
  for (let i = 0; i < 10; i++) {
    const a = rowA[i];
    if (a === true) addColumn(xAt(i), -ROW_Z);
    else if (a) addStub(xAt(i), -ROW_Z, a);
    const b = rowB[i];
    if (b === true) addColumn(xAt(i), ROW_Z);
    else if (b) addStub(xAt(i), ROW_Z, b);
  }
  // The avenue continues briefly beyond the arch.
  for (const x of [0.285, 0.332]) {
    addColumn(x, -ROW_Z);
    addColumn(x, ROW_Z);
  }

  // ---- Surviving entablature runs bridging groups of columns ----
  const beamY = GROUND + 0.217;
  g.add(box(0.21, 0.018, 0.026, entab, xAt(2), beamY, -ROW_Z));
  g.add(box(0.118, 0.018, 0.026, entab, xAt(8), beamY, -ROW_Z));
  g.add(box(0.164, 0.018, 0.026, entab, xAt(6.5), beamY, ROW_Z));

  // ---- Monumental Arch: triple-arched facade, north flank broken ----
  // Built in a pivot group and turned 25° — the real arch stands angled to
  // the avenue, and the turn lets the facade read from the aerial views.
  const archG = new Group();
  archG.position.x = ARCH_X;
  archG.rotation.y = (-25 * Math.PI) / 180;
  g.add(archG);

  const facade = new Shape();
  facade.moveTo(-0.175, 0);
  facade.lineTo(0.175, 0);
  facade.lineTo(0.175, 0.215);
  facade.lineTo(0.09, 0.215);
  facade.lineTo(0.09, 0.37);
  facade.lineTo(-0.09, 0.37);
  facade.lineTo(-0.09, 0.19);
  facade.lineTo(-0.175, 0.11);
  facade.closePath();
  facade.holes.push(
    archHole(0, 0.052, 0.13), // central portal over the roadway
    archHole(0.1325, 0.028, 0.075), // south side passage
    archHole(-0.1325, 0.028, 0.075) // north side passage (broken flank)
  );
  const wall = new Mesh(
    new ExtrudeGeometry(facade, {
      depth: ARCH_T,
      bevelEnabled: false,
      curveSegments: 10,
    }),
    archFace
  );
  // Shape x → group z, extrude → group -x: wall spans ±ARCH_T/2.
  wall.rotation.y = -Math.PI / 2;
  wall.position.set(ARCH_T / 2, 0.02, 0);
  archG.add(wall);

  // Cornices: band over the side passages, thin crown over the central block.
  const band = box(0.066, 0.013, 0.262, cornice, 0, 0.2415, 0.044);
  const crown = box(0.064, 0.011, 0.192, cornice, 0, 0.3955, 0);
  // Slim ledge across the attic so the upper block doesn't read blank.
  const ledge = box(0.062, 0.01, 0.184, cornice, 0, 0.315, 0);
  archG.add(band, crown, ledge);
  // Pilaster strips flanking the central portal on both faces.
  for (const dx of [-1, 1])
    for (const dz of [-1, 1])
      archG.add(
        box(0.012, 0.21, 0.02, capStone, dx * 0.031, 0.125, dz * 0.075)
      );
  // Tumbled block at the foot of the broken flank.
  g.add(box(0.034, 0.026, 0.04, archFace, 0.24, 0.037, -0.175, 0.5));

  // ---- Fallen drums + rubble field ----
  const drum = (
    x: number,
    z: number,
    r: number,
    len: number,
    rotY: number,
    m: MeshLambertMaterial
  ) => {
    const d = new Mesh(new CylinderGeometry(r, r, len, 7), m);
    d.position.set(x, 0.012 + r, z);
    d.rotation.set(0, rotY, Math.PI / 2);
    g.add(d);
  };
  // A collapsed column: drums still roughly in a line across the avenue.
  drum(-0.03, -0.02, 0.009, 0.032, 0.12, shaft);
  drum(0.008, -0.016, 0.009, 0.03, -0.08, capStone);
  drum(0.044, -0.01, 0.0085, 0.028, 0.2, shaft);
  // Loose drums out on the sand.
  drum(-0.2, 0.155, 0.01, 0.034, 1.0, capStone);
  drum(0.09, -0.16, 0.009, 0.03, -0.6, shaft);
  drum(-0.26, -0.14, 0.0085, 0.028, 0.4, rubble);
  // Rough blocks.
  g.add(box(0.03, 0.02, 0.024, rubble, 0.2, 0.022, 0.13, 0.7));
  g.add(box(0.026, 0.016, 0.022, rubble, -0.13, 0.02, 0.17, -0.4));
  g.add(box(0.028, 0.018, 0.02, rubble, -0.32, 0.021, 0.02, 1.1));
  g.add(box(0.024, 0.015, 0.02, rubble, 0.28, 0.02, 0.17, 0.3));

  return g;
}
