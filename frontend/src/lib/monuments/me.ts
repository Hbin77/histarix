// Manastir Ostrog — papercraft: a whitewashed monastery wedged into a shallow
// alcove of a near-vertical grey cliff, its two arcaded gallery levels and
// bell tower framed by rock that bulges below and overhangs above.
// Cliff landform: its own terrain base, no plaza disc.

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

const ROCK = "#b7b1a6"; // muted grey limestone
const ROCK_DK = "#a29b8f";
const ROCK_WARM = "#b3a691"; // faint iron staining
const WHITE = TONES.white;
const WHITE_SH = "#ddd8ce";
const SLATE = "#8e97a3";
const DARK = "#5f5a52"; // arcade openings

const CF = 0.55; // centre of the arcs that shape the cliff face
const BACK_Z = -0.24;

const LEDGE = 0.33; // monastery floor
const ALCOVE_TOP = 0.62;

function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  m: MeshLambertMaterial
): Mesh {
  const b = new Mesh(new BoxGeometry(w, h, d), m);
  b.position.set(x, y + h / 2, z);
  return b;
}

/** Depth of the cliff face at x, for an arc of radius rf struck from (0, CF). */
function faceZ(rf: number, x: number): number {
  return CF - Math.sqrt(rf * rf - x * x);
}

/**
 * A horizontal slice of cliff. The front edge is an arc struck from (0, CF)
 * — in front of the rock — so it reads concave; a smaller radius pushes the
 * face out toward the viewer, a larger one hollows it back.
 */
function cliffSlab(
  rf: number,
  halfW: number,
  y0: number,
  h: number,
  m: MeshLambertMaterial
): Mesh {
  const s = new Shape();
  const N = 16;
  for (let i = 0; i <= N; i++) {
    const x = -halfW + (2 * halfW * i) / N;
    if (i === 0) s.moveTo(x, -faceZ(rf, x));
    else s.lineTo(x, -faceZ(rf, x));
  }
  s.lineTo(halfW * 0.86, -BACK_Z);
  s.lineTo(-halfW * 0.86, -BACK_Z);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: h, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, y0, 0);
  return new Mesh(geo, m);
}

/** Round-headed opening: a dark slot with a half-cylinder head. */
function opening(w: number, h: number, m: MeshLambertMaterial): Group {
  const g = new Group();
  const r = w / 2;
  g.add(box(w, h, 0.014, 0, 0, 0, m));
  const head = new Mesh(
    new CylinderGeometry(r, r, 0.014, 8, 1, false, Math.PI / 2, Math.PI),
    m
  );
  head.geometry.rotateX(Math.PI / 2);
  head.position.y = h;
  g.add(head);
  return g;
}

/** A gallery storey: white wall pierced by a row of arcade openings. */
function gallery(
  w: number,
  h: number,
  d: number,
  count: number,
  archW: number,
  archH: number,
  y: number
): Group {
  const g = new Group();
  g.add(box(w, h, d, 0, y, -0.03, mat(WHITE)));
  const dark = mat(DARK);
  const step = (w - 0.02) / count;
  for (let i = 0; i < count; i++) {
    const o = opening(archW, archH, dark);
    o.position.set(-w / 2 + 0.01 + step * (i + 0.5), y + 0.014, -0.03 + d / 2);
    g.add(o);
  }
  // sill and cornice bands read the storey as a gallery, not a slab
  g.add(box(w + 0.008, 0.006, d + 0.006, 0, y, -0.03, mat(WHITE_SH)));
  g.add(box(w + 0.01, 0.007, d + 0.008, 0, y + h - 0.007, -0.03, mat(WHITE_SH)));
  return g;
}

