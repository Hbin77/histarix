// Wawel Castle (Kraków) — papercraft miniature.
// Low green hill over a Vistula bend, ringed by a red-brick rampart with a
// fat round bastion; cream courtyard palace with red hip roofs, cathedral
// with the gold-domed Sigismund Chapel, a brick Gothic bell tower, and the
// Clock Tower's dark baroque cap rising highest.

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

const SQ2 = Math.SQRT2;
const ZS = 0.9; // terrain squashed into a gentle ellipse along z
const PLAT = 0.17; // courtyard plateau surface height
const WALL = "#e7ddc7"; // warm cream palace plaster
const ROOF = TONES.woodRed;

function box(w: number, h: number, d: number, x: number, y: number, z: number, color: string): Mesh {
  const m = new Mesh(new BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z);
  return m;
}

/** Cylinder positioned by its base y. */
function cyl(rT: number, rB: number, h: number, x: number, yB: number, z: number, color: string, seg = 14): Mesh {
  const m = new Mesh(new CylinderGeometry(rT, rB, h, seg), mat(color));
  m.position.set(x, yB + h / 2, z);
  return m;
}

/** Cone positioned by its base y. */
function cone(r: number, h: number, x: number, yB: number, z: number, color: string, seg = 12): Mesh {
  const m = new Mesh(new ConeGeometry(r, h, seg), mat(color));
  m.position.set(x, yB + h / 2, z);
  return m;
}

/** Ball ornament (gold finials etc.). */
function ball(r: number, x: number, y: number, z: number, color: string): Mesh {
  const m = new Mesh(new SphereGeometry(r, 6, 4), mat(color));
  m.position.set(x, y, z);
  return m;
}

/** Rectangular hip-roof frustum (base at yB): eave half-extents hx/hz. */
function hipRoof(hx: number, hz: number, h: number, t: number, x: number, yB: number, z: number, color: string): Mesh {
  const geo = new CylinderGeometry(t * SQ2, SQ2, 1, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, 0.5, 0);
  const m = new Mesh(geo, mat(color));
  m.scale.set(hx, h, hz);
  m.position.set(x, yB, z);
  return m;
}

/** Gabled prism roof, ridge along X, positioned by its base y. */
function gableRoof(halfLen: number, halfDepth: number, h: number, x: number, yB: number, z: number, color: string): Mesh {
  const s = new Shape();
  s.moveTo(-halfDepth, 0);
  s.lineTo(halfDepth, 0);
  s.lineTo(0, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: halfLen * 2, bevelEnabled: false });
  geo.translate(0, 0, -halfLen);
  geo.rotateY(Math.PI / 2);
  const m = new Mesh(geo, mat(color));
  m.position.set(x, yB, z);
  return m;
}

/** Lathe of [r, y] pairs, base at y = 0, positioned by its base. */
function lathe(pts: [number, number][], x: number, yB: number, z: number, color: string, seg = 12): Mesh {
  const m = new Mesh(
    new LatheGeometry(pts.map(([r, y]) => new Vector2(r, y)), seg),
    mat(color)
  );
  m.position.set(x, yB, z);
  return m;
}

