// Kuwait Towers — papercraft: three slender concrete needles on the bay
// spit. The tallest is skewered by two stacked spheres, the second carries a
// single water sphere, the third is a bare spire. Pale sand-gray shafts,
// muted sea-green globes speckled with enamelled cladding tiles.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const CONCRETE = "#e4dfd4"; // pale sand-gray shaft
const CONCRETE_DK = "#c9c2b4";
const SEA = "#6fa198"; // muted sea-green globe
const SEA_LT = "#91b9af";
const SEA_DK = "#5c8a81";

/** Enamelled cladding tiles ringing a globe at a given latitude. */
function speckle(
  g: Group,
  cx: number,
  cy: number,
  cz: number,
  r: number,
  phi: number,
  count: number,
  size: number,
  color: string
): void {
  for (let i = 0; i < count; i++) {
    const theta = (i / count) * Math.PI * 2 + phi;
    const m = new Mesh(new BoxGeometry(size, size * 0.8, 0.006), mat(color));
    m.position.set(
      cx + r * Math.cos(phi) * Math.sin(theta),
      cy + r * Math.sin(phi),
      cz + r * Math.cos(phi) * Math.cos(theta)
    );
    m.rotation.set(-phi, theta, 0, "YXZ");
    g.add(m);
  }
}

/** Sea-green globe with two courses of cladding tiles. */
function globe(g: Group, x: number, y: number, z: number, r: number): void {
  const s = new Mesh(new SphereGeometry(r, 11, 7), mat(SEA));
  s.position.set(x, y, z);
  g.add(s);
  speckle(g, x, y, z, r * 0.995, 0.12, 10, r * 0.46, SEA_LT);
  speckle(g, x, y, z, r * 0.995, 0.78, 7, r * 0.32, SEA_DK);
  speckle(g, x, y, z, r * 0.995, -0.62, 8, r * 0.34, SEA_LT);
}

/** Tapering needle with a flared foot. */
function needle(
  g: Group,
  x: number,
  z: number,
  rBot: number,
  rTop: number,
  top: number
): void {
  const shaft = new Mesh(new CylinderGeometry(rTop, rBot, top, 12), mat(CONCRETE));
  shaft.position.set(x, top / 2, z);
  g.add(shaft);
  const foot = new Mesh(
    new CylinderGeometry(rBot + 0.006, rBot + 0.028, 0.05, 12),
    mat(CONCRETE_DK)
  );
  foot.position.set(x, 0.025, z);
  g.add(foot);
  const pad = new Mesh(new CylinderGeometry(rBot + 0.05, rBot + 0.056, 0.016, 14), mat(TONES.stone));
  pad.position.set(x, 0.008, z);
  g.add(pad);
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.36));

  // ---- the low sandy spit the three towers stand on ----
  const spit = new Mesh(new CylinderGeometry(0.275, 0.3, 0.022, 26), mat(TONES.stone));
  spit.position.y = 0.017;
  g.add(spit);

  // ---- main tower: two stacked globes on one needle ----
  needle(g, 0, 0, 0.026, 0.009, 0.965);
  globe(g, 0, 0.52, 0, 0.082);
  // collar rings pinching the shaft above and below the big globe
  for (const y of [0.428, 0.612]) {
    const c = new Mesh(new CylinderGeometry(0.03, 0.03, 0.014, 12), mat(CONCRETE_DK));
    c.position.set(0, y, 0);
    g.add(c);
  }
  // the ringed observation brim around the top of the big globe
  const brim = new Mesh(new CylinderGeometry(0.095, 0.088, 0.01, 20), mat(CONCRETE_DK));
  brim.position.set(0, 0.564, 0);
  g.add(brim);
  globe(g, 0, 0.775, 0, 0.046);

  // ---- second tower: a single water globe ----
  needle(g, -0.155, 0.055, 0.022, 0.009, 0.755);
  globe(g, -0.155, 0.475, 0.055, 0.066);
  for (const y of [0.401, 0.549]) {
    const c = new Mesh(new CylinderGeometry(0.026, 0.026, 0.013, 12), mat(CONCRETE_DK));
    c.position.set(-0.155, y, 0.055);
    g.add(c);
  }

  // ---- third tower: a bare spire carrying the floodlights ----
  needle(g, 0.165, -0.085, 0.019, 0.007, 0.585);
  const ring = new Mesh(new CylinderGeometry(0.02, 0.025, 0.02, 12), mat(CONCRETE_DK));
  ring.position.set(0.165, 0.46, -0.085);
  g.add(ring);
  const lamp = new Mesh(new CylinderGeometry(0.013, 0.016, 0.016, 10), mat(SEA_DK));
  lamp.position.set(0.165, 0.572, -0.085);
  g.add(lamp);

  return g;
}
