// Victoria Falls (Mosi-oa-Tunya) — stylized papercraft landform: the Zambezi
// crosses a forested tableland and drops off its front edge as one tall white
// curtain into a narrow foaming gorge, walled in by rock on both sides and
// closed by a low rim in front. The mist column stands over the eastern end.
// The scene is turned off axis so the cliff line never goes edge-on.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
} from "three";
import { mat, TONES } from "./materials";

const BASALT = "#6b665f";
const BASALT_D = "#504b45";
const FOREST = "#7a9165";
const FOREST_D = "#5f7550";
const FOAM = "#f1efe9";
const GORGE_W = "#5c7889"; // shadowed water in the slot

const W = 0.48; // length of the cliff line
const RIM = 0.38; // tableland top / cliff lip
const LIP_Z = -0.05; // the cliff face plane
const PD = 0.18; // tableland depth
const FLOOR = 0.13; // where the curtain breaks up into spray

const basalt = mat(BASALT);
const basaltD = mat(BASALT_D);
const foam = mat(FOAM);
const forest = mat(FOREST);
const forestD = mat(FOREST_D);

function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  m: MeshLambertMaterial
): Mesh {
  const mesh = new Mesh(new BoxGeometry(w, h, d), m);
  mesh.position.set(x, y, z);
  return mesh;
}

