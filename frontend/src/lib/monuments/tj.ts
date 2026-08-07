// Ismoil Somoni Peak (Pik Somoni, Pamir) — papercraft: a hard-facetted snow
// pyramid with knife arêtes, one slate face striped with snow couloirs, all
// riding a broad glacier shoulder. Landform: no plaza disc.

import {
  BoxGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const SEG = 6; // hexagonal peak -> six sharp arêtes
const D2R = Math.PI / 180;
const COS30 = Math.cos(30 * D2R);
const ROCK = "#79818e"; // slate rock face
const ROCK_DARK = "#636b78";
const ICE = "#e2e8ef"; // shaded glacier ice
const BASE_Y = 0.155; // where the peak springs from the shoulder

/** Straight-flanked arête profile of the peak, as (radius, height). */
const PEAK: Array<[number, number]> = [
  [0.228, BASE_Y],
  [0.195, 0.22],
  [0.161, 0.285],
  [0.128, 0.35],
  [0.095, 0.415],
  [0.062, 0.48],
  [0.028, 0.545],
  [0.0001, 0.6],
];

function peakR(y: number): number {
  for (let i = 1; i < PEAK.length; i++) {
    const [r0, y0] = PEAK[i - 1];
    const [r1, y1] = PEAK[i];
    if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return 0;
}

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

/**
 * Nudge the vertices sitting on one lathe ring up or down by an
 * angle-dependent amount so the glacier edge stops reading as a perfect
 * circle. Integer sine frequencies keep the lathe seam continuous.
 */
function jitterApron(mesh: Mesh, ringY: number, amp: number, phase: number): void {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    if (Math.abs(pos.getY(i) - ringY) > 1e-4) continue;
    const a = Math.atan2(pos.getZ(i), pos.getX(i));
    const d =
      amp *
      (0.5 +
        0.5 * Math.sin(2 * a + phase) +
        0.34 * Math.sin(3 * a + phase * 2.2) +
        0.26 * Math.sin(5 * a + phase * 3.9));
    pos.setY(i, Math.max(0, ringY + d));
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

/** Facet-local frame: local +z is the outward normal of the facet at `deg`. */
function facet(deg: number): Group {
  const grp = new Group();
  grp.rotation.y = deg * D2R;
  return grp;
}

/** Strip lying flat on a facet, running up-slope from y0 to y1. */
function faceStrip(
  lx: number,
  y0: number,
  y1: number,
  w: number,
  color: string
): Mesh {
  const d0 = peakR(y0) * COS30;
  const d1 = peakR(y1) * COS30;
  const m = new Mesh(
    new BoxGeometry(w, Math.hypot(d1 - d0, y1 - y0), 0.012),
    mat(color)
  );
  m.position.set(lx, (y0 + y1) / 2, (d0 + d1) / 2 + 0.007);
  m.rotation.x = Math.atan2(d1 - d0, y1 - y0);
  return m;
}

/** Crest line of the lateral arête (local x outward, y up). */
const CREST: Array<[number, number]> = [
  [0.08, 0.4],
  [0.14, 0.344],
  [0.172, 0.36],
  [0.212, 0.296],
  [0.25, 0.31],
  [0.288, 0.24],
  [0.318, 0.206],
  [0.348, 0.098],
];
/** Line the arête sits on, following the glacier shoulder back down. */
const FLANK: Array<[number, number]> = [
  [0.348, 0.008],
  [0.3, 0.068],
  [0.242, 0.126],
  [0.18, 0.185],
  [0.08, 0.27],
];

function areteBody(): Mesh {
  const s = new Shape();
  s.moveTo(CREST[0][0], CREST[0][1]);
  for (const [x, y] of CREST.slice(1)) s.lineTo(x, y);
  for (const [x, y] of FLANK) s.lineTo(x, y);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: 0.036, bevelEnabled: false });
  geo.translate(0, 0, -0.018);
  return new Mesh(geo, mat(ROCK));
}

function areteSnow(): Mesh {
  const s = new Shape();
  s.moveTo(CREST[0][0], CREST[0][1]);
  for (const [x, y] of CREST.slice(1)) s.lineTo(x, y);
  for (let i = CREST.length - 1; i >= 0; i--)
    s.lineTo(CREST[i][0], CREST[i][1] - 0.04);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: 0.044, bevelEnabled: false });
  geo.translate(0, 0, -0.022);
  return new Mesh(geo, mat(TONES.snow));
}

