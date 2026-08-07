// Catedral de Santa Isabel (Malabo) — papercraft: neo-Gothic twin-tower
// facade in ochre-cream stone. Two buttressed towers under octagonal spires
// with corner pinnacles flank a gabled centre bay carrying a rose window over
// a pointed portal; a soft terracotta nave roof runs back behind them.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const STONE = "#e1d2a9";
const TRIM = "#cabb96";
const STONE_LIGHT = "#eee4c6";
const SPIRE = "#b8ae98";
const ROOF = "#b06d52"; // soft terracotta
const GLASS = "#4a4458";

const TX = 0.155; // tower centre offset
const THW = 0.068; // tower half-width at the base
const FACE = 0.095; // tower front plane
const TZ = FACE - THW; // tower centre in z

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

/** Pointed-arch opening, base at mesh y = 0, extruded along +z. */
function lancet(w: number, h: number, d: number, color: string): Mesh {
  const s = new Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(w / 2, h * 0.6);
  s.lineTo(0, h);
  s.lineTo(-w / 2, h * 0.6);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
  return new Mesh(geo, mat(color));
}

/** Gable triangle, base at mesh y = 0, extruded along +z. */
function gable(hw: number, h: number, d: number, color: string): Mesh {
  const s = new Shape();
  s.moveTo(-hw, 0);
  s.lineTo(hw, 0);
  s.lineTo(0, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
  return new Mesh(geo, mat(color));
}

/** Slim stone cross on a short post; base at y0. */
function cross(y0: number, s: number, color: string): Group {
  const g = new Group();
  g.add(box(0.007 * s, 0.055 * s, 0.007 * s, 0, y0 + 0.0275 * s, 0, color));
  g.add(box(0.03 * s, 0.007 * s, 0.007 * s, 0, y0 + 0.036 * s, 0, color));
  return g;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.35));

  // ---- nave behind the facade, under a terracotta roof ----
  g.add(box(0.3, 0.34, 0.32, 0, 0.17, -0.14, STONE));
  g.add(box(0.316, 0.016, 0.336, 0, 0.348, -0.14, TRIM));
  const naveRoof = gable(0.166, 0.13, 0.33, ROOF);
  naveRoof.position.set(0, 0.356, -0.305);
  g.add(naveRoof);
  for (const sx of [1, -1])
    for (const z of [-0.075, -0.16, -0.245]) {
      const w = lancet(0.03, 0.11, 0.008, GLASS);
      w.rotation.y = sx * (Math.PI / 2);
      w.position.set(sx * 0.15, 0.13, z);
      g.add(w);
    }

  // ---- twin towers ----
  for (const sx of [1, -1]) {
    const x = sx * TX;
    g.add(box(THW * 2, 0.32, THW * 2, x, 0.16, TZ, STONE));
    g.add(box(0.148, 0.014, 0.148, x, 0.327, TZ, TRIM));
    g.add(box(0.124, 0.22, 0.124, x, 0.44, TZ, STONE));
    g.add(box(0.138, 0.014, 0.138, x, 0.557, TZ, TRIM));
    g.add(box(0.112, 0.13, 0.112, x, 0.615, TZ, STONE));
    g.add(box(0.152, 0.018, 0.152, x, 0.689, TZ, TRIM)); // belfry cornice

    // corner buttress strips
    for (const bx of [1, -1])
      for (const bz of [1, -1])
        g.add(
          box(0.014, 0.68, 0.014, x + bx * 0.064, 0.34, TZ + bz * 0.064, TRIM)
        );

    // corner pinnacles
    for (const bx of [1, -1])
      for (const bz of [1, -1]) {
        const px = x + bx * 0.062;
        const pz = TZ + bz * 0.062;
        g.add(box(0.018, 0.05, 0.018, px, 0.723, pz, TRIM));
        const tip = new Mesh(new ConeGeometry(0.017, 0.058, 4), mat(SPIRE));
        tip.rotation.y = Math.PI / 4;
        tip.position.set(px, 0.777, pz);
        g.add(tip);
      }

    // octagonal spire
    const spire = new Mesh(new ConeGeometry(0.064, 0.24, 8), mat(SPIRE));
    spire.position.set(x, 0.818, TZ);
    g.add(spire);
    const finial = cross(0.938, 1, TRIM);
    finial.position.set(x, 0, TZ);
    g.add(finial);

    // pointed windows up the front and outer faces
    for (const [y, w, h] of [
      [0.13, 0.028, 0.1],
      [0.36, 0.03, 0.115],
      [0.575, 0.032, 0.098],
    ] as const) {
      const surround = lancet(w + 0.014, h + 0.014, 0.006, STONE_LIGHT);
      surround.position.set(x, y - 0.007, FACE - 0.002);
      g.add(surround);
      const win = lancet(w, h, 0.01, GLASS);
      win.position.set(x, y, FACE - 0.004);
      g.add(win);
      const side = lancet(w, h, 0.01, GLASS);
      side.rotation.y = sx * (Math.PI / 2);
      side.position.set(x + sx * (THW + 0.001), y, TZ);
      g.add(side);
    }
  }

  // ---- centre bay ----
  g.add(box(0.174, 0.56, 0.07, 0, 0.28, 0.047, STONE));
  g.add(box(0.19, 0.016, 0.082, 0, 0.568, 0.047, TRIM));
  const centreGable = gable(0.095, 0.2, 0.07, STONE);
  centreGable.position.set(0, 0.576, 0.012);
  g.add(centreGable);
  // terracotta coping riding both rakes of the gable
  for (const sx of [1, -1]) {
    const rake = box(0.216, 0.01, 0.075, sx * 0.0475, 0.676, 0.047, "#bd8067");
    rake.rotation.z = sx * 1.128;
    g.add(rake);
  }
  const gableCross = cross(0.776, 0.9, TRIM);
  gableCross.position.set(0, 0, 0.047);
  g.add(gableCross);

  // rose window: pale ring, dark glass, six spokes
  const ring = new Mesh(new CylinderGeometry(0.052, 0.052, 0.008, 14), mat(STONE_LIGHT));
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0.44, 0.081);
  g.add(ring);
  const glass = new Mesh(new CylinderGeometry(0.042, 0.042, 0.008, 14), mat(GLASS));
  glass.rotation.x = Math.PI / 2;
  glass.position.set(0, 0.44, 0.084);
  g.add(glass);
  for (let i = 0; i < 6; i++) {
    const spoke = box(0.006, 0.076, 0.005, 0, 0.44, 0.086, STONE_LIGHT);
    spoke.rotation.z = (i * Math.PI) / 6;
    g.add(spoke);
  }
  // small oculus in the gable
  const oculus = new Mesh(new CylinderGeometry(0.024, 0.024, 0.008, 10), mat(STONE_LIGHT));
  oculus.rotation.x = Math.PI / 2;
  oculus.position.set(0, 0.645, 0.048);
  g.add(oculus);
  const oGlass = new Mesh(new CylinderGeometry(0.016, 0.016, 0.008, 10), mat(GLASS));
  oGlass.rotation.x = Math.PI / 2;
  oGlass.position.set(0, 0.645, 0.051);
  g.add(oGlass);

  // ---- portal ----
  const arch = lancet(0.088, 0.235, 0.008, STONE_LIGHT);
  arch.position.set(0, 0.012, 0.079);
  g.add(arch);
  const door = lancet(0.062, 0.2, 0.012, TONES.ironDark);
  door.position.set(0, 0.02, 0.078);
  g.add(door);
  g.add(box(0.2, 0.02, 0.05, 0, 0.01, 0.105, TRIM)); // step

  return g;
}
