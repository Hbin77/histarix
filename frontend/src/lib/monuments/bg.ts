// Alexander Nevsky Cathedral, Sofia — papercraft miniature.
// Neo-Byzantine massing: tall west bell tower with gold dome, huge central
// gold dome on an arched drum, verdigris domes cascading east to the apse,
// cream body with arched windows and gold cross tips.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;
const CREAM = "#ece5d3"; // facade cream, a notch warmer than TONES.white

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

/** Byzantine dome: slightly-past-hemisphere sphere whose open rim tucks onto
 *  a thin cornice disc, so nothing hollow shows from the aerial view. */
function dome(r: number, y: number, color: string, seg = 12): Group {
  const g = new Group();
  const cap = new Mesh(
    new SphereGeometry(r, seg, 5, 0, Math.PI * 2, 0, Math.PI * 0.58),
    mat(color)
  );
  cap.position.y = y + 0.242 * r;
  g.add(cap);
  const cornice = new Mesh(
    new CylinderGeometry(r * 1.0, r * 1.0, 0.014, seg),
    mat(color)
  );
  cornice.position.y = y + 0.007;
  g.add(cornice);
  return g;
}

/** Gold cross tip: vertical + arm. */
function cross(size: number, x: number, y: number, z: number): Group {
  const g = new Group();
  const t = size * 0.14;
  const v = new Mesh(new BoxGeometry(t, size, t), mat(TONES.gold));
  v.position.set(x, y + size / 2, z);
  g.add(v);
  const h = new Mesh(new BoxGeometry(size * 0.56, t, t), mat(TONES.gold));
  h.position.set(x, y + size * 0.66, z);
  g.add(h);
  return g;
}

/** Arched opening: flat slate panel + round top disc, flush on a wall face.
 *  face: 0 = +Z, 1 = +X, 2 = -Z, 3 = -X. */
function archWindow(
  w: number,
  h: number,
  x: number,
  y: number,
  z: number,
  face: number,
  color: string = TONES.slate
): Group {
  const g = new Group();
  const panel = new Mesh(new BoxGeometry(w, h, 0.012), mat(color));
  panel.position.y = h / 2;
  g.add(panel);
  const top = new Mesh(new CylinderGeometry(w / 2, w / 2, 0.012, 6), mat(color));
  top.rotation.x = Math.PI / 2;
  top.position.y = h;
  g.add(top);
  g.position.set(x, y, z);
  g.rotation.y = (face * Math.PI) / 2;
  return g;
}

