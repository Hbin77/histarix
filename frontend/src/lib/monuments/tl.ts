// Cristo Rei de Díli — papercraft: an ivory robed figure with arms flung
// wide and heavy sleeve drapes hanging beneath them, standing on a banded
// globe atop a tapering pedestal on a muted green cape headland.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const IVORY = "#e8e3d6";
const IVORY_SHADE = "#cbc5b5";
const HILL = "#6f8f6a"; // muted green cape
const HILL_DARK = "#5e7d5b";
const GLOBE = "#7f9ab4";
const CONTINENT = "#a9b493";
const BAND = "#b9a271";

const HILL_Y = 0.18; // headland summit, where the pedestal starts
const GLOBE_Y = 0.505;
const GLOBE_R = 0.085;
const SHOULDER_Y = 0.836;

/** Right-hand sleeve outline: arm on top, heavy cloth swagging below. */
const SLEEVE: Array<[number, number]> = [
  [0.026, 0.846],
  [0.182, 0.936],
  [0.19, 0.912],
  [0.16, 0.856],
  [0.132, 0.812],
  [0.104, 0.776],
  [0.078, 0.798],
  [0.05, 0.788],
  [0.026, 0.802],
];

function lathe(pts: Array<[number, number]>, color: string, segs: number): Mesh {
  return new Mesh(
    new LatheGeometry(
      pts.map(([r, y]) => new Vector2(r, y)),
      segs
    ),
    mat(color)
  );
}

function sleeve(sx: number): Mesh {
  const s = new Shape();
  s.moveTo(sx * SLEEVE[0][0], SLEEVE[0][1]);
  for (const [x, y] of SLEEVE.slice(1)) s.lineTo(sx * x, y);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: 0.064, bevelEnabled: false });
  geo.translate(0, 0, -0.032);
  return new Mesh(geo, mat(IVORY));
}

/** Tapered arm running from the shoulder out to the raised hand. */
function arm(sx: number): Mesh {
  const x0 = sx * 0.04;
  const y0 = 0.84;
  const x1 = sx * 0.176;
  const y1 = 0.93;
  const len = Math.hypot(x1 - x0, y1 - y0);
  const m = new Mesh(new CylinderGeometry(0.012, 0.018, len, 8), mat(IVORY));
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0);
  m.rotation.z = Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2;
  return m;
}

