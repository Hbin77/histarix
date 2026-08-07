// Maison des Esclaves (Gorée) — papercraft: small two-storey coral-pink house
// with twin curved staircases sweeping up from the courtyard to the upper
// gallery, the dark Door of No Return passing clean through the ground floor
// to the blue sea behind, all under a muted terracotta roof.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
} from "three";
import { mat, TONES } from "./materials";

const PINK = "#c98a84"; // coral-pink render, sunlit
const PINK_D = "#ad7069"; // shaded walls, stair flanks
const PINK_L = "#d9a39c"; // upper storey, catches more light
const TERRA = "#b06a4f"; // terracotta roof
const DARK = "#463832"; // doorways, the passage
const YARD = "#d6c5a6"; // sandy courtyard

const GF = 0.032; // courtyard level
const FLOOR1 = GF + 0.195; // upper-floor / landing level
const SQ2 = Math.SQRT2;

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

/** One curved flight: a quarter-circle sweep of solid steps rising from the
 *  courtyard to the upper landing, with a low outer balustrade.
 *  `side` is -1 for the left flight, +1 for the right. */
function curvedStair(side: number, steps: number): Group {
  const g = new Group();
  const cx = side * 0.2;
  const cz = 0.1;
  const R = 0.135;
  const radial = 0.05;
  const tread = ((R * Math.PI) / 2 / steps) * 1.3;
  const rise = FLOOR1 - GF;

  for (let i = 0; i < steps; i++) {
    const t = (i + 0.5) / steps;
    const a = -side * t * (Math.PI / 2);
    const top = GF + (rise * (i + 1)) / steps;
    const px = cx + Math.sin(a) * R;
    const pz = cz + Math.cos(a) * R;

    const step = new Mesh(new BoxGeometry(tread, top, radial), mat(PINK));
    step.position.set(px, top / 2, pz);
    step.rotation.y = a;
    g.add(step);

    // outer balustrade riding the rim of the flight
    const rOut = R + radial / 2 - 0.007;
    const rail = new Mesh(new BoxGeometry(tread, 0.032, 0.016), mat(PINK_D));
    rail.position.set(cx + Math.sin(a) * rOut, top + 0.016, cz + Math.cos(a) * rOut);
    rail.rotation.y = a;
    g.add(rail);
  }
  return g;
}

export function build(): Group {
  const g = new Group();

  // ---- blue sea, then the sandy courtyard shelf the house stands on ----
  const sea = new Mesh(new CylinderGeometry(0.34, 0.335, 0.024, 36), mat(TONES.water));
  sea.position.y = 0.012;
  g.add(sea);

  const yard = new Mesh(new CylinderGeometry(0.3, 0.3, 0.032, 26), mat(YARD));
  yard.scale.z = 0.78;
  yard.position.set(0, 0.016, 0.055);
  g.add(yard);

  // ---- ground floor: two blocks with the passage running clean between ----
  for (const sx of [-1, 1]) {
    g.add(box(0.135, 0.195, 0.17, sx * 0.1325, GF + 0.0975, 0, PINK));
    // shuttered openings on the courtyard face
    g.add(box(0.032, 0.056, 0.012, sx * 0.163, GF + 0.112, 0.086, DARK));
  }

  // passage side walls + lintel — the Door of No Return, open front to back
  for (const sx of [-1, 1]) {
    g.add(box(0.014, 0.116, 0.17, sx * 0.058, GF + 0.058, 0, DARK));
  }
  g.add(box(0.13, 0.04, 0.17, 0, GF + 0.175, 0, PINK_D));
  // shallow arch head over the courtyard end of the passage
  const arch = new Mesh(
    new CylinderGeometry(0.051, 0.051, 0.016, 12, 1, false, Math.PI / 2, Math.PI),
    mat(DARK)
  );
  arch.rotation.set(Math.PI / 2, 0, 0);
  arch.position.set(0, GF + 0.116, 0.085);
  g.add(arch);
  // the sea itself, framed at the far end of the passage
  g.add(box(0.13, 0.15, 0.008, 0, GF + 0.07, -0.093, TONES.water));

  // ---- twin curved staircases ----
  g.add(curvedStair(-1, 9));
  g.add(curvedStair(1, 9));

  // landing spanning between the two flights, in front of the upper storey
  g.add(box(0.2, 0.026, 0.06, 0, FLOOR1 - 0.013, 0.115, PINK));
  g.add(box(0.2, 0.03, 0.014, 0, FLOOR1 + 0.015, 0.138, PINK_D));

  // ---- upper storey: full-width gallery block ----
  g.add(box(0.4, 0.145, 0.17, 0, FLOOR1 + 0.0725, 0, PINK_L));
  // central doorway the stairs deliver you to
  g.add(box(0.05, 0.09, 0.014, 0, FLOOR1 + 0.045, 0.088, DARK));
  // flanking windows with pale reveals
  for (const x of [-0.155, -0.077, 0.077, 0.155]) {
    g.add(box(0.042, 0.062, 0.01, x, FLOOR1 + 0.056, 0.088, TONES.white));
    g.add(box(0.03, 0.05, 0.014, x, FLOOR1 + 0.056, 0.089, DARK));
  }

  // ---- terracotta roof: cornice band and a low hipped cap ----
  g.add(box(0.414, 0.016, 0.184, 0, FLOOR1 + 0.153, 0, PINK_D));
  // rotate at geometry level so the z-squash lands on the roof's own axis
  const capGeo = new CylinderGeometry(0.088 * SQ2, 0.206 * SQ2, 0.072, 4, 1);
  capGeo.rotateY(Math.PI / 4);
  const cap = new Mesh(capGeo, mat(TERRA));
  cap.scale.z = 0.46;
  cap.position.y = FLOOR1 + 0.197;
  g.add(cap);

  // ---- a low sea wall along the back of the courtyard ----
  const wall = new Shape();
  wall.moveTo(-0.18, 0);
  wall.lineTo(0.18, 0);
  wall.lineTo(0.18, 0.03);
  wall.lineTo(-0.18, 0.03);
  wall.closePath();
  const wallGeo = new ExtrudeGeometry(wall, { depth: 0.02, bevelEnabled: false });
  wallGeo.translate(0, GF, -0.163);
  g.add(new Mesh(wallGeo, mat(PINK_D)));

  return g;
}
