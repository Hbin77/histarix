// Casa Rosada (Buenos Aires) — papercraft miniature.
// Long two-storey salmon-pink facade, projecting end pavilions with low
// slate caps, central loggia with two tiers of three white-trimmed arches,
// balustraded roofline, arched attic carrying the Argentine flag.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  TorusGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;
const PINK = "#d8a099"; // muted casa-rosada salmon
const PINK_DK = "#c08a82"; // shaded pink for roof decks
const OPENING = "#7c554f"; // dark rosewood window/arch voids

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

/** Low 4-sided hip cap; half-extents (hx, hz), height h, top = t * bottom. */
function hipCap(hx: number, hz: number, h: number, t: number, color: string): Mesh {
  const geo = new CylinderGeometry(t * SQ2, SQ2, 1, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, 0.5, 0);
  const m = new Mesh(geo, mat(color));
  m.scale.set(hx, h, hz);
  return m;
}

/** Balustrade: thin white rails along the front/back roof edges. */
function rails(g: Group, cx: number, w: number, y: number, zHalf: number): void {
  g.add(box(w, 0.02, 0.01, cx, y, zHalf, TONES.white));
  g.add(box(w, 0.02, 0.01, cx, y, -zHalf, TONES.white));
}

/** White-framed window with dark pane, proud of a ±z face. */
function win(x: number, y: number, z: number, w = 0.024, h = 0.05): Group {
  const grp = new Group();
  const s = Math.sign(z);
  const frame = box(w, h, 0.008, x, y, z, TONES.white);
  grp.add(frame);
  grp.add(box(w - 0.008, h - 0.012, 0.008, x, y, z + s * 0.003, OPENING));
  return grp;
}

/** Row of three arches on the loggia face: dark voids under white arch caps
 *  with white pilasters between. yBot = opening bottom, face z = zFace. */
function archTrio(g: Group, yBot: number, zFace: number): void {
  const openH = 0.08;
  const r = 0.018;
  const archGeo = new TorusGeometry(r, 0.006, 5, 8, Math.PI);
  const white = mat(TONES.white);
  for (const x of [-0.052, 0, 0.052]) {
    g.add(box(0.036, openH + r, 0.012, x, yBot + (openH + r) / 2, zFace, OPENING));
    const arch = new Mesh(archGeo, white);
    arch.position.set(x, yBot + openH, zFace + 0.006);
    g.add(arch);
  }
  for (const x of [-0.078, -0.026, 0.026, 0.078]) {
    g.add(box(0.012, openH + r + 0.024, 0.014, x, yBot + (openH + r) / 2, zFace, TONES.white));
  }
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  // ---- long two-storey main body ----
  g.add(box(0.68, 0.23, 0.19, 0, 0.115, 0, PINK));
  // string course between floors + crowning cornice (white, slightly proud)
  g.add(box(0.69, 0.012, 0.2, 0, 0.115, 0, TONES.white));
  g.add(box(0.69, 0.014, 0.2, 0, 0.225, 0, TONES.white));
  // pink roof deck inset above the cornice (keeps aerial view pink)
  g.add(box(0.665, 0.012, 0.175, 0, 0.235, 0, PINK_DK));
  // wing roofline balustrades
  rails(g, 0.155, 0.13, 0.243, 0.093);
  rails(g, -0.155, 0.13, 0.243, 0.093);

  // ---- projecting end pavilions with low slate caps ----
  for (const sx of [1, -1]) {
    const cx = sx * 0.28;
    g.add(box(0.12, 0.27, 0.23, cx, 0.135, 0, PINK));
    g.add(box(0.13, 0.012, 0.24, cx, 0.115, 0, TONES.white));
    g.add(box(0.13, 0.014, 0.24, cx, 0.263, 0, TONES.white));
    // corner pilaster strips (front + back)
    for (const dx of [-0.052, 0.052])
      for (const sz of [1, -1])
        g.add(box(0.014, 0.25, 0.008, cx + dx, 0.135, sz * 0.115, TONES.white));
    // pavilion balustrade in front of the cap
    rails(g, cx, 0.12, 0.281, 0.118);
    // low slate hip cap, subtle above the balustrade
    const cap = hipCap(0.06, 0.112, 0.032, 0.62, TONES.slate);
    cap.position.set(cx, 0.271, 0);
    g.add(cap);
    // pavilion windows, both floors, front + back
    for (const sz of [1, -1])
      for (const y of [0.06, 0.17]) g.add(win(cx, y, sz * 0.115, 0.032, 0.056));
  }

  // ---- wing windows: three bays per wing, both floors, front + back ----
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      for (const wx of [0.122, 0.16, 0.198])
        for (const y of [0.06, 0.17]) g.add(win(sx * wx, y, sz * 0.095));

  // ---- central block with two tiers of three arches ----
  g.add(box(0.18, 0.3, 0.24, 0, 0.15, 0, PINK));
  archTrio(g, 0.025, 0.126); // ground-floor arcade
  g.add(box(0.19, 0.012, 0.25, 0, 0.145, 0, TONES.white)); // string course
  archTrio(g, 0.16, 0.126); // upper loggia
  g.add(box(0.2, 0.014, 0.26, 0, 0.297, 0, TONES.white)); // cornice
  g.add(box(0.175, 0.012, 0.235, 0, 0.307, 0, PINK_DK)); // roof deck
  rails(g, 0, 0.18, 0.318, 0.124);
  // back face reads as plain pink with windows
  for (const wx of [-0.05, 0, 0.05])
    for (const y of [0.06, 0.17]) g.add(win(wx, y, -0.124));

  // ---- arched attic + Argentine flag ----
  g.add(box(0.12, 0.04, 0.09, 0, 0.324, 0, PINK));
  g.add(box(0.126, 0.01, 0.096, 0, 0.348, 0, TONES.white));
  const archTop = new Mesh(new CylinderGeometry(0.026, 0.026, 0.07, 12), mat(PINK));
  archTop.rotation.x = Math.PI / 2;
  archTop.position.y = 0.353;
  g.add(archTop);
  const archTrim = new Mesh(
    new TorusGeometry(0.026, 0.005, 5, 10, Math.PI),
    mat(TONES.white)
  );
  archTrim.position.set(0, 0.353, 0.036);
  g.add(archTrim);
  const pole = new Mesh(new CylinderGeometry(0.004, 0.004, 0.14, 6), mat(TONES.slate));
  pole.position.y = 0.435;
  g.add(pole);
  g.add(box(0.05, 0.011, 0.004, 0.029, 0.492, 0, TONES.water));
  g.add(box(0.05, 0.011, 0.004, 0.029, 0.481, 0, TONES.white));
  g.add(box(0.05, 0.011, 0.004, 0.029, 0.47, 0, TONES.water));

  return g;
}
