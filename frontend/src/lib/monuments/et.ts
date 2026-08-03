// Lalibela (Bete Giyorgis) — papercraft: Greek-cross monolithic church
// hewn downward into red volcanic rock, standing in a deep square pit.
// The stepped cross-relief roof sits at ground level — the aerial icon.

import {
  BoxGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Shape,
} from "three";
import { mat, TONES } from "./materials";

/** Plus-sign (Greek cross) outline. a = half arm length, b = half arm width. */
function crossShape(a: number, b: number): Shape {
  const s = new Shape();
  s.moveTo(b, a);
  s.lineTo(-b, a);
  s.lineTo(-b, b);
  s.lineTo(-a, b);
  s.lineTo(-a, -b);
  s.lineTo(-b, -b);
  s.lineTo(-b, -a);
  s.lineTo(b, -a);
  s.lineTo(b, -b);
  s.lineTo(a, -b);
  s.lineTo(a, b);
  s.lineTo(b, b);
  s.closePath();
  return s;
}

/** Extruded slab standing upright with its base at baseY. */
function slab(
  shape: Shape,
  h: number,
  baseY: number,
  m: MeshLambertMaterial
): Mesh {
  const geo = new ExtrudeGeometry(shape, {
    depth: h,
    bevelEnabled: false,
    curveSegments: 5,
  });
  geo.rotateX(-Math.PI / 2); // extrusion now runs up +Y; shape y -> world -z
  const mesh = new Mesh(geo, m);
  mesh.position.y = baseY;
  return mesh;
}

/**
 * One terrain tier: rounded square (outer half o, corners start at c) with
 * the square pit cavity (half p) and an open entrance trench on the front
 * (world +z). Single contour — the trench slot connects the outer edge to
 * the pit, so no hole path is needed.
 */
function terrainShape(o: number, c: number, p: number): Shape {
  const w = 0.045; // trench half width
  const t = -0.06; // trench center offset (approach comes in off-axis)
  const s = new Shape();
  // NOTE: shape y maps to world -z, so the front trench sits at shape y=-o.
  s.moveTo(t + w, -o);
  s.lineTo(c, -o);
  s.quadraticCurveTo(o, -o, o, -c);
  s.lineTo(o, c);
  s.quadraticCurveTo(o, o, c, o);
  s.lineTo(-c, o);
  s.quadraticCurveTo(-o, o, -o, c);
  s.lineTo(-o, -c);
  s.quadraticCurveTo(-o, -o, -c, -o);
  s.lineTo(t - w, -o);
  // into the trench, around the pit, back out
  s.lineTo(t - w, -p);
  s.lineTo(-p, -p);
  s.lineTo(-p, p);
  s.lineTo(p, p);
  s.lineTo(p, -p);
  s.lineTo(t + w, -p);
  s.closePath();
  return s;
}