export function build(): Group {
  const g = new Group();

  // ---- Vistula bend wrapping the back of the hill ----
  const water = new Mesh(
    new CylinderGeometry(0.372, 0.372, 0.012, 22, 1, false, Math.PI * 0.46, Math.PI * 1.2),
    mat(TONES.water)
  );
  water.position.y = 0.006;
  water.scale.z = ZS;
  g.add(water);

  // ---- Wawel hill: grass apron + green slope + brick rampart band ----
  const apron = cyl(0.345, 0.352, 0.016, 0, 0, 0, TONES.forest, 20);
  apron.scale.z = ZS;
  g.add(apron);
  const slope = cyl(0.312, 0.336, 0.1, 0, 0.012, 0, TONES.forest, 20);
  slope.scale.z = ZS;
  g.add(slope);
  const rampart = cyl(0.306, 0.318, 0.068, 0, 0.105, 0, TONES.brick, 20);
  rampart.scale.z = ZS;
  g.add(rampart);
  const court = cyl(0.303, 0.303, 0.012, 0, PLAT - 0.012, 0, TONES.stone, 20);
  court.scale.z = ZS;
  g.add(court);

  // battlement teeth along the rampart rim
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const tooth = box(0.02, 0.022, 0.012, 0.303 * Math.cos(a), PLAT + 0.006, 0.303 * Math.sin(a) * ZS, TONES.brickDark);
    tooth.rotation.y = Math.PI / 2 - a;
    g.add(tooth);
  }

  // ---- round brick bastions bulging from the rampart ----
  // fat Sandomierska-style bastion, front-right below the palace
  g.add(cyl(0.052, 0.058, 0.24, 0.1, 0, 0.235, TONES.brick, 12));
  g.add(cyl(0.058, 0.058, 0.02, 0.1, 0.24, 0.235, TONES.brickDark, 12));
  g.add(cone(0.064, 0.085, 0.1, 0.26, 0.235, TONES.brickDark, 12));
  // slimmer brick tower on the left flank
  g.add(cyl(0.034, 0.038, 0.24, -0.27, 0, 0.11, TONES.brick, 10));
  g.add(cone(0.045, 0.07, -0.27, 0.24, 0.11, TONES.brickDark, 10));

  // ---- palace quadrangle (east half): cream wings, red hip roofs ----
  g.add(box(0.24, 0.105, 0.075, 0.1, PLAT + 0.0525, 0.1225, WALL)); // south wing
  g.add(box(0.24, 0.105, 0.075, 0.1, PLAT + 0.0525, -0.1225, WALL)); // north wing
  g.add(box(0.07, 0.105, 0.24, 0.225, PLAT + 0.0525, 0, WALL)); // east wing
  g.add(hipRoof(0.128, 0.0455, 0.052, 0.18, 0.1, PLAT + 0.105, 0.1225, ROOF));
  g.add(hipRoof(0.128, 0.0455, 0.052, 0.18, 0.1, PLAT + 0.105, -0.1225, ROOF));
  g.add(hipRoof(0.043, 0.128, 0.052, 0.18, 0.225, PLAT + 0.105, 0, ROOF));

  // windows on the outer palace facades
  for (const x of [0.02, 0.07, 0.12, 0.17]) {
    g.add(box(0.014, 0.032, 0.006, x, PLAT + 0.06, 0.161, TONES.slate));
    g.add(box(0.014, 0.032, 0.006, x, PLAT + 0.06, -0.161, TONES.slate));
  }
  for (const z of [-0.08, -0.03, 0.03, 0.08]) {
    g.add(box(0.006, 0.032, 0.014, 0.261, PLAT + 0.06, z, TONES.slate));
  }

  // round corner towers on the river-facing east side
  g.add(cyl(0.03, 0.033, 0.25, 0.262, 0.1, -0.15, WALL, 10));
  g.add(cone(0.04, 0.07, 0.262, 0.35, -0.15, ROOF, 10));
  g.add(cyl(0.028, 0.031, 0.21, 0.262, 0.1, 0.15, WALL, 10));
  g.add(cone(0.037, 0.065, 0.262, 0.31, 0.15, ROOF, 10));

  // ---- cathedral (west half): white nave, gable roof, gilded sygnaturka ----
  g.add(box(0.21, 0.12, 0.095, -0.155, PLAT + 0.06, -0.03, TONES.white));
  g.add(gableRoof(0.105, 0.0525, 0.055, -0.155, PLAT + 0.12, -0.03, ROOF));
  g.add(cone(0.011, 0.09, -0.19, PLAT + 0.165, -0.03, TONES.ink, 8));
  g.add(ball(0.007, -0.19, PLAT + 0.26, -0.03, TONES.gold));

  // Sigismund Chapel: white cube + octagonal drum + big gold dome (front)
  g.add(box(0.074, 0.06, 0.062, -0.11, PLAT + 0.03, 0.06, TONES.white));
  g.add(cyl(0.034, 0.037, 0.034, -0.11, PLAT + 0.06, 0.06, TONES.white, 8));
  g.add(
    lathe(
      [
        [0.046, 0],
        [0.048, 0.014],
        [0.041, 0.032],
        [0.027, 0.049],
        [0.012, 0.06],
        [0.001, 0.066],
      ],
      -0.11,
      PLAT + 0.094,
      0.06,
      TONES.gold
    )
  );
  g.add(cyl(0.007, 0.007, 0.016, -0.11, PLAT + 0.158, 0.06, TONES.gold, 8));
  g.add(ball(0.0065, -0.11, PLAT + 0.18, 0.06, TONES.gold));

  // Vasa Chapel: smaller slate dome beside it
  g.add(box(0.052, 0.052, 0.048, -0.185, PLAT + 0.026, 0.06, TONES.white));
  g.add(cyl(0.021, 0.023, 0.026, -0.185, PLAT + 0.052, 0.06, TONES.white, 8));
  const vasa = new Mesh(new SphereGeometry(0.028, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), mat(TONES.slate));
  vasa.scale.y = 0.85;
  vasa.position.set(-0.185, PLAT + 0.078, 0.06);
  g.add(vasa);

  // ---- Sigismund bell tower: brick Gothic, dark tent + corner pinnacles ----
  g.add(box(0.056, 0.24, 0.056, -0.26, PLAT + 0.12, -0.07, TONES.brick));
  g.add(box(0.062, 0.02, 0.062, -0.26, PLAT + 0.24, -0.07, TONES.brickDark));
  const tent = cone(0.046, 0.085, -0.26, PLAT + 0.26, -0.07, TONES.ink, 4);
  tent.rotation.y = Math.PI / 4;
  g.add(tent);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      g.add(cone(0.008, 0.032, -0.26 + sx * 0.026, PLAT + 0.25, -0.07 + sz * 0.026, TONES.ink, 6));
    }
  g.add(ball(0.008, -0.26, PLAT + 0.352, -0.07, TONES.gold));

  // ---- Clock Tower: brick shaft, white belfry, broad dark baroque cap ----
  const TX = -0.04;
  const TZ = -0.06;
  g.add(box(0.064, 0.3, 0.064, TX, PLAT + 0.15, TZ, TONES.brick));
  g.add(box(0.058, 0.16, 0.058, TX, PLAT + 0.38, TZ, TONES.white));
  // gold clock faces (front + east)
  const clockF = cyl(0.017, 0.017, 0.006, TX, 0, TZ + 0.027, TONES.gold, 12);
  clockF.rotation.x = Math.PI / 2;
  clockF.position.y = PLAT + 0.44;
  g.add(clockF);
  const clockS = cyl(0.017, 0.017, 0.006, TX + 0.027, 0, TZ, TONES.gold, 12);
  clockS.rotation.z = Math.PI / 2;
  clockS.position.y = PLAT + 0.44;
  g.add(clockS);
  // cap: flat slab, flared skirt, broad bulb, gold lantern, onion, spike
  const capB = PLAT + 0.46;
  g.add(box(0.08, 0.014, 0.08, TX, capB + 0.007, TZ, TONES.ink));
  g.add(cyl(0.024, 0.05, 0.036, TX, capB + 0.014, TZ, TONES.ink, 10));
  const bulb = new Mesh(new SphereGeometry(0.038, 10, 6), mat(TONES.ink));
  bulb.scale.y = 0.82;
  bulb.position.set(TX, capB + 0.062, TZ);
  g.add(bulb);
  g.add(cyl(0.0125, 0.0125, 0.034, TX, capB + 0.086, TZ, TONES.gold, 8)); // gilded lantern
  const onion = new Mesh(new SphereGeometry(0.019, 8, 6), mat(TONES.ink));
  onion.scale.y = 0.9;
  onion.position.set(TX, capB + 0.128, TZ);
  g.add(onion);
  g.add(cyl(0.0035, 0.0035, 0.052, TX, capB + 0.14, TZ, TONES.ink, 6));
  g.add(ball(0.01, TX, capB + 0.198, TZ, TONES.gold));

  // ---- scattered trees hugging the hillside ----
  const treeAt = (x: number, z: number, r: number) => {
    const t = new Mesh(new SphereGeometry(r, 7, 5), mat("#69825a"));
    t.scale.y = 0.8;
    t.position.set(x, 0.05, z);
    g.add(t);
  };
  treeAt(-0.22, 0.19, 0.032);
  treeAt(0.21, 0.2, 0.026);
  treeAt(0.3, -0.1, 0.03);
  treeAt(-0.3, 0.03, 0.026);

  return g;
}
