// Moai (Easter Island) — papercraft: three monolithic head-and-torso figures
// with heavy brow blocks and long noses, standing on a low stone ahu platform
// over a grassy coastal mound. The tall middle figure wears a red pukao.

import { BoxGeometry, CylinderGeometry, Group, Mesh } from "three";
import { mat, TONES } from "./materials";

const D2R = Math.PI / 180;

const moaiStone = mat("#aba295"); // weathered volcanic tuff
const moaiShadow = mat("#756e63"); // recessed eye band under the brow
const ahuStone = mat("#7c766b"); // dark basalt platform
const ahuSlab = mat("#948c7e"); // lighter capping slabs
const grass = mat(TONES.forest);
const scoria = mat(TONES.woodRed); // red pukao topknot

/** Tapered rectangular block (4-seg cylinder rotated 45°, depth-scaled). */
function taperBox(wTop: number, wBot: number, h: number, depth: number): Mesh {
  const mesh = new Mesh(
    new CylinderGeometry(wTop / 2 / Math.SQRT1_2, wBot / 2 / Math.SQRT1_2, h, 4, 1),
    moaiStone
  );
  mesh.rotation.y = Math.PI / 4;
  mesh.scale.z = depth / Math.max(wTop, wBot);
  return mesh;
}

function box(w: number, h: number, d: number, m = moaiStone): Mesh {
  return new Mesh(new BoxGeometry(w, h, d), m);
}

/** One moai figure, base at y=0, facing +z. Total height ~0.4 (+pukao). */
function moai(hasPukao: boolean): Group {
  const g = new Group();

  // Torso — broad shoulders, slab-like monolith.
  const torso = taperBox(0.15, 0.125, 0.16, 0.1);
  torso.position.y = 0.08;
  g.add(torso);

  // Massive elongated head, ~60% of the figure, flat top (pukao seat).
  const head = taperBox(0.112, 0.122, 0.24, 0.105);
  head.position.y = 0.275;
  g.add(head);

  // Heavy overhanging brow ledge.
  const brow = box(0.128, 0.028, 0.06);
  brow.position.set(0, 0.33, 0.0525);
  g.add(brow);

  // Shadowed eye sockets tucked under the brow.
  const eyes = box(0.1, 0.022, 0.006, moaiShadow);
  eyes.position.set(0, 0.306, 0.0525);
  g.add(eyes);

  // Long nose: bold vertical block, tip tilted outward.
  const nose = box(0.034, 0.13, 0.055);
  nose.position.set(0, 0.256, 0.055);
  nose.rotation.x = -8 * D2R;
  g.add(nose);

  // Flared nostril block at the nose tip.
  const nostril = box(0.052, 0.02, 0.048);
  nostril.position.set(0, 0.194, 0.061);
  g.add(nostril);

  // Thin pursed lips over a strong jutting chin.
  const lips = box(0.064, 0.016, 0.032);
  lips.position.set(0, 0.163, 0.054);
  g.add(lips);
  const chin = box(0.072, 0.022, 0.034);
  chin.position.set(0, 0.14, 0.051);
  g.add(chin);

  // Long ears hugging the head sides.
  for (const sx of [-1, 1]) {
    const ear = box(0.02, 0.11, 0.04);
    ear.position.set(sx * 0.068, 0.27, 0.005);
    g.add(ear);
  }

  // Arms held tight along the torso, hands meeting on the belly.
  for (const sx of [-1, 1]) {
    const arm = box(0.018, 0.12, 0.055);
    arm.position.set(sx * 0.071, 0.085, 0.01);
    arm.rotation.z = -sx * 4 * D2R; // hug the tapering torso
    g.add(arm);
  }
  const hands = box(0.06, 0.022, 0.012);
  hands.position.set(0, 0.05, 0.052);
  g.add(hands);

  if (hasPukao) {
    const knot = new Mesh(new CylinderGeometry(0.036, 0.044, 0.055, 8), scoria);
    knot.position.set(0, 0.4225, -0.005);
    g.add(knot);
  }

  // Subtle backward lean of the monolith.
  g.rotation.x = -2.5 * D2R;
  return g;
}

export function build(): Group {
  const g = new Group();

  // --- Grass coastal mound (terrain base, no plaza disc) ---
  const mound = new Mesh(new CylinderGeometry(0.33, 0.36, 0.028, 24), grass);
  mound.position.y = 0.014;
  g.add(mound);
  const grassTop = 0.028;

  // Sun-dried lighter patch breaking up the flat green in aerial views.
  const patch = new Mesh(
    new CylinderGeometry(0.24, 0.26, 0.006, 18),
    mat("#89a073")
  );
  patch.position.set(0.03, grassTop, 0.03);
  g.add(patch);

  // --- Ahu: low stone platform + lighter capping slab + sloped front apron ---
  const platform = box(0.54, 0.055, 0.17, ahuStone);
  platform.position.set(0, grassTop + 0.0275, -0.02);
  g.add(platform);

  const cap = box(0.52, 0.018, 0.15, ahuSlab);
  cap.position.set(0, grassTop + 0.055 + 0.009, -0.02);
  g.add(cap);

  const apron = box(0.4, 0.014, 0.11, ahuSlab);
  apron.position.set(0, grassTop + 0.006, 0.1);
  apron.rotation.x = 14 * D2R;
  g.add(apron);

  // --- Three moai in a row on the platform, middle one tallest ---
  const ahuTop = grassTop + 0.055 + 0.018;
  const figures: Array<[number, number, number, boolean]> = [
    // [x, scale, yRotDeg, hasPukao]
    [-0.17, 0.9, 4, false],
    [0, 0.97, 0, true],
    [0.17, 0.87, -5, false],
  ];
  for (const [x, s, ry, pukao] of figures) {
    const fig = moai(pukao);
    fig.position.set(x, ahuTop, -0.03);
    // Vertical stretch elongates the monoliths (long heads, long noses).
    fig.scale.set(0.92 * s, 1.1 * s, 0.96 * s);
    fig.rotation.y = ry * D2R;
    g.add(fig);
  }

  // --- A few fallen stones scattered on the grass ---
  const stones: Array<[number, number, number, number]> = [
    [-0.25, 0.17, 0.02, 30],
    [0.21, 0.2, 0.016, -20],
    [0.05, 0.25, 0.014, 55],
  ];
  for (const [x, z, h, deg] of stones) {
    const st = box(0.035, h, 0.026, ahuStone);
    st.position.set(x, grassTop + h / 2, z);
    st.rotation.y = deg * D2R;
    g.add(st);
  }

  return g;
}
