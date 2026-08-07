// Volcanoes National Park (Virunga chain) — papercraft landform: a chain of
// three broad green cones, the tallest carrying a flattened crater rim and a
// lenticular mist cap, with a grey-white mist layer banding them above the
// dark forest skirts and a tiny gorilla silhouette on the foreground slope.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  TorusGeometry,
  Vector2,
} from "three";
import { mat } from "./materials";

const SLOPE = "#71906a"; // sunlit volcanic slope
const SLOPE_D = "#5e7d5b"; // farther / shaded cone
const FOREST = "#3f5a42"; // dense forest skirt
const GROUND = "#587455"; // park floor
const CRATER = "#5b7a5b"; // shallow crater floor
const MIST = "#d9dedb"; // grey-white cloud
const APE = "#33382f"; // gorilla silhouette

const SEG = 18; // radial facets on every cone

type Cone = { x: number; z: number; r0: number; h: number; rTop: number };

/** Cone radius at absolute height y — slightly concave volcanic slope. */
function radiusAt(c: Cone, y: number): number {
  const t = Math.min(Math.max(y / c.h, 0), 1);
  return c.rTop + (c.r0 - c.rTop) * Math.pow(1 - t, 1.15);
}

function coneMesh(c: Cone, m: MeshLambertMaterial): Mesh {
  const ts = [0, 0.13, 0.27, 0.42, 0.57, 0.71, 0.84, 0.94, 1];
  const pts = ts.map((t) => new Vector2(radiusAt(c, t * c.h), t * c.h));
  const mesh = new Mesh(new LatheGeometry(pts, SEG), m);
  mesh.position.set(c.x, 0, c.z);
  return mesh;
}

/** Dark forest apron hugging the bottom of a cone. */
function skirtMesh(c: Cone, top: number, m: MeshLambertMaterial): Mesh {
  const pts = [
    new Vector2(c.r0 * 1.08, 0),
    new Vector2(radiusAt(c, top * 0.5) + 0.007, top * 0.5),
    new Vector2(radiusAt(c, top) + 0.004, top),
  ];
  const mesh = new Mesh(new LatheGeometry(pts, SEG), m);
  mesh.position.set(c.x, 0, c.z);
  return mesh;
}

/** Flattened mist ring wrapped around a cone at absolute height y, flared
 *  outward by `flare` so it drifts off the slope like cloud rather than a
 *  collar. */
function mistBand(
  c: Cone,
  y: number,
  tube: number,
  flare: number,
  m: MeshLambertMaterial
): Mesh {
  const ring = new Mesh(new TorusGeometry(radiusAt(c, y) + flare, tube, 4, 16), m);
  ring.rotation.x = Math.PI / 2;
  ring.scale.z = 0.34; // flattening happens on the local Z axis after rotation
  ring.position.set(c.x, y, c.z);
  return ring;
}

export function build(): Group {
  const g = new Group();
  const slope = mat(SLOPE);
  const slopeD = mat(SLOPE_D);
  const forest = mat(FOREST);
  const mist = mat(MIST);
  const ape = mat(APE);

  // ---- park floor: a very shallow green mound (no plaza — this is terrain) ----
  const floor = new Mesh(
    new LatheGeometry(
      [
        new Vector2(0.35, 0),
        new Vector2(0.335, 0.013),
        new Vector2(0.25, 0.027),
        new Vector2(0.13, 0.035),
        new Vector2(0, 0.038),
      ],
      24
    ),
    mat(GROUND)
  );
  g.add(floor);

  // ---- the chain: tallest at centre, two lower shoulders left and right ----
  const main: Cone = { x: 0.02, z: -0.03, r0: 0.208, h: 0.5, rTop: 0.078 };
  const left: Cone = { x: -0.195, z: 0.055, r0: 0.14, h: 0.325, rTop: 0.026 };
  const right: Cone = { x: 0.2, z: 0.09, r0: 0.118, h: 0.25, rTop: 0.022 };

  g.add(coneMesh(main, slope));
  g.add(coneMesh(left, slopeD));
  g.add(coneMesh(right, slopeD));

  g.add(skirtMesh(main, 0.1, forest));
  g.add(skirtMesh(left, 0.07, forest));
  g.add(skirtMesh(right, 0.055, forest));

  // ---- flattened crater rim on the tallest cone ----
  const dish = new Mesh(new CylinderGeometry(0.05, 0.046, 0.014, 12), mat(CRATER));
  dish.position.set(main.x, main.h - 0.004, main.z);
  g.add(dish);
  const rim = new Mesh(new TorusGeometry(0.072, 0.014, 4, 16), slope);
  rim.rotation.x = Math.PI / 2;
  rim.scale.z = 0.62;
  rim.position.set(main.x, main.h + 0.001, main.z);
  g.add(rim);

  // ---- mist: a low layer banding all three cones, plus a wide lenticular
  //      collar caught just under the main summit ----
  g.add(mistBand(main, 0.215, 0.02, 0.008, mist));
  g.add(mistBand(left, 0.168, 0.016, 0.004, mist));
  g.add(mistBand(right, 0.128, 0.015, 0.004, mist));
  g.add(mistBand(main, 0.355, 0.023, 0.034, mist));

  // ---- tiny gorilla silhouette on the forest floor, front-centre ----
  const ga = new Group();
  ga.position.set(-0.03, 0.028, 0.25);
  ga.rotation.y = 0.2;
  g.add(ga);
  const part = (w: number, h: number, d: number, x: number, y: number, z: number) => {
    const m = new Mesh(new BoxGeometry(w, h, d), ape);
    m.position.set(x, y, z);
    ga.add(m);
  };
  part(0.05, 0.036, 0.038, 0, 0.026, -0.004); // hunched back
  part(0.044, 0.026, 0.03, 0, 0.052, 0.008); // heavy shoulders
  part(0.024, 0.022, 0.021, 0, 0.07, 0.016); // low-set head
  part(0.012, 0.042, 0.012, -0.029, 0.021, 0.014); // knuckling arms
  part(0.012, 0.042, 0.012, 0.029, 0.021, 0.014);
  part(0.014, 0.02, 0.014, -0.015, 0.01, -0.016); // haunches
  part(0.014, 0.02, 0.014, 0.015, 0.01, -0.016);

  return g;
}