export function build(): Group {
  const g = new Group();

  const ground = new Mesh(new CylinderGeometry(0.37, 0.37, 0.026, 30), mat(FOREST_D));
  ground.position.y = 0.013;
  g.add(ground);

  const scene = new Group();
  scene.rotation.y = 0.4; // ~23°
  g.add(scene);

  // ---- forested tableland; its front face is the cliff ----
  const pz = LIP_Z - PD / 2;
  scene.add(box(W, RIM - 0.026, PD, 0, (RIM - 0.026) / 2, pz, basalt));
  scene.add(box(W, 0.026, PD, 0, RIM - 0.013, pz, forest));
  // vegetated flanks stepping out so the tableland reads as land, not a block
  for (const s of [-1, 1]) {
    scene.add(box(0.028, 0.26, PD - 0.02, s * (W / 2 + 0.014), 0.13, pz, forest));
    scene.add(box(0.05, 0.15, PD + 0.02, s * (W / 2 + 0.038), 0.075, pz, forestD));
  }
  scene.add(box(W + 0.06, 0.21, 0.04, 0, 0.105, pz - PD / 2 - 0.02, forest));

  // the Zambezi crossing it, green banks left and right
  scene.add(box(0.37, 0.02, PD - 0.045, 0, RIM - 0.003, pz - 0.014, mat(TONES.water)));
  for (const [x, w] of [
    [-0.105, 0.038],
    [0.035, 0.03],
    [0.14, 0.024],
  ] as const)
    scene.add(box(w, 0.03, 0.055, x, RIM + 0.009, pz - 0.028, forestD));

  // ---- the curtain: three plain sheets stepped in plan and bellying
  //      forward, so the cliff line is never one flat rectangle ----
  const TOP = RIM - 0.002;
  const sheets: Array<[number, number, number, number]> = [
    // centre x, width, bottom, z nudge
    [-0.158, 0.166, FLOOR + 0.018, 0.0],
    [-0.001, 0.172, FLOOR, 0.024],
    [0.158, 0.166, FLOOR + 0.024, 0.009],
  ];
  for (const [cx, w, bot, dz] of sheets) {
    const sheet = new Group();
    sheet.position.set(cx, (TOP + bot) / 2, LIP_Z + 0.014 + dz);
    sheet.rotation.x = -0.05;
    sheet.add(box(w, TOP - bot, 0.03, 0, 0, 0, foam));
    scene.add(sheet);
  }
  // white water curling over the lip — the bright line seen from above
  scene.add(box(W - 0.004, 0.028, 0.07, 0, RIM + 0.003, LIP_Z - 0.02, foam));

  // ---- the narrow gorge: churned water walled in by rock ----
  scene.add(box(W - 0.02, 0.1, 0.15, 0, 0.05, LIP_Z + 0.075, mat(GORGE_W)));
  // low rim closing the near side of the slot
  scene.add(box(W + 0.06, 0.1, 0.14, 0, 0.05, LIP_Z + 0.22, basalt));
  scene.add(box(W + 0.06, 0.022, 0.14, 0, 0.111, LIP_Z + 0.22, forest));
  scene.add(box(W + 0.06, 0.05, 0.016, 0, 0.025, LIP_Z + 0.158, basaltD));
  // rock walls closing the two ends of the slot
  for (const s of [-1, 1]) {
    scene.add(box(0.055, 0.2, 0.29, s * (W / 2 + 0.012), 0.1, LIP_Z + 0.145, basalt));
    scene.add(box(0.055, 0.022, 0.29, s * (W / 2 + 0.012), 0.211, LIP_Z + 0.145, forest));
  }

  // ---- spray boiling out of the slot and clinging to the lip ----
  const spray: Array<[number, number, number, number, string]> = [
    [-0.205, 0.155, 0.02, 0.05, "#eeece7"],
    [-0.135, 0.185, 0.05, 0.062, "#f1efe9"],
    [-0.06, 0.15, 0.025, 0.052, "#e4e1db"],
    [0.005, 0.195, 0.055, 0.066, "#f1efe9"],
    [0.075, 0.155, 0.022, 0.054, "#eae7e1"],
    [0.15, 0.19, 0.05, 0.06, "#f1efe9"],
    [0.215, 0.158, 0.024, 0.05, "#e4e1db"],
    [-0.13, 0.365, 0.008, 0.03, "#eae8e3"],
    [0.02, 0.375, 0.014, 0.034, "#f0eee9"],
    [0.135, 0.368, 0.006, 0.028, "#e5e3de"],
  ];
  for (const [x, y, z, r, c] of spray) {
    const m = new Mesh(new SphereGeometry(r, 7, 5), mat(c));
    m.position.set(x, y, LIP_Z + 0.035 + z);
    scene.add(m);
  }

  // ---- rainforest tufts along the rims ----
  const tuftGeo = new ConeGeometry(0.028, 0.052, 6);
  const tufts: Array<[number, number, number]> = [
    [-0.205, RIM, pz - 0.065],
    [-0.06, RIM, pz - 0.076],
    [0.085, RIM, pz - 0.06],
    [0.21, RIM, pz - 0.078],
    [-0.165, 0.122, LIP_Z + 0.26],
    [-0.02, 0.122, LIP_Z + 0.268],
    [0.125, 0.122, LIP_Z + 0.256],
    [-0.256, 0.222, LIP_Z + 0.06],
    [-0.256, 0.222, LIP_Z + 0.22],
    [0.256, 0.222, LIP_Z + 0.06],
    [0.256, 0.222, LIP_Z + 0.22],
  ];
  for (const [x, y, z] of tufts) {
    const t = new Mesh(tuftGeo, forestD);
    t.position.set(x, y + 0.024, z);
    scene.add(t);
  }

  // ---- the mist column standing over the eastern end ----
  const mist: Array<[number, number, number, number, string]> = [
    [0.185, 0.3, 0.005, 0.085, "#e2e0dc"],
    [0.135, 0.385, 0.035, 0.07, "#ecebe7"],
    [0.215, 0.455, 0.008, 0.056, "#dbd9d5"],
    [0.16, 0.52, 0.03, 0.042, "#e6e4e0"],
    [0.215, 0.575, 0.004, 0.03, "#dedcd8"],
  ];
  for (const [x, y, z, r, c] of mist) {
    const m = new Mesh(new SphereGeometry(r, 7, 5), mat(c));
    m.position.set(x, y, LIP_Z + 0.05 + z);
    scene.add(m);
  }

  return g;
}
