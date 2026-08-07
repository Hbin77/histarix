// The Cotton Tree (Freetown) — papercraft: one massive kapok. Pale-grey trunk
// flaring into wide buttress roots, a few heavy horizontal limbs carrying a
// broad umbrella crown, with tiny rooftops huddled at its foot for scale.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  Shape,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const BARK = "#bab7ac"; // pale grey kapok bark
const BARK_D = "#a09d91"; // shaded bark, buttress flanks
const LEAF = "#7a976c"; // sunlit canopy
const LEAF_D = "#64855a"; // shaded canopy lobes
const EARTH = "#b3a289"; // trodden ground round the roots

const TRUNK_TOP = 0.605;

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

/** One buttress root: a tall triangular fin standing radially off the trunk. */
function buttress(deg: number, reach: number, rise: number, thick: number): Mesh {
  const s = new Shape();
  s.moveTo(0.02, 0);
  s.lineTo(reach, 0);
  s.lineTo(reach * 0.34, rise * 0.52);
  s.lineTo(0.02, rise);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: thick, bevelEnabled: false });
  geo.translate(0, 0, -thick / 2);
  const m = new Mesh(geo, mat(BARK_D));
  m.rotation.y = (deg * Math.PI) / 180;
  return m;
}

/** Heavy limb reaching out and slightly up from the crotch of the trunk. */
function limb(deg: number, len: number, lift: number): Mesh {
  const geo = new CylinderGeometry(0.011, 0.021, len, 6);
  geo.rotateZ(Math.PI / 2); // lay it along +x
  geo.translate(len / 2, 0, 0);
  const m = new Mesh(geo, mat(BARK));
  m.rotation.y = (deg * Math.PI) / 180;
  m.rotation.z = lift;
  return m;
}

/** Flattened canopy lobe. */
function lobe(
  r: number,
  flat: number,
  x: number,
  y: number,
  z: number,
  m: MeshLambertMaterial
): Mesh {
  const mesh = new Mesh(new SphereGeometry(r, 12, 5), m);
  mesh.scale.y = flat;
  mesh.position.set(x, y, z);
  return mesh;
}

/** Tiny gabled rooftop, for scale against the tree. */
function roof(w: number, d: number, h: number, wall: string): Group {
  const g = new Group();
  g.add(box(w, h * 0.55, d, 0, h * 0.275, 0, wall));
  const s = new Shape();
  s.moveTo(-w * 0.58, 0);
  s.lineTo(w * 0.58, 0);
  s.lineTo(0, h * 0.5);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: d * 1.1, bevelEnabled: false });
  geo.translate(0, h * 0.55, -(d * 1.1) / 2);
  g.add(new Mesh(geo, mat(TONES.slate)));
  return g;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.33));

  // trodden earth ring the roots grip
  const ground = new Mesh(new CylinderGeometry(0.2, 0.21, 0.014, 22), mat(EARTH));
  ground.position.y = 0.012;
  g.add(ground);

  // ---- trunk: broad at the root swell, near-cylindrical above ----
  const trunk = new Mesh(
    new LatheGeometry(
      [
        new Vector2(0.102, 0.014),
        new Vector2(0.076, 0.075),
        new Vector2(0.063, 0.16),
        new Vector2(0.056, 0.31),
        new Vector2(0.054, 0.46),
        new Vector2(0.06, 0.558),
        new Vector2(0.05, TRUNK_TOP),
      ],
      14
    ),
    mat(BARK)
  );
  g.add(trunk);

  // ---- buttress roots flaring out round the base ----
  for (const [deg, reach, rise, thick] of [
    [10, 0.183, 0.255, 0.034],
    [68, 0.158, 0.216, 0.03],
    [126, 0.19, 0.272, 0.036],
    [186, 0.15, 0.2, 0.029],
    [242, 0.178, 0.248, 0.034],
    [304, 0.164, 0.226, 0.031],
  ] as const) {
    const b = buttress(deg, reach, rise, thick);
    b.position.y = 0.014;
    g.add(b);
  }

  // ---- heavy horizontal limbs carrying the crown ----
  for (const [deg, len, lift, y] of [
    [15, 0.18, 0.26, 0.552],
    [95, 0.155, 0.32, 0.572],
    [168, 0.19, 0.22, 0.547],
    [242, 0.148, 0.36, 0.577],
    [300, 0.168, 0.28, 0.562],
  ] as const) {
    const l = limb(deg, len, lift);
    l.position.y = y;
    g.add(l);
  }

  // ---- umbrella crown: one broad flat canopy plus lobes round the rim ----
  const leaf = mat(LEAF);
  const leafD = mat(LEAF_D);
  // shaded soffit disc — gives the crown its flat umbrella underside
  const soffit = new Mesh(new CylinderGeometry(0.272, 0.238, 0.026, 16), leafD);
  soffit.position.y = 0.703;
  g.add(soffit);
  g.add(lobe(0.295, 0.34, 0, 0.775, 0, leaf));
  for (const [deg, r, flat, rr, y] of [
    [30, 0.118, 0.38, 0.208, 0.747],
    [104, 0.1, 0.42, 0.216, 0.763],
    [172, 0.126, 0.36, 0.198, 0.737],
    [248, 0.106, 0.4, 0.212, 0.755],
    [318, 0.112, 0.38, 0.204, 0.743],
  ] as const) {
    const a = (deg * Math.PI) / 180;
    g.add(lobe(r, flat, Math.sin(a) * rr, y, Math.cos(a) * rr, leafD));
  }
  // a lighter crest riding the top of the canopy
  g.add(lobe(0.16, 0.36, -0.022, 0.827, 0.016, leaf));

  // ---- tiny rooftops huddled under the canopy ----
  for (const [x, z, w, d, h, ry, wall] of [
    [0.255, 0.145, 0.072, 0.056, 0.058, 0.35, TONES.white],
    [-0.205, 0.235, 0.062, 0.048, 0.05, -0.22, TONES.sand],
    [-0.285, -0.06, 0.056, 0.046, 0.046, 0.9, TONES.white],
    [0.125, -0.265, 0.065, 0.05, 0.053, 0.15, TONES.stone],
  ] as const) {
    const r = roof(w, d, h, wall);
    r.position.set(x, 0.012, z);
    r.rotation.y = ry;
    g.add(r);
  }

  return g;
}
