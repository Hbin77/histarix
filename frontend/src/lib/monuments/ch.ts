// Matterhorn — stylized papercraft alpine horn: a steep four-sided pyramid
// with a hooked summit, snow-plastered upper faces over dark rock, rising
// from a lobed glacier mound with a blue ice rim.
// Natural landform: no plaza disc; grounded by its own terrain base.

import {
  ConeGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const H = 0.55; // horn height above the base terrain
const Y0 = 0.025; // horn foot height (buried in the glacier mound)
const RB = 0.22; // pyramid corner distance at the foot
const R_TIP = 0.006;
const P = 1.12; // slope concavity exponent (nearly straight, steep faces)
const BEND = -0.06; // summit crook (toward -x = viewer's left in front view)
const SNOW_OFF = 0.006; // snow shell offset above rock faces
const SEG_R = 16; // radial segments (4 per pyramid face)
const SEG_H = 14;

const ROCK = "#59606f"; // dark muted alpine rock
const QPI = Math.PI / 4;

/** Corner-radius → boundary-distance multiplier for a square cross-section. */
function squareM(a: number): number {
  const q = ((a % (2 * QPI)) + 2 * QPI) % (2 * QPI);
  return Math.cos(QPI) / Math.cos(q - QPI);
}

/** Pyramid corner distance at normalized height t (slightly concave). */
function coreR(t: number): number {
  return R_TIP + (RB - R_TIP) * Math.pow(1 - t, P);
}

/** Sideways drift of the horn axis — straight low, kinking near the summit. */
function bendX(t: number): number {
  return BEND * Math.pow(t, 3.5);
}

/** Shared rock-relief noise so rock and snow shells stay parallel. */
function relief(t: number, a: number): number {
  const fade = Math.min(1, (1 - t) * 4) * Math.min(1, t * 6 + 0.35);
  const cw = Math.max(0, (squareM(a) - 0.707) / 0.293); // ridge-corner weight
  return (
    fade *
    (0.004 * Math.sin(17 * t + 3 * a) +
      0.003 * Math.sin(29 * t + 5 * a) +
      0.008 * cw * Math.sin(23 * t + a))
  );
}

/** Angle-dependent snowline: dips low on the north face, high on rock faces. */
function snowLine(a: number): number {
  const s =
    0.52 +
    0.16 * Math.sin(a - 0.6) +
    0.08 * Math.sin(2 * a + 1.7) +
    0.04 * Math.sin(3 * a + 0.4) +
    0.03 * Math.sin(5 * a + 2.6);
  return Math.min(0.75, Math.max(0.24, s));
}

/** Reshape a cylinder-grid mesh into the (bent, squared) horn surface. */
function shapeHorn(mesh: Mesh, snow: boolean): void {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const t = Math.min(1, Math.max(0, (pos.getY(i) + H / 2) / H));
    const a = Math.atan2(pos.getX(i), pos.getZ(i));
    let tt = t;
    let d = coreR(t) * squareM(a) + relief(t, a);
    if (snow) {
      const ts = snowLine(a);
      if (t >= ts) {
        d += SNOW_OFF;
      } else {
        tt = ts; // tuck below-snowline verts just inside the rock
        d = coreR(ts) * squareM(a) - 0.02;
      }
    }
    pos.setXYZ(i, Math.sin(a) * d + bendX(tt), tt * H, Math.cos(a) * d);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

/** Jitter a lathe ring's radius (integer sine freqs keep the seam closed). */
function lobeRing(mesh: Mesh, ringY: number, amp: number, phase: number): void {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    if (Math.abs(pos.getY(i) - ringY) > 1e-4) continue;
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const a = Math.atan2(z, x);
    const r =
      Math.hypot(x, z) +
      amp * (0.5 * Math.sin(5 * a + phase) + 0.5 * Math.sin(8 * a + phase * 2.7));
    const len = Math.hypot(x, z) || 1;
    pos.setXYZ(i, (x / len) * r, ringY, (z / len) * r);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

export function build(): Group {
  const g = new Group();

  // --- Rock horn: squared, bent, faceted steep pyramid ---
  const rock = new Mesh(
    new CylinderGeometry(0.0015, RB, H, SEG_R, SEG_H, true),
    mat(ROCK)
  );
  shapeHorn(rock, false);
  rock.position.y = Y0;
  rock.scale.z = 0.9; // broad north/east faces, slimmer profile from the side
  g.add(rock);

  // --- Snow shell: parallel offset surface, jagged angle-varying snowline ---
  const snow = new Mesh(
    new CylinderGeometry(0.0015, RB, H, SEG_R, SEG_H, true),
    mat(TONES.snow)
  );
  shapeHorn(snow, true);
  snow.position.y = Y0 + 0.002;
  snow.scale.z = 0.9;
  g.add(snow);

  // --- Summit cap: tilted snow tetra closing the tip — the "hook" kink ---
  const cap = new Mesh(new ConeGeometry(0.027, 0.085, 4), mat(TONES.snow));
  const tilt = 0.7;
  cap.rotation.z = tilt;
  cap.position.set(
    bendX(0.88) - Math.sin(tilt) * 0.018 - 0.009,
    Y0 + 0.88 * H + Math.cos(tilt) * 0.018,
    0
  );
  g.add(cap);

  // --- Glacier mound: low white lobed apron the horn rises from ---
  const mound = new Mesh(
    new LatheGeometry(
      [
        new Vector2(0.25, 0.006),
        new Vector2(0.243, 0.02),
        new Vector2(0.21, 0.042),
        new Vector2(0.16, 0.065),
        new Vector2(0.1, 0.082),
        new Vector2(0.05, 0.09),
      ],
      24
    ),
    mat(TONES.snow)
  );
  lobeRing(mound, 0.006, 0.014, 4.1);
  g.add(mound);

  // --- Blue ice band under the glacier rim ---
  const ice = new Mesh(
    new CylinderGeometry(0.243, 0.252, 0.014, 24),
    mat(TONES.water)
  );
  ice.position.y = 0.007;
  g.add(ice);

  // --- A couple of chunky moraine boulders half-buried at the glacier rim ---
  const rocks: Array<[number, number, number, number]> = [
    [0.21, -0.13, 0.055, 0.9],
    [-0.16, 0.19, 0.048, 2.1],
  ];
  for (const [x, z, s, ry] of rocks) {
    const b = new Mesh(new ConeGeometry(s, s * 0.9, 5), mat(TONES.slate));
    b.position.set(x, 0.012, z);
    b.rotation.y = ry;
    g.add(b);
  }

  return g;
}
