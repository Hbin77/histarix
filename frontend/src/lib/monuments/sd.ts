// Meroë Pyramids — papercraft: a cluster of narrow, steep-sided Nubian
// pyramids of varying heights standing on rippled ochre dunes, each with a
// small pylon-fronted porch chapel offset at its eastern foot.

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
import { mat } from "./materials";

const STONE = "#ab7659"; // sunlit Nubian sandstone
const STONE_D = "#8e6045"; // shaded courses, plinths
const CHAPEL = "#c2947a"; // lighter chapel masonry
const STONE_L = "#b8836a"; // alternate course tone, keeps the cluster legible
const DOOR = "#584234"; // chapel doorway
const DUNE = "#dcc292"; // desert floor
const RIPPLE = "#cbae7d"; // wind-ripple shadow

const SQ2 = Math.SQRT2;
const D45 = Math.PI / 4;

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

/** Nubian pyramid: steep two-stage taper on a low plinth. `hw` is the base
 *  half-width; the apex lands at roughly 1.02 × `h` above the sand. */
function pyramid(hw: number, h: number, broken: number, face: string): Group {
  const g = new Group();
  g.add(box(hw * 2.2, 0.016, hw * 2.2, 0, 0.008, 0, STONE_D));

  const midHW = hw * 0.4;
  const lowH = h * 0.62 * broken;
  const lower = new Mesh(
    new CylinderGeometry(
      (hw + (midHW - hw) * broken) * SQ2,
      hw * SQ2,
      lowH,
      4,
      1
    ),
    mat(face)
  );
  lower.rotation.y = D45;
  lower.position.y = 0.016 + lowH / 2;
  g.add(lower);

  // course band marking the change of batter
  const band = new Mesh(
    new CylinderGeometry(midHW * 1.0 * SQ2, midHW * 1.05 * SQ2, 0.009, 4, 1),
    mat(STONE_D)
  );
  band.rotation.y = D45;
  band.position.y = 0.016 + lowH;
  g.add(band);

  if (broken >= 1) {
    const cap = new Mesh(new ConeGeometry(midHW * SQ2, h * 0.42, 4), mat(face));
    cap.rotation.y = D45;
    cap.position.y = 0.016 + lowH + (h * 0.42) / 2;
    g.add(cap);
  }
  return g;
}

/** Small pylon chapel: battered walls, flared cornice, dark doorway. */
function chapel(w: number, h: number, d: number): Group {
  const g = new Group();
  const bodyGeo = new CylinderGeometry(w * 0.42 * SQ2, w * 0.5 * SQ2, h, 4, 1);
  bodyGeo.rotateY(D45); // rotate the geometry so scale.z stays on the chapel's axis
  const body = new Mesh(bodyGeo, mat(CHAPEL));
  body.position.y = h / 2;
  body.scale.z = d / w;
  g.add(body);
  g.add(box(w * 1.06, h * 0.14, d * 1.12, 0, h + h * 0.06, 0, STONE_D));
  g.add(box(w * 0.3, h * 0.52, 0.012, 0, h * 0.26, d * 0.5, DOOR));
  return g;
}

export function build(): Group {
  const g = new Group();

  // ---- dune floor: shallow ochre mound, no plaza (this is desert) ----
  g.add(
    new Mesh(
      new LatheGeometry(
        [
          new Vector2(0.345, 0),
          new Vector2(0.33, 0.012),
          new Vector2(0.24, 0.024),
          new Vector2(0.12, 0.03),
          new Vector2(0, 0.032),
        ],
        28
      ),
      mat(DUNE)
    )
  );

  // wind ripples: long low ridges lying across the sand
  for (const [x, z, len, wide, ry] of [
    [-0.155, 0.185, 0.13, 0.042, 0.22],
    [0.115, 0.235, 0.105, 0.036, -0.14],
    [0.225, -0.115, 0.09, 0.034, 0.5],
    [-0.235, -0.08, 0.085, 0.032, -0.4],
    [0.02, -0.215, 0.115, 0.04, 0.08],
  ] as const) {
    const r = new Mesh(
      new SphereGeometry(1, 10, 3, 0, Math.PI * 2, 0, Math.PI / 2),
      mat(RIPPLE)
    );
    r.scale.set(len, 0.014, wide);
    r.position.set(x, 0.024, z);
    r.rotation.y = ry;
    g.add(r);
  }

  // ---- the cluster: tall pyramids behind, smaller ones stepping forward ----
  // Nubian pyramids run about 70° at the base, so height ≈ 3 × half-width.
  const field: Array<[number, number, number, number, number]> = [
    // x, z, half-width, height, broken (1 = intact)
    [-0.085, -0.07, 0.114, 0.348, 1],
    [0.12, -0.095, 0.092, 0.281, 1],
    [0.225, 0.08, 0.069, 0.211, 1],
    [-0.05, 0.135, 0.081, 0.247, 1],
    [-0.235, 0.05, 0.067, 0.205, 1],
    [0.088, 0.235, 0.061, 0.186, 0.45],
  ];

  field.forEach(([x, z, hw, h, broken], i) => {
    const p = pyramid(hw, h, broken, i % 2 ? STONE_L : STONE);
    p.position.set(x, 0.026, z);
    g.add(p);

    if (broken >= 1) {
      // porch chapel against the east face, offset off the axis
      const cw = hw * 0.58;
      const cd = hw * 0.44;
      const c = chapel(cw, hw * 0.62, cd);
      c.position.set(x + hw * 0.3, 0.026, z + hw + cd * 0.46);
      g.add(c);
    }
  });

  // ---- fallen blocks at the foot of the ruined pyramid ----
  for (const [x, z, s, ry] of [
    [0.02, 0.265, 0.036, 0.5],
    [0.155, 0.28, 0.029, -0.3],
    [0.075, 0.295, 0.025, 0.9],
  ] as const) {
    const b = box(s, s * 0.5, s * 0.78, x, 0.026 + s * 0.25, z, STONE_D);
    b.rotation.y = ry;
    g.add(b);
  }

  return g;
}
