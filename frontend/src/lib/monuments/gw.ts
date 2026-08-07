// Catedral de Nossa Senhora da Candelária (Bissau) — papercraft: boxy
// mid-century church, chalk-white walls with dusty terracotta trim, two
// squat square bell towers with pyramid caps flanking a plain triangular
// gable, and the small lighthouse lantern crowning the left tower.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
  TorusGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;
const TERRA = "#b4705a"; // dusty terracotta trim
const TERRA_DARK = "#9a5b47"; // roof tiles
const OPENING = "#5b5142"; // recessed louvres / doorway

const FACE_Z = 0.14; // facade plane
const NAVE_H = 0.38; // wall top
const RIDGE_Y = 0.525; // gable apex
const HALF_W = 0.16; // nave half width

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

/** Triangular prism laid along Z: base y0, apex height h, spans z0 → z1. */
function gablePrism(
  halfW: number,
  y0: number,
  h: number,
  z0: number,
  z1: number,
  color: string
): Mesh {
  const s = new Shape();
  s.moveTo(-halfW, 0);
  s.lineTo(halfW, 0);
  s.lineTo(0, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: z0 - z1, bevelEnabled: false });
  geo.translate(0, y0, z1);
  return new Mesh(geo, mat(color));
}

/** Flat disc facing +Z (rose window pane, clock face, arch tympanum). */
function disc(r: number, thick: number, seg: number, color: string): Mesh {
  const geo = new CylinderGeometry(r, r, thick, seg);
  geo.rotateX(Math.PI / 2);
  return new Mesh(geo, mat(color));
}

function pyramid(halfW: number, h: number, color: string): Mesh {
  const geo = new ConeGeometry(halfW * SQ2, h, 4);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, h / 2, 0);
  return new Mesh(geo, mat(color));
}

const SHAFT = 0.52; // bell-tower shaft top
const BELFRY_Y = 0.545;
const BELFRY_H = 0.12;
const CAP_Y = 0.688; // pyramid roof springs here

/** One squat bell tower, optionally crowned with the lighthouse lantern. */
function tower(lantern: boolean): Group {
  const g = new Group();

  g.add(box(0.15, SHAFT, 0.15, 0, SHAFT / 2, 0, TONES.white));
  g.add(box(0.166, 0.028, 0.166, 0, 0.014, 0, TERRA)); // plinth band
  g.add(box(0.166, 0.024, 0.166, 0, 0.532, 0, TERRA)); // belfry cornice

  // belfry stage with a grid of small louvre openings on every face
  g.add(box(0.138, BELFRY_H, 0.138, 0, BELFRY_Y + BELFRY_H / 2, 0, TONES.white));
  const louvre = new BoxGeometry(0.022, 0.026, 0.008);
  for (let f = 0; f < 4; f++) {
    const a = (f * Math.PI) / 2;
    for (let c = -1; c <= 1; c++) {
      for (let r = 0; r < 3; r++) {
        const m = new Mesh(louvre, mat(OPENING));
        const u = c * 0.034;
        const v = BELFRY_Y + 0.024 + r * 0.036;
        m.position.set(
          Math.cos(a) * u + Math.sin(a) * 0.067,
          v,
          -Math.sin(a) * u + Math.cos(a) * 0.067
        );
        m.rotation.y = a;
        g.add(m);
      }
    }
  }

  g.add(box(0.172, 0.026, 0.172, 0, 0.678, 0, TERRA)); // roof cornice
  const roof = pyramid(0.086, 0.148, TERRA_DARK);
  roof.position.y = CAP_Y;
  g.add(roof);

  // clock face on the shaft, front side
  const ring = new Mesh(new TorusGeometry(0.032, 0.007, 5, 14), mat(TERRA));
  ring.position.set(0, 0.44, 0.076);
  g.add(ring);
  const dial = disc(0.03, 0.008, 14, TONES.stone);
  dial.position.set(0, 0.44, 0.076);
  g.add(dial);

  if (lantern) {
    g.add(box(0.082, 0.016, 0.082, 0, 0.844, 0, TONES.white)); // gallery deck
    const glass = new Mesh(
      new CylinderGeometry(0.031, 0.033, 0.05, 8),
      mat(TONES.slate)
    );
    glass.position.y = 0.877;
    g.add(glass);
    const cap = new Mesh(new ConeGeometry(0.044, 0.036, 8), mat(TERRA_DARK));
    cap.position.y = 0.92;
    g.add(cap);
  }
  return g;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  // ---- nave block + terracotta cornice ----
  g.add(box(0.34, NAVE_H, 0.36, 0, NAVE_H / 2, -0.04, TONES.white));
  g.add(box(0.36, 0.02, 0.378, 0, NAVE_H + 0.01, -0.04, TERRA));
  g.add(box(0.356, 0.028, 0.374, 0, 0.014, -0.04, TERRA)); // plinth band

  // tall slot windows down each flank
  for (const sx of [1, -1])
    for (const z of [-0.02, -0.1, -0.18])
      g.add(box(0.008, 0.115, 0.036, sx * 0.171, 0.245, z, OPENING));

  // ---- roof prism, with the facade gable framed by a terracotta rim ----
  g.add(gablePrism(0.178, 0.39, 0.148, 0.115, -0.245, TERRA_DARK));
  g.add(gablePrism(0.178, 0.39, 0.148, FACE_Z + 0.002, 0.112, TERRA));
  g.add(gablePrism(0.162, 0.39, 0.131, FACE_Z + 0.016, FACE_Z, TONES.white));

  // rose window on the upper facade
  const rose = new Mesh(new TorusGeometry(0.046, 0.011, 5, 16), mat(TERRA));
  rose.position.set(0, 0.3, 0.147);
  g.add(rose);
  const pane = disc(0.04, 0.008, 16, TONES.stone);
  pane.position.set(0, 0.3, 0.146);
  g.add(pane);
  for (let i = 0; i < 6; i++) {
    const spoke = box(0.07, 0.008, 0.008, 0, 0.3, 0.151, TERRA);
    spoke.rotation.z = (i * Math.PI) / 6;
    g.add(spoke);
  }

  // ---- arched portal ----
  const archRing = new Mesh(
    new TorusGeometry(0.062, 0.014, 5, 14, Math.PI),
    mat(TERRA)
  );
  archRing.position.set(0, 0.17, 0.147);
  g.add(archRing);
  for (const sx of [1, -1])
    g.add(box(0.028, 0.17, 0.028, sx * 0.062, 0.085, 0.147, TERRA));
  const tymp = disc(0.05, 0.012, 14, OPENING);
  tymp.position.set(0, 0.17, 0.145);
  g.add(tymp);
  g.add(box(0.1, 0.17, 0.012, 0, 0.085, 0.145, OPENING));

  // ---- towers ----
  const left = tower(true);
  left.position.set(-0.245, 0, 0.065);
  g.add(left);
  const right = tower(false);
  right.position.set(0.245, 0, 0.065);
  g.add(right);

  // ---- cross on the gable apex ----
  g.add(box(0.017, 0.082, 0.017, 0, 0.579, 0.148, TONES.stoneDark));
  g.add(box(0.054, 0.017, 0.017, 0, 0.6, 0.148, TONES.stoneDark));

  // ---- entrance steps ----
  g.add(box(0.24, 0.02, 0.075, 0, 0.01, 0.178, TONES.stone));
  g.add(box(0.2, 0.02, 0.05, 0, 0.03, 0.165, TONES.stone));

  return g;
}
