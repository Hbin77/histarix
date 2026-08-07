// Basilique Notre-Dame de la Paix (Yamoussoukro) — papercraft: an immense
// ribbed soft-grey dome with lantern and cross over a columned ivory rotunda,
// two smaller domed pavilions beside it, and curved colonnades sweeping
// forward to embrace the pale esplanade.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const D2R = Math.PI / 180;

const IVORY = "#e4dcce"; // walls, entablatures
const IVORY_LIT = "#f0eade"; // column shafts standing proud of the wall
const DOME = "#bdb9b0"; // soft stone grey of the great dome
const DOME_RIB = "#cfcac0"; // meridian ribs
const DOME_SM = "#b0b6bd"; // slate blue on the pavilion domes
const PAVE = "#e4dcca"; // esplanade paving

/** Hollow annular slab (rectangular cross-section revolved around Y). */
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

/** Ring of engaged columns: narrow vertical ribbons standing proud of a wall.
 *  Two triangles each, so a drum or a colonnade can be lined cheaply.
 *  `inward` flips the winding for shafts seen from inside a curved arcade. */
function colonnade(
  count: number,
  radius: number,
  y0: number,
  y1: number,
  widthDeg: number,
  phiStart = 0,
  phiLen = 360,
  inward = false
): Group {
  const g = new Group();
  const m = mat(IVORY_LIT);
  const profile = inward
    ? [new Vector2(radius, y1), new Vector2(radius, y0)]
    : [new Vector2(radius, y0), new Vector2(radius, y1)];
  for (let i = 0; i < count; i++) {
    const phi = phiStart + (phiLen * i) / count;
    g.add(new Mesh(new LatheGeometry(profile, 1, phi * D2R, widthDeg * D2R), m));
  }
  return g;
}

function cross(h: number): Group {
  const g = new Group();
  const m = mat(IVORY);
  const stem = new Mesh(new BoxGeometry(h * 0.11, h, h * 0.11), m);
  stem.position.y = h / 2;
  g.add(stem);
  const arm = new Mesh(new BoxGeometry(h * 0.44, h * 0.11, h * 0.11), m);
  arm.position.y = h * 0.72;
  g.add(arm);
  return g;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  const ivory = mat(IVORY);
  const stone = mat(TONES.stone);

  // ---- esplanade fanning out in front, with a lighter central axis ----
  g.add(ring(0.238, 0.362, 0.012, 0.022, mat(PAVE), 12, -42 * D2R, 84 * D2R));
  g.add(ring(0.238, 0.362, 0.022, 0.03, mat(TONES.white), 6, -12 * D2R, 24 * D2R));

  // ---- stepped podium ----
  const tier = (r: number, y0: number, y1: number) => {
    const t = new Mesh(new CylinderGeometry(r, r + 0.008, y1 - y0, 16), stone);
    t.position.y = (y0 + y1) / 2;
    g.add(t);
  };
  tier(0.238, 0, 0.028);
  tier(0.215, 0.028, 0.052);

  // ---- rotunda: columned drum, entablature, attic drum ----
  const drum = new Mesh(new CylinderGeometry(0.105, 0.105, 0.173, 20), ivory);
  drum.position.y = 0.1385;
  g.add(drum);
  g.add(colonnade(16, 0.114, 0.062, 0.212, 13));
  g.add(ring(0.1, 0.128, 0.225, 0.248, ivory, 14));
  const attic = new Mesh(new CylinderGeometry(0.108, 0.108, 0.052, 18), ivory);
  attic.position.y = 0.274;
  g.add(attic);
  g.add(ring(0.108, 0.128, 0.288, 0.302, ivory, 14));

  // ---- the great dome, ribbed along its meridians ----
  const domePts: Array<[number, number]> = [
    [0.124, 0.3],
    [0.124, 0.32],
    [0.12, 0.352],
    [0.11, 0.392],
    [0.094, 0.432],
    [0.071, 0.47],
    [0.043, 0.499],
    [0.021, 0.512],
  ];
  g.add(
    new Mesh(
      new LatheGeometry(
        domePts.map(([r, y]) => new Vector2(r, y)),
        18
      ),
      mat(DOME)
    )
  );
  const ribPts = domePts.map(([r, y]) => new Vector2(r + 0.005, y));
  const ribMat = mat(DOME_RIB);
  for (let i = 0; i < 12; i++)
    g.add(new Mesh(new LatheGeometry(ribPts, 1, ((i * 360) / 12) * D2R, 8 * D2R), ribMat));

  // ---- lantern, cupola and crowning cross ----
  const lantern = new Mesh(new CylinderGeometry(0.026, 0.028, 0.058, 12), ivory);
  lantern.position.y = 0.541;
  g.add(lantern);
  g.add(ring(0.024, 0.035, 0.57, 0.58, ivory, 8));
  const cupola = new Mesh(new CylinderGeometry(0.005, 0.028, 0.034, 12), mat(DOME));
  cupola.position.y = 0.597;
  g.add(cupola);
  const ball = new Mesh(new SphereGeometry(0.01, 6, 4), ivory);
  ball.position.y = 0.62;
  g.add(ball);
  const top = cross(0.05);
  top.position.y = 0.624;
  g.add(top);

  // ---- flanking domed pavilions ----
  for (const sx of [1, -1]) {
    const p = new Group();
    p.position.set(sx * 0.165, 0, 0);
    const body = new Mesh(new CylinderGeometry(0.042, 0.042, 0.078, 14), ivory);
    body.position.y = 0.091;
    p.add(body);
    p.add(colonnade(10, 0.048, 0.058, 0.124, 15));
    p.add(ring(0.04, 0.057, 0.13, 0.142, ivory, 10));
    p.add(
      new Mesh(
        new LatheGeometry(
          [
            new Vector2(0.052, 0.142),
            new Vector2(0.049, 0.16),
            new Vector2(0.04, 0.178),
            new Vector2(0.025, 0.192),
            new Vector2(0.01, 0.199),
          ],
          10
        ),
        mat(DOME_SM)
      )
    );
    const finial = cross(0.032);
    finial.position.y = 0.199;
    p.add(finial);
    g.add(p);
  }

  // ---- curved colonnades sweeping forward to embrace the esplanade ----
  const wall = mat(TONES.stoneDark);
  for (const [phi0, len] of [
    [34, 78],
    [248, 78],
  ] as const) {
    const a0 = phi0 * D2R;
    const aLen = len * D2R;
    g.add(ring(0.25, 0.294, 0.012, 0.032, stone, 9, a0, aLen));
    g.add(ring(0.266, 0.28, 0.032, 0.098, wall, 9, a0, aLen));
    g.add(colonnade(11, 0.284, 0.032, 0.098, 5, phi0 + 2, len - 4));
    g.add(colonnade(11, 0.262, 0.032, 0.098, 5, phi0 + 2, len - 4, true));
    g.add(ring(0.252, 0.292, 0.098, 0.116, ivory, 9, a0, aLen));
  }

  return g;
}
