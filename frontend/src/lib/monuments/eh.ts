// Dakhla (Western Sahara) — papercraft: a slender sand spit curving around a
// flat turquoise lagoon, one soft white crescent dune standing in the shallows,
// and a handful of low white cubic buildings out near the tip.
// Natural landform: no plaza disc, the sea plate is its own base.

import {
  BoxGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const D2R = Math.PI / 180;

const LAGOON = "#86c4c2"; // muted turquoise, deeper middle
const SHALLOW = "#a9d8d0"; // pale water over the sand flats
const SAND = "#ddc9a0"; // the spit
const DUNE = "#efeadd"; // soft white crescent dune
const BUILDING = TONES.white;

/** Curved ridge: a lens cross-section swept through an arc, then tapered at
 *  both ends so it reads as a spit or a dune horn rather than a ring segment. */
function ridge(
  rMid: number,
  halfW: number,
  base: number,
  crest: number,
  phi0: number,
  phiLen: number,
  seg: number,
  color: string,
  fade = 0.16
): Mesh {
  const rise = crest - base;
  const pts = [
    new Vector2(rMid + halfW, base),
    new Vector2(rMid + halfW * 0.62, base + rise * 0.76),
    new Vector2(rMid + halfW * 0.05, crest),
    new Vector2(rMid - halfW * 0.58, base + rise * 0.7),
    new Vector2(rMid - halfW, base),
  ];
  const m = new Mesh(
    new LatheGeometry(pts, seg, phi0 * D2R, phiLen * D2R),
    mat(color)
  );

  const pos = m.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 1e-5) continue;
    let deg = (Math.atan2(x, z) / D2R - phi0) % 360;
    if (deg < 0) deg += 360;
    // vertices on the start cap can land just short of a full turn
    const t = Math.min(deg / phiLen, 1);
    const e = Math.min(Math.max(Math.min(t, 1 - t) / fade, 0), 1);
    const taper = 0.12 + 0.88 * e * e * (3 - 2 * e);
    const nr = rMid + (r - rMid) * (0.3 + 0.7 * taper);
    pos.setXYZ(
      i,
      (x / r) * nr,
      base + (pos.getY(i) - base) * taper,
      (z / r) * nr
    );
  }
  pos.needsUpdate = true;
  m.geometry.computeVertexNormals();
  return m;
}

/** Flat water plate with a wobbled shoreline. */
function plate(radius: number, y0: number, y1: number, seg: number, color: string, amp: number, phase: number): Mesh {
  const m = new Mesh(
    new LatheGeometry(
      [new Vector2(radius, y0), new Vector2(radius, y1), new Vector2(0, y1)],
      seg
    ),
    mat(color)
  );
  const pos = m.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (Math.abs(r - radius) > 1e-4) continue;
    const a = Math.atan2(z, x);
    const nr =
      r + amp * (Math.sin(2 * a + phase) + 0.55 * Math.sin(3 * a + phase * 2.2));
    pos.setXYZ(i, (x / r) * nr, pos.getY(i), (z / r) * nr);
  }
  pos.needsUpdate = true;
  m.geometry.computeVertexNormals();
  return m;
}

export function build(): Group {
  const g = new Group();

  // ---- open Atlantic: a shallow sea drum, footprint 0.75 ----
  g.add(
    new Mesh(
      new LatheGeometry(
        [
          new Vector2(0.375, 0),
          new Vector2(0.371, 0.026),
          new Vector2(0.364, 0.052),
          new Vector2(0, 0.052),
        ],
        34
      ),
      mat(TONES.water)
    )
  );

  // ---- the lagoon inside the spit: pale flats, deeper turquoise middle ----
  g.add(plate(0.256, 0.046, 0.058, 26, SHALLOW, 0.016, 1.4));
  g.add(plate(0.162, 0.058, 0.062, 20, LAGOON, 0.02, 3.3));

  // ---- the spit itself, tapering to nothing at both ends ----
  g.add(ridge(0.288, 0.042, 0.044, 0.112, 40, 220, 36, SAND));

  // ---- the crescent dune standing in the shallows ----
  const dune = new Group();
  dune.position.set(-0.046, 0, -0.03);
  dune.add(ridge(0.09, 0.034, 0.05, 0.102, 210, 155, 16, DUNE, 0.26));
  g.add(dune);

  // ---- low white cubic buildings out along the spit ----
  for (const [deg, w, h, d] of [
    [56, 0.036, 0.032, 0.03],
    [66, 0.03, 0.026, 0.026],
    [76, 0.042, 0.038, 0.032],
    [86, 0.032, 0.028, 0.028],
    [97, 0.038, 0.034, 0.03],
    [108, 0.028, 0.024, 0.026],
  ] as const) {
    const a = deg * D2R;
    const radius = 0.288 + 0.012 * Math.sin(3 * a + 0.8);
    const t = new Group();
    t.position.set(Math.sin(a) * radius, 0.104, Math.cos(a) * radius);
    t.rotation.y = a;
    const body = new Mesh(new BoxGeometry(w, h, d), mat(BUILDING));
    body.position.y = h / 2;
    t.add(body);
    const roof = new Mesh(new BoxGeometry(w + 0.006, 0.005, d + 0.006), mat(SAND));
    roof.position.y = h + 0.002;
    t.add(roof);
    g.add(t);
  }

  return g;
}
