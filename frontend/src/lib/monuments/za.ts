// Table Mountain (Cape Town, South Africa) — papercraft massif seen from
// Bloubergstrand: dead-level table top on sheer blue-gray cliffs with
// buttress ribs, green lower slopes, Devil's Peak cone on the left,
// Lion's Head on the right, tiny white city blocks and ocean at the foot.
// Natural landform: no plaza disc — water slab + sand/green terrain base.

import { BoxGeometry, CylinderGeometry, Group, Mesh } from "three";
import { mat, TONES } from "./materials";

const STRETCH = 2.35; // x-elongation of the massif
const MX = -0.02; // massif center x

function cyl(
  rTop: number,
  rBot: number,
  h: number,
  seg: number,
  color: string
): Mesh {
  return new Mesh(new CylinderGeometry(rTop, rBot, h, seg), mat(color));
}

export function build(): Group {
  const g = new Group();

  // --- Ocean slab (round base the whole scene sits in) ---
  const sea = cyl(0.36, 0.36, 0.012, 28, TONES.water);
  sea.position.y = 0.006;
  g.add(sea);

  // --- Shoreline: sand rim, then lighter coastal plain ---
  const sand = cyl(0.3, 0.315, 0.016, 22, TONES.sand);
  sand.position.y = 0.02;
  sand.scale.x = 1.12;
  g.add(sand);

  const plain = cyl(0.27, 0.29, 0.016, 22, "#8aa076");
  plain.position.y = 0.034;
  plain.scale.x = 1.12;
  g.add(plain);

  // --- Main table massif: broad low wall, elongated along x ---
  // Green lower slope (taller flank, as in the Blouberg view)
  const slope = cyl(0.092, 0.12, 0.175, 14, TONES.forest);
  slope.position.set(MX, 0.1075, 0);
  slope.scale.x = STRETCH;
  g.add(slope);

  // Sheer cliff band (the famous face) — wide and squat
  const cliff = cyl(0.085, 0.092, 0.195, 14, TONES.slate);
  cliff.position.set(MX, 0.2925, 0);
  cliff.scale.x = STRETCH;
  g.add(cliff);

  // Dead-level table top (sunlit rock plateau)
  const cap = cyl(0.082, 0.0845, 0.014, 14, "#a3a795");
  cap.position.set(MX, 0.396, 0);
  cap.scale.x = STRETCH;
  g.add(cap);

  // --- Buttress ribs on the front cliff face (Platteklip gorge relief) ---
  const ribMat = mat("#6c7689");
  const ribs: Array<[number, number, number]> = [
    // world x, z placement, y-rotation
    [-0.1, 0.078, 0.2],
    [0.0, 0.084, -0.05],
    [0.1, 0.068, -0.32],
  ];
  for (const [x, z, ry] of ribs) {
    const rib = new Mesh(new BoxGeometry(0.04, 0.17, 0.02), ribMat);
    rib.position.set(x, 0.29, z);
    rib.rotation.y = ry;
    g.add(rib);
  }

  // --- Devil's Peak (left): broad triangular cone merging into the table ---
  const dpSkirt = cyl(0.06, 0.1, 0.09, 10, TONES.forest);
  dpSkirt.position.set(-0.265, 0.065, 0);
  g.add(dpSkirt);

  const dpRock = cyl(0.005, 0.095, 0.29, 10, TONES.slate);
  dpRock.position.set(-0.265, 0.215, 0);
  g.add(dpRock);

  // --- Lion's Head (right): low green shoulder + pointed rock cone ---
  const lhSkirt = cyl(0.032, 0.06, 0.08, 9, TONES.forest);
  lhSkirt.position.set(0.3, 0.06, 0);
  g.add(lhSkirt);

  const lhRock = cyl(0.004, 0.055, 0.19, 9, TONES.slate);
  lhRock.position.set(0.3, 0.185, 0);
  g.add(lhRock);

  // --- City Bowl: tiny white blocks strung along the front shore ---
  const cityMat = mat(TONES.white);
  const spots: Array<[number, number, number, number]> = [
    // x, z, footprint, height
    [-0.16, 0.19, 0.018, 0.016],
    [-0.1, 0.22, 0.016, 0.02],
    [-0.05, 0.19, 0.02, 0.014],
    [0.0, 0.23, 0.016, 0.022],
    [0.05, 0.2, 0.018, 0.016],
    [0.1, 0.22, 0.015, 0.018],
    [0.15, 0.19, 0.018, 0.014],
    [0.2, 0.21, 0.014, 0.016],
    [-0.21, 0.21, 0.015, 0.014],
  ];
  for (const [x, z, s, h] of spots) {
    const b = new Mesh(new BoxGeometry(s, h, s), cityMat);
    b.position.set(x, 0.042 + h / 2, z);
    g.add(b);
  }

  return g;
}
