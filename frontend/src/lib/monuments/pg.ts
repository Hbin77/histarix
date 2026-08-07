// National Parliament House, Port Moresby — papercraft: the huge
// forward-leaning haus tambaran gable, its broad face banded with a mosaic
// of ochre, terracotta and off-white, sweeping up to a pointed finial over
// a low wide base wing.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Shape,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const TERRA = "#b5714f"; // terracotta ground of the mosaic
const OCHRE = "#cb9a58"; // ochre
const BROWN = "#6c4a37"; // deep carved brown
const OFFWHITE = "#eae2d2";
const COURT = "#d9d2c2";

const AP = 0.66; // gable apex height, before it leans forward
const HW = 0.26; // gable half-width at the base
const LEAN = 0.16; // forward tilt, radians
const THICK = 0.1; // gable slab thickness
const GROUND = 0.018;

/** Gable half-width fraction at height fraction t, slightly concave. */
const PROFILE: Array<[number, number]> = [
  [0, 1],
  [0.12, 0.85],
  [0.3, 0.63],
  [0.52, 0.42],
  [0.74, 0.22],
  [0.9, 0.09],
  [1, 0],
];

function widthAt(t: number): number {
  for (let i = 1; i < PROFILE.length; i++) {
    const [t1, w1] = PROFILE[i];
    if (t <= t1) {
      const [t0, w0] = PROFILE[i - 1];
      return HW * (w0 + ((w1 - w0) * (t - t0)) / (t1 - t0));
    }
  }
  return 0;
}

function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  m: MeshLambertMaterial
): Mesh {
  const mesh = new Mesh(new BoxGeometry(w, h, d), m);
  mesh.position.set(x, y, z);
  return mesh;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.355));

  const terra = mat(TERRA);
  const ochre = mat(OCHRE);
  const brown = mat(BROWN);
  const off = mat(OFFWHITE);
  const dark = mat(TONES.ink);

  // ---- forecourt ----
  const court = new Mesh(new CylinderGeometry(0.34, 0.34, GROUND, 26), mat(COURT));
  court.position.y = GROUND / 2;
  g.add(court);

  // ---- low wide base wing behind the gable ----
  g.add(box(0.56, 0.175, 0.21, 0, GROUND + 0.0875, -0.135, off));
  g.add(box(0.58, 0.02, 0.23, 0, GROUND + 0.185, -0.135, brown));
  g.add(box(0.564, 0.022, 0.214, 0, GROUND + 0.134, -0.135, ochre));
  for (let i = -4; i <= 4; i++)
    g.add(box(0.012, 0.1, 0.012, i * 0.062, GROUND + 0.056, -0.032, brown));

  // ---- entrance terrace and steps ----
  g.add(box(0.34, 0.02, 0.115, 0, GROUND + 0.01, 0.14, mat(COURT)));
  g.add(box(0.3, 0.02, 0.09, 0, GROUND + 0.03, 0.128, off));

  // ---- the gable ----
  const gable = new Group();
  gable.position.set(0, GROUND, -0.015);
  gable.rotation.x = LEAN; // apex swings forward over the entrance
  g.add(gable);

  const s = new Shape();
  s.moveTo(-HW, 0);
  for (let i = 1; i < PROFILE.length; i++) {
    const [t, w] = PROFILE[i];
    s.lineTo(-HW * w, t * AP);
  }
  for (let i = PROFILE.length - 2; i >= 0; i--) {
    const [t, w] = PROFILE[i];
    s.lineTo(HW * w, t * AP);
  }
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: THICK, bevelEnabled: false });
  geo.translate(0, 0, -THICK / 2);
  gable.add(new Mesh(geo, terra));

  // patterned mosaic bands marching up the face
  const FACE = THICK / 2 + 0.007;
  const bands: Array<[number, MeshLambertMaterial]> = [
    [0.115, ochre],
    [0.275, off],
    [0.435, ochre],
    [0.6, off],
    [0.76, ochre],
  ];
  for (const [t, tone] of bands) {
    const w = widthAt(t) * 1.86;
    gable.add(box(w, 0.046, 0.013, 0, t * AP, FACE, tone));
    gable.add(box(w + 0.008, 0.008, 0.015, 0, t * AP - 0.027, FACE, brown));
    gable.add(box(w + 0.008, 0.008, 0.015, 0, t * AP + 0.027, FACE, brown));
    const n = Math.max(2, Math.round(w / 0.052));
    for (let k = 0; k <= n; k++)
      gable.add(box(0.008, 0.046, 0.016, -w / 2 + (k * w) / n, t * AP, FACE, brown));
  }

  // central spine and the pointed apex ornament
  gable.add(box(0.02, AP * 0.9, 0.011, 0, AP * 0.45, FACE, brown));
  const apexOrn = new Mesh(new ConeGeometry(0.03, 0.075, 4), ochre);
  apexOrn.rotation.y = Math.PI / 4;
  apexOrn.position.set(0, AP + 0.03, 0);
  gable.add(apexOrn);
  const spire = new Mesh(new CylinderGeometry(0.0035, 0.008, 0.062, 5), brown);
  spire.position.set(0, AP + 0.094, 0);
  gable.add(spire);

  // deep shadowed entrance recess and its posts
  gable.add(box(0.215, 0.135, 0.02, 0, 0.068, FACE - 0.005, dark));
  for (const x of [-0.195, -0.1, 0.1, 0.195])
    gable.add(box(0.018, 0.14, 0.016, x, 0.07, FACE - 0.008, brown));
  for (const x of [-0.05, 0.05])
    gable.add(box(0.014, 0.135, 0.014, x, 0.068, FACE - 0.002, ochre));

  return g;
}
