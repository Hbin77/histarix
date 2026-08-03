// Angkor Wat — papercraft miniature. Quincunx of five lotus-bud towers
// (center tallest) on a steep stepped pyramid (Bakan), ringed by two
// gallery enclosures, with the long west causeway crossing the moat.

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

const GRASS = "#a4b18b"; // muted temple-ground green
const TOWER = "#a89a80"; // weathered gray sandstone
const ROOF = "#9c8d74"; // darker gallery roofs

const TY = 0.036; // terrace top

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

/** Ridged lotus-bud tower (Lathe, 8 facets): stepped rings tightening into
 *  an ogival tip — the Angkor prasat profile. Base sits at y = 0. */
function lotusTower(r: number, h: number, color: string): Mesh {
  const pts: Vector2[] = [new Vector2(r, 0), new Vector2(r, 0.16 * h)];
  let rPrev = r;
  const tiers = 6;
  for (let i = 1; i <= tiers; i++) {
    const t = i / tiers;
    const y = 0.16 * h + (0.88 * h - 0.16 * h) * t;
    const ri = r * (1 - 0.66 * Math.pow(t, 2.1)); // ogival: fat mid, tuck at top
    pts.push(new Vector2(rPrev * 1.02, y - 0.02 * h)); // ring lip flares out...
    pts.push(new Vector2(ri, y)); // ...then tucks in
    rPrev = ri;
  }
  pts.push(new Vector2(rPrev * 0.55, 0.96 * h));
  pts.push(new Vector2(0, h));
  return new Mesh(new LatheGeometry(pts, 8), mat(color));
}

/** Triangular prism gallery roof; ridge runs along Z (rotate for X runs). */
function prismRoof(len: number, halfW: number, h: number, color: string): Mesh {
  const s = new Shape();
  s.moveTo(-halfW, 0);
  s.lineTo(halfW, 0);
  s.lineTo(0, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: len, bevelEnabled: false });
  geo.translate(0, 0, -len / 2);
  return new Mesh(geo, mat(color));
}

/** 4-sided pyramid cap for corner pavilions. */
function pyramidCap(r: number, h: number, color: string): Mesh {
  const geo = new ConeGeometry(r, h, 4);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, h / 2, 0);
  return new Mesh(geo, mat(color));
}

