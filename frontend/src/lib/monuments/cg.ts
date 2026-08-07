// Tour Nabemba (Brazzaville) — papercraft: a slender cylinder that swells at
// the waist and flares into a ribbed crown, pale sand fins over dusty teal
// glass, standing alone above a low riverfront skyline on the Congo.

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

const RIB = "#d6c6a4"; // pale sand facade fins
const GLASS = "#68878a"; // dusty teal glazing between the fins
const CROWN = "#e0d2b4"; // lighter cap and cornice
const QUAY = TONES.stoneDark;

/** Tower silhouette (radius, height): base, waist swell, taper, flared crown. */
const SHAFT: Array<[number, number]> = [
  [0.101, 0.0],
  [0.108, 0.22],
  [0.112, 0.45],
  [0.106, 0.66],
  [0.096, 0.8],
  [0.102, 0.818],
  [0.121, 0.864],
  [0.121, 0.888],
];

const RIBS = 18; // fins around the shaft
const RIB_SPAN = 12; // degrees of sand per 20° pitch — the rest reads as glass

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

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.35));

  // ---- the Congo sweeping past the front-right, with a stone quay ----
  const RIVER_0 = 22 * D2R;
  const RIVER_LEN = 108 * D2R;
  g.add(ring(0.236, 0.352, 0.006, 0.018, mat(TONES.water), 20, RIVER_0, RIVER_LEN));
  g.add(
    ring(0.224, 0.24, 0.008, 0.03, mat(QUAY), 18, RIVER_0 - 0.08, RIVER_LEN + 0.16)
  );

  // ---- low riverfront town: flat-roofed blocks with a shallow cornice ----
  const town = (deg: number, radius: number, w: number, h: number, d: number, c: string) => {
    const a = deg * D2R;
    const t = new Group();
    t.position.set(Math.sin(a) * radius, 0.012, Math.cos(a) * radius);
    t.rotation.y = a;
    t.add(box(w, h, d, 0, h / 2, 0, c));
    t.add(box(w + 0.009, 0.008, d + 0.009, 0, h + 0.004, 0, QUAY));
    g.add(t);
  };
  // front row along the quay
  town(152, 0.272, 0.106, 0.058, 0.05, TONES.white);
  town(182, 0.274, 0.09, 0.078, 0.05, TONES.stone);
  town(212, 0.272, 0.112, 0.05, 0.048, TONES.sand);
  town(242, 0.274, 0.094, 0.072, 0.05, TONES.white);
  town(272, 0.272, 0.104, 0.046, 0.048, TONES.stone);
  town(302, 0.274, 0.088, 0.066, 0.05, TONES.sand);
  town(332, 0.272, 0.11, 0.054, 0.05, TONES.white);
  // second row set back behind it
  town(196, 0.204, 0.078, 0.09, 0.046, TONES.sandDark);
  town(258, 0.202, 0.07, 0.062, 0.044, TONES.stone);
  town(318, 0.204, 0.074, 0.084, 0.046, TONES.sandDark);

  // ---- podium the tower rises from ----
  const podium = new Mesh(new CylinderGeometry(0.128, 0.144, 0.038, 20), mat(CROWN));
  podium.position.y = 0.019;
  g.add(podium);

  // ---- shaft: teal glazed core behind the fins ----
  g.add(
    new Mesh(
      new LatheGeometry(
        SHAFT.map(([r, y]) => new Vector2(r, y)),
        24
      ),
      mat(GLASS)
    )
  );
  const roof = new Mesh(new CylinderGeometry(0.112, 0.118, 0.01, 24), mat(CROWN));
  roof.position.y = 0.889;
  g.add(roof);

  // ---- sand fins riding the full silhouette, flaring with the crown ----
  const ribPts = SHAFT.map(([r, y]) => new Vector2(r + 0.007, y));
  for (let i = 0; i < RIBS; i++)
    g.add(
      new Mesh(
        new LatheGeometry(ribPts, 2, (i * 360) / RIBS * D2R, RIB_SPAN * D2R),
        mat(RIB)
      )
    );

  // ---- base band, cornice capping the fins, and the roof mast ----
  g.add(ring(0.1, 0.113, 0.038, 0.058, mat(CROWN), 24));
  g.add(ring(0.116, 0.128, 0.888, 0.898, mat(CROWN), 24));
  const mast = new Mesh(new CylinderGeometry(0.003, 0.005, 0.086, 6), mat(TONES.slate));
  mast.position.y = 0.946;
  g.add(mast);
  g.add(box(0.026, 0.005, 0.005, 0, 0.955, 0, TONES.slate));
  g.add(box(0.018, 0.005, 0.005, 0, 0.972, 0, TONES.slate));

  return g;
}