export function build(): Group {
  const g = new Group();

  // ---- headland: green cape with a rocky shore ledge ----
  g.add(
    lathe(
      [
        [0.375, 0],
        [0.362, 0.028],
        [0.335, 0.06],
        [0.3, 0.093],
        [0.25, 0.128],
        [0.192, 0.158],
        [0.145, 0.175],
        [0.0001, HILL_Y],
      ],
      HILL,
      24
    )
  );
  g.add(
    lathe(
      [
        [0.375, 0],
        [0.368, 0.016],
        [0.356, 0.03],
        [0.353, 0.027],
        [0.366, 0.014],
        [0.373, 0],
      ],
      TONES.stoneDark,
      24
    )
  );
  // shaded fold on the far flank
  g.add(
    new Mesh(
      new LatheGeometry(
        [
          new Vector2(0.352, 0.036),
          new Vector2(0.296, 0.092),
          new Vector2(0.288, 0.097),
          new Vector2(0.344, 0.042),
        ],
        14,
        Math.PI * 0.9,
        Math.PI * 0.75
      ),
      mat(HILL_DARK)
    )
  );

  // pilgrim stair climbing the front of the cape, laid on the slope
  for (const [z, y] of [
    [0.33, 0.066],
    [0.3, 0.095],
    [0.27, 0.114],
    [0.24, 0.133],
    [0.21, 0.149],
    [0.18, 0.164],
    [0.155, 0.173],
  ] as const) {
    const step = new Mesh(
      new BoxGeometry(0.078 - (0.33 - z) * 0.08, 0.014, 0.036),
      mat(TONES.stone)
    );
    step.position.set(0, y, z);
    g.add(step);
  }

  // ---- tapering pedestal ----
  g.add(
    lathe(
      [
        [0.132, HILL_Y - 0.01],
        [0.132, 0.212],
        [0.112, 0.222],
        [0.098, 0.29],
        [0.086, 0.38],
        [0.082, 0.42],
        [0.096, 0.428],
        [0.096, 0.446],
        [0.0001, 0.45],
      ],
      TONES.stone,
      12
    )
  );
  g.add(
    lathe(
      [
        [0.136, 0.196],
        [0.136, 0.214],
        [0.13, 0.216],
        [0.13, 0.198],
      ],
      TONES.stoneDark,
      12
    )
  );

  // ---- banded globe ----
  const globe = new Mesh(new SphereGeometry(GLOBE_R, 14, 10), mat(GLOBE));
  globe.position.y = GLOBE_Y;
  g.add(globe);
  for (const [rx, ry] of [
    [Math.PI / 2, 0],
    [0, 0],
    [0, Math.PI / 2],
  ] as const) {
    const ring = new Mesh(new TorusGeometry(GLOBE_R + 0.002, 0.004, 4, 20), mat(BAND));
    ring.position.y = GLOBE_Y;
    ring.rotation.set(rx, ry, 0);
    g.add(ring);
  }
  // continents: flattened patches clinging to the sphere
  for (const [lat, lon, w, h] of [
    [12, 30, 0.055, 0.045],
    [-28, -50, 0.045, 0.05],
    [35, -110, 0.04, 0.035],
    [-10, 150, 0.05, 0.03],
  ] as const) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = lon * (Math.PI / 180);
    const patch = new Mesh(new BoxGeometry(w, h, 0.012), mat(CONTINENT));
    patch.position.set(
      GLOBE_R * Math.sin(phi) * Math.sin(theta),
      GLOBE_Y + GLOBE_R * Math.cos(phi),
      GLOBE_R * Math.sin(phi) * Math.cos(theta)
    );
    patch.lookAt(0, GLOBE_Y, 0);
    g.add(patch);
  }

  // ---- the figure ----
  g.add(
    lathe(
      [
        [0.062, 0.572],
        [0.066, 0.588],
        [0.062, 0.63],
        [0.057, 0.69],
        [0.052, 0.75],
        [0.048, 0.8],
        [0.044, SHOULDER_Y],
        [0.028, 0.854],
      ],
      IVORY,
      12
    )
  );
  // front seam of the robe, and its shaded back
  const seam = new Mesh(new BoxGeometry(0.014, 0.26, 0.012), mat(IVORY_SHADE));
  seam.position.set(0, 0.7, 0.052);
  g.add(seam);
  g.add(
    new Mesh(
      new LatheGeometry(
        [
          new Vector2(0.06, 0.578),
          new Vector2(0.055, 0.68),
          new Vector2(0.05, 0.77),
          new Vector2(0.042, SHOULDER_Y),
        ],
        6,
        Math.PI * 0.72,
        Math.PI * 0.56
      ),
      mat(IVORY_SHADE)
    )
  );

  for (const sx of [1, -1]) {
    g.add(sleeve(sx));
    g.add(arm(sx));
    const hand = new Mesh(new BoxGeometry(0.026, 0.03, 0.022), mat(IVORY));
    hand.position.set(sx * 0.178, 0.932, 0);
    hand.rotation.z = sx * -0.5;
    g.add(hand);
  }

  const neck = new Mesh(new CylinderGeometry(0.016, 0.02, 0.024, 8), mat(IVORY));
  neck.position.y = 0.858;
  g.add(neck);
  const head = new Mesh(new SphereGeometry(0.032, 10, 8), mat(IVORY));
  head.position.y = 0.888;
  g.add(head);
  const hair = new Mesh(
    new SphereGeometry(0.036, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.72),
    mat(IVORY_SHADE)
  );
  hair.position.set(0, 0.89, -0.009);
  g.add(hair);
  const beard = new Mesh(new ConeGeometry(0.017, 0.036, 6), mat(IVORY_SHADE));
  beard.position.set(0, 0.868, 0.019);
  beard.rotation.x = Math.PI;
  g.add(beard);

  return g;
}
