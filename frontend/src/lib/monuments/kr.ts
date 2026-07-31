// 경복궁 근정전 (Geunjeongjeon, Gyeongbokgung) — papercraft miniature.
// Two-tier stone terrace, red column row, double hip-and-gable roof with
// generous eave overhang, upturned corners and white yangseong ridges.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
  Vector3,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;
const LATTICE = "#5d7a68"; // muted dancheong-green door lattice

/** Rectangular hip-roof frustum: eave half-extents (hx, hz), height h,
 *  taper ratio t (top = t * bottom). Base sits at y = 0 of the mesh. */
function hipFrustum(hx: number, hz: number, h: number, t: number, color: string): Mesh {
  const geo = new CylinderGeometry(t * SQ2, SQ2, 1, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, 0.5, 0);
  const m = new Mesh(geo, mat(color));
  m.scale.set(hx, h, hz);
  return m;
}

/** Gabled ridge slab (paljak upper section): ridge runs along X.
 *  halfLen along X, halfDepth at base along Z, height h, small flat top. */
function gableSlab(halfLen: number, halfDepth: number, h: number, color: string): Mesh {
  const s = new Shape();
  s.moveTo(-halfDepth, 0);
  s.lineTo(halfDepth, 0);
  s.lineTo(0.18 * halfDepth, h);
  s.lineTo(-0.18 * halfDepth, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: halfLen * 2, bevelEnabled: false });
  geo.translate(0, 0, -halfLen);
  geo.rotateY(Math.PI / 2);
  return new Mesh(geo, mat(color));
}

/** White ridge cap laid along an arbitrary roof edge p0 → p1. */
function ridgeCap(p0: Vector3, p1: Vector3, w: number, thick: number): Group {
  const grp = new Group();
  grp.position.copy(p0);
  grp.lookAt(p1); // non-camera objects aim local +Z at the target
  const len = p0.distanceTo(p1);
  const m = new Mesh(new BoxGeometry(w, thick, len + 0.02), mat(TONES.white));
  m.position.z = len / 2;
  grp.add(m);
  return grp;
}

/** Upturned eave-corner wing at (cx, y, cz): rides up the hip line with its
 *  tip kicking just past the corner (keeps the 0.75 footprint budget). */
