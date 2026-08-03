// Sydney Opera House — papercraft: two rows of overlapping white shell
// vaults (spherical wedge slices with thickness) on a wide granite podium
// jutting into the harbour. Water slab instead of plaza (Bennelong Point).

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  Shape,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const D2R = Math.PI / 180;

interface SailOpts {
  R: number; // sphere radius the shell is sliced from
  z: number; // anchor along the row (tip end)
  facing?: 1 | -1; // 1 = mouth opens toward +Z (harbour), -1 = reversed
  lean?: number; // extra forward tilt, degrees
  m: MeshLambertMaterial;
}

/**
 * One shell sail: a wedge of a hollow sphere (pole to below the equator),
 * revolved partially so the open mouth faces ±Z and the pointed tip
 * overhangs the mouth. Squashed sideways so it reads steep, not bulbous.
 */
/**
 * Ridge curve base->tip: circle arc up to 30 deg from the pole, then a
 * straight tangent extension so the tip stays a rising sharp point instead
 * of curling over the pole.
 */
function ridge(r: number): Vector2[] {
  const thetas = [100, 85, 70, 56, 43, 30];
  const pts = thetas.map(
    (d) => new Vector2(r * Math.sin(d * D2R), r * Math.cos(d * D2R))
  );
  const t0 = 30 * D2R;
  for (const d of [0.2, 0.38]) {
    pts.push(
      new Vector2(
        r * (Math.sin(t0) - Math.cos(t0) * d),
        r * (Math.cos(t0) + Math.sin(t0) * d)
      )
    );
  }
  return pts;
}

function sail(o: SailOpts, baseY: number): Mesh {
  const tBase = 100 * D2R;
  const phi = 118 * D2R;
  const thk = 0.018;

  const outer = ridge(o.R).reverse(); // tip -> base
  const inner = ridge(o.R - thk); // base -> tip
  const pts = [...outer, ...inner, outer[0].clone()];

  const f = o.facing ?? 1;
  // facing 1: wedge centered at azimuth PI -> convex back faces -Z, mouth +Z.
  const phiStart = f === 1 ? Math.PI - phi / 2 : -phi / 2;
  const mesh = new Mesh(new LatheGeometry(pts, 6, phiStart, phi), o.m);

  const sx = 0.4,
    sy = 1.3,
    sz = 0.85;
  mesh.scale.set(sx, sy, sz);
  mesh.rotation.x = f * (o.lean ?? 3) * D2R;
  mesh.position.set(0, baseY - sy * o.R * Math.cos(tBase) - 0.012, o.z);
  return mesh;
}

/** Dark glass curtain wall tucked inside an exposed shell mouth. */
function glassWall(
  w: number,
  h: number,
  z: number,
  facing: 1 | -1,
  y: number,
  m: MeshLambertMaterial
): Mesh {
  const wall = new Mesh(new BoxGeometry(w, h, 0.03), m);
  wall.position.set(0, y, z);
  wall.rotation.x = facing * -24 * D2R; // top leans back under the shell
  return wall;
}

/** One hall: three nested harbour-facing sails + one reversed at the rear. */
function hall(
  white: MeshLambertMaterial,
  cream: MeshLambertMaterial,
  glass: MeshLambertMaterial
): Group {
  const row = new Group();
  row.add(sail({ R: 0.135, z: 0.3, m: cream }, 0));
  row.add(sail({ R: 0.2, z: 0.26, m: white }, 0));
  row.add(sail({ R: 0.29, z: 0.2, m: white }, 0));
  row.add(sail({ R: 0.185, z: -0.17, facing: -1, m: cream }, 0));
  row.add(glassWall(0.046, 0.06, 0.265, 1, 0.04, glass));
  row.add(glassWall(0.052, 0.068, -0.133, -1, 0.045, glass));
  return row;
}

export function build(): Group {
  const g = new Group();

  const white = mat(TONES.white);
  const cream = mat("#e7e1d3");
  const glass = mat("#57534a");
  const granite = mat("#c9ad91");
  const graniteDark = mat("#b89a7c");
  const water = mat(TONES.water);

  // --- Harbour water slab (this landmark grounds in water, not a plaza) ---
  const sea = new Mesh(new CylinderGeometry(0.37, 0.37, 0.014, 28), water);
  sea.position.y = 0.007;
  g.add(sea);

  // --- Podium: elongated peninsula, pointed toward the harbour (+Z) ---
  const shape = new Shape();
  const outline: [number, number][] = [
    [-0.17, 0.3],
    [-0.2, 0.2],
    [-0.2, -0.14],
    [-0.09, -0.29],
    [0.09, -0.29],
    [0.2, -0.14],
    [0.2, 0.2],
    [0.17, 0.3],
  ];
  shape.moveTo(outline[0][0], outline[0][1]);
  for (let i = 1; i < outline.length; i++)
    shape.lineTo(outline[i][0], outline[i][1]);
  shape.closePath();
  const podium = new Mesh(
    new ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false }),
    granite
  );
  podium.rotation.x = -Math.PI / 2; // shape y -> world -z (south = +y above)
  podium.position.y = 0.012;
  g.add(podium);

  // --- Monumental steps rising to the podium at the south end ---
  const stepW = 0.3;
  for (let i = 0; i < 3; i++) {
    const step = new Mesh(new BoxGeometry(stepW, 0.016, 0.03), graniteDark);
    step.position.set(0, 0.02 + i * 0.014, -0.255 - i * 0.02);
    g.add(step);
  }

  const podiumTop = 0.062;

  // --- West hall (Concert Hall): the larger row ---
  const west = hall(white, cream, glass);
  west.position.set(-0.088, podiumTop, 0.0);
  west.rotation.y = 3 * D2R;
  g.add(west);

  // --- East hall (Joan Sutherland Theatre): smaller, set back south ---
  const east = hall(white, cream, glass);
  east.scale.setScalar(0.8);
  east.position.set(0.09, podiumTop, -0.055);
  east.rotation.y = -4 * D2R;
  g.add(east);

  return g;
}
