// NEWBORN (Pristina) — papercraft: the seven freestanding capitals standing
// in a row on the plaza, built from chunky slab strokes in muted mustard,
// their faces broken by small painted doodle motifs. The row is turned off
// axis so the word still reads from the quarter and side views.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
} from "three";
import { mat, plazaDisc } from "./materials";

const H = 0.285; // cap height
const S = 0.026; // stroke thickness
const T = 0.058; // letter depth
const GAP = 0.011;
const MUSTARD = "#c7a244";
const yellow = mat(MUSTARD);

/** Vertical stroke spanning y0..y1 centred on xc. */
function vbar(xc: number, y0: number, y1: number, t = S): Mesh {
  const m = new Mesh(new BoxGeometry(t, y1 - y0, T), yellow);
  m.position.set(xc, (y0 + y1) / 2, 0);
  return m;
}

/** Horizontal stroke spanning x0..x1 at height yc. */
function hbar(x0: number, x1: number, yc: number, t = S): Mesh {
  const m = new Mesh(new BoxGeometry(x1 - x0, t, T), yellow);
  m.position.set((x0 + x1) / 2, yc, 0);
  return m;
}

/** Slanted stroke from (ax, ay) to (bx, by). */
function diag(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  t = S
): Mesh {
  const len = Math.hypot(bx - ax, by - ay);
  const m = new Mesh(new BoxGeometry(t, len + t * 0.5, T), yellow);
  m.position.set((ax + bx) / 2, (ay + by) / 2, 0);
  m.rotation.z = Math.atan2(-(bx - ax), by - ay);
  return m;
}

/** Strokes for one capital, drawn in a w-wide, H-tall cell from (0, 0). */
function glyph(ch: string, w: number): Group {
  const g = new Group();
  switch (ch) {
    case "N":
      g.add(vbar(S / 2, 0, H));
      g.add(vbar(w - S / 2, 0, H));
      g.add(diag(S * 0.55, H - S * 0.35, w - S * 0.55, S * 0.35, S * 1.02));
      break;
    case "E":
      g.add(vbar(S / 2, 0, H));
      g.add(hbar(0, w, H - S / 2));
      g.add(hbar(0, w - S * 0.25, H / 2, S * 0.94));
      g.add(hbar(0, w, S / 2));
      break;
    case "W":
      g.add(diag(S * 0.6, H, w * 0.29, S * 0.55));
      g.add(diag(w * 0.29, S * 0.55, w * 0.5, H * 0.62));
      g.add(diag(w * 0.5, H * 0.62, w * 0.71, S * 0.55));
      g.add(diag(w * 0.71, S * 0.55, w - S * 0.6, H));
      break;
    case "B":
      g.add(vbar(S / 2, 0, H));
      g.add(hbar(0, w - S * 0.6, H - S / 2));
      g.add(hbar(0, w - S * 0.2, H / 2, S * 0.94));
      g.add(hbar(0, w, S / 2));
      g.add(vbar(w - S * 1.1, H / 2, H));
      g.add(vbar(w - S / 2, 0, H / 2));
      break;
    case "O":
      g.add(vbar(S / 2, 0, H));
      g.add(vbar(w - S / 2, 0, H));
      g.add(hbar(0, w, H - S / 2));
      g.add(hbar(0, w, S / 2));
      break;
    case "R":
      g.add(vbar(S / 2, 0, H));
      g.add(hbar(0, w, H - S / 2));
      g.add(hbar(0, w - S * 0.2, H * 0.54, S * 0.94));
      g.add(vbar(w - S / 2, H * 0.54, H));
      g.add(diag(w * 0.46, H * 0.54, w - S * 0.5, S * 0.4));
      break;
  }
  return g;
}

/** Small painted motif stuck on a letter's front face. */
function doodle(
  x: number,
  y: number,
  size: number,
  round: boolean,
  m: MeshLambertMaterial
): Mesh {
  const mesh = round
    ? new Mesh(new CylinderGeometry(size / 2, size / 2, 0.006, 10), m)
    : new Mesh(new BoxGeometry(size, size, 0.006), m);
  if (round) mesh.rotation.x = Math.PI / 2;
  mesh.position.set(x, y, T / 2 + 0.001);
  return mesh;
}

const LETTERS: Array<[string, number]> = [
  ["N", 0.088],
  ["E", 0.078],
  ["W", 0.11],
  ["B", 0.082],
  ["O", 0.088],
  ["R", 0.084],
  ["N", 0.088],
];

// [letter index, x as a fraction of that letter's width, y fraction of H,
//  size, round?, tone] — all anchored on strokes that always exist.
const DOODLES: Array<[number, number, number, number, boolean, string]> = [
  [0, 0.0, 0.74, 0.017, false, "#6b86a8"],
  [0, 0.0, 0.44, 0.015, true, "#b0685e"],
  [0, 1.0, 0.24, 0.014, false, "#e8e3d6"],
  [1, 0.0, 0.78, 0.016, true, "#e8e3d6"],
  [1, 0.6, 1.0, 0.015, false, "#7e9b76"],
  [1, 0.0, 0.3, 0.014, false, "#b0685e"],
  [2, 0.5, 0.6, 0.017, false, "#6b86a8"],
  [3, 0.0, 0.76, 0.017, true, "#b0685e"],
  [3, 0.55, 0.5, 0.014, false, "#e8e3d6"],
  [3, 0.0, 0.34, 0.014, false, "#7e9b76"],
  [4, 0.0, 0.52, 0.017, false, "#7e9b76"],
  [4, 1.0, 0.68, 0.015, true, "#6b86a8"],
  [4, 1.0, 0.28, 0.014, false, "#b0685e"],
  [5, 0.0, 0.32, 0.017, false, "#6b86a8"],
  [5, 0.54, 1.0, 0.014, true, "#e8e3d6"],
  [5, 0.0, 0.72, 0.014, false, "#7e9b76"],
  [6, 0.0, 0.58, 0.016, true, "#7e9b76"],
  [6, 1.0, 0.3, 0.015, false, "#b0685e"],
  [6, 1.0, 0.72, 0.014, false, "#6b86a8"],
];

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  const row = new Group();
  row.rotation.y = 0.52; // ~30°, so the word reads from every stage angle
  g.add(row);

  const total =
    LETTERS.reduce((a, [, w]) => a + w, 0) + GAP * (LETTERS.length - 1);

  // low paving plinth under the word
  const plinth = new Mesh(
    new BoxGeometry(total + 0.05, 0.03, T + 0.075),
    mat("#c0b9a9")
  );
  plinth.position.y = 0.015;
  row.add(plinth);

  const doodleMats = new Map<string, MeshLambertMaterial>();
  const tone = (hex: string) => {
    let m = doodleMats.get(hex);
    if (!m) doodleMats.set(hex, (m = mat(hex)));
    return m;
  };

  let x = -total / 2;
  LETTERS.forEach(([ch, w], i) => {
    const cell = new Group();
    cell.position.set(x, 0.03, 0);
    cell.add(glyph(ch, w));
    for (const [li, fx, fy, size, round, hex] of DOODLES) {
      if (li !== i) continue;
      const px = fx === 0 ? S / 2 : fx === 1 ? w - S / 2 : fx * w;
      const py = fy === 1 ? H - S / 2 : fy * H;
      cell.add(doodle(px, py, size, round, tone(hex)));
    }
    row.add(cell);
    x += w + GAP;
  });

  return g;
}