function eaveWing(cx: number, y: number, cz: number, len: number, color: string): Group {
  const g = new Group();
  g.position.set(cx, y, cz);
  g.rotation.y = Math.atan2(cx, cz) - Math.PI / 2; // +x of group points outward
  const wing = new Mesh(new BoxGeometry(len, 0.014, 0.05), mat(color));
  wing.position.x = -len * 0.3; // mostly inboard, tip ~len*0.2 past the corner
  wing.rotation.z = 0.45; // outward end swings up
  g.add(wing);
  return g;
}

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

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  // ---- two-tier stone terrace (woldae) ----
  g.add(box(0.58, 0.1, 0.38, 0, 0.05, 0, TONES.stoneDark));
  g.add(box(0.48, 0.09, 0.3, 0, 0.145, 0, TONES.stoneDark));

  // balustrade rails on both tiers
  const rail = (w: number, d: number, y: number) => {
    g.add(box(w, 0.03, 0.018, 0, y, d / 2 - 0.009, TONES.stone));
    g.add(box(w, 0.03, 0.018, 0, y, -(d / 2 - 0.009), TONES.stone));
    g.add(box(0.018, 0.03, d - 0.036, w / 2 - 0.009, y, 0, TONES.stone));
    g.add(box(0.018, 0.03, d - 0.036, -(w / 2 - 0.009), y, 0, TONES.stone));
  };
  rail(0.58, 0.38, 0.115);
  rail(0.48, 0.3, 0.205);

  // front stairs (south, +Z)
  g.add(box(0.17, 0.05, 0.07, 0, 0.025, 0.225, TONES.stone));
  g.add(box(0.17, 0.05, 0.035, 0, 0.075, 0.2075, TONES.stone));
  g.add(box(0.14, 0.045, 0.055, 0, 0.1225, 0.1775, TONES.stone));
  g.add(box(0.14, 0.045, 0.028, 0, 0.1675, 0.164, TONES.stone));

  // ---- hall body: green lattice infill behind red columns ----
  g.add(box(0.37, 0.25, 0.23, 0, 0.315, 0, LATTICE));

  const colGeo = new CylinderGeometry(0.016, 0.018, 0.25, 6);
  const colMat = mat(TONES.woodRed);
  const colXs = [-0.2, -0.12, -0.04, 0.04, 0.12, 0.2];
  for (const x of colXs) {
    for (const z of [0.125, -0.125]) {
      const c = new Mesh(colGeo, colMat);
      c.position.set(x, 0.315, z);
      g.add(c);
    }
  }
  for (const z of [-0.042, 0.042]) {
    for (const x of [-0.2, 0.2]) {
      const c = new Mesh(colGeo, colMat);
      c.position.set(x, 0.315, z);
      g.add(c);
    }
  }

  // red lintel beam + dancheong band under the lower eave
  g.add(box(0.43, 0.028, 0.28, 0, 0.454, 0, TONES.woodRed));
  g.add(box(0.41, 0.024, 0.26, 0, 0.48, 0, TONES.roofGreen));

  // ---- lower roof: wide hipped skirt, generous overhang ----
  const lowerRoof = hipFrustum(0.31, 0.2, 0.1, 0.6, TONES.roofTeal);
  lowerRoof.position.y = 0.487;
  g.add(lowerRoof);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      g.add(eaveWing(sx * 0.3, 0.492, sz * 0.191, 0.075, TONES.roofTeal));
      // white hip ridge cap on the lower roof corner edge
      g.add(
        ridgeCap(
          new Vector3(sx * 0.302, 0.497, sz * 0.195),
          new Vector3(sx * 0.188, 0.592, sz * 0.122),
          0.016,
          0.013
        )
      );
    }

  // ---- upper storey band (short: the two roofs sit close together) ----
  g.add(box(0.35, 0.08, 0.21, 0, 0.615, 0, LATTICE));
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      g.add(box(0.022, 0.08, 0.022, sx * 0.168, 0.615, sz * 0.1, TONES.woodRed));
  g.add(box(0.37, 0.024, 0.23, 0, 0.664, 0, TONES.woodRed));

  // ---- upper roof: hipped skirt + broad, shallower gable ridge section ----
  const upperSkirt = hipFrustum(0.285, 0.185, 0.095, 0.55, TONES.roofTeal);
  upperSkirt.position.y = 0.652;
  g.add(upperSkirt);
  const gable = gableSlab(0.168, 0.118, 0.14, TONES.roofTeal);
  gable.position.y = 0.722;
  g.add(gable);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      g.add(eaveWing(sx * 0.275, 0.657, sz * 0.176, 0.07, TONES.roofTeal));
      // white naerimmaru: descending ridge along each gable edge
      g.add(
        ridgeCap(
          new Vector3(sx * 0.169, 0.732, sz * 0.113),
          new Vector3(sx * 0.169, 0.86, sz * 0.024),
          0.016,
          0.013
        )
      );
      // white chunyeomaru: continues down the skirt hip to the eave corner
      g.add(
        ridgeCap(
          new Vector3(sx * 0.16, 0.744, sz * 0.104),
          new Vector3(sx * 0.272, 0.66, sz * 0.176),
          0.016,
          0.013
        )
      );
    }

  // ---- white yangseong main ridge + chwidu end horns ----
  g.add(box(0.35, 0.03, 0.04, 0, 0.874, 0, TONES.white));
  g.add(box(0.028, 0.046, 0.044, 0.168, 0.888, 0, TONES.white));
  g.add(box(0.028, 0.046, 0.044, -0.168, 0.888, 0, TONES.white));

  return g;
}