export function build(): Group {
  const g = new Group();

  // ---- glacier shoulders: broad, low snow apron out to a 0.72 footprint.
  //      Closed at the top so the peak never shows the shell's inside. ----
  const apron = lathe(
    [
      [0.36, 0],
      [0.345, 0.024],
      [0.32, 0.052],
      [0.293, 0.08],
      [0.268, 0.107],
      [0.248, 0.13],
      [0.236, 0.148],
      [0.0001, 0.152],
    ],
    TONES.snow,
    18
  );
  jitterApron(apron, 0, 0.014, 1.1);
  jitterApron(apron, 0.052, 0.01, 2.7);
  g.add(apron);

  // crevasse lines so the apron reads as glacier rather than snowdrift
  for (const [deg, r, y, len] of [
    [26, 0.3, 0.07, 0.1],
    [-64, 0.318, 0.05, 0.085],
    [150, 0.288, 0.082, 0.075],
    [-140, 0.324, 0.044, 0.06],
    [-14, 0.258, 0.115, 0.07],
  ] as const) {
    const c = new Mesh(new BoxGeometry(len, 0.006, 0.014), mat(ICE));
    const a = deg * D2R;
    c.position.set(Math.sin(a) * r, y, Math.cos(a) * r);
    c.rotation.y = a + 0.5;
    g.add(c);
  }

  // dark rock ribs breaking through the lower glacier
  for (const [deg, r, y, w, h] of [
    [-38, 0.298, 0.064, 0.06, 0.05],
    [96, 0.272, 0.085, 0.048, 0.042],
    [-118, 0.314, 0.046, 0.05, 0.038],
  ] as const) {
    const rib = new Mesh(new BoxGeometry(w, h, w * 0.7), mat(ROCK_DARK));
    const a = deg * D2R;
    rib.position.set(Math.sin(a) * r, y, Math.cos(a) * r);
    rib.rotation.y = a;
    g.add(rib);
  }

  // ---- the snow pyramid ----
  g.add(lathe(PEAK, TONES.snow, SEG));

  // Front-right facet is the great slate wall, stopping short of the summit
  // so the apex stays white; more rock breaks out low on the far facets.
  const outer = PEAK.map(
    ([r, y]) => [r + (r > 0.01 ? 0.005 : 0), y] as [number, number]
  );
  g.add(lathe(outer.slice(0, 6), ROCK, 1, 0, 60 * D2R));
  g.add(lathe(outer.slice(0, 4), ROCK_DARK, 1, 180 * D2R, 60 * D2R));
  g.add(lathe(outer.slice(0, 3), ROCK, 1, 120 * D2R, 60 * D2R));

  // Snow tongue spilling over the right half of the slate wall, plus two
  // narrow couloirs threading the shaded half.
  const overlay = PEAK.map(
    ([r, y]) => [r + (r > 0.01 ? 0.011 : 0), y] as [number, number]
  );
  g.add(lathe(overlay.slice(2, 6), TONES.snow, 1, 34 * D2R, 26 * D2R));
  const rockFace = facet(30);
  for (const [lx, y0, y1, w] of [
    [-0.062, BASE_Y, 0.33, 0.013],
    [-0.03, BASE_Y, 0.44, 0.01],
  ] as const)
    rockFace.add(faceStrip(lx, y0, y1, w, TONES.snow));
  g.add(rockFace);

  // ---- lateral knife arête running out over the left shoulder ----
  const ridge = new Group();
  ridge.rotation.y = 205 * D2R;
  ridge.add(areteBody());
  ridge.add(areteSnow());
  g.add(ridge);

  // ---- subsidiary summit on the far shoulder ----
  const sub = new Group();
  sub.position.set(-0.13, 0, 0.19);
  sub.add(
    lathe(
      [
        [0.098, 0.115],
        [0.076, 0.172],
        [0.05, 0.226],
        [0.025, 0.268],
        [0.0001, 0.295],
      ],
      TONES.snow,
      5
    )
  );
  const subRock = new Mesh(new BoxGeometry(0.05, 0.07, 0.018), mat(ROCK));
  subRock.position.set(0.042, 0.17, 0.048);
  subRock.rotation.y = 0.8;
  sub.add(subRock);
  g.add(sub);

  return g;
}
