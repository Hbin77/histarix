// Parthenon — papercraft: octastyle Doric ruin (8 x 13 peristyle) on a
// three-step crepidoma over an Acropolis rock slab; broken front colonnade,
// partial pediments, low ruined cella walls, fallen drums and blocks.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Shape,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const NX = 14; // columns along each flank (x axis)
const NZ = 8; // columns across each facade (z axis)
const SX = 0.0395; // flank intercolumniation
const SZ = 0.036; // facade intercolumniation
const ROCK_H = 0.016; // Acropolis slab
const STEP_H = 0.025;
const TOP_Y = ROCK_H + STEP_H * 3; // stylobate surface
const COL_H = 0.2;
const CAP_H = 0.012;
const ENTAB_H = 0.045;
const ENTAB_Y = TOP_Y + COL_H + CAP_H; // entablature bottom
const PED_Y = ENTAB_Y + ENTAB_H; // pediment bottom
const PED_B = 0.144; // pediment half-base (z)
const PED_H = 0.06; // pediment apex height
const PED_D = 0.044; // pediment depth (x)

const xAt = (i: number) => (i - (NX - 1) / 2) * SX;
const zAt = (j: number) => (j - (NZ - 1) / 2) * SZ;

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

/** Pediment piece from a 2D outline in the z/y plane, extruded along x. */
function pediment(
  outline: [number, number][],
  m: MeshLambertMaterial,
  xCenter: number
): Mesh {
  const s = new Shape();
  outline.forEach(([u, v], k) => (k === 0 ? s.moveTo(u, v) : s.lineTo(u, v)));
  const geo = new ExtrudeGeometry(s, { depth: PED_D, bevelEnabled: false });
  const mesh = new Mesh(geo, m);
  mesh.rotation.y = Math.PI / 2;
  mesh.position.set(xCenter - PED_D / 2, PED_Y, 0);
  return mesh;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.372));

  const marble = mat("#e7dec9"); // weathered Pentelic marble
  const marbleLit = mat(TONES.white); // entablature + pediments
  const step = mat("#cfc3ab"); // crepidoma, a shade deeper than the shafts
  const broken = mat(TONES.stoneDark); // stubs, break faces
  const inner = mat("#c9bb9f"); // cella wall remnants
  const rock = mat(TONES.sand); // Acropolis ground

  // Rectangular Acropolis rock terrace under the crepidoma.
  g.add(box(0.635, ROCK_H, 0.375, rock, 0, 0.012 + ROCK_H / 2, 0));
  // Worn sandy patches on the plaza around the temple.
  const patches: [number, number, number, number][] = [
    [0.3, 0.09, 0.11, 0.08],
    [-0.3, 0.02, 0.09, 0.13],
    [0.02, 0.25, 0.14, 0.07],
    [-0.1, -0.25, 0.11, 0.06],
  ];
  patches.forEach(([x, z, w, d]) =>
    g.add(box(w, 0.006, d, rock, x, 0.015, z))
  );

  // Three-step crepidoma.
  const stepDims: [number, number][] = [
    [0.635, 0.375],
    [0.6, 0.34],
    [0.565, 0.305],
  ];
  stepDims.forEach(([w, d], k) =>
    g.add(box(w, STEP_H, d, step, 0, ROCK_H + STEP_H * (k + 0.5), 0))
  );

  // Peristyle: full columns + capitals; picturesque gaps on the front flank.
  const shaftGeo = new CylinderGeometry(0.011, 0.0135, COL_H, 7);
  const capGeo = new BoxGeometry(0.031, CAP_H, 0.031);
  // Front flank (j = NZ-1) ruin plan: stub heights by column index, -1 = gone.
  const frontState: Record<number, number> = { 5: 0.07, 6: -1, 7: 0.045, 8: 0.1 };

  const addColumn = (x: number, z: number) => {
    const shaft = new Mesh(shaftGeo, marble);
    shaft.position.set(x, TOP_Y + COL_H / 2, z);
    g.add(shaft);
    const cap = new Mesh(capGeo, marble);
    cap.position.set(x, TOP_Y + COL_H + CAP_H / 2, z);
    g.add(cap);
  };
  const addStub = (x: number, z: number, h: number) => {
    const stub = new Mesh(new CylinderGeometry(0.012, 0.0135, h, 7), broken);
    stub.position.set(x, TOP_Y + h / 2, z);
    g.add(stub);
  };

  for (let i = 0; i < NX; i++) {
    for (let j = 0; j < NZ; j++) {
      const perimeter = i === 0 || i === NX - 1 || j === 0 || j === NZ - 1;
      if (!perimeter) continue;
      const x = xAt(i);
      const z = zAt(j);
      if (j === NZ - 1 && i > 0 && i < NX - 1 && i in frontState) {
        const h = frontState[i];
        if (h > 0) addStub(x, z, h);
        continue;
      }
      addColumn(x, z);
    }
  }

  // Entablature (architrave + frieze as one band).
  const beamW = 0.036;
  const beamY = ENTAB_Y + ENTAB_H / 2;
  const endSpan = zAt(NZ - 1) - zAt(0) + beamW; // facade beams
  g.add(box(beamW, ENTAB_H, endSpan, marbleLit, xAt(0), beamY, 0));
  g.add(box(beamW, ENTAB_H, endSpan, marbleLit, xAt(NX - 1), beamY, 0));
  const flankSpan = xAt(NX - 1) - xAt(0) + beamW;
  g.add(box(flankSpan, ENTAB_H, beamW, marbleLit, 0, beamY, zAt(0))); // rear: intact
  // Front flank: only the two surviving runs (over columns 0-4 and 9-13).
  const runA0 = xAt(0) - beamW / 2;
  const runA1 = xAt(4) + beamW / 2;
  g.add(box(runA1 - runA0, ENTAB_H, beamW, marbleLit, (runA0 + runA1) / 2, beamY, zAt(NZ - 1)));
  const runB0 = xAt(9) - beamW / 2;
  const runB1 = xAt(NX - 1) + beamW / 2;
  g.add(box(runB1 - runB0, ENTAB_H, beamW, marbleLit, (runB0 + runB1) / 2, beamY, zAt(NZ - 1)));

  // West pediment (-x): near-complete triangle.
  g.add(
    pediment(
      [
        [-PED_B, 0],
        [PED_B, 0],
        [0, PED_H],
        [-PED_B, 0],
      ],
      marbleLit,
      -xAt(NX - 1)
    )
  );
  // East pediment (+x): two raking corner wedges with the centre lost.
  const wedgeX = 0.055;
  const wedgeTopY = PED_H * (1 - wedgeX / PED_B);
  g.add(
    pediment(
      [
        [-PED_B, 0],
        [-wedgeX, 0],
        [-wedgeX, wedgeTopY],
        [-PED_B, 0],
      ],
      marbleLit,
      xAt(NX - 1)
    )
  );
  g.add(
    pediment(
      [
        [wedgeX, 0],
        [PED_B, 0],
        [wedgeX, wedgeTopY],
        [wedgeX, 0],
      ],
      marbleLit,
      xAt(NX - 1)
    )
  );

  // Ruined cella wall fragments (heights above the stylobate).
  const walls: [number, number, number, number][] = [
    // [xCenter, zCenter, length, height]
    [-0.09, -0.07, 0.15, 0.13],
    [0.05, -0.07, 0.1, 0.07],
    [0.16, -0.07, 0.06, 0.04],
    [-0.04, 0.07, 0.12, 0.1],
    [0.1, 0.07, 0.08, 0.055],
  ];
  walls.forEach(([x, z, len, h]) =>
    g.add(box(len, h, 0.016, inner, x, TOP_Y + h / 2, z))
  );
  // West cross wall with door reading as two piers.
  g.add(box(0.016, 0.14, 0.06, inner, -0.17, TOP_Y + 0.07, -0.04));
  g.add(box(0.016, 0.14, 0.06, inner, -0.17, TOP_Y + 0.07, 0.04));

  // Fallen drums + blocks on the rock around the temple.
  const drumGeo = new CylinderGeometry(0.012, 0.012, 0.034, 7);
  const drumSpots: [number, number, number][] = [
    [0.29, 0.1, 0.4],
    [-0.28, 0.13, 1.2],
    [0.07, 0.245, 2.0],
    [-0.12, -0.245, 0.9],
  ];
  drumSpots.forEach(([x, z, spin]) => {
    const d = new Mesh(drumGeo, broken);
    d.rotation.set(Math.PI / 2, 0, spin);
    d.position.set(x, 0.012 + 0.012, z);
    g.add(d);
  });
  const blockSpots: [number, number, number][] = [
    [0.32, -0.05, 0.5],
    [-0.31, -0.09, 1.4],
    [0.2, 0.23, 0.2],
  ];
  blockSpots.forEach(([x, z, rot]) => {
    const b = box(0.032, 0.02, 0.024, broken, x, 0.012 + 0.01, z);
    b.rotation.y = rot;
    g.add(b);
  });

  return g;
}
