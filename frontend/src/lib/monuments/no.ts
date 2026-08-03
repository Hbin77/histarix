// Bryggen (Bergen) — papercraft: Hanseatic wharf row of six tall narrow
// wooden gabled houses (muted red/ochre/white/mustard) shoulder to shoulder
// facing a timber quay and the harbor water.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
} from "three";
import { mat, TONES } from "./materials";

const RED = "#a35a4a"; // TONES.woodRed
const RED_DEEP = "#96513f";
const MUSTARD = "#c8a45f";
const OCHRE = "#b8794e";
const TIMBER = "#a9906a";

interface HouseSpec {
  w: number; // full width (shoulder-to-shoulder pitch)
  wallH: number; // eave height
  gableH: number; // gable rise above eave
  d: number; // depth (front-to-back)
  body: string;
  roof: string;
  trim: string; // window/door color
  chimney?: boolean;
  endSide?: 1 | -1; // exposed end wall of the row: add side windows
}

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

/** One gabled house. Group origin: ground center of the facade line (z=front). */
function house(s: HouseSpec): Group {
  const g = new Group();
  const bw = s.w - 0.006; // seam between neighbors
  const hw = bw / 2;

  // body
  g.add(box(bw, s.wallH, s.d, 0, s.wallH / 2, -s.d / 2, s.body));

  // gable prism (same wood color as body), ridge along Z
  const tri = new Shape();
  tri.moveTo(-hw, 0);
  tri.lineTo(hw, 0);
  tri.lineTo(0, s.gableH);
  tri.closePath();
  const prism = new Mesh(
    new ExtrudeGeometry(tri, { depth: s.d, bevelEnabled: false }),
    mat(s.body)
  );
  prism.position.set(0, s.wallH, -s.d);
  g.add(prism);

  // two roof slope panels with overhang
  const ang = Math.atan2(s.gableH, hw);
  const slope = Math.hypot(hw, s.gableH) + 0.022;
  for (const side of [1, -1]) {
    const panel = new Mesh(
      new BoxGeometry(slope, 0.011, s.d + 0.026),
      mat(s.roof)
    );
    panel.rotation.z = side * ang;
    // slope midpoint, pushed slightly out along the slope normal
    panel.position.set(
      -side * (hw / 2 + 0.004 * Math.sin(ang)),
      s.wallH + s.gableH / 2 + 0.004 * Math.cos(ang),
      -s.d / 2
    );
    g.add(panel);
  }

  // white bargeboard trim along the front gable edges (Bryggen signature)
  for (const side of [1, -1]) {
    const board = new Mesh(
      new BoxGeometry(slope - 0.014, 0.009, 0.007),
      mat(s.trim)
    );
    board.rotation.z = side * ang;
    board.position.set(
      -side * (hw / 2 - 0.002 * Math.sin(ang)),
      s.wallH + s.gableH / 2 - 0.004,
      0.009
    );
    g.add(board);
  }

  // facade: ground-floor doorway
  g.add(box(0.03, 0.052, 0.008, 0, 0.026, 0.003, s.trim));
  // two rows of paired windows
  for (const wy of [0.105, 0.175]) {
    for (const wx of [-0.022, 0.022]) {
      g.add(box(0.017, 0.024, 0.007, wx, wy, 0.0025, s.trim));
    }
  }
  // gable loft door + hoist beam at the peak (Hanseatic warehouse hoist)
  g.add(box(0.02, 0.03, 0.007, 0, s.wallH + 0.028, 0.0025, s.trim));
  g.add(box(0.007, 0.007, 0.035, 0, s.wallH + s.gableH - 0.028, 0.012, TIMBER));

  if (s.chimney) {
    g.add(
      box(0.02, 0.034, 0.02, 0, s.wallH + s.gableH + 0.008, -s.d * 0.62, TONES.stoneDark)
    );
  }

  // side windows on the exposed end walls of the row
  if (s.endSide) {
    const sx = s.endSide * (hw + 0.0035);
    for (const wz of [-s.d * 0.25, -s.d * 0.55, -s.d * 0.85]) {
      for (const wy of [0.105, 0.175]) {
        g.add(box(0.007, 0.024, 0.017, sx, wy, wz, s.trim));
      }
    }
  }
  return g;
}

export function build(): Group {
  const g = new Group();

  // harbor water — full grounding disc, curved edge reads as the sea front
  const water = new Mesh(
    new CylinderGeometry(0.355, 0.355, 0.008, 28),
    mat(TONES.water)
  );
  water.position.y = 0.004;
  g.add(water);

  // stone quay slab the row stands on
  g.add(box(0.62, 0.02, 0.3, 0, 0.017, -0.05, TONES.plaza));
  // timber wharf edge along the waterline
  g.add(box(0.62, 0.024, 0.05, 0, 0.024, 0.085, TIMBER));
  // bollards on the wharf
  const bollGeo = new CylinderGeometry(0.007, 0.008, 0.026, 6);
  const bollMat = mat(TONES.ironDark);
  for (const bx of [-0.24, -0.08, 0.08, 0.24]) {
    const b = new Mesh(bollGeo, bollMat);
    b.position.set(bx, 0.048, 0.098);
    g.add(b);
  }

  // ---- the wharf row: six narrow gabled houses, facades toward the water ----
  const specs: HouseSpec[] = [
    { w: 0.098, wallH: 0.285, gableH: 0.13, d: 0.24, body: RED, roof: TONES.slate, trim: TONES.white, chimney: true, endSide: -1 },
    { w: 0.098, wallH: 0.26, gableH: 0.115, d: 0.22, body: MUSTARD, roof: TONES.brickDark, trim: TONES.white },
    { w: 0.098, wallH: 0.3, gableH: 0.135, d: 0.25, body: TONES.white, roof: TONES.brickDark, trim: TONES.ink, chimney: true },
    { w: 0.098, wallH: 0.27, gableH: 0.12, d: 0.23, body: RED_DEEP, roof: TONES.slate, trim: TONES.white },
    { w: 0.098, wallH: 0.265, gableH: 0.115, d: 0.22, body: TONES.white, roof: TONES.brickDark, trim: TONES.ink },
    { w: 0.098, wallH: 0.29, gableH: 0.13, d: 0.24, body: OCHRE, roof: TONES.slate, trim: TONES.white, chimney: true, endSide: 1 },
  ];
  const pitch = 0.098;
  const x0 = -pitch * 2.5;
  const frontJitter = [0.004, -0.005, 0.006, -0.003, 0.002, -0.006];
  specs.forEach((s, i) => {
    const h = house(s);
    h.position.set(x0 + i * pitch, 0.027, 0.055 + frontJitter[i]);
    g.add(h);
  });

  return g;
}
