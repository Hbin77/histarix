// Phare Amédée — papercraft: the slender white iron lighthouse tapering up
// from a tiny coral islet to a railed gallery and a grey domed lantern,
// with leaning palms and a plank jetty running out over the turquoise lagoon.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const LAGOON = "#86c1bd"; // muted lagoon turquoise
const SHALLOW = "#aad5cc";
const SAND = "#e6dcc2";
const CORAL = "#d9cdb2";
const IRON_WHITE = "#f1eee7"; // painted iron plate
const GREY = "#98a0a6"; // lantern dome and plate seams
const PALM = "#5e8b64"; // muted palm green
const TRUNK = "#a08a6a";
const WOOD = "#a98a6b";

const ISLET_Y = 0.058; // coral islet top

function ring(r: number, h: number, color: string, seg = 26, rTop = r): Mesh {
  const m = new Mesh(new CylinderGeometry(rTop, r, h, seg), mat(color));
  m.position.y = h / 2;
  return m;
}

/** One flattened palm frond, springing from the local origin. */
function frond(len: number, tilt: number, yaw: number, m: MeshLambertMaterial): Mesh {
  const geo = new ConeGeometry(0.016, len, 4);
  geo.translate(0, len / 2, 0);
  const mesh = new Mesh(geo, m);
  mesh.scale.set(1, 1, 0.28);
  mesh.rotation.set(0, yaw, tilt);
  return mesh;
}

/** Leaning coconut palm: tapered trunk plus a drooping crown of fronds. */
function palm(h: number, lean: number, m: MeshLambertMaterial): Group {
  const g = new Group();
  const geo = new CylinderGeometry(0.008, 0.014, h, 6);
  geo.translate(0, h / 2, 0);
  const trunk = new Mesh(geo, mat(TRUNK));
  trunk.rotation.z = lean;
  g.add(trunk);

  const crown = new Group();
  crown.position.set(-Math.sin(lean) * h, Math.cos(lean) * h, 0);
  for (let i = 0; i < 7; i++) {
    const yaw = (i * Math.PI * 2) / 7 + 0.3;
    crown.add(frond(0.075 + (i % 3) * 0.012, 2.0 + (i % 2) * 0.25, yaw, m));
  }
  const nut = new Mesh(new SphereGeometry(0.009, 5, 4), mat(TRUNK));
  nut.position.y = -0.004;
  crown.add(nut);
  g.add(crown);
  return g;
}