export function build(): Group {
  const g = new Group();

  const rock = mat(TONES.brick); // pit walls, reddish tuff
  const rockMid = mat("#b47f60"); // middle terrace, slightly deeper red
  const rockRim = mat("#b5814f"); // lichen-orange ground surface
  const rockDark = mat("#8f5c44"); // pit floor / trench shade
  const church = mat("#8f5741");
  const plinth = mat("#87523e");
  const reliefLight = mat("#c09271");
  const reliefDark = mat("#7f5340");
  const opening = mat("#4a3628");

  // ---- excavation: stepped rock mesa, pit depth 0.30 ----
  const pit = 0.205;
  g.add(slab(terrainShape(0.285, 0.195, pit), 0.13, 0, rock));
  g.add(slab(terrainShape(0.262, 0.177, pit), 0.1, 0.13, rockMid));
  g.add(slab(terrainShape(0.243, 0.163, pit), 0.07, 0.23, rockRim));

  // pit + trench floor (oversized, tucked under the walls)
  const floor = new Mesh(new BoxGeometry(0.46, 0.012, 0.46), rockDark);
  floor.position.set(0, 0.006, 0);
  g.add(floor);
  const trenchFloor = new Mesh(new BoxGeometry(0.09, 0.012, 0.11), rockDark);
  trenchFloor.position.set(-0.06, 0.006, 0.235);
  g.add(trenchFloor);

  // trench steps descending from ground level to the pit floor (front)
  for (let i = 0; i < 5; i++) {
    const h = 0.06 * (i + 1);
    const step = new Mesh(new BoxGeometry(0.084, h, 0.016), rockDark);
    step.position.set(-0.06, h / 2, 0.218 + 0.016 * i);
    g.add(step);
  }

  // ---- church: stepped plinth + cross tower, roof just proud of ground ----
  g.add(slab(crossShape(0.17, 0.082), 0.03, 0.012, plinth));
  g.add(slab(crossShape(0.158, 0.072), 0.03, 0.042, plinth));
  g.add(slab(crossShape(0.145, 0.062), 0.248, 0.072, church));

  // moldings: mid string course + cornice lip under the roof
  g.add(slab(crossShape(0.148, 0.064), 0.01, 0.175, reliefLight));
  g.add(slab(crossShape(0.15, 0.066), 0.012, 0.295, reliefLight));

  // roof: concentric Greek crosses in relief (the aerial signature)
  g.add(slab(crossShape(0.145, 0.062), 0.008, 0.32, reliefDark));
  g.add(slab(crossShape(0.112, 0.048), 0.008, 0.328, reliefLight));
  g.add(slab(crossShape(0.08, 0.035), 0.008, 0.336, reliefDark));

  // ---- openings on the four arm-end faces ----
  const winTop = new BoxGeometry(0.021, 0.036, 0.01);
  const winLow = new BoxGeometry(0.017, 0.026, 0.01);
  const face = 0.145; // arm tip plane
  for (const [dx, dz, ry] of [
    [0, 1, 0],
    [1, 0, Math.PI / 2],
    [0, -1, Math.PI],
    [-1, 0, -Math.PI / 2],
  ] as const) {
    for (const ox of [-0.038, 0, 0.038]) {
      const w1 = new Mesh(winTop, opening);
      w1.position.set(dx * face + -dz * ox, 0.26, dz * face + dx * ox);
      w1.rotation.y = ry;
      g.add(w1);
      const w2 = new Mesh(winLow, opening);
      w2.position.set(dx * face + -dz * ox, 0.215, dz * face + dx * ox);
      w2.rotation.y = ry;
      g.add(w2);
    }
  }
  // doorway at the base of the front arm, facing the trench
  const door = new Mesh(new BoxGeometry(0.042, 0.056, 0.01), opening);
  door.position.set(0, 0.104, face);
  g.add(door);

  // ---- hermit-cell holes carved into the inner pit walls ----
  const cell = new BoxGeometry(0.024, 0.028, 0.01);
  for (const [cx, cy, cz, cry] of [
    [-0.13, 0.15, -0.205, 0],
    [0.12, 0.11, -0.205, 0],
    [0.205, 0.14, -0.09, Math.PI / 2],
    [-0.205, 0.12, 0.06, Math.PI / 2],
  ] as const) {
    const c = new Mesh(cell, opening);
    c.position.set(cx, cy, cz);
    c.rotation.y = cry;
    g.add(c);
  }

  // ---- boulders at the mesa foot for papercraft texture ----
  const bump = mat("#a97050");
  for (const [bx, bz, bs, br] of [
    [0.24, 0.185, 0.05, 0.4],
    [-0.265, -0.1, 0.044, 0.9],
    [0.1, -0.27, 0.04, 1.3],
  ] as const) {
    const b = new Mesh(new BoxGeometry(bs, 0.042, bs * 0.85), bump);
    b.position.set(bx, 0.021, bz);
    b.rotation.y = br;
    g.add(b);
  }

  return g;
}
