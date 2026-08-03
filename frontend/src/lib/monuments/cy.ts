// Kyrenia Castle — papercraft: massive honey-stone coastal fortress with
// thick battered curtain walls, one huge round Venetian bastion at the
// harbor corner, and a tiny horseshoe harbor enclosed by a stone mole.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Shape,
  SphereGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const D2R = Math.PI / 180;

/**
 * Flat solid sector / annulus-sector lying on XZ, extruded up from y=0.
 * World angle th (degrees) is measured from +Z toward +X (front = 0).
 */
function sectorSolid(
  rOut: number,
  th0: number,
  th1: number,
  h: number,
  m: MeshLambertMaterial,
  rIn = 0,
  seg = 20
): Mesh {
  const p0 = (th0 - 90) * D2R;
  const p1 = (th1 - 90) * D2R;
  const s = new Shape();
  if (rIn <= 0) {
    s.moveTo(0, 0);
    s.absarc(0, 0, rOut, p0, p1, false);
    s.lineTo(0, 0);
  } else {
    s.absarc(0, 0, rOut, p0, p1, false);
    s.absarc(0, 0, rIn, p1, p0, true);
  }
  const geo = new ExtrudeGeometry(s, {
    depth: h,
    bevelEnabled: false,
    curveSegments: seg,
  });
  geo.rotateX(-Math.PI / 2); // shape plane -> ground, extrude -> +Y
  return new Mesh(geo, m);
}

/** Rectangular battered (tapered) slab: top footprint w x d, base spread wider. */
function batteredSlab(
  w: number,
  d: number,
  y0: number,
  y1: number,
  spread: number,
  m: MeshLambertMaterial
): Mesh {
  const geo = new CylinderGeometry(
    Math.SQRT1_2,
    Math.SQRT1_2 * (1 + spread),
    y1 - y0,
    4,
    1
  );
  geo.rotateY(Math.PI / 4);
  const mesh = new Mesh(geo, m);
  mesh.scale.set(w, 1, d);
  mesh.position.y = (y0 + y1) / 2;
  return mesh;
}

function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  m: MeshLambertMaterial
): Mesh {
  const mesh = new Mesh(new BoxGeometry(w, h, d), m);
  mesh.position.set(x, y, z);
  return mesh;
}

