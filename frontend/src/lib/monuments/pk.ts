// Badshahi Mosque, Lahore — papercraft miniature.
// Red sandstone courtyard with entrance gate, prayer hall crowned by three
// bulbous white marble onion domes, white-framed pointed arches, and four
// tall slender red corner minarets capped with white marble pavilions.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const RED = "#b26a55"; // muted red sandstone
const REDD = "#96574a"; // shadowed sandstone
const RECESS = "#7c4538"; // dark arch recess

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

/** Bulbous Mughal onion dome; base ring at local y = 0, apex ~1.5r. */
const DOME_PROFILE: [number, number][] = [
  [0.5, 0],
  [0.84, 0.12],
  [1.0, 0.45],
  [0.92, 0.78],
  [0.62, 1.1],
  [0.3, 1.32],
  [0, 1.5],
];
const DOMELET_PROFILE: [number, number][] = [
  [0.55, 0],
  [1.0, 0.45],
  [0.65, 1.0],
  [0, 1.4],
];
function onionDome(
  r: number,
  segments = 12,
  profile: [number, number][] = DOME_PROFILE
): Mesh {
  const pts = profile.map(([x, y]) => new Vector2(x * r, y * r));
  return new Mesh(new LatheGeometry(pts, segments), mat(TONES.white));
}

function domelet(r: number, segments = 8): Mesh {
  return onionDome(r, segments, DOMELET_PROFILE);
}

/** Thin pointed-arch panel (Mughal profile), extruded toward +Z.
 *  Base at local y = 0, centered on x. */
function archPanel(w: number, h: number, color: string): Mesh {
  const s = new Shape();
  const hw = w / 2;
  s.moveTo(-hw, 0);
  s.lineTo(-hw, h * 0.55);
  s.quadraticCurveTo(-hw, h * 0.85, -hw * 0.4, h * 0.93);
  s.lineTo(0, h);
  s.lineTo(hw * 0.4, h * 0.93);
  s.quadraticCurveTo(hw, h * 0.85, hw, h * 0.55);
  s.lineTo(hw, 0);
  s.closePath();
  const geo = new ExtrudeGeometry(s, {
    depth: 0.008,
    bevelEnabled: false,
    curveSegments: 2,
  });
  return new Mesh(geo, mat(color));
}

/** White-framed portal: white surround with a darker recessed arch inside. */
function framedArch(w: number, h: number, x: number, y: number, z: number): Group {
  const g = new Group();
  const frame = archPanel(w, h, TONES.white);
  frame.position.set(x, y, z);
  g.add(frame);
  const inset = archPanel(w * 0.72, h * 0.84, RECESS);
  inset.position.set(x, y, z + 0.002);
  g.add(inset);
  return g;
}

/** Tall corner minaret: slender red octagonal shaft, white balcony rings,
 *  white marble pavilion + onion canopy on top. */
function minaret(x: number, z: number): Group {
  const g = new Group();
  g.position.set(x, 0, z);

  g.add(box(0.062, 0.05, 0.062, 0, 0.05, 0, REDD)); // plinth

  const shaft = new Mesh(new CylinderGeometry(0.017, 0.024, 0.37, 8), mat(RED));
  shaft.position.y = 0.26;
  g.add(shaft);

  // white balcony rings up the shaft
  for (const y of [0.2, 0.335]) {
    const ring = new Mesh(
      new CylinderGeometry(0.027, 0.027, 0.009, 6),
      mat(TONES.white)
    );
    ring.position.y = y;
    g.add(ring);
  }

  // white marble pavilion + canopy dome
  const slab = new Mesh(
    new CylinderGeometry(0.028, 0.028, 0.008, 6),
    mat(TONES.white)
  );
  slab.position.y = 0.449;
  g.add(slab);
  const pav = new Mesh(
    new CylinderGeometry(0.021, 0.023, 0.042, 6),
    mat(TONES.white)
  );
  pav.position.y = 0.474;
  g.add(pav);
  const dome = domelet(0.026);
  dome.position.y = 0.493;
  g.add(dome);
  const spike = new Mesh(
    new CylinderGeometry(0.002, 0.004, 0.022, 4),
    mat(TONES.gold)
  );
  spike.position.y = 0.538;
  g.add(spike);
  return g;
}

/** Small octagonal turret with a white domelet (prayer-hall corners). */
function turret(x: number, z: number, h: number): Group {
  const g = new Group();
  g.position.set(x, 0, z);
  const shaft = new Mesh(new CylinderGeometry(0.014, 0.017, h, 6), mat(RED));
  shaft.position.y = 0.025 + h / 2;
  g.add(shaft);
  const cap = new Mesh(
    new CylinderGeometry(0.02, 0.02, 0.007, 6),
    mat(TONES.white)
  );
  cap.position.y = 0.025 + h + 0.003;
  g.add(cap);
  const dome = domelet(0.019, 6);
  dome.position.y = 0.025 + h + 0.007;
  g.add(dome);
  return g;
}