export function build(): Group {
  const g = new Group();
  const white = mat(IRON_WHITE);
  const grey = mat(GREY);
  const dark = mat(TONES.ink);
  const palmMat = mat(PALM);

  // ---- lagoon, shallows, beach, coral islet ----
  g.add(ring(0.36, 0.026, LAGOON, 34));
  g.add(ring(0.29, 0.034, SHALLOW, 30));
  g.add(ring(0.225, 0.046, SAND, 26));
  g.add(ring(0.19, ISLET_Y, CORAL, 24));

  // ---- lighthouse ----
  const lh = new Group();
  lh.position.y = ISLET_Y;
  g.add(lh);

  const plinth = new Mesh(new CylinderGeometry(0.058, 0.066, 0.03, 14), grey);
  plinth.position.y = 0.015;
  lh.add(plinth);

  const SHAFT_Y = 0.03;
  const SHAFT_H = 0.7;
  const shaft = new Mesh(new CylinderGeometry(0.028, 0.05, SHAFT_H, 14, 1), white);
  shaft.position.y = SHAFT_Y + SHAFT_H / 2;
  lh.add(shaft);

  // iron plate seams: thin proud bands, radius following the taper
  for (const t of [0.16, 0.34, 0.52, 0.7, 0.86]) {
    const r = 0.05 + (0.028 - 0.05) * t + 0.0025;
    const band = new Mesh(new CylinderGeometry(r, r, 0.008, 14), grey);
    band.position.y = SHAFT_Y + SHAFT_H * t;
    lh.add(band);
  }
  // small windows spiralling up the shaft
  for (let i = 0; i < 5; i++) {
    const t = 0.1 + i * 0.18;
    const a = i * 1.35;
    const r = 0.05 + (0.028 - 0.05) * t;
    const w = new Mesh(new BoxGeometry(0.014, 0.02, 0.01), dark);
    w.position.set(Math.sin(a) * r, SHAFT_Y + SHAFT_H * t + 0.03, Math.cos(a) * r);
    w.rotation.y = a;
    lh.add(w);
  }

  // ---- gallery: corbelled floor with a railing ----
  const GAL_Y = SHAFT_Y + SHAFT_H;
  const corbel = new Mesh(new CylinderGeometry(0.056, 0.03, 0.022, 14), white);
  corbel.position.y = GAL_Y + 0.011;
  lh.add(corbel);
  const deck = new Mesh(new CylinderGeometry(0.058, 0.058, 0.008, 14), grey);
  deck.position.y = GAL_Y + 0.026;
  lh.add(deck);
  const rail = new Mesh(new TorusGeometry(0.055, 0.0028, 4, 14), grey);
  rail.rotation.x = Math.PI / 2;
  rail.position.y = GAL_Y + 0.056;
  lh.add(rail);
  const postGeo = new BoxGeometry(0.004, 0.03, 0.004);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const p = new Mesh(postGeo, grey);
    p.position.set(Math.sin(a) * 0.055, GAL_Y + 0.045, Math.cos(a) * 0.055);
    lh.add(p);
  }

  // ---- watch room, glazed lantern, grey dome, finial ----
  const watch = new Mesh(new CylinderGeometry(0.032, 0.034, 0.028, 12), white);
  watch.position.y = GAL_Y + 0.044;
  lh.add(watch);

  const LANT_Y = GAL_Y + 0.058;
  const lantern = new Mesh(new CylinderGeometry(0.031, 0.031, 0.046, 12), dark);
  lantern.position.y = LANT_Y + 0.023;
  lh.add(lantern);
  const astragal = new BoxGeometry(0.005, 0.046, 0.005);
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const b = new Mesh(astragal, white);
    b.position.set(Math.sin(a) * 0.031, LANT_Y + 0.023, Math.cos(a) * 0.031);
    lh.add(b);
  }
  const cornice = new Mesh(new CylinderGeometry(0.038, 0.036, 0.009, 12), grey);
  cornice.position.y = LANT_Y + 0.05;
  lh.add(cornice);

  const domePts = [
    [0.037, 0],
    [0.034, 0.012],
    [0.027, 0.022],
    [0.016, 0.03],
    [0.0001, 0.034],
  ].map(([r, y]) => new Vector2(r, y));
  const dome = new Mesh(new LatheGeometry(domePts, 12), grey);
  dome.position.y = LANT_Y + 0.054;
  lh.add(dome);

  const rod = new Mesh(new CylinderGeometry(0.002, 0.003, 0.03, 5), grey);
  rod.position.y = LANT_Y + 0.102;
  lh.add(rod);
  const ball = new Mesh(new SphereGeometry(0.007, 5, 4), grey);
  ball.position.y = LANT_Y + 0.121;
  lh.add(ball);

  // ---- leaning palms around the islet ----
  const palms: Array<[number, number, number, number, number]> = [
    [0.13, 0.075, 0.2, 0.28, 0.6],
    [-0.115, 0.085, 0.18, -0.24, 2.4],
    [-0.055, -0.135, 0.15, 0.2, 4.1],
    [0.115, -0.1, 0.13, -0.18, 5.4],
  ];
  for (const [x, z, h, lean, ry] of palms) {
    const p = palm(h, lean, palmMat);
    p.position.set(x, ISLET_Y - 0.004, z);
    p.rotation.y = ry;
    g.add(p);
  }

  // ---- keeper's hut tucked among the palms ----
  const hut = new Group();
  hut.position.set(-0.105, ISLET_Y, 0.065);
  hut.rotation.y = 0.4;
  const hutBody = new Mesh(new BoxGeometry(0.058, 0.036, 0.046), white);
  hutBody.position.y = 0.018;
  hut.add(hutBody);
  const hutRoof = new Mesh(new BoxGeometry(0.066, 0.008, 0.054), grey);
  hutRoof.position.y = 0.04;
  hut.add(hutRoof);
  g.add(hut);

  // ---- plank jetty running out over the shallows ----
  const jetty = new Group();
  jetty.position.set(0.02, 0, 0);
  jetty.rotation.y = -0.22;
  const deckPlank = new Mesh(new BoxGeometry(0.04, 0.009, 0.28), mat(WOOD));
  deckPlank.position.set(0, 0.062, 0.185);
  jetty.add(deckPlank);
  const pileGeo = new CylinderGeometry(0.0035, 0.0035, 0.062, 5);
  for (const pz of [0.135, 0.205, 0.275, 0.312]) {
    for (const px of [-0.015, 0.015]) {
      const pile = new Mesh(pileGeo, mat(WOOD));
      pile.position.set(px, 0.031, pz);
      jetty.add(pile);
    }
  }
  g.add(jetty);

  return g;
}
