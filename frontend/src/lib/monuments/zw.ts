// Great Zimbabwe — papercraft: the solid Conical Tower rising out of the
// curved Great Enclosure wall. Both are built from stacked mortarless
// granite courses, each course stepping in slightly so the horizontal joint
// lines read; an inner arc runs parallel to the wall as the narrow passage.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const D2R = Math.PI / 180;
const GRANITE = "#b6a992"; // weathered grey-brown granite
const GRANITE_D = "#9b8e78"; // shaded course

/** One dry-stone course: annular wall band over an arc. */
function course(
  rIn: number,
  rOut: number,
  y0: number,
  y1: number,
  color: string,
  seg: number,
  phiStart: number,
  phiLen: number
): Mesh {
  const pts = [
    new Vector2(rOut, y0),
    new Vector2(rOut, y1),
    new Vector2(rIn, y1),
    new Vector2(rIn, y0),
    new Vector2(rOut, y0),
  ];
  return new Mesh(new LatheGeometry(pts, seg, phiStart, phiLen), mat(color));
}

/** Cap the open cross-section where a wall arc terminates. */
function wallEnd(deg: number, radius: number, h: number, thick: number): Mesh {
  const m = new Mesh(new BoxGeometry(0.014, h, thick), mat(GRANITE_D));
  const a = deg * D2R;
  m.position.set(Math.sin(a) * radius, h / 2, Math.cos(a) * radius);
  m.rotation.y = a;
  return m;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.375));

  // The enclosure is a squashed circle, so the ruin lives in a z-scaled
  // group (footprint 0.74 x 0.64).
  const enc = new Group();
  enc.scale.z = 0.87;
  g.add(enc);

  // Trodden earth floor inside the enclosure.
  const floor = new Mesh(
    new CylinderGeometry(0.3, 0.3, 0.022, 30),
    mat("#c9bca6")
  );
  floor.position.y = 0.011;
  enc.add(floor);

  // ---- Great Enclosure wall: battered courses whose arcs shorten with
  //      height, so the crest steps down toward the entrance gap. ----
  const outer: Array<[number, number, number, number, string, number, number]> =
    [
      [0.29, 0.372, 0.0, 0.076, GRANITE, 30, 330],
      [0.297, 0.366, 0.076, 0.142, GRANITE_D, 38, 322],
      [0.304, 0.359, 0.142, 0.206, GRANITE, 52, 308],
      [0.311, 0.352, 0.206, 0.27, GRANITE_D, 70, 290],
    ];
  for (const [rIn, rOut, y0, y1, c, d0, d1] of outer) {
    const seg = Math.max(6, Math.round((d1 - d0) / 12));
    enc.add(course(rIn, rOut, y0, y1, c, seg, d0 * D2R, (d1 - d0) * D2R));
    for (const d of [d0, d1]) {
      const cap = new Mesh(
        new BoxGeometry(0.013, y1 - y0, rOut - rIn),
        mat(GRANITE_D)
      );
      const a = d * D2R;
      const r = (rIn + rOut) / 2;
      cap.position.set(Math.sin(a) * r, (y0 + y1) / 2, Math.cos(a) * r);
      cap.rotation.y = a;
      enc.add(cap);
    }
  }

  // ---- Inner wall: parallel arc leaving a narrow passage behind it ----
  const IN_START = 200 * D2R;
  const IN_LEN = 100 * D2R;
  const inner: Array<[number, number, number, number, string]> = [
    [0.226, 0.268, 0.0, 0.07, GRANITE],
    [0.23, 0.263, 0.07, 0.132, GRANITE_D],
    [0.234, 0.258, 0.132, 0.186, GRANITE],
  ];
  for (const [rIn, rOut, y0, y1, c] of inner)
    enc.add(course(rIn, rOut, y0, y1, c, 11, IN_START, IN_LEN));
  enc.add(wallEnd(200, 0.247, 0.186, 0.046));
  enc.add(wallEnd(300, 0.247, 0.186, 0.046));

  // ---- Conical Tower: fat, solid, strongly tapered, stacked courses ----
  const tower = new Group();
  tower.position.set(0.135, 0, -0.055);
  const drums: Array<[number, number, number, number, string]> = [
    [0.118, 0.108, 0.0, 0.042, GRANITE_D], // splayed footing course
    [0.106, 0.098, 0.042, 0.145, GRANITE],
    [0.096, 0.088, 0.145, 0.245, GRANITE_D],
    [0.086, 0.079, 0.245, 0.34, GRANITE],
    [0.077, 0.071, 0.34, 0.425, GRANITE_D],
    [0.069, 0.064, 0.425, 0.5, GRANITE],
    [0.063, 0.061, 0.5, 0.545, GRANITE_D], // eroded flat crown
  ];
  for (const [rb, rt, y0, y1, c] of drums) {
    const d = new Mesh(new CylinderGeometry(rt, rb, y1 - y0, 16, 1), mat(c));
    d.position.y = (y0 + y1) / 2;
    tower.add(d);
  }
  enc.add(tower);

  // ---- Sparse green tufts at the footings ----
  const tuftGeo = new ConeGeometry(0.026, 0.04, 6);
  const tuftMat = mat(TONES.forest);
  const tufts: Array<[number, number]> = [
    [0.31, 0.16],
    [-0.28, 0.2],
    [-0.35, -0.07],
    [0.19, -0.28],
    [0.02, 0.27],
    [-0.13, -0.19],
  ];
  for (const [x, z] of tufts) {
    const t = new Mesh(tuftGeo, tuftMat);
    t.position.set(x, 0.02, z);
    g.add(t);
  }

  return g;
}