/** Gold finial spike for the big domes. */
function finial(x: number, y: number, z: number, h: number): Mesh {
  const m = new Mesh(new CylinderGeometry(0.003, 0.006, h, 4), mat(TONES.gold));
  m.position.set(x, y + h / 2, z);
  return m;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  // ---- red sandstone courtyard platform ----
  g.add(box(0.58, 0.025, 0.42, 0, 0.0125, 0, RED));

  // ---- courtyard walls (low, with white coping) ----
  const wallH = 0.045;
  const wallY = 0.025 + wallH / 2;
  const wall = (w: number, d: number, x: number, z: number) => {
    g.add(box(w, wallH, d, x, wallY, z, RED));
    g.add(box(w + 0.004, 0.006, d + 0.004, x, 0.025 + wallH, z, TONES.white));
  };
  wall(0.22, 0.02, -0.18, 0.2); // front, flanking the gate
  wall(0.22, 0.02, 0.18, 0.2);
  wall(0.02, 0.4, -0.28, 0); // sides
  wall(0.02, 0.4, 0.28, 0);
  wall(0.09, 0.02, -0.245, -0.2); // back stubs beside the hall
  wall(0.09, 0.02, 0.245, -0.2);

  // ---- entrance gate (front, +Z) ----
  g.add(box(0.15, 0.11, 0.05, 0, 0.08, 0.18, RED));
  g.add(box(0.156, 0.012, 0.056, 0, 0.141, 0.18, TONES.white));
  g.add(framedArch(0.085, 0.085, 0, 0.025, 0.2055));
  for (const sx of [1, -1]) {
    const d = domelet(0.014, 6);
    d.position.set(sx * 0.058, 0.147, 0.18);
    g.add(d);
  }

  // ---- prayer hall (back, −Z) ----
  g.add(box(0.42, 0.13, 0.15, 0, 0.09, -0.13, RED)); // body
  g.add(box(0.43, 0.014, 0.16, 0, 0.162, -0.13, TONES.white)); // parapet trim

  // central pishtaq (projecting portal)
  g.add(box(0.135, 0.18, 0.04, 0, 0.115, -0.045, RED));
  g.add(box(0.141, 0.014, 0.046, 0, 0.212, -0.045, TONES.white));
  g.add(framedArch(0.098, 0.145, 0, 0.025, -0.0255));

  // flanking arch bays on the facade (dark recesses)
  for (const sx of [1, -1]) {
    for (const bx of [0.108, 0.166]) {
      const a = archPanel(0.042, 0.085, RECESS);
      a.position.set(sx * bx, 0.03, -0.056);
      g.add(a);
    }
  }

  // ---- three white marble onion domes on white marble necks ----
  const neck = (r: number, h: number, x: number, y: number) => {
    const m = new Mesh(new CylinderGeometry(r, r, h, 8), mat(TONES.white));
    m.position.set(x, y, -0.14);
    g.add(m);
  };
  neck(0.058, 0.06, 0, 0.19);
  neck(0.041, 0.05, 0.155, 0.183);
  neck(0.041, 0.05, -0.155, 0.183);

  const central = onionDome(0.1);
  central.position.set(0, 0.218, -0.14);
  g.add(central);
  g.add(finial(0, 0.368, -0.14, 0.04));
  for (const sx of [1, -1]) {
    const d = onionDome(0.071, 10);
    d.position.set(sx * 0.155, 0.206, -0.14);
    g.add(d);
    g.add(finial(sx * 0.155, 0.312, -0.14, 0.03));
  }

  // ---- central ablution pool in the courtyard ----
  g.add(box(0.104, 0.01, 0.074, 0, 0.03, 0.06, TONES.white));
  g.add(box(0.088, 0.008, 0.058, 0, 0.035, 0.06, TONES.water));

  // ---- prayer-hall corner turrets ----
  for (const sx of [1, -1]) {
    g.add(turret(sx * 0.212, -0.058, 0.155));
    g.add(turret(sx * 0.212, -0.2, 0.155));
  }

  // ---- four tall corner minarets ----
  g.add(minaret(0.265, 0.185));
  g.add(minaret(-0.265, 0.185));
  g.add(minaret(0.265, -0.185));
  g.add(minaret(-0.265, -0.185));

  return g;
}
