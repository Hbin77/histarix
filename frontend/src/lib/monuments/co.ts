// Cartagena Walls — papercraft: curved sand-colored bastion wall on a dark
// stone rampart, Las Bóvedas gallery (white arcade, red tile roof) on one
// half, open cannon walkway on the other, domed corner garita, Caribbean at
// the wall's foot.

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

const D2R = Math.PI / 180;

/** Annular wall arc with a battered (sloped) outer face. */
function arcWall(
  rOut0: number,
  rOut1: number,
  rIn: number,
  y0: number,
  y1: number,
  m: MeshLambertMaterial,
  seg: number,
  phiStart: number,
  phiLen: number
): Mesh {
  const pts = [
    new Vector2(rOut0, y0),
    new Vector2(rOut1, y1),
    new Vector2(rIn, y1),
    new Vector2(rIn, y0),
    new Vector2(rOut0, y0),
  ];
  return new Mesh(new LatheGeometry(pts, seg, phiStart, phiLen), m);
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.3));

  // Everything architectural lives in `w`, pulled in slightly so a wider
  // band of sea shows at the wall's foot.
  const w = new Group();
  w.scale.set(0.93, 1, 0.93);
  g.add(w);

  const rampart = mat("#96897a"); // dark coral-stone base
  const sand = mat(TONES.sand);
  const sandDark = mat(TONES.sandDark);
  const stone = mat(TONES.stone);
  const white = mat(TONES.white);
  const roof = mat(TONES.woodRed);
  const arch = mat("#7f6c58");
  const bronze = mat(TONES.ironDark);
  const water = mat(TONES.water);
  const trunk = mat("#a98f68");
  const frond = mat(TONES.forest);

  // Wall arc geometry: bulges toward +z (the sea), land plaza inside.
  const A0 = -66 * D2R; // left end
  const A1 = 70 * D2R; // right end (garita corner)
  const LEN = A1 - A0;

  // --- Caribbean at the wall's foot (outer arc only) ---
  g.add(arcWall(0.372, 0.372, 0.28, 0, 0.01, water, 24, -80 * D2R, 160 * D2R));

  // --- Rampart base (dark stone, battered) + sand curtain wall ---
  w.add(arcWall(0.335, 0.323, 0.22, 0, 0.09, rampart, 26, A0, LEN));
  w.add(arcWall(0.322, 0.305, 0.225, 0.09, 0.24, sand, 26, A0, LEN));

  // --- Open walkway (right half): floor, sea parapet, merlons, inner curb ---
  const W0 = 2 * D2R;
  w.add(arcWall(0.288, 0.288, 0.238, 0.24, 0.248, stone, 14, W0, A1 - W0));
  w.add(arcWall(0.305, 0.302, 0.286, 0.24, 0.3, sand, 14, W0, A1 - W0));
  w.add(arcWall(0.24, 0.24, 0.226, 0.24, 0.262, sandDark, 12, W0, A1 - W0));
  const merlonGeo = new BoxGeometry(0.03, 0.032, 0.02);
  for (let deg = 4; deg <= 68; deg += 8) {
    const a = deg * D2R;
    const m = new Mesh(merlonGeo, sandDark);
    m.position.set(Math.sin(a) * 0.295, 0.316, Math.cos(a) * 0.295);
    m.rotation.y = a;
    w.add(m);
  }

  // --- Cannons poking seaward between merlons ---
  const cannonGeo = new CylinderGeometry(0.005, 0.008, 0.065, 8);
  for (const deg of [16, 32, 48]) {
    const a = deg * D2R;
    const c = new Mesh(cannonGeo, bronze);
    c.position.set(Math.sin(a) * 0.299, 0.279, Math.cos(a) * 0.299);
    c.rotation.order = "YXZ";
    c.rotation.y = a;
    c.rotation.x = Math.PI / 2 - 0.15;
    w.add(c);
  }

  // --- Las Bóvedas gallery (left half): white walls, red tile roof ---
  const B1 = 0;
  w.add(arcWall(0.3, 0.3, 0.228, 0.24, 0.375, white, 14, A0, B1 - A0));
  const roofPts = [
    new Vector2(0.315, 0.375),
    new Vector2(0.264, 0.418),
    new Vector2(0.215, 0.375),
    new Vector2(0.315, 0.375),
  ];
  w.add(new Mesh(new LatheGeometry(roofPts, 14, A0, B1 - A0), roof));

  // Arcade arches on the plaza face, small windows on the sea face.
  const archGeo = new BoxGeometry(0.026, 0.078, 0.02);
  for (let deg = -60; deg <= -12; deg += 8) {
    const a = deg * D2R;
    const m = new Mesh(archGeo, arch);
    m.position.set(Math.sin(a) * 0.227, 0.294, Math.cos(a) * 0.227);
    m.rotation.y = a;
    w.add(m);
  }
  const winGeo = new BoxGeometry(0.018, 0.026, 0.012);
  for (let deg = -54; deg <= -14; deg += 10) {
    const a = deg * D2R;
    const m = new Mesh(winGeo, arch);
    m.position.set(Math.sin(a) * 0.3, 0.335, Math.cos(a) * 0.3);
    m.rotation.y = a;
    w.add(m);
  }

  // --- Wall end caps + gallery caps/gables at both gallery ends ---
  const wallCapGeo = new BoxGeometry(0.018, 0.24, 0.112);
  for (const a of [A0, A1]) {
    const cap = new Mesh(wallCapGeo, sandDark);
    cap.position.set(Math.sin(a) * 0.2775, 0.12, Math.cos(a) * 0.2775);
    cap.rotation.y = a;
    w.add(cap);
  }
  const gableShape = new Shape();
  gableShape.moveTo(-0.052, 0);
  gableShape.lineTo(0.052, 0);
  gableShape.lineTo(0, 0.043);
  gableShape.closePath();
  const gableGeo = new ExtrudeGeometry(gableShape, {
    depth: 0.012,
    bevelEnabled: false,
  });
  const bldCapGeo = new BoxGeometry(0.016, 0.135, 0.074);
  for (const a of [A0, B1]) {
    const cap = new Mesh(bldCapGeo, white);
    cap.position.set(Math.sin(a) * 0.264, 0.3075, Math.cos(a) * 0.264);
    cap.rotation.y = a;
    w.add(cap);
    const gable = new Mesh(gableGeo, white);
    gable.position.set(Math.sin(a) * 0.264, 0.375, Math.cos(a) * 0.264);
    gable.rotation.y = a + Math.PI / 2;
    w.add(gable);
  }

  // --- Garita: corbel base, round sentry body, cornice, dome, finial ---
  const ga = A1;
  const gx = Math.sin(ga) * 0.3;
  const gz = Math.cos(ga) * 0.3;
  const garita = new Group();
  garita.position.set(gx, 0, gz);
  const corbel = new Mesh(new CylinderGeometry(0.048, 0.016, 0.055, 10), sand);
  corbel.position.y = 0.2375;
  garita.add(corbel);
  const body = new Mesh(new CylinderGeometry(0.046, 0.046, 0.145, 10), sand);
  body.position.y = 0.3375;
  garita.add(body);
  const cornice = new Mesh(new CylinderGeometry(0.056, 0.056, 0.016, 10), sandDark);
  cornice.position.y = 0.418;
  garita.add(cornice);
  const dome = new Mesh(new SphereGeometry(0.048, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), stone);
  dome.position.y = 0.426;
  dome.scale.y = 0.95;
  garita.add(dome);
  // Small muted tricolor on a pole above the dome.
  const pole = new Mesh(new CylinderGeometry(0.0025, 0.0025, 0.085, 6), bronze);
  pole.position.y = 0.508;
  garita.add(pole);
  const stripes: Array<[string, number, number]> = [
    [TONES.gold, 0.012, 0.5415],
    [TONES.domeBlue, 0.006, 0.5325],
    [TONES.woodRed, 0.006, 0.5265],
  ];
  for (const [tone, h, y] of stripes) {
    const s = new Mesh(new BoxGeometry(0.036, h, 0.004), mat(tone));
    s.position.set(0.02, y, 0);
    garita.add(s);
  }
  // Door toward the walkway, slit windows toward the sea.
  const door = new Mesh(new BoxGeometry(0.018, 0.052, 0.01), arch);
  const da = ga - Math.PI / 2;
  door.position.set(Math.sin(da) * 0.043, 0.31, Math.cos(da) * 0.043);
  door.rotation.y = da;
  garita.add(door);
  const slitGeo = new BoxGeometry(0.012, 0.034, 0.01);
  for (const off of [0.35, -0.55]) {
    const s = new Mesh(slitGeo, arch);
    const sa = ga + off;
    s.position.set(Math.sin(sa) * 0.044, 0.35, Math.cos(sa) * 0.044);
    s.rotation.y = sa;
    garita.add(s);
  }
  w.add(garita);

  // --- Papercraft palms on the plaza: leaning trunk, splayed fronds ---
  const trunkGeo = new CylinderGeometry(0.0045, 0.007, 0.1, 6);
  const frondGeo = new BoxGeometry(0.055, 0.005, 0.015);
  for (const [px, pz, lean] of [
    [-0.15, -0.08, 0.14],
    [0.05, -0.19, -0.1],
    [0.16, -0.06, 0.08],
  ] as const) {
    const palm = new Group();
    palm.position.set(px, 0, pz);
    const t = new Mesh(trunkGeo, trunk);
    t.position.y = 0.062;
    t.rotation.z = lean;
    palm.add(t);
    const topX = -Math.sin(lean) * 0.1;
    for (let k = 0; k < 6; k++) {
      const a = k * (Math.PI / 3) + lean;
      const f = new Mesh(frondGeo, frond);
      f.rotation.order = "YZX";
      f.rotation.y = a;
      f.rotation.z = -0.55;
      f.position.set(
        topX + Math.cos(a) * 0.024,
        0.112 - 0.006,
        -Math.sin(a) * 0.024
      );
      palm.add(f);
    }
    g.add(palm);
  }

  return g;
}