/** Steep stair ramp climbing toward -Z (front face on +Z side). */
function ramp(
  w: number,
  len: number,
  x: number,
  y: number,
  z: number,
  angle: number
): Mesh {
  const m = new Mesh(new BoxGeometry(w, 0.012, len), mat(TONES.stone));
  m.position.set(x, y, z);
  m.rotation.x = angle;
  return m;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.375));

  // ---- moat + temple-ground terrace ----
  const water = new Mesh(
    new CylinderGeometry(0.355, 0.355, 0.014, 28),
    mat(TONES.water)
  );
  water.position.y = 0.012;
  g.add(water);
  const terrace = new Mesh(
    new CylinderGeometry(0.285, 0.285, 0.022, 28),
    mat(GRASS)
  );
  terrace.position.y = 0.025;
  g.add(terrace);

  // ---- west causeway across the moat (approach on +Z) ----
  g.add(box(0.075, 0.032, 0.165, 0, 0.021, 0.2925, TONES.stone));
  // naga balustrade edge strips
  for (const sx of [1, -1])
    g.add(box(0.01, 0.012, 0.165, sx * 0.0335, 0.042, 0.2925, TONES.stoneDark));
  // cruciform terrace pad at the gallery entrance
  g.add(box(0.11, 0.012, 0.05, 0, 0.042, 0.235, TONES.stone));
  g.add(box(0.05, 0.012, 0.085, 0, 0.042, 0.245, TONES.stone));
  // inner processional walk to the second platform
  g.add(box(0.045, 0.01, 0.08, 0, 0.041, 0.175, TONES.stone));

  // ---- outer gallery enclosure (0.38 x 0.42) ----
  const wallH = 0.044;
  const wallY = TY + wallH / 2;
  for (const sz of [1, -1]) {
    g.add(box(0.38, wallH, 0.028, 0, wallY, sz * 0.21, TONES.stoneDark));
    const r = prismRoof(0.38, 0.024, 0.026, ROOF);
    r.rotation.y = Math.PI / 2;
    r.position.set(0, TY + wallH, sz * 0.21);
    g.add(r);
  }
  for (const sx of [1, -1]) {
    g.add(box(0.028, wallH, 0.42, sx * 0.19, wallY, 0, TONES.stoneDark));
    const r = prismRoof(0.42, 0.024, 0.026, ROOF);
    r.position.set(sx * 0.19, TY + wallH, 0);
    g.add(r);
  }
  // corner pavilions
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      g.add(box(0.055, 0.07, 0.055, sx * 0.19, TY + 0.035, sz * 0.21, TONES.stoneDark));
      const cap = pyramidCap(0.042, 0.046, ROOF);
      cap.position.set(sx * 0.19, TY + 0.07, sz * 0.21);
      g.add(cap);
    }
  // west gopura (entrance pavilion) with its own small bud tower
  g.add(box(0.09, 0.06, 0.06, 0, TY + 0.03, 0.21, TONES.stoneDark));
  const gopuraTower = lotusTower(0.023, 0.105, TOWER);
  gopuraTower.position.set(0, TY + 0.06, 0.21);
  g.add(gopuraTower);

  // library buildings flanking the inner walk
  for (const sx of [1, -1]) {
    g.add(box(0.055, 0.03, 0.075, sx * 0.1, TY + 0.015, 0.1, TONES.stoneDark));
    const r = prismRoof(0.075, 0.03, 0.018, ROOF);
    r.position.set(sx * 0.1, TY + 0.03, 0.1);
    g.add(r);
  }

  // ---- second enclosure platform + gallery (inner axis shifted -0.02) ----
  const cz = -0.02;
  g.add(box(0.3, 0.06, 0.32, 0, TY + 0.03, cz, TONES.stone));
  const p2 = TY + 0.06; // 0.096
  const w2H = 0.04;
  for (const sz of [1, -1]) {
    g.add(box(0.27, w2H, 0.022, 0, p2 + w2H / 2, cz + sz * 0.145, TONES.stoneDark));
    const r = prismRoof(0.27, 0.019, 0.022, ROOF);
    r.rotation.y = Math.PI / 2;
    r.position.set(0, p2 + w2H, cz + sz * 0.145);
    g.add(r);
  }
  for (const sx of [1, -1]) {
    g.add(box(0.022, w2H, 0.29, sx * 0.135, p2 + w2H / 2, cz, TONES.stoneDark));
    const r = prismRoof(0.29, 0.019, 0.022, ROOF);
    r.position.set(sx * 0.135, p2 + w2H, cz);
    g.add(r);
  }
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      g.add(box(0.04, 0.05, 0.04, sx * 0.135, p2 + 0.025, cz + sz * 0.145, TONES.stoneDark));
      const cap = pyramidCap(0.03, 0.035, ROOF);
      cap.position.set(sx * 0.135, p2 + 0.05, cz + sz * 0.145);
      g.add(cap);
    }

  // ---- Bakan: steep two-step pyramid ----
  g.add(box(0.225, 0.062, 0.225, 0, p2 + 0.031, cz, TONES.stoneDark));
  const p3 = p2 + 0.062; // 0.158
  g.add(box(0.19, 0.05, 0.19, 0, p3 + 0.025, cz, TONES.stoneDark));
  const p4 = p3 + 0.05; // 0.208
  // top parapet frame
  for (const sz of [1, -1])
    g.add(box(0.184, 0.018, 0.012, 0, p4 + 0.009, cz + sz * 0.086, TONES.stone));
  for (const sx of [1, -1])
    g.add(box(0.012, 0.018, 0.184, sx * 0.086, p4 + 0.009, cz, TONES.stone));

  // steep axial stairs (front)
  g.add(ramp(0.05, 0.072, 0, 0.066, 0.15, 1.1));
  g.add(ramp(0.045, 0.074, 0, 0.127, 0.101 + cz + 0.02, 1.15));
  g.add(ramp(0.04, 0.06, 0, 0.183, 0.0735 + cz + 0.02, 1.14));

  // ---- quincunx of lotus-bud towers ----
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 0.066;
      const z = cz + sz * 0.066;
      g.add(box(0.06, 0.022, 0.06, x, p4 + 0.011, z, TONES.stoneDark));
      const t = lotusTower(0.035, 0.22, TOWER);
      t.position.set(x, p4 + 0.022, z);
      g.add(t);
    }
  g.add(box(0.09, 0.038, 0.09, 0, p4 + 0.019, cz, TONES.stoneDark));
  const center = lotusTower(0.049, 0.34, TOWER);
  center.position.set(0, p4 + 0.038, cz);
  g.add(center);

  return g;
}
