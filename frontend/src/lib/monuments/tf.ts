// Mont Ross (Kerguelen) — papercraft: a twin-summited charcoal volcanic
// massif draped in white glacier ice, its jagged saddle ridge linking the two
// peaks, rising steeply out of a cold gray-blue sea. Landform: no plaza disc.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const D2R = Math.PI / 180;
const ROCK = "#4e535c"; // charcoal basalt
const ROCK_DARK = "#3e434c";
const ROCK_LIGHT = "#5e646e";
const ICE = TONES.snow;
const ICE_SHADE = "#dde4ec";
const SEA_DARK = "#7ba0c2";

/** Main summit profile, as (radius, height) in the massif's local frame. */
const PEAK_A: Array<[number, number]> = [
  [0.168, 0.1],
  [0.144, 0.19],
  [0.119, 0.27],
  [0.093, 0.35],
  [0.066, 0.43],
  [0.038, 0.51],
  [0.0001, 0.58],
];
/** Secondary summit. */
const PEAK_B: Array<[number, number]> = [
  [0.118, 0.09],
  [0.098, 0.16],
  [0.077, 0.235],
  [0.055, 0.31],
  [0.032, 0.38],
  [0.0001, 0.44],
];

function lathe(
  pts: Array<[number, number]>,
  color: string,
  segs: number,
  phiStart = 0,
  phiLen = Math.PI * 2
): Mesh {
  return new Mesh(
    new LatheGeometry(
      pts.map(([r, y]) => new Vector2(r, y)),
      segs,
      phiStart,
      phiLen
    ),
    mat(color)
  );
}

const offset = (pts: Array<[number, number]>, d: number) =>
  pts.map(([r, y]) => [r + (r > 0.01 ? d : 0), y] as [number, number]);

/** Jag the coastline so the island does not read as a poker chip. */
function jagShore(mesh: Mesh, ringY: number, amp: number, phase: number): void {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    if (Math.abs(pos.getY(i) - ringY) > 1e-4) continue;
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const a = Math.atan2(z, x);
    const d =
      1 +
      amp *
        (0.5 * Math.sin(3 * a + phase) +
          0.34 * Math.sin(5 * a + phase * 1.9) +
          0.22 * Math.sin(8 * a + phase * 3.3));
    pos.setXYZ(i, x * d, ringY, z * d);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

/** Sawtooth crest joining the two summits, extruded into a knife ridge. */
function saddle(color: string, drop: number, depth: number): Mesh {
  const crest: Array<[number, number]> = [
    [0.02, 0.45],
    [0.05, 0.4],
    [0.072, 0.416],
    [0.096, 0.334],
    [0.117, 0.362],
    [0.14, 0.318],
    [0.162, 0.4],
  ];
  const s = new Shape();
  s.moveTo(crest[0][0], crest[0][1]);
  for (const [x, y] of crest.slice(1)) s.lineTo(x, y);
  for (let i = crest.length - 1; i >= 0; i--)
    s.lineTo(crest[i][0], crest[i][1] - drop);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth, bevelEnabled: false });
  geo.translate(0, 0, -depth / 2);
  return new Mesh(geo, mat(color));
}

