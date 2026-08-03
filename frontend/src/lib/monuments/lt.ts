// Gediminas Tower (Vilnius) — papercraft: steep green castle hill with a
// winding stepped walkway, walled hilltop courtyard, octagonal red-brick
// tower (3 stories, battered stone base, crenellated deck, tricolor flag)
// and the gabled keep ruins alongside. Landform base — no plaza disc.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  TorusGeometry,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const HILL_H = 0.31; // plateau height
const R_BASE = 0.35; // hill foot radius (footprint 0.70)
const R_TOP = 0.19; // plateau radius
const OCT = Math.PI / 8; // align octagon faces to axes

/** Hill radius at normalized height t (concave grassy slope). */
function hillR(t: number): number {
  const s = Math.min(Math.max(t, 0), 1);
  return R_TOP + (R_BASE - R_TOP) * Math.pow(1 - s, 1.6);
}

export function build(): Group {
  const g = new Group();
  const grass = mat("#8ca677");
  const tree = mat("#5e7b50");
  const brick = mat(TONES.brick);
  const brickDark = mat(TONES.brickDark);
  const stone = mat(TONES.stone);
  const stoneDark = mat(TONES.stoneDark);
  const ink = mat(TONES.ink);

  // ---- Castle hill (faceted lathe, capped plateau) ----
  const ts = [0, 0.1, 0.22, 0.36, 0.52, 0.68, 0.84, 1];
  const pts = ts.map((t) => new Vector2(hillR(t), t * HILL_H));
  pts.push(new Vector2(0.0001, HILL_H));
  const hill = new Mesh(new LatheGeometry(pts, 20), grass);
  g.add(hill);

  // ---- Hilltop courtyard slab + rampart ring ----
  const slab = new Mesh(new CylinderGeometry(0.18, 0.187, 0.03, 20), mat(TONES.plaza));
  slab.position.y = HILL_H + 0.015;
  g.add(slab);
  const PLATEAU = HILL_H + 0.03; // courtyard surface
  const rampart = new Mesh(new TorusGeometry(0.174, 0.008, 4, 22), stoneDark);
  rampart.rotation.x = Math.PI / 2;
  rampart.position.y = PLATEAU + 0.004;
  g.add(rampart);

  // stone revetment wall wrapping the slope just below the tower side
  const revet = new Mesh(
    new CylinderGeometry(0.198, 0.214, 0.08, 12, 1, true, (-15 * Math.PI) / 180, (120 * Math.PI) / 180),
    stone
  );
  revet.position.y = HILL_H - 0.038;
  g.add(revet);

  // ---- Winding stepped walkway up the slope ----
  const STEPS = 12;
  const A0 = (-150 * Math.PI) / 180;
  const A1 = (30 * Math.PI) / 180;
  for (let i = 0; i < STEPS; i++) {
    const t = i / (STEPS - 1);
    const y = 0.015 + t * (HILL_H + 0.005);
    const a = A0 + (A1 - A0) * t;
    const r = hillR(y / HILL_H) + 0.006;
    const step = new Mesh(new BoxGeometry(0.08, 0.013, 0.05), stone);
    step.position.set(Math.sin(a) * r, y, Math.cos(a) * r);
    step.rotation.y = a;
    g.add(step);
  }

  // ---- Slope trees (low-poly firs) ----
  const treeSpots: Array<[number, number, number]> = [
    [70, 0.16, 1.0],
    [100, 0.34, 0.85],
    [130, 0.2, 1.1],
    [160, 0.42, 0.8],
    [95, 0.08, 0.95],
    [-120, 0.55, 0.75],
    [-95, 0.3, 0.9],
  ];
  for (const [deg, t, s] of treeSpots) {
    const a = (deg * Math.PI) / 180;
    const r = hillR(t) * 0.97;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    const y = t * HILL_H;
    const cone = new Mesh(new ConeGeometry(0.02 * s, 0.055 * s, 7), tree);
    cone.position.set(x, y + 0.032 * s, z);
    g.add(cone);
  }

  // ================= Tower =================
  const tower = new Group();
  tower.position.set(0.068, PLATEAU, 0.048);

  // battered stone footing
  const footing = new Mesh(new CylinderGeometry(0.096, 0.118, 0.08, 8), stone);
  footing.rotation.y = OCT;
  footing.position.y = 0.04;
  tower.add(footing);

  // 3-story octagonal brick shaft
  const BODY_H = 0.26;
  const body = new Mesh(new CylinderGeometry(0.083, 0.092, BODY_H, 8), brick);
  body.rotation.y = OCT;
  body.position.y = 0.08 + BODY_H / 2;
  tower.add(body);

  // story bands
  for (const f of [1 / 3, 2 / 3]) {
    const band = new Mesh(new CylinderGeometry(0.093, 0.093, 0.008, 8), brickDark);
    band.rotation.y = OCT;
    band.position.y = 0.08 + BODY_H * f;
    tower.add(band);
  }

  // windows (dark slots on octagon faces, two levels)
  const winGeo = new BoxGeometry(0.018, 0.03, 0.012);
  const winAt = (deg: number, y: number) => {
    const a = (deg * Math.PI) / 180;
    const w = new Mesh(winGeo, ink);
    w.position.set(Math.sin(a) * 0.086, y, Math.cos(a) * 0.086);
    w.rotation.y = a;
    tower.add(w);
  };
  for (const d of [0, 90, 180, 270]) winAt(d, 0.08 + BODY_H * 0.82);
  for (const d of [0, 45, 135, 315]) winAt(d, 0.08 + BODY_H * 0.46);

  // crown (slightly flared machicolated deck) + deck floor
  const crownY = 0.08 + BODY_H;
  const crown = new Mesh(new CylinderGeometry(0.102, 0.091, 0.04, 8), brickDark);
  crown.rotation.y = OCT;
  crown.position.y = crownY + 0.02;
  tower.add(crown);
  const deck = new Mesh(new CylinderGeometry(0.09, 0.09, 0.007, 8), stone);
  deck.rotation.y = OCT;
  deck.position.y = crownY + 0.043;
  tower.add(deck);

  // merlons around the deck rim
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const m = new Mesh(new BoxGeometry(0.03, 0.021, 0.014), brick);
    m.position.set(Math.sin(a) * 0.094, crownY + 0.051, Math.cos(a) * 0.094);
    m.rotation.y = a;
    tower.add(m);
  }

  // flagpole + Lithuanian tricolor (muted)
  const pole = new Mesh(new CylinderGeometry(0.0038, 0.0038, 0.18, 6), mat(TONES.ironDark));
  pole.position.y = crownY + 0.04 + 0.09;
  tower.add(pole);
  const flagCols = [TONES.gold, TONES.roofGreen, TONES.woodRed];
  flagCols.forEach((c, i) => {
    const stripe = new Mesh(new BoxGeometry(0.066, 0.014, 0.004), mat(c));
    stripe.position.set(0.036, crownY + 0.203 - i * 0.014, 0);
    tower.add(stripe);
  });

  g.add(tower);

  // ================= Keep ruins (gabled brick shell) =================
  const ruin = new Group();
  ruin.position.set(-0.118, PLATEAU, 0.04);
  ruin.rotation.y = 0.3;
  ruin.scale.setScalar(0.92);

  const shell = new Mesh(new BoxGeometry(0.13, 0.062, 0.062), brick);
  shell.position.y = 0.031;
  ruin.add(shell);
  // gable roof: two slanted slabs meeting at a ridge along x
  for (const s of [1, -1]) {
    const slope = new Mesh(new BoxGeometry(0.136, 0.007, 0.046), mat(TONES.ironDark));
    slope.position.set(0, 0.079, s * 0.019);
    slope.rotation.x = -s * 0.62;
    ruin.add(slope);
  }
  // taller end gable walls
  for (const s of [1, -1]) {
    const gable = new Mesh(new BoxGeometry(0.012, 0.092, 0.058), brickDark);
    gable.position.set(s * 0.062, 0.046, 0);
    ruin.add(gable);
  }
  // arched niche hint
  const niche = new Mesh(new BoxGeometry(0.03, 0.034, 0.01), ink);
  niche.position.set(0.012, 0.034, 0.029);
  ruin.add(niche);

  g.add(ruin);

  return g;
}
