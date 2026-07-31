// Juche Tower (주체사상탑) — papercraft: slender tapering granite shaft with
// pilaster fluting + tier lines, ringed capital, gold basin, muted-red flame.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

export function build(): Group {
  const g = new Group();

  const granite = mat("#d3cec2");
  const graniteLight = mat("#e7e3d9");
  const graniteDark = mat(TONES.stoneDark);
  const tierLine = mat("#c2bcae");
  const flameRed = mat("#b05442");
  const gold = mat(TONES.gold);

  g.add(plazaDisc(0.33));

  // --- Riverside base: wide low podium tiers, then square plinth ---
  const podium = new Mesh(new BoxGeometry(0.28, 0.026, 0.19), mat(TONES.stone));
  podium.position.y = 0.025;
  g.add(podium);
  const tier2 = new Mesh(new BoxGeometry(0.18, 0.026, 0.14), granite);
  tier2.position.y = 0.051;
  g.add(tier2);
  const plinth = new Mesh(new BoxGeometry(0.128, 0.038, 0.128), graniteDark);
  plinth.position.y = 0.083;
  g.add(plinth);

  // --- Shaft: slender tapered square column (4-seg cylinder rotated 45°) ---
  const shaftBottom = 0.1;
  const shaftTop = 0.755;
  const shaftH = shaftTop - shaftBottom;
  const halfBottom = 0.049; // square side 0.098
  const halfTop = 0.035; // square side 0.070
  const shaft = new Mesh(
    new CylinderGeometry(
      halfTop * Math.SQRT2,
      halfBottom * Math.SQRT2,
      shaftH,
      4,
      1
    ),
    granite
  );
  shaft.rotation.y = Math.PI / 4;
  shaft.position.y = (shaftBottom + shaftTop) / 2;
  g.add(shaft);

  // --- Vertical fluting: thin pilaster strips on each face, tilted to taper ---
  const slope = (halfBottom - halfTop) / shaftH;
  const midHalf = (halfBottom + halfTop) / 2;
  const stripLen = shaftH - 0.04;
  const stripY = (shaftBottom + shaftTop) / 2;
  const stripX = new BoxGeometry(0.01, stripLen, 0.007);
  const stripZ = new BoxGeometry(0.007, stripLen, 0.01);
  for (const off of [-0.014, 0.014]) {
    for (const s of [1, -1] as const) {
      const px = new Mesh(stripX, graniteLight);
      px.position.set(s * midHalf, stripY, off);
      px.rotation.z = s * slope;
      g.add(px);
      const pz = new Mesh(stripZ, graniteLight);
      pz.position.set(off, stripY, s * midHalf);
      pz.rotation.x = -s * slope;
      g.add(pz);
    }
  }

  // --- Horizontal tier lines (the tower's stacked-block granite courses) ---
  for (const ty of [0.17, 0.257, 0.344, 0.431, 0.518, 0.605, 0.692]) {
    const half = halfBottom - slope * (ty - shaftBottom);
    const side = 2 * half + 0.005;
    const band = new Mesh(new BoxGeometry(side, 0.006, side), tierLine);
    band.position.y = ty;
    g.add(band);
  }

  // --- Ringed capital near the top ---
  const capital: Array<[number, number, number, Mesh["material"]]> = [
    [0.08, 0.014, 0.762, granite],
    [0.108, 0.02, 0.78, graniteLight],
    [0.098, 0.016, 0.798, granite],
    [0.108, 0.02, 0.816, graniteLight],
    [0.118, 0.012, 0.832, tierLine],
  ];
  for (const [s, h, y, m] of capital) {
    const band = new Mesh(new BoxGeometry(s, h, s), m);
    band.position.y = y;
    g.add(band);
  }

  // --- Torch basin: muted dark band + gold cup ---
  const torchNeck = new Mesh(
    new BoxGeometry(0.064, 0.012, 0.064),
    mat(TONES.ironDark)
  );
  torchNeck.position.y = 0.844;
  g.add(torchNeck);
  const basin = new Mesh(new CylinderGeometry(0.052, 0.04, 0.02, 8), gold);
  basin.position.y = 0.86;
  g.add(basin);

  // --- The flame: tall lathe profile with sharp tip, muted brick red ---
  const profile = [
    new Vector2(0.026, 0),
    new Vector2(0.045, 0.014),
    new Vector2(0.053, 0.04),
    new Vector2(0.046, 0.068),
    new Vector2(0.031, 0.094),
    new Vector2(0.016, 0.114),
    new Vector2(0.005, 0.126),
    new Vector2(0.0, 0.132),
  ];
  const flame = new Mesh(new LatheGeometry(profile, 8), flameRed);
  flame.rotation.y = Math.PI / 8;
  flame.rotation.z = 0.05;
  flame.position.y = 0.866;
  g.add(flame);

  // --- Small statue group on the plaza in front (riverside ensemble hint) ---
  const statues = new Group();
  const statuePlinth = new Mesh(
    new BoxGeometry(0.06, 0.018, 0.034),
    mat(TONES.stone)
  );
  statuePlinth.position.y = 0.021;
  statues.add(statuePlinth);
  const bronze = mat(TONES.ironDark);
  for (const [fx, fh] of [
    [-0.017, 0.036],
    [0, 0.044],
    [0.017, 0.036],
  ] as const) {
    const fig = new Mesh(new BoxGeometry(0.012, fh, 0.012), bronze);
    fig.position.set(fx, 0.03 + fh / 2, 0);
    statues.add(fig);
  }
  statues.position.set(0, 0, 0.245);
  g.add(statues);

  return g;
}
