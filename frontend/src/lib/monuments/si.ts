// Lake Bled — papercraft miniature: oval alpine lake ringed by a forested
// shore, teardrop island carrying the Assumption church (white nave, slender
// white bell tower with dark spire), stone stair down to the water, and the
// castle crag rising behind the far shore. Natural landform: no plaza disc.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const PINE = "#5f7a54"; // muted conifer green (darker than TONES.forest)
const SX = 1.08; // lake oval stretch west–east
const SZ = 0.9;
const WATER_Y = 0.026;
const ISLE_TOP = 0.056;

function box(
  w: number, h: number, d: number,
  x: number, y: number, z: number,
  color: string
): Mesh {
  const m = new Mesh(new BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z);
  return m;
}

function cone(
  r: number, h: number,
  x: number, y: number, z: number,
  color: string, seg = 7
): Mesh {
  const m = new Mesh(new ConeGeometry(r, h, seg), mat(color));
  m.position.set(x, y, z);
  return m;
}

/** Gabled roof prism, ridge along X, base at local y = 0. */
function gable(halfLen: number, halfDepth: number, h: number, color: string): Mesh {
  const s = new Shape();
  s.moveTo(-halfDepth, 0);
  s.lineTo(halfDepth, 0);
  s.lineTo(0, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: halfLen * 2, bevelEnabled: false });
  geo.translate(0, 0, -halfLen);
  geo.rotateY(Math.PI / 2);
  return new Mesh(geo, mat(color));
}

/** Teardrop plate: round head radius rHead at origin, tip at +x = tipX,
 *  extruded to `depth` thick, lying flat with base at y = 0. */
function teardrop(rHead: number, tipX: number, depth: number, color: string): Mesh {
  const tang = Math.acos(rHead / tipX);
  const s = new Shape();
  s.absarc(0, 0, rHead, tang, Math.PI * 2 - tang, false);
  s.lineTo(tipX, 0);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 12 });
  geo.rotateX(-Math.PI / 2);
  return new Mesh(geo, mat(color));
}

/** Organic coastline: radial + crest-height wobble on the outer shore rings.
 *  Integer sine frequencies keep the lathe seam continuous. */