/** 4-sided low hip roof, eave half-extents hx/hz, height h. */
function hipRoof(hx: number, hz: number, h: number, color: string): Mesh {
  const geo = new CylinderGeometry(0.55 * SQ2, SQ2, 1, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, 0.5, 0);
  const m = new Mesh(geo, mat(color));
  m.scale.set(hx, h, hz);
  return m;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  // ---- stepped stone base ----
  g.add(box(0.62, 0.04, 0.38, 0, 0.02, 0, TONES.stone));

  // ---- main cream masses: long nave (X) + transept (Z) ----
  g.add(box(0.5, 0.18, 0.22, -0.015, 0.13, 0, CREAM)); // nave, west→east
  g.add(box(0.22, 0.18, 0.32, 0.02, 0.13, 0, CREAM)); // transept
  // horizontal stone bands (Sofia's striped facade, papercraft-simplified)
  g.add(box(0.504, 0.022, 0.224, -0.015, 0.085, 0, TONES.stone));
  g.add(box(0.224, 0.022, 0.324, 0.02, 0.085, 0, TONES.stone));
  g.add(box(0.504, 0.016, 0.224, -0.015, 0.185, 0, TONES.stone));
  g.add(box(0.224, 0.016, 0.324, 0.02, 0.185, 0, TONES.stone));

  // ---- verdigris roofs over nave + transept ----
  const naveRoof = hipRoof(0.26, 0.115, 0.04, TONES.verdigris);
  naveRoof.position.set(-0.015, 0.22, 0);
  g.add(naveRoof);
  const transeptRoof = hipRoof(0.115, 0.165, 0.04, TONES.verdigris);
  transeptRoof.position.set(0.02, 0.22, 0);
  g.add(transeptRoof);

  // ---- crossing block under the drum ----
  g.add(box(0.26, 0.11, 0.26, 0.02, 0.275, 0, CREAM));
  const crossingSkirt = hipRoof(0.16, 0.16, 0.035, TONES.verdigris);
  crossingSkirt.position.set(0.02, 0.325, 0);
  g.add(crossingSkirt);

  // three verdigris semi-domes leaning on the drum (west, north, south —
  // the east side is carried by the choir dome cascade instead)
  const buttressGeo = new SphereGeometry(0.052, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.58);
  const buttressMat = mat(TONES.verdigris);
  for (const [dx, dz] of [[-0.12, 0], [0, 0.12], [0, -0.12]] as const) {
    const b = new Mesh(buttressGeo, buttressMat);
    b.position.set(0.02 + dx, 0.343, dz);
    g.add(b);
  }

  // ---- central drum with arched windows ----
  const drum = new Mesh(new CylinderGeometry(0.112, 0.112, 0.2, 16), mat(CREAM));
  drum.position.set(0.02, 0.43, 0);
  g.add(drum);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const win = new Mesh(new BoxGeometry(0.026, 0.08, 0.012), mat(TONES.slate));
    win.position.set(0.02 + Math.sin(a) * 0.111, 0.46, Math.cos(a) * 0.111);
    win.rotation.y = a;
    g.add(win);
  }
  const drumCornice = new Mesh(
    new CylinderGeometry(0.124, 0.124, 0.018, 16),
    mat(TONES.stone)
  );
  drumCornice.position.set(0.02, 0.539, 0);
  g.add(drumCornice);

  // ---- great gold dome + lantern + cross ----
  const mainDome = dome(0.135, 0.548, TONES.gold, 14);
  mainDome.position.x = 0.02;
  g.add(mainDome);
  const lantern = new Mesh(new CylinderGeometry(0.02, 0.024, 0.04, 8), mat(TONES.gold));
  lantern.position.set(0.02, 0.725, 0);
  g.add(lantern);
  g.add(cross(0.07, 0.02, 0.745, 0));

  // ---- four gold-tipped corner turrets around the crossing ----
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const tx = 0.02 + sx * 0.105;
      const tz = sz * 0.105;
      const shaft = new Mesh(new CylinderGeometry(0.024, 0.026, 0.08, 6), mat(CREAM));
      shaft.position.set(tx, 0.37, tz);
      g.add(shaft);
      const d = dome(0.031, 0.41, TONES.gold, 8);
      d.position.set(tx, 0, tz);
      g.add(d);
    }

  // ---- west bell tower (tallest element) ----
  const TX = -0.22;
  g.add(box(0.14, 0.58, 0.14, TX, 0.33, 0, CREAM));
  g.add(box(0.152, 0.018, 0.152, TX, 0.3, 0, TONES.stone));
  g.add(box(0.152, 0.018, 0.152, TX, 0.5, 0, TONES.stone));
  // belfry with arched openings on all faces
  g.add(box(0.155, 0.13, 0.155, TX, 0.685, 0, CREAM));
  for (let f = 0; f < 4; f++) {
    const a = (f * Math.PI) / 2;
    g.add(
      archWindow(
        0.052,
        0.07,
        TX + Math.sin(a) * 0.078,
        0.645,
        Math.cos(a) * 0.078,
        f,
        TONES.ink
      )
    );
  }
  g.add(box(0.175, 0.02, 0.175, TX, 0.76, 0, TONES.stone));
  const towerDrum = new Mesh(new CylinderGeometry(0.058, 0.062, 0.05, 10), mat(CREAM));
  towerDrum.position.set(TX, 0.795, 0);
  g.add(towerDrum);
  const towerDome = dome(0.072, 0.82, TONES.gold, 12);
  towerDome.position.x = TX;
  g.add(towerDome);
  g.add(cross(0.06, TX, 0.905, 0));

  // ---- east: secondary verdigris dome, then apse semi-dome cascade ----
  const choirDrum = new Mesh(new CylinderGeometry(0.06, 0.064, 0.09, 12), mat(CREAM));
  choirDrum.position.set(0.165, 0.265, 0);
  g.add(choirDrum);
  const choirDome = dome(0.074, 0.31, TONES.verdigris, 12);
  choirDome.position.x = 0.165;
  g.add(choirDome);
  g.add(cross(0.045, 0.165, 0.398, 0));

  // apse: half-cylinder bulging east + verdigris half-dome
  const apse = new Mesh(
    new CylinderGeometry(0.09, 0.09, 0.15, 10, 1, false, 0, Math.PI),
    mat(CREAM)
  );
  apse.position.set(0.235, 0.115, 0);
  g.add(apse);
  const apseDome = dome(0.088, 0.2, TONES.verdigris, 10);
  apseDome.position.x = 0.225;
  g.add(apseDome);

  // ---- arched windows: transept ends + tower west portal ----
  for (const sz of [1, -1]) {
    g.add(archWindow(0.06, 0.08, 0.02, 0.1, sz * 0.161, sz === 1 ? 0 : 2));
    g.add(archWindow(0.028, 0.05, -0.06, 0.11, sz * 0.161, sz === 1 ? 0 : 2));
    g.add(archWindow(0.028, 0.05, 0.1, 0.11, sz * 0.161, sz === 1 ? 0 : 2));
  }
  // west entrance portal at tower foot
  g.add(archWindow(0.06, 0.09, TX - 0.071, 0.05, 0, 3, TONES.ink));

  return g;
}
