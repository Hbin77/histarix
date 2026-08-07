// Registan (Samarkand) — papercraft: three madrasa facades framing an open
// square. Each is a giant pishtaq portal pierced by a pointed arch, tiled
// spandrels either side, low arcaded wings, ribbed turquoise domes behind,
// and — on the two flanking madrasas — twin cylindrical minarets.

import {
  BoxGeometry,
  CylinderGeometry,
  ConeGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Path,
  Shape,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const WALL = TONES.sand;
const WALL_D = TONES.sandDark;
const TILE = "#66a3b1"; // muted turquoise tilework
const TILE_D = "#4e8797"; // shaded tile / iwan interior

/** Timurid pointed-arch outline, half-width a, springing hs, apex at ap. */
function archPath(a: number, hs: number, ap: number): Path {
  const p = new Path();
  p.moveTo(-a, 0);
  p.lineTo(-a, hs);
  p.quadraticCurveTo(-a, ap, 0, ap);
  p.quadraticCurveTo(a, ap, a, hs);
  p.lineTo(a, 0);
  p.closePath();
  return p;
}

function archShape(a: number, hs: number, ap: number): Shape {
  const s = new Shape();
  const p = archPath(a, hs, ap);
  s.curves = p.curves;
  s.autoClose = true;
  return s;
}

/** Extrude a shape so its front face lands on z = 0, growing backwards. */
function slab(shape: Shape, depth: number, color: string): Mesh {
  const geo = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 4,
  });
  geo.translate(0, 0, -depth);
  return new Mesh(geo, mat(color));
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

/** Ribbed turquoise dome on a drum; 12 facets read as the melon ribs. */
function dome(r: number): Group {
  const g = new Group();
  const dh = r * 1.15; // drum height
  const drum = new Mesh(new CylinderGeometry(r * 0.9, r * 0.94, dh, 12), mat(TILE_D));
  drum.position.y = dh / 2;
  g.add(drum);
  const prof: Array<[number, number]> = [
    [0.92, 0.0],
    [1.0, 0.2],
    [0.94, 0.5],
    [0.74, 0.79],
    [0.4, 0.97],
    [0.0001, 1.09],
  ];
  const shell = new Mesh(
    new LatheGeometry(
      prof.map(([pr, py]) => new Vector2(pr * r, py * r)),
      12
    ),
    mat(TILE)
  );
  shell.position.y = dh;
  g.add(shell);
  return g;
}

/** Cylindrical minaret: tapered shaft, tile bands, balcony, lantern. */
function minaret(h: number): Group {
  const g = new Group();
  const rB = 0.03;
  const rT = 0.022;
  const shaft = new Mesh(new CylinderGeometry(rT, rB, h, 8), mat(WALL));
  shaft.position.y = h / 2;
  g.add(shaft);
  const bt = 0.46; // single tile band around the shaft
  const br = rB + (rT - rB) * bt;
  const band = new Mesh(new CylinderGeometry(br + 0.002, br + 0.002, 0.03, 8), mat(TILE));
  band.position.y = h * bt;
  g.add(band);
  const balcony = new Mesh(new CylinderGeometry(0.038, 0.034, 0.018, 8), mat(WALL_D));
  balcony.position.y = h + 0.009;
  g.add(balcony);
  const lantern = new Mesh(new CylinderGeometry(0.024, 0.026, 0.038, 8), mat(WALL));
  lantern.position.y = h + 0.037;
  g.add(lantern);
  const cap = new Mesh(new ConeGeometry(0.03, 0.032, 8), mat(TILE));
  cap.position.y = h + 0.072;
  g.add(cap);
  return g;
}

interface FacadeOpts {
  wingW: number; // half-facade wing width
  portalW: number;
  portalH: number;
  wingH: number;
  minarets: boolean;
  domes: Array<[number, number, number]>; // [local x, radius, base y]
}

