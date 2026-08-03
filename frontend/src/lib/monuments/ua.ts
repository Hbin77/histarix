// Собор святої Софії, Київ — papercraft miniature. White stepped cathedral
// carrying a cluster of green Ukrainian-baroque pear domes with gold accents
// around a central gold group, plus the free-standing tiered bell tower
// crowned with its own gold pear dome.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const CX = 0.11; // cathedral center x
const BX = -0.225; // bell tower center x

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

/** Ukrainian-baroque pear dome: swells just above the drum, concave neck,
 *  small tip. Local base sits at y = 0. */
function pearDome(r: number, h: number, color: string): Mesh {
  const pts = [
    new Vector2(0.0001, 0),
    new Vector2(r * 0.8, 0),
    new Vector2(r, h * 0.3),
    new Vector2(r * 0.82, h * 0.56),
    new Vector2(r * 0.4, h * 0.77),
    new Vector2(r * 0.15, h * 0.91),
    new Vector2(0.0001, h),
  ];
  return new Mesh(new LatheGeometry(pts, 8), mat(color));
}

/** Octagonal white drum + pear dome + gold finial (ball or spike).
 *  Returns the group; base sits at (x, yBase, z). */
function domeUnit(
  x: number,
  yBase: number,
  z: number,
  drumR: number,
  drumH: number,
  domeR: number,
  domeH: number,
  domeColor: string,
  finial: "ball" | "spike"
): Group {
  const u = new Group();
  u.position.set(x, yBase, z);

  const drum = new Mesh(
    new CylinderGeometry(drumR, drumR * 1.06, drumH, 8, 1, true), // caps hidden
    mat(TONES.white)
  );
  drum.position.y = drumH / 2;
  u.add(drum);

  // thin gold collar under green domes ("gold accents"); redundant on gold,
  // where the dome instead seats into the drum to hide its open top.
  const isGold = domeColor === TONES.gold;
  if (!isGold) {
    const collar = new Mesh(
      new CylinderGeometry(drumR * 1.08, drumR * 1.08, 0.01, 8),
      mat(TONES.gold)
    );
    collar.position.y = drumH + 0.005;
    u.add(collar);
  }

  const domeBaseY = isGold ? drumH - 0.005 : drumH + 0.01;
  const dome = pearDome(domeR, domeH, domeColor);
  dome.position.y = domeBaseY;
  u.add(dome);

  const tipY = domeBaseY + domeH;
  if (finial === "ball") {
    const ball = new Mesh(new SphereGeometry(0.011, 6, 4), mat(TONES.gold));
    ball.position.y = tipY + 0.008;
    u.add(ball);
  } else {
    const spike = new Mesh(new ConeGeometry(0.006, 0.03, 6), mat(TONES.gold));
    spike.position.y = tipY + 0.012;
    u.add(spike);
  }
  return u;
}

/** Small gold cross: vertical bar + crossbar, base at (x, y, z). */
function cross(x: number, y: number, z: number): Group {
  const c = new Group();
  c.position.set(x, y, z);
  const v = box(0.006, 0.05, 0.006, 0, 0.025, 0, TONES.gold);
  const hbar = box(0.028, 0.006, 0.006, 0, 0.033, 0, TONES.gold);
  c.add(v, hbar);
  return c;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.36));

  // =================== cathedral: white stepped massing ===================
  // base tier
  g.add(box(0.34, 0.13, 0.27, CX, 0.065, 0, TONES.white));
  g.add(box(0.352, 0.014, 0.282, CX, 0.137, 0, TONES.roofGreen)); // cornice
  // upper tier
  g.add(box(0.25, 0.1, 0.19, CX, 0.194, 0, TONES.white));
  g.add(box(0.262, 0.014, 0.202, CX, 0.251, 0, TONES.roofGreen)); // roof rim

  // slate arched-window rows (front and back faces)
  for (const zs of [1, -1]) {
    for (const wx of [-0.12, -0.06, 0, 0.06, 0.12])
      g.add(box(0.024, 0.06, 0.01, CX + wx, 0.075, zs * 0.136, TONES.slate));
    for (const wx of [-0.07, 0, 0.07])
      g.add(box(0.022, 0.052, 0.01, CX + wx, 0.198, zs * 0.096, TONES.slate));
  }

  // ---- dome cluster on the upper-tier roof (y = 0.258) ----
  const TOP = 0.258;
  // central gold dome — clearly the tallest of the cathedral
  g.add(domeUnit(CX, TOP, 0, 0.052, 0.12, 0.065, 0.16, TONES.gold, "ball"));
  g.add(cross(CX, TOP + 0.12 - 0.005 + 0.16 + 0.016, 0));
  // two medium gold domes flanking along the ridge
  for (const sx of [1, -1])
    g.add(
      domeUnit(CX + sx * 0.094, TOP, 0, 0.027, 0.07, 0.034, 0.09, TONES.gold, "ball")
    );
  // four green pear domes at the upper-tier corners
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      g.add(
        domeUnit(
          CX + sx * 0.096,
          TOP,
          sz * 0.073,
          0.025,
          0.07,
          0.032,
          0.085,
          TONES.verdigris,
          "spike"
        )
      );
  // four smaller green domes on the base-tier corners (y = 0.144)
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      g.add(
        domeUnit(
          CX + sx * 0.143,
          0.144,
          sz * 0.102,
          0.021,
          0.055,
          0.027,
          0.07,
          TONES.verdigris,
          "spike"
        )
      );

  // ============ bell tower: four white tiers, gold pear dome ============
  const tiers: Array<[number, number, number]> = [
    // [width, height, yBottom]
    [0.15, 0.15, 0],
    [0.12, 0.17, 0.164],
    [0.1, 0.16, 0.348],
    [0.082, 0.13, 0.522],
  ];
  for (let i = 0; i < tiers.length; i++) {
    const [w, h, y0] = tiers[i];
    g.add(box(w, h, w, BX, y0 + h / 2, 0, TONES.white));
    // cornice slab — gold on the top tier, green below
    const trim = i === tiers.length - 1 ? TONES.gold : TONES.roofGreen;
    g.add(box(w + 0.016, 0.014, w + 0.016, BX, y0 + h + 0.007, 0, trim));
  }
  // dark arched openings punched through both axes of tiers 2–4
  const arches: Array<[number, number, number]> = [
    // [opening width, opening height, center y]
    [0.046, 0.1, 0.252],
    [0.04, 0.095, 0.43],
    [0.034, 0.078, 0.59],
  ];
  for (let i = 0; i < arches.length; i++) {
    const [aw, ah, ay] = arches[i];
    const span = tiers[i + 1][0] + 0.008;
    g.add(box(aw, ah, span, BX, ay, 0, TONES.slate));
    g.add(box(span, ah, aw, BX, ay, 0, TONES.slate));
  }
  // gold pear dome crowning the tower
  g.add(domeUnit(BX, 0.666, 0, 0.032, 0.05, 0.046, 0.145, TONES.gold, "ball"));
  g.add(cross(BX, 0.666 + 0.05 - 0.005 + 0.145 + 0.016, 0));

  return g;
}
