// Colosseo — papercraft: elliptical amphitheater, three arcade tiers with
// radius steps, iconic broken upper ring (~60% of circumference survives).

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const D2R = Math.PI / 180;

/** Hollow annular wall (rectangular cross-section revolved around Y). */
function ring(
  rIn: number,
  rOut: number,
  y0: number,
  y1: number,
  m: MeshLambertMaterial,
  seg: number,
  phiStart = 0,
  phiLen = Math.PI * 2
): Mesh {
  const pts = [
    new Vector2(rOut, y0),
    new Vector2(rOut, y1),
    new Vector2(rIn, y1),
    new Vector2(rIn, y0),
    new Vector2(rOut, y0),
  ];
  return new Mesh(new LatheGeometry(pts, seg, phiStart, phiLen), m);
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  // Elliptical squash applied to the whole amphitheater (189m x 156m ≈ 0.82).
  const colo = new Group();
  colo.scale.z = 0.82;
  g.add(colo);

  const facade = mat("#d3b795"); // warm travertine
  const innerWall = mat(TONES.brick);
  const seatLow = mat(TONES.stone);
  const seatHigh = mat("#cbb69c");
  const arena = mat(TONES.sand);
  const cornice = mat(TONES.stoneDark);
  const brokenEdge = mat(TONES.brickDark);
  const arch = mat("#7f6c58");

  // Surviving outer-wall arc: 216° (60%), gap faces the front-right.
  const arcStart = 127 * D2R;
  const arcLen = 216 * D2R;

  // Arena floor + stepped seating bowl (all full rings so the bowl reads
  // from the aerial view).
  const floor = new Mesh(new CylinderGeometry(0.153, 0.153, 0.03, 24), arena);
  floor.position.y = 0.015;
  colo.add(floor);
  colo.add(ring(0.15, 0.207, 0.0, 0.075, seatLow, 28));
  colo.add(ring(0.205, 0.262, 0.0, 0.135, seatHigh, 28));
  colo.add(ring(0.26, 0.31, 0.0, 0.2, innerWall, 28));

  // Outer facade: two full tiers with a slight radius step...
  colo.add(ring(0.315, 0.36, 0.0, 0.16, facade, 36));
  colo.add(ring(0.315, 0.348, 0.16, 0.3, facade, 36));
  // ...and the broken third tier + cornice, only on the surviving arc.
  colo.add(ring(0.312, 0.336, 0.299, 0.45, facade, 26, arcStart, arcLen));
  colo.add(ring(0.312, 0.346, 0.45, 0.472, cornice, 26, arcStart, arcLen));
  // Cascading step stubs where the wall breaks down.
  colo.add(ring(0.312, 0.336, 0.299, 0.365, facade, 3, 115 * D2R, 12 * D2R));
  colo.add(ring(0.312, 0.336, 0.299, 0.365, facade, 3, 343 * D2R, 12 * D2R));

  // Broken-edge piers capping the open tube ends (exposed brick).
  const tallCap = new BoxGeometry(0.036, 0.178, 0.016);
  const stubCap = new BoxGeometry(0.036, 0.07, 0.014);
  for (const [geo, deg, y] of [
    [tallCap, 127, 0.383],
    [tallCap, 343, 0.383],
    [stubCap, 115, 0.332],
    [stubCap, 355, 0.332],
  ] as const) {
    const cap = new Mesh(geo, brokenEdge);
    const a = deg * D2R;
    cap.position.set(Math.sin(a) * 0.324, y, Math.cos(a) * 0.324);
    cap.rotation.y = a;
    colo.add(cap);
  }

  // Dark boxes suggesting the arcade arches. Ground tier is surface-inset;
  // upper tiers pierce the wall so openings read from both sides.
  const archGround = new BoxGeometry(0.042, 0.085, 0.014);
  const archMid = new BoxGeometry(0.042, 0.085, 0.045);
  const archTop = new BoxGeometry(0.042, 0.085, 0.036);
  const addArch = (
    geo: BoxGeometry,
    deg: number,
    radius: number,
    y: number
  ) => {
    const m = new Mesh(geo, arch);
    const a = deg * D2R;
    m.position.set(Math.sin(a) * radius, y, Math.cos(a) * radius);
    m.rotation.y = a;
    colo.add(m);
  };
  for (let i = 0; i < 14; i++) {
    addArch(archGround, (i * 360) / 14, 0.362, 0.085);
    addArch(archMid, (i * 360) / 14 + 12.85, 0.3315, 0.228);
  }
  for (let i = 0; i < 8; i++)
    addArch(archTop, 141 + (i * 188) / 7, 0.324, 0.36);
  // Small attic windows above the third arcade, between arch bays.
  const windowGeo = new BoxGeometry(0.02, 0.024, 0.036);
  for (let i = 0; i < 7; i++)
    addArch(windowGeo, 154.4 + (i * 188) / 7, 0.324, 0.427);

  return g;
}
