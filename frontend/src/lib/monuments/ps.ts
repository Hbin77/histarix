// قبة الصخرة (Dome of the Rock) — papercraft: low tiled octagonal drum on a
// pale stone platform, shallow lead roof running in to a windowed drum under
// a large gilded dome with a slim finial.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  Shape,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const OCT = 8;
const HALF_SEG = Math.PI / OCT; // rotate so a flat face points at +Z
const R_WALL = 0.255; // octagon circumradius
const APO = R_WALL * Math.cos(HALF_SEG); // face plane distance

const TILE_BLUE = "#4c76a0";
const TILE_TEAL = "#59968f";
const TILE_DEEP = "#3b5a7c";
const MARBLE = "#e0dacd";
const LEAD = "#93a09b";

/** Octagonal prism / frustum, base at local y = 0, a flat face toward +Z. */
function oct(rBot: number, rTop: number, h: number, m: MeshLambertMaterial): Mesh {
  const geo = new CylinderGeometry(rTop, rBot, h, OCT, 1);
  geo.rotateY(HALF_SEG);
  geo.translate(0, h / 2, 0);
  return new Mesh(geo, m);
}

/** Arch-topped panel in the XY plane, extruded along +Z, base at y = 0. */
function archPanel(
  hw: number,
  straightH: number,
  depth: number,
  m: MeshLambertMaterial
): Mesh {
  const s = new Shape();
  s.moveTo(-hw, 0);
  s.lineTo(-hw, straightH);
  s.absarc(0, straightH, hw, Math.PI, 0, true);
  s.lineTo(hw, 0);
  s.closePath();
  const geo = new ExtrudeGeometry(s, {
    depth,
    bevelEnabled: false,
    curveSegments: 3,
  });
  return new Mesh(geo, m);
}

/** Place a child on octagon face k (0 = +Z), pushed out to `radius`. */
function onFace(g: Group, child: Mesh | Group, k: number, radius: number, y: number) {
  const a = (k * Math.PI) / 4;
  child.position.set(Math.sin(a) * radius, y, Math.cos(a) * radius);
  child.rotation.y = a;
  g.add(child);
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.36));

  const marble = mat(MARBLE);
  const tileBlue = mat(TILE_BLUE);
  const tileTeal = mat(TILE_TEAL);
  const tileDeep = mat(TILE_DEEP);
  const dark = mat(TONES.ink);
  const gold = mat(TONES.gold);
  const stone = mat(TONES.stone);

  // ---- pale stone platform (the Haram terrace) ----
  const plat = oct(0.345, 0.34, 0.035, stone);
  plat.position.y = 0.008;
  g.add(plat);

  const WALL_Y = 0.043;
  const WALL_H = 0.235;
  const WALL_TOP = WALL_Y + WALL_H;

  // ---- octagon walls: marble dado, blue tile field, inscription band ----
  const wall = oct(R_WALL, R_WALL, WALL_H, tileBlue);
  wall.position.y = WALL_Y;
  g.add(wall);

  const dado = oct(0.259, 0.259, 0.062, marble);
  dado.position.y = WALL_Y;
  g.add(dado);

  const course = oct(0.262, 0.262, 0.011, tileTeal);
  course.position.y = WALL_Y + 0.062;
  g.add(course);

  const frieze = oct(0.26, 0.26, 0.03, tileDeep);
  frieze.position.y = WALL_TOP - 0.03;
  g.add(frieze);

  const cornice = oct(0.272, 0.268, 0.02, marble);
  cornice.position.y = WALL_TOP;
  g.add(cornice);

  // ---- arched windows, three to a face ----
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const r = APO - 0.006;
    for (const dx of [-0.052, 0, 0.052]) {
      const win = archPanel(0.019, 0.032, 0.014, dark);
      win.position.set(
        Math.sin(a) * r + Math.cos(a) * dx,
        WALL_Y + 0.128,
        Math.cos(a) * r - Math.sin(a) * dx
      );
      win.rotation.y = a;
      g.add(win);
    }
  }

  // ---- four cardinal entrance porches ----
  for (const k of [0, 2, 4, 6]) {
    const porch = new Group();
    const body = new Mesh(new BoxGeometry(0.098, 0.14, 0.05), marble);
    body.position.y = 0.07;
    porch.add(body);
    const cap = new Mesh(new BoxGeometry(0.112, 0.016, 0.06), stone);
    cap.position.y = 0.148;
    porch.add(cap);
    const door = archPanel(0.028, 0.058, 0.012, dark);
    door.position.set(0, 0.012, 0.021);
    porch.add(door);
    const step = new Mesh(new BoxGeometry(0.11, 0.012, 0.03), stone);
    step.position.set(0, -0.006, 0.036);
    porch.add(step);
    onFace(g, porch, k, APO + 0.014, WALL_Y);
  }

  // ---- shallow lead roof running in to the dome drum ----
  const roof = oct(0.266, 0.152, 0.038, mat(LEAD));
  roof.position.y = WALL_TOP + 0.018;
  g.add(roof);

  // ---- windowed drum ----
  const DRUM_Y = WALL_TOP + 0.054;
  const drum = new Mesh(new CylinderGeometry(0.145, 0.149, 0.058, 14, 1), marble);
  drum.position.y = DRUM_Y + 0.029;
  g.add(drum);
  const winGeo = new BoxGeometry(0.021, 0.03, 0.012);
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    const w = new Mesh(winGeo, tileDeep);
    w.position.set(Math.sin(a) * 0.141, DRUM_Y + 0.028, Math.cos(a) * 0.141);
    w.rotation.y = a;
    g.add(w);
  }
  const drumCap = new Mesh(new CylinderGeometry(0.154, 0.152, 0.014, 14), stone);
  drumCap.position.y = DRUM_Y + 0.065;
  g.add(drumCap);

  // ---- gilded dome ----
  const DOME_Y = DRUM_Y + 0.07;
  const R_D = 0.152;
  const prof: Array<[number, number]> = [
    [R_D, 0],
    [R_D + 0.004, 0.026],
    [R_D - 0.007, 0.068],
    [R_D - 0.027, 0.108],
    [R_D - 0.056, 0.142],
    [R_D - 0.09, 0.169],
    [R_D - 0.121, 0.188],
    [R_D - 0.142, 0.2],
    [0.0001, 0.207],
  ];
  const dome = new Mesh(
    new LatheGeometry(
      prof.map(([r, y]) => new Vector2(r, y)),
      18
    ),
    gold
  );
  dome.position.y = DOME_Y;
  g.add(dome);

  // ---- finial ----
  const rod = new Mesh(new CylinderGeometry(0.005, 0.007, 0.05, 6), gold);
  rod.position.y = DOME_Y + 0.228;
  g.add(rod);
  const ball = new Mesh(new SphereGeometry(0.015, 6, 4), gold);
  ball.position.y = DOME_Y + 0.263;
  g.add(ball);
  const tip = new Mesh(new CylinderGeometry(0.001, 0.005, 0.024, 6), gold);
  tip.position.y = DOME_Y + 0.284;
  g.add(tip);

  return g;
}
