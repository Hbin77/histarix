// Livingstone–Stanley Monument (Mugere) — papercraft: the big leaning wedge
// of granite carved with the explorers' names, ringed by loose stones on a low
// plinth atop a grassy rise, with the pale band of Lake Tanganyika behind.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const R = 0.37; // terrain radius (footprint 0.74)
const KNOLL_Y = 0.075; // top of the grassy rise
const PLINTH_Y = 0.032;
const BOULDER_H = 0.36;
const LEAN = 0.16; // horizontal drift per unit height

const GRANITE = "#9b9188";
const GRANITE_DARK = "#847a71";
const GRASS = "#8ea36c";
const GRASS_DARK = "#7a8f5c";
const SHORE = "#c3b795";

/** Circle-segment slab: everything beyond z = -chord, on the terrain circle. */
function lakeSlab(chord: number, radius: number, h: number, color: string): Mesh {
  const xc = Math.sqrt(radius * radius - chord * chord);
  const a = Math.atan2(xc, chord);
  const s = new Shape();
  s.moveTo(chord, -xc);
  s.absarc(0, 0, radius, -a, a, false);
  s.closePath();
  const geo = new ExtrudeGeometry(s, {
    depth: h,
    bevelEnabled: false,
    curveSegments: 10,
  });
  geo.rotateX(-Math.PI / 2);
  geo.rotateY(Math.PI / 2); // swing the segment round to the far shore
  return new Mesh(geo, mat(color));
}

/**
 * The monolith: a chunky tapered 7-sided prism jittered into rough facets,
 * with the top sliced on a slant so one corner rises into the apex and the
 * far side falls away in a long back slope. Base stays flat at y = 0.
 */
function monolith(): Mesh {
  const geo = new CylinderGeometry(0.075, 0.19, BOULDER_H, 7, 3);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const t = (y + BOULDER_H / 2) / BOULDER_H;
    let nx = x;
    let nz = z;
    let ny = y;
    const rr = Math.hypot(x, z);
    if (rr > 1e-5) {
      const a = Math.atan2(z, x);
      const k =
        1 +
        0.11 * Math.sin(3 * a + 2.1) +
        0.06 * Math.sin(5 * a - 1.3) +
        0.08 * Math.sin(2 * a + 3.4 * t);
      nx = x * k;
      nz = z * k;
      if (t > 0.02)
        ny =
          y +
          0.018 * Math.sin(4 * a + 2.6 * t) +
          0.1 * Math.pow(t, 1.7) * Math.cos(a); // slanted crest
    }
    pos.setXYZ(i, nx + LEAN * (y + BOULDER_H / 2), ny, nz);
  }
  geo.scale(1, 1, 0.85); // a fin, but a thick, heavy one
  geo.translate(0, BOULDER_H / 2, 0);
  geo.computeVertexNormals();
  return new Mesh(geo, mat(GRANITE));
}

export function build(): Group {
  const g = new Group();

  // ---- terrain: grassy plain, sandy shore, lake band at the back ----
  const ground = new Mesh(new CylinderGeometry(R, R, 0.03, 28), mat(GRASS));
  ground.position.y = 0.015;
  g.add(ground);
  g.add(lakeSlab(0.185, R, 0.034, SHORE));
  const lake = lakeSlab(0.235, R - 0.004, 0.036, TONES.water);
  g.add(lake);

  // ---- grassy rise the monument stands on ----
  g.add(
    new Mesh(
      new LatheGeometry(
        [
          new Vector2(0.345, 0.028),
          new Vector2(0.332, 0.044),
          new Vector2(0.305, 0.062),
          new Vector2(0.24, KNOLL_Y),
          new Vector2(0.0001, KNOLL_Y + 0.004),
        ],
        24
      ),
      mat(GRASS_DARK)
    )
  );

  // ---- low stone plinth ----
  const plinth = new Mesh(
    new CylinderGeometry(0.25, 0.268, PLINTH_Y, 9),
    mat(TONES.stoneDark)
  );
  plinth.position.y = KNOLL_Y + PLINTH_Y / 2 - 0.004;
  plinth.rotation.y = 0.25;
  g.add(plinth);

  // ---- the boulder ----
  const rock = monolith();
  rock.position.set(-0.03, KNOLL_Y + PLINTH_Y - 0.008, 0);
  rock.rotation.y = -0.22;
  g.add(rock);

  // carved name panel on the broad face
  const panel = new Mesh(new BoxGeometry(0.08, 0.055, 0.026), mat(GRANITE_DARK));
  panel.position.set(-0.044, 0.23, 0.138);
  panel.rotation.set(-0.1, -0.22, 0.05);
  g.add(panel);

  // ---- loose stones ringing the foot ----
  const stone = mat(GRANITE_DARK);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.4;
    const s = 0.03 + 0.012 * Math.sin(i * 2.3);
    const b = new Mesh(new SphereGeometry(s, 5, 4), stone);
    b.scale.set(1.2, 0.7, 1);
    b.position.set(
      Math.sin(a) * 0.238 - 0.02,
      KNOLL_Y + PLINTH_Y + s * 0.2,
      Math.cos(a) * 0.238
    );
    b.rotation.y = a;
    g.add(b);
  }

  // ---- scrub dotting the plain ----
  const scrub = mat(GRASS_DARK);
  for (const [x, z, s] of [
    [-0.28, 0.14, 0.03],
    [0.26, 0.19, 0.026],
    [-0.16, 0.28, 0.022],
    [0.31, -0.05, 0.024],
    [-0.31, -0.04, 0.028],
    [0.13, 0.3, 0.02],
  ] as const) {
    const bush = new Mesh(new SphereGeometry(s, 5, 4), scrub);
    bush.scale.y = 0.7;
    bush.position.set(x, 0.03 + s * 0.4, z);
    g.add(bush);
  }

  return g;
}