export function build(): Group {
  const g = new Group();
  const rock = mat(ROCK);
  const rockDk = mat(ROCK_DK);

  // ---- Terrain: scrubby grey-green apron the cliff rises from ----
  const ground = new Mesh(new CylinderGeometry(0.36, 0.36, 0.022, 32), mat("#93997e"));
  ground.position.y = 0.011;
  g.add(ground);
  const scree = new Mesh(new CylinderGeometry(0.26, 0.3, 0.03, 24), mat("#a9a396"));
  scree.position.set(0, 0.026, -0.06);
  g.add(scree);

  // ---- The cliff: bulging buttress, hollowed alcove, overhanging summit ----
  g.add(cliffSlab(0.542, 0.25, 0.02, 0.31, rock));
  g.add(cliffSlab(0.63, 0.238, LEDGE, ALCOVE_TOP - LEDGE, rockDk)); // recessed
  g.add(cliffSlab(0.567, 0.222, ALCOVE_TOP, 0.17, rock)); // overhang
  g.add(cliffSlab(0.6, 0.182, 0.79, 0.09, rockDk));
  g.add(cliffSlab(0.625, 0.126, 0.88, 0.05, rock));

  // weathering: a couple of shallow strata shelves crossing the upper face
  for (const [x, y, w, color] of [
    [-0.04, 0.688, 0.3, ROCK_WARM],
    [0.05, 0.752, 0.22, ROCK_DK],
  ] as const) {
    const shelf = box(w, 0.013, 0.024, x, y, faceZ(0.567, x) + 0.008, mat(color));
    shelf.rotation.set(0, Math.asin(x / 0.567), -0.03);
    g.add(shelf);
  }
  // boulders piled at the foot
  for (const [x, z, s, r] of [
    [-0.24, 0.05, 0.05, 0.4],
    [0.22, 0.07, 0.044, 1.0],
    [-0.06, 0.12, 0.036, 0.7],
    [0.11, 0.11, 0.03, 1.3],
  ] as const) {
    const b = box(s, s * 0.75, s * 0.9, x, 0.022, z, rockDk);
    b.rotation.y = r;
    g.add(b);
  }

  // ---- The monastery, standing on the ledge inside the alcove ----
  const mon = new Group();
  g.add(mon);

  // rough stone terrace it is built out from
  mon.add(box(0.29, 0.026, 0.09, 0.014, LEDGE - 0.026, -0.028, mat("#bdb6a9")));

  mon.add(gallery(0.228, 0.1, 0.074, 6, 0.024, 0.034, LEDGE));
  mon.add(gallery(0.21, 0.094, 0.068, 6, 0.022, 0.032, LEDGE + 0.1));

  // parapet and the two small cupolas above the upper gallery
  const TOP = LEDGE + 0.194;
  mon.add(box(0.218, 0.012, 0.074, 0, TOP, -0.03, mat(WHITE_SH)));
  const cupola = (x: number, s: number) => {
    const c = new Group();
    c.position.set(x, TOP + 0.012, -0.028);
    c.add(box(0.03 * s, 0.026 * s, 0.03 * s, 0, 0, 0, mat(WHITE)));
    const drum = new Mesh(new CylinderGeometry(0.014 * s, 0.014 * s, 0.02 * s, 8), mat(WHITE));
    drum.position.y = 0.036 * s;
    c.add(drum);
    const dome = new Mesh(
      new SphereGeometry(0.016 * s, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2),
      mat(SLATE)
    );
    dome.position.y = 0.046 * s;
    c.add(dome);
    c.add(box(0.0028, 0.016 * s, 0.0028, 0, 0.06 * s, 0, mat(TONES.gold)));
    c.add(box(0.01 * s, 0.0028, 0.0028, 0, 0.068 * s, 0, mat(TONES.gold)));
    return c;
  };
  mon.add(cupola(0.042, 1));
  mon.add(cupola(-0.034, 0.82));

  // ---- Bell tower on the left of the facade, clear of the overhang ----
  const tower = new Group();
  tower.position.set(-0.132, LEDGE, -0.008);
  mon.add(tower);
  tower.add(box(0.07, 0.212, 0.056, 0, 0, 0, mat(WHITE)));
  tower.add(opening(0.024, 0.032, mat(DARK)).translateY(0.138).translateZ(0.028));
  tower.add(box(0.078, 0.008, 0.064, 0, 0.212, 0, mat(WHITE_SH)));
  tower.add(box(0.054, 0.04, 0.046, 0, 0.22, 0, mat(WHITE)));
  const cap = new Mesh(new ConeGeometry(0.045, 0.036, 4), mat(SLATE));
  cap.rotation.y = Math.PI / 4;
  cap.position.y = 0.278;
  tower.add(cap);
  tower.add(box(0.003, 0.02, 0.003, 0, 0.296, 0.006, mat(TONES.gold)));
  tower.add(box(0.012, 0.003, 0.003, 0, 0.305, 0.006, mat(TONES.gold)));

  // ---- The pilgrims' stair, zigzagging up the buttress face ----
  const path = mat("#c9c3b5");
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const x = -0.225 + t * 0.115;
    const y = 0.05 + t * 0.25;
    const s = box(0.1 - t * 0.02, 0.01, 0.026, x, y, faceZ(0.542, x) + 0.012, path);
    s.rotation.set(0, Math.asin(x / 0.542), i % 2 === 0 ? 0.16 : -0.16);
    g.add(s);
  }

  // ---- A few dark cypresses at the cliff foot for scale ----
  const leaf = mat("#5f7a58");
  for (const [x, z, s] of [
    [-0.31, 0.06, 1],
    [0.28, 0.11, 0.85],
    [0.06, 0.19, 0.7],
    [-0.13, 0.2, 0.8],
  ] as const) {
    const t = new Group();
    t.position.set(x, 0.022, z);
    const stem = new Mesh(new CylinderGeometry(0.004, 0.006, 0.02 * s, 5), mat("#7a6a52"));
    stem.position.y = 0.01 * s;
    t.add(stem);
    const crown = new Mesh(new ConeGeometry(0.022 * s, 0.075 * s, 6), leaf);
    crown.position.y = 0.055 * s;
    t.add(crown);
    g.add(t);
  }

  return g;
}