/** Ring of merlons around a round tower top. */
function crenellateRing(
  g: Group,
  cx: number,
  cz: number,
  r: number,
  y: number,
  n: number,
  m: MeshLambertMaterial,
  size = 0.026
): void {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const b = new Mesh(new BoxGeometry(size, 0.028, 0.016), m);
    b.position.set(cx + Math.sin(a) * r, y, cz + Math.cos(a) * r);
    b.rotation.y = a;
    g.add(b);
  }
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  const wall = mat(TONES.sand); // honey stone
  const wallDark = mat(TONES.sandDark); // battered rock base
  const stone = mat(TONES.stone); // mole / pale accents
  const stoneDark = mat(TONES.stoneDark);
  const court = mat("#d3bd92"); // courtyard floor
  const water = mat(TONES.water);
  const dark = mat("#6e5c44"); // gates / slits, muted umber
  const white = mat(TONES.white);
  const dome = mat(TONES.domeBlue);

  // --- Sea: water wraps the front + right of the fortress ---
  const sea = sectorSolid(0.362, -85, 95, 0.018, water);
  sea.position.y = 0.006;
  g.add(sea);
  // Shallow turquoise pocket inside the mole (the tiny harbor itself)
  const basin = sectorSolid(0.285, 6, 100, 0.02, mat("#8fc0bd"), 0, 14);
  basin.position.set(0, 0.008, -0.05);
  g.add(basin);

  // --- Rock platform the fortress rises from (battered honey stone) ---
  const plat = batteredSlab(0.44, 0.28, 0.01, 0.065, 0.2, wallDark);
  plat.position.z = -0.07;
  g.add(plat);

  // --- Curtain walls: long squat ring, outer x -0.19..0.19, z -0.18..0.04 ---
  g.add(box(0.38, 0.16, 0.05, 0, 0.14, 0.015, wall)); // sea wall (front)
  g.add(box(0.38, 0.16, 0.05, 0, 0.14, -0.155, wall)); // land wall (back)
  g.add(box(0.05, 0.16, 0.12, -0.165, 0.14, -0.07, wall)); // west wall
  g.add(box(0.05, 0.16, 0.12, 0.165, 0.14, -0.07, wall)); // east wall

  // Courtyard floor + inner buildings (visible from the aerial view)
  g.add(box(0.26, 0.04, 0.13, 0, 0.08, -0.075, court));
  g.add(box(0.06, 0.07, 0.11, 0.1, 0.135, -0.08, stone)); // range building
  g.add(box(0.07, 0.06, 0.06, -0.06, 0.13, -0.09, white)); // Byzantine chapel
  const drum = new Mesh(new CylinderGeometry(0.024, 0.024, 0.018, 10), white);
  drum.position.set(-0.06, 0.169, -0.09);
  g.add(drum);
  const cupola = new Mesh(
    new SphereGeometry(0.031, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    dome
  );
  cupola.position.set(-0.06, 0.178, -0.09);
  g.add(cupola);

  // --- Wall-top merlons ---
  const mGeo = new BoxGeometry(0.03, 0.026, 0.018);
  for (let i = 0; i < 8; i++) {
    const x = -0.165 + (i * 0.33) / 7;
    g.add(box(0.03, 0.026, 0.018, x, 0.231, 0.028, wall));
    g.add(box(0.03, 0.026, 0.018, x, 0.231, -0.168, wall));
  }
  for (let i = 0; i < 3; i++) {
    const z = -0.125 + i * 0.05;
    for (const x of [-0.178, 0.178]) {
      const merlon = new Mesh(mGeo, wall);
      merlon.position.set(x, 0.231, z);
      merlon.rotation.y = Math.PI / 2;
      g.add(merlon);
    }
  }

  // --- Great round Venetian bastion (SW harbor corner, rises from the sea) ---
  const bastion = new Mesh(new CylinderGeometry(0.095, 0.125, 0.3, 18), wall);
  bastion.position.set(-0.19, 0.15, 0.05);
  g.add(bastion);
  const crown = new Mesh(
    new CylinderGeometry(0.108, 0.098, 0.026, 18),
    wallDark
  );
  crown.position.set(-0.19, 0.313, 0.05);
  g.add(crown);
  crenellateRing(g, -0.19, 0.05, 0.095, 0.34, 10, wall);
  // Gun ports facing the sea
  for (const a of [-20, 25]) {
    const port = new Mesh(new BoxGeometry(0.026, 0.03, 0.014), dark);
    port.position.set(
      -0.19 + Math.sin(a * D2R) * 0.108,
      0.22,
      0.05 + Math.cos(a * D2R) * 0.108
    );
    port.rotation.y = a * D2R;
    g.add(port);
  }

  // --- Corner towers (all lower than the great bastion) ---
  // Harbor-entrance square tower (SE)
  g.add(box(0.09, 0.2, 0.09, 0.19, 0.15, 0.04, wall));
  for (const [dx, dz] of [
    [-0.034, 0.034],
    [0.034, 0.034],
    [-0.034, -0.034],
    [0.034, -0.034],
  ] as const)
    g.add(box(0.024, 0.024, 0.024, 0.19 + dx, 0.262, 0.04 + dz, wall));
  // NE square tower (land side)
  g.add(box(0.08, 0.18, 0.08, 0.19, 0.15, -0.16, wall));
  // NW round horseshoe tower
  const nw = new Mesh(new CylinderGeometry(0.044, 0.054, 0.19, 12), wall);
  nw.position.set(-0.19, 0.145, -0.16);
  g.add(nw);
  const nwCrown = new Mesh(
    new CylinderGeometry(0.048, 0.044, 0.016, 12),
    wallDark
  );
  nwCrown.position.set(-0.19, 0.248, -0.16);
  g.add(nwCrown);
  crenellateRing(g, -0.19, -0.16, 0.042, 0.268, 8, wall, 0.02);

  // --- Sea gate + slit windows on the sea wall ---
  g.add(box(0.04, 0.05, 0.014, 0.05, 0.09, 0.042, dark));
  for (const x of [-0.09, -0.02, 0.12])
    g.add(box(0.013, 0.03, 0.012, x, 0.175, 0.043, dark));

  // --- Harbor mole: stone arc enclosing the tiny harbor; its far end lands
  //     on the shore, the entrance gap faces the great bastion ---
  const mole = sectorSolid(0.32, 20, 105, 0.04, stone, 0.29, 11);
  mole.position.set(0, 0.02, -0.05);
  g.add(mole);
  // Low parapet lip along the mole's outer edge
  const lip = sectorSolid(0.32, 22, 103, 0.016, stoneDark, 0.309, 9);
  lip.position.set(0, 0.06, -0.05);
  g.add(lip);
  // Little harbor light at the mole tip
  const tipX = Math.sin(20 * D2R) * 0.305;
  const tipZ = -0.05 + Math.cos(20 * D2R) * 0.305;
  const light = new Mesh(new CylinderGeometry(0.016, 0.019, 0.06, 10), white);
  light.position.set(tipX, 0.05, tipZ);
  g.add(light);
  const lightCap = new Mesh(
    new CylinderGeometry(0.019, 0.019, 0.01, 10),
    stoneDark
  );
  lightCap.position.set(tipX, 0.085, tipZ);
  g.add(lightCap);

  // --- Tiny fishing boats in the basin ---
  for (const [x, z, a, c] of [
    [0.08, 0.16, 25, TONES.white],
    [0.17, 0.12, -40, TONES.woodRed],
  ] as const) {
    const hull = new Mesh(new BoxGeometry(0.042, 0.012, 0.016), mat(c));
    hull.position.set(x, 0.033, z);
    hull.rotation.y = a * D2R;
    g.add(hull);
  }

  // --- Harbor rocks ---
  for (const [x, z, r] of [
    [-0.1, 0.28, 0.022],
    [-0.27, 0.16, 0.018],
  ] as const) {
    const rock = new Mesh(new SphereGeometry(r, 6, 4), stoneDark);
    rock.position.set(x, 0.026, z);
    rock.scale.y = 0.55;
    g.add(rock);
  }

  return g;
}