/** One madrasa front, facing local +Z, front plane at z = 0. */
function madrasa(o: FacadeOpts): Group {
  const g = new Group();
  const D = 0.085; // facade depth
  const pw = o.portalW;
  const ph = o.portalH;

  // --- domes rise behind the wings ---
  for (const [dx, dr, dy] of o.domes) {
    const d = dome(dr);
    d.position.set(dx, dy, -D - 0.01);
    g.add(d);
  }

  // --- arcaded wings ---
  for (const s of [-1, 1]) {
    const cx = s * (pw / 2 + o.wingW / 2);
    g.add(box(o.wingW, o.wingH, D, cx, o.wingH / 2, -D / 2, WALL));
    g.add(box(o.wingW + 0.008, 0.016, D + 0.008, cx, o.wingH + 0.008, -D / 2, WALL_D));
    // two storeys of little arched cells
    const n = Math.max(2, Math.round(o.wingW / 0.052));
    for (let i = 0; i < n; i++) {
      const x = cx - o.wingW / 2 + (o.wingW * (i + 0.5)) / n;
      for (const y of [o.wingH * 0.28, o.wingH * 0.68]) {
        g.add(box(0.026, 0.05, 0.012, x, y, 0.002, TILE_D));
      }
    }
    // turquoise panel strip along the parapet
    g.add(box(o.wingW - 0.012, 0.018, 0.01, cx, o.wingH - 0.03, 0.003, TILE));
  }

  // --- pishtaq: rectangular frame pierced by the pointed arch ---
  const a = pw * 0.31;
  const hs = ph * 0.42;
  const ap = ph * 0.8;
  const frame = new Shape();
  frame.moveTo(-pw / 2, 0);
  frame.lineTo(pw / 2, 0);
  frame.lineTo(pw / 2, ph);
  frame.lineTo(-pw / 2, ph);
  frame.closePath();
  frame.holes.push(archPath(a, hs, ap));
  g.add(slab(frame, D, WALL));

  // tiled band tracing the arch
  const ring = archShape(a + 0.017, hs, ap + 0.021);
  ring.holes.push(archPath(a, hs, ap));
  const band = slab(ring, 0.01, TILE);
  band.position.z = 0.004;
  g.add(band);

  // tiled spandrels either side of the arch, and the crowning cornice
  for (const s of [-1, 1]) {
    g.add(
      box(pw * 0.13, ph * 0.34, 0.01, s * (pw * 0.36), ph * 0.6, 0.004, TILE)
    );
  }
  g.add(box(pw + 0.012, 0.02, D + 0.012, 0, ph + 0.01, -D / 2, WALL_D));
  g.add(box(pw - 0.01, 0.026, 0.01, 0, ph - 0.03, 0.004, TILE_D));

  // shadowed iwan behind the opening
  g.add(box(a * 2.05, ap, 0.012, 0, ap / 2, -0.028, TILE_D));
  g.add(box(a * 0.8, ap * 0.45, 0.012, 0, ap * 0.225, -0.02, "#6d6a5f"));

  // --- minarets at the outer corners ---
  if (o.minarets) {
    const mx = pw / 2 + o.wingW - 0.006;
    for (const s of [-1, 1]) {
      const m = minaret(0.5);
      m.position.set(s * mx, 0, -0.028);
      g.add(m);
    }
  }
  return g;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.375));

  // paved square between the three facades
  const square = new Mesh(new BoxGeometry(0.42, 0.014, 0.4), mat("#cdc4b2"));
  square.position.set(0, 0.017, 0.04);
  g.add(square);

  // Tilya-Kori closes the far side, its blue dome on axis above the portal.
  const back = madrasa({
    wingW: 0.175,
    portalW: 0.215,
    portalH: 0.46,
    wingH: 0.235,
    minarets: false,
    domes: [[0, 0.098, 0.335]],
  });
  back.position.set(0, 0, -0.175);
  g.add(back);
  // Tilya-Kori's stubby corner turrets
  for (const s of [-1, 1]) {
    const t = new Mesh(new CylinderGeometry(0.024, 0.028, 0.3, 6), mat(WALL));
    t.position.set(s * 0.275, 0.15, -0.205);
    g.add(t);
    const cap = new Mesh(new ConeGeometry(0.03, 0.03, 6), mat(TILE));
    cap.position.set(s * 0.275, 0.315, -0.205);
    g.add(cap);
  }

  // Ulugh Beg (left) and Sher-Dor (right) face each other across the square.
  for (const s of [-1, 1]) {
    const side = madrasa({
      wingW: 0.1,
      portalW: 0.195,
      portalH: 0.44,
      wingH: 0.22,
      minarets: true,
      domes: [[s * 0.128, 0.07, 0.235]],
    });
    side.position.set(s * 0.21, 0, 0.035);
    side.rotation.y = (-s * Math.PI) / 2; // front (+z) turns to face the square
    g.add(side);
  }

  return g;
}