export function build(): Group {
  const g = new Group();

  // ---- cold gray-blue sea ----
  const sea = new Mesh(new CylinderGeometry(0.375, 0.375, 0.028, 32), mat(TONES.water));
  sea.position.y = 0.014;
  g.add(sea);
  for (const [deg, r, len] of [
    [42, 0.315, 0.13],
    [-70, 0.33, 0.11],
    [138, 0.3, 0.1],
    [-158, 0.325, 0.09],
  ] as const) {
    const a = deg * D2R;
    const swell = new Mesh(new BoxGeometry(len, 0.005, 0.024), mat(SEA_DARK));
    swell.position.set(Math.sin(a) * r, 0.028, Math.cos(a) * r);
    swell.rotation.y = a + 0.35;
    g.add(swell);
  }

  const massif = new Group();
  massif.position.set(-0.02, 0, -0.03);
  massif.scale.set(1.05, 1, 0.95);
  g.add(massif);

  // ---- rocky shore shelf climbing out of the water ----
  const shelf = lathe(
    [
      [0.3, 0.018],
      [0.288, 0.048],
      [0.264, 0.08],
      [0.234, 0.108],
      [0.204, 0.128],
      [0.182, 0.14],
      [0.0001, 0.143],
    ],
    ROCK,
    22
  );
  jagShore(shelf, 0.018, 0.12, 1.3);
  massif.add(shelf);
  // wave-cut band at the waterline
  const band = lathe(
    [
      [0.3, 0.018],
      [0.29, 0.042],
      [0.286, 0.04],
      [0.296, 0.017],
    ],
    ROCK_DARK,
    22
  );
  jagShore(band, 0.018, 0.12, 1.3);
  massif.add(band);

  // ---- main summit: charcoal cone under a heavy ice drape ----
  const peakA = new Group();
  peakA.position.set(-0.05, 0, -0.02);
  massif.add(peakA);
  peakA.add(lathe(PEAK_A, ROCK, 5));
  peakA.add(lathe(offset(PEAK_A.slice(3), 0.006), ICE, 5)); // summit ice cap
  peakA.add(lathe(offset(PEAK_A.slice(0, 5), 0.011), ICE, 1, 0, 72 * D2R));
  peakA.add(lathe(offset(PEAK_A.slice(1, 4), 0.011), ICE, 1, 144 * D2R, 72 * D2R));
  peakA.add(lathe(offset(PEAK_A.slice(2, 5), 0.011), ICE_SHADE, 1, -144 * D2R, 72 * D2R));
  // rock ribs cutting back through the ice
  for (const [deg, from, to, wide] of [
    [96, 2, 6, 26],
    [-38, 3, 6, 20],
    [172, 3, 5, 22],
  ] as const)
    peakA.add(
      lathe(
        offset(PEAK_A.slice(from, to), 0.009),
        ROCK_DARK,
        1,
        (deg - wide / 2) * D2R,
        wide * D2R
      )
    );

  // broken ice front: dark teeth biting into the foot of each glacier tongue
  for (const [deg, y, r, w, h] of [
    [24, 0.13, 0.135, 0.05, 0.042],
    [52, 0.155, 0.126, 0.04, 0.034],
    [168, 0.272, 0.1, 0.042, 0.034],
    [-166, 0.28, 0.098, 0.038, 0.03],
  ] as const) {
    const a = deg * D2R;
    const tooth = new Mesh(new BoxGeometry(w, h, 0.024), mat(ROCK));
    tooth.position.set(Math.sin(a) * r, y, Math.cos(a) * r);
    tooth.rotation.set(0.25, a, 0.2);
    peakA.add(tooth);
  }

  // ---- secondary summit ----
  const peakB = new Group();
  peakB.position.set(0.105, 0, 0.055);
  massif.add(peakB);
  peakB.add(lathe(PEAK_B, ROCK_LIGHT, 5));
  peakB.add(lathe(offset(PEAK_B.slice(3), 0.006), ICE, 5));
  peakB.add(lathe(offset(PEAK_B.slice(1, 4), 0.011), ICE, 1, -72 * D2R, 72 * D2R));
  peakB.add(
    lathe(offset(PEAK_B.slice(2, 5), 0.009), ROCK_DARK, 1, 128 * D2R, 24 * D2R)
  );

  // ---- jagged saddle ridge linking the two summits ----
  const ridge = new Group();
  ridge.position.set(-0.05, 0, -0.02);
  ridge.rotation.y = -Math.atan2(0.075, 0.155);
  ridge.add(saddle(ROCK, 0.28, 0.05));
  ridge.add(saddle(ICE, 0.035, 0.058));
  massif.add(ridge);

  // ---- volcanic spires and crags on the shoulders ----
  for (const [x, z, r, h, ry, color] of [
    [-0.19, 0.115, 0.032, 0.15, 0.4, ROCK_DARK],
    [0.075, -0.165, 0.028, 0.12, 1.1, ROCK],
    [-0.135, -0.155, 0.026, 0.1, 0.7, ROCK_DARK],
    [0.185, 0.12, 0.03, 0.09, 0.2, ROCK_LIGHT],
  ] as const) {
    const spire = new Mesh(new ConeGeometry(r, h, 5), mat(color));
    spire.position.set(x, 0.11 + h / 2, z);
    spire.rotation.y = ry;
    massif.add(spire);
  }

  // ---- low dark headland out on the water in the foreground ----
  const cape = new Group();
  cape.position.set(0.195, 0, 0.178);
  g.add(cape);
  for (const [x, z, r, h, ry, color] of [
    [0, 0, 0.062, 0.1, 0.3, ROCK],
    [0.05, 0.042, 0.042, 0.068, 1.2, ROCK_DARK],
    [-0.045, 0.04, 0.036, 0.055, 0.8, ROCK_LIGHT],
  ] as const) {
    const rock = new Mesh(new CylinderGeometry(r * 0.72, r, h, 6), mat(color));
    rock.position.set(x, 0.014 + h / 2, z);
    rock.rotation.y = ry;
    cape.add(rock);
  }

  return g;
}
