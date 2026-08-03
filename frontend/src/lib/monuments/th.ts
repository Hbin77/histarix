// Grand Palace / Wat Phra Kaew (Bangkok) — papercraft miniature.
// Golden bell-shaped chedi (Phra Si Rattana Chedi) + ordination hall with
// telescoping orange/green Thai roofs and chofa finials + corn-cob prang.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const ROOF_ORANGE = "#c2764a"; // muted Thai roof-tile orange
const GOLD_LIGHT = "#d9ba6d"; // softer gold for chedi highlights

/** Gable prism: ridge along X. halfLen (x), halfDepth (z), height h.
 *  Base sits at y = 0 of the mesh; small flat top for the ridge. */
function gable(halfLen: number, halfDepth: number, h: number, color: string): Mesh {
  const s = new Shape();
  s.moveTo(-halfDepth, 0);
  s.lineTo(halfDepth, 0);
  s.lineTo(0.14 * halfDepth, h);
  s.lineTo(-0.14 * halfDepth, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: halfLen * 2, bevelEnabled: false });
  geo.translate(0, 0, -halfLen);
  geo.rotateY(Math.PI / 2);
  return new Mesh(geo, mat(color));
}

function box(
  w: number, h: number, d: number,
  x: number, y: number, z: number,
  color: string
): Mesh {
  const m = new Mesh(new BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z);
  return m;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  // ================= golden chedi (left) =================
  const chedi = new Group();
  chedi.position.set(-0.235, 0, 0.08);

  // white circular platform
  const plat = new Mesh(new CylinderGeometry(0.105, 0.115, 0.04, 12), mat(TONES.white));
  plat.position.y = 0.02;
  chedi.add(plat);

  // stepped gold tiers
  const tiers: Array<[number, number, number, number]> = [
    [0.088, 0.096, 0.035, 0.0575],
    [0.078, 0.085, 0.03, 0.09],
    [0.069, 0.075, 0.028, 0.118],
  ];
  for (const [rt, rb, h, y] of tiers) {
    const t = new Mesh(new CylinderGeometry(rt, rb, h, 12), mat(TONES.gold));
    t.position.y = y;
    chedi.add(t);
  }

  // bell body (lathe)
  const bellPts = [
    new Vector2(0.076, 0),
    new Vector2(0.08, 0.02),
    new Vector2(0.074, 0.055),
    new Vector2(0.058, 0.095),
    new Vector2(0.042, 0.125),
    new Vector2(0.035, 0.14),
  ];
  const bell = new Mesh(new LatheGeometry(bellPts, 12), mat(GOLD_LIGHT));
  bell.position.y = 0.132;
  chedi.add(bell);

  // harmika
  chedi.add(box(0.055, 0.028, 0.055, 0, 0.286, 0, TONES.gold));

  // ringed spire (plong chanai): core + stacked discs
  const core = new Mesh(new CylinderGeometry(0.011, 0.028, 0.24, 8), mat(TONES.gold));
  core.position.y = 0.42;
  chedi.add(core);
  for (let i = 0; i < 7; i++) {
    const r = 0.046 - i * 0.0045;
    const ring = new Mesh(new CylinderGeometry(r, r, 0.014, 10), mat(GOLD_LIGHT));
    ring.position.y = 0.312 + i * 0.032;
    chedi.add(ring);
  }

  // needle finial
  const needle = new Mesh(new ConeGeometry(0.014, 0.17, 8), mat(TONES.gold));
  needle.position.y = 0.615;
  chedi.add(needle);
  g.add(chedi);

  // ================= ordination hall (center) =================
  const hall = new Group();
  hall.position.x = 0.03;

  // plinth + white walls
  hall.add(box(0.34, 0.04, 0.3, 0, 0.02, 0, TONES.stone));
  hall.add(box(0.28, 0.22, 0.25, 0, 0.15, 0, TONES.white));

  // gold corner pilasters + doors on the long faces
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      hall.add(box(0.02, 0.22, 0.02, sx * 0.135, 0.15, sz * 0.12, TONES.gold));
  for (const sz of [1, -1])
    for (const dx of [-0.075, 0, 0.075])
      hall.add(box(0.036, 0.1, 0.012, dx, 0.115, sz * 0.125, TONES.gold));

  // telescoping roof tiers: orange slab + green eave border + gold ridge
  const roofTiers: Array<[number, number, number, number]> = [
    // [halfLen, halfDepth, height, baseY]
    [0.165, 0.15, 0.09, 0.255],
    [0.135, 0.115, 0.09, 0.325],
    [0.105, 0.085, 0.1, 0.395],
  ];
  for (const [hl, hd, h, y] of roofTiers) {
    const orange = gable(hl, hd, h, ROOF_ORANGE);
    orange.position.y = y;
    hall.add(orange);
    // green border strip lying proud on each slope, hugging the eave
    const slope = Math.atan2(h, 0.86 * hd);
    const stripW = hd * 0.32;
    for (const sz of [1, -1]) {
      const strip = new Mesh(
        new BoxGeometry(hl * 2 + 0.004, 0.008, stripW),
        mat(TONES.roofGreen)
      );
      const zC = hd * (1 - 0.86 * 0.15);
      strip.position.set(
        0,
        y + h * 0.15 + 0.004 * Math.cos(slope),
        sz * (zC + 0.004 * Math.sin(slope))
      );
      strip.rotation.x = sz * slope;
      hall.add(strip);
    }
    // gold serrated-ridge bar (bai raka)
    hall.add(box(hl * 2 + 0.004, 0.012, 0.015, 0, y + h + 0.004, 0, TONES.gold));
  }

  // white clerestory bands filling gaps between tiers
  hall.add(box(0.26, 0.08, 0.17, 0, 0.3, 0, TONES.white));
  hall.add(box(0.2, 0.08, 0.12, 0, 0.37, 0, TONES.white));

  // gold gable plates on the upper tier end faces
  for (const [hl, hd, h, y] of [roofTiers[1], roofTiers[2]]) {
    const tri = new Shape();
    tri.moveTo(-hd * 0.72, 0);
    tri.lineTo(hd * 0.72, 0);
    tri.lineTo(0, h * 0.8);
    tri.closePath();
    const plateGeo = new ExtrudeGeometry(tri, { depth: 0.012, bevelEnabled: false });
    for (const sx of [1, -1]) {
      const plate = new Mesh(plateGeo, mat(TONES.gold));
      plate.rotation.y = Math.PI / 2;
      plate.position.set(sx * (hl - 0.005), y + 0.012, 0);
      hall.add(plate);
    }
  }

  // chofa finials: slender gold horns at each stepped ridge end
  for (const [hl, , h, y] of roofTiers) {
    const ridgeY = y + h;
    for (const sx of [1, -1]) {
      const horn = new Mesh(new ConeGeometry(0.009, 0.085, 6), mat(TONES.gold));
      horn.position.set(sx * (hl - 0.006), ridgeY + 0.034, 0);
      horn.rotation.z = -sx * 0.32; // tip kicks outward like a bird's head
      hall.add(horn);
    }
  }
  g.add(hall);

  // ================= corn-cob prang (right) =================
  const prang = new Group();
  prang.position.set(0.28, 0, 0.07);

  // stepped square base
  prang.add(box(0.13, 0.028, 0.13, 0, 0.014, 0, TONES.stoneDark));
  prang.add(box(0.112, 0.026, 0.112, 0, 0.041, 0, TONES.stoneDark));
  prang.add(box(0.096, 0.024, 0.096, 0, 0.065, 0, TONES.stone));

  // corrugated tapering body (octagonal lathe)
  const prangPts: Vector2[] = [];
  const rows: Array<[number, number]> = [
    [0.05, 0], [0.054, 0.024], [0.045, 0.042], [0.049, 0.066],
    [0.041, 0.084], [0.045, 0.108], [0.036, 0.126], [0.04, 0.15],
    [0.032, 0.168], [0.035, 0.192], [0.027, 0.21], [0.029, 0.234],
    [0.022, 0.252], [0.024, 0.276], [0.017, 0.294], [0.018, 0.318],
    [0.012, 0.336], [0.01, 0.36],
  ];
  for (const [r, y] of rows) prangPts.push(new Vector2(r, y));
  const body = new Mesh(new LatheGeometry(prangPts, 8), mat(TONES.stone));
  body.position.y = 0.077;
  prang.add(body);

  // niche porches on the four cardinal faces of the lower body
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const niche = box(
      0.02, 0.05, 0.02,
      Math.sin(a) * 0.046, 0.13, Math.cos(a) * 0.046,
      TONES.stoneDark
    );
    niche.rotation.y = a;
    prang.add(niche);
  }

  // gold crown + trident needle (vajra)
  const crown = new Mesh(new ConeGeometry(0.014, 0.055, 6), mat(TONES.gold));
  crown.position.y = 0.455;
  prang.add(crown);
  const spike = new Mesh(new CylinderGeometry(0.003, 0.003, 0.075, 6), mat(TONES.gold));
  spike.position.y = 0.51;
  prang.add(spike);
  g.add(prang);

  return g;
}