function jitterCoast(mesh: Mesh): void {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r0 = Math.hypot(x, z);
    if (r0 < 1e-5) continue;
    const t = Math.min(Math.max((r0 - 0.26) / (0.315 - 0.26), 0), 1);
    if (t === 0) continue;
    const a = Math.atan2(z, x);
    const f =
      1 +
      t *
        (0.035 * Math.sin(2 * a + 1.1) +
          0.025 * Math.sin(3 * a + 2.4) +
          0.02 * Math.sin(5 * a + 0.7));
    let ny = y;
    if (y > 0.03)
      ny = y + t * (0.011 * Math.sin(4 * a + 0.5) + 0.008 * Math.sin(7 * a + 2.0));
    pos.setXYZ(i, (x / r0) * r0 * f, ny, (z / r0) * r0 * f);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

export function build(): Group {
  const g = new Group();

  // ---- shore ring: green rim rising to an irregular crest, dipping to the
  //      waterline and tucking under the lake surface ----
  const shorePts = [
    new Vector2(0.315, 0),
    new Vector2(0.312, 0.02),
    new Vector2(0.3, 0.04),
    new Vector2(0.285, 0.055),
    new Vector2(0.268, 0.04),
    new Vector2(0.25, 0.03),
    new Vector2(0.235, 0.012),
  ];
  const shore = new Mesh(new LatheGeometry(shorePts, 48), mat(TONES.forest));
  jitterCoast(shore);
  shore.scale.set(SX, 1, SZ);
  g.add(shore);

  // ---- lake surface ----
  const water = new Mesh(
    new CylinderGeometry(0.255, 0.255, WATER_Y, 48),
    mat(TONES.water)
  );
  water.position.y = WATER_Y / 2;
  water.scale.set(SX, 1, SZ);
  g.add(water);

  // ---- teardrop island + church (grouped so it rotates as one) ----
  const isle = new Group();
  isle.position.set(-0.055, 0, 0.025);
  isle.rotation.y = 0.5;
  g.add(isle);

  // stone retaining wall band + green crown
  const wall = teardrop(0.082, 0.15, 0.042, TONES.stone);
  wall.position.y = 0.004;
  isle.add(wall);
  const crown = teardrop(0.082, 0.15, 0.016, TONES.forest);
  crown.scale.set(0.93, 1, 0.93);
  crown.position.y = 0.042;
  isle.add(crown);

  // famous stair from the water up the south wall
  isle.add(box(0.036, 0.042, 0.018, 0, 0.025, 0.089, TONES.white));
  isle.add(box(0.036, 0.028, 0.018, 0, 0.02, 0.105, TONES.white));
  isle.add(box(0.036, 0.016, 0.018, 0, 0.019, 0.121, TONES.white));

  // church nave + roof + apse
  isle.add(box(0.09, 0.052, 0.05, 0.016, ISLE_TOP + 0.026, -0.004, TONES.white));
  const naveRoof = gable(0.05, 0.029, 0.032, TONES.brick);
  naveRoof.position.set(0.016, ISLE_TOP + 0.052, -0.004);
  isle.add(naveRoof);
  const apse = new Mesh(new CylinderGeometry(0.018, 0.018, 0.038, 10), mat(TONES.white));
  apse.position.set(0.066, ISLE_TOP + 0.019, -0.004);
  isle.add(apse);
  isle.add(cone(0.02, 0.018, 0.066, ISLE_TOP + 0.047, -0.004, TONES.brick, 10));

  // bell tower: white shaft, cornice, dark octagonal spire, gold tip
  isle.add(box(0.04, 0.23, 0.04, -0.047, ISLE_TOP + 0.115, -0.004, TONES.white));
  isle.add(box(0.05, 0.013, 0.05, -0.047, ISLE_TOP + 0.2365, -0.004, TONES.stone));
  isle.add(cone(0.034, 0.11, -0.047, ISLE_TOP + 0.298, -0.004, TONES.ink, 8));
  const tip = new Mesh(new SphereGeometry(0.0065, 8, 6), mat(TONES.gold));
  tip.position.set(-0.047, ISLE_TOP + 0.356, -0.004);
  isle.add(tip);
  // clock + bell openings on the faces the camera sees
  isle.add(box(0.014, 0.014, 0.005, -0.047, ISLE_TOP + 0.192, 0.0165, TONES.gold));
  isle.add(box(0.011, 0.017, 0.005, -0.047, ISLE_TOP + 0.215, 0.0165, TONES.ink));
  isle.add(box(0.005, 0.014, 0.014, -0.0695, ISLE_TOP + 0.192, -0.004, TONES.gold));
  isle.add(box(0.005, 0.017, 0.011, -0.0695, ISLE_TOP + 0.215, -0.004, TONES.ink));

  // island trees (kept clear of the nave so the church reads)
  const treeY = ISLE_TOP - 0.002;
  isle.add(cone(0.018, 0.05, -0.022, treeY + 0.025, 0.055, PINE));
  isle.add(cone(0.02, 0.058, 0.062, treeY + 0.029, 0.036, TONES.forest));
  isle.add(cone(0.019, 0.055, 0.03, treeY + 0.0275, -0.048, PINE));
  isle.add(cone(0.016, 0.045, -0.048, treeY + 0.0225, -0.035, TONES.forest));
  isle.add(cone(0.016, 0.042, 0.11, treeY + 0.021, 0, PINE));

  // ---- pletna boat on the lake ----
  g.add(box(0.032, 0.009, 0.013, 0.1, WATER_Y + 0.004, 0.12, TONES.woodRed));
  g.add(box(0.016, 0.008, 0.01, 0.1, WATER_Y + 0.012, 0.12, TONES.white));

  // ---- castle crag behind the far shore: broad forested cliff hill ----
  const crag = new Mesh(new CylinderGeometry(0.04, 0.085, 0.11, 7), mat(TONES.stoneDark));
  crag.position.set(0.13, 0.055, -0.26);
  g.add(crag);
  g.add(cone(0.12, 0.085, 0.13, 0.0425, -0.26, TONES.forest));
  g.add(box(0.055, 0.024, 0.032, 0.13, 0.122, -0.26, TONES.white));
  const castleRoof = gable(0.029, 0.018, 0.016, TONES.brick);
  castleRoof.position.set(0.13, 0.134, -0.26);
  g.add(castleRoof);
  const keep = new Mesh(new CylinderGeometry(0.01, 0.01, 0.04, 8), mat(TONES.white));
  keep.position.set(0.15, 0.13, -0.248);
  g.add(keep);
  g.add(cone(0.013, 0.02, 0.15, 0.16, -0.248, TONES.brick, 8));

  // ---- soft second hill (west shore) ----
  g.add(cone(0.08, 0.1, -0.24, 0.05, -0.15, TONES.forest));

  // ---- conifers along the shore rim ----
  const rim: Array<[number, number, number, string]> = [
    [200, 0.018, 0.06, PINE],
    [160, 0.02, 0.065, TONES.forest],
    [130, 0.017, 0.055, PINE],
    [250, 0.021, 0.07, TONES.forest],
    [305, 0.017, 0.055, PINE],
    [20, 0.02, 0.065, TONES.forest],
    [55, 0.016, 0.05, PINE],
  ];
  for (const [deg, r, h, c] of rim) {
    const a = (deg * Math.PI) / 180;
    g.add(cone(r, h, Math.cos(a) * 0.28 * SX, 0.03 + h / 2, Math.sin(a) * 0.28 * SZ, c));
  }

  return g;
}
