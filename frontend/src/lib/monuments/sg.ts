// Marina Bay Sands — papercraft: three wide glass slab towers, each split by
// an inverted-V leg notch below the merge level, bridged by a white surfboard
// skypark cantilevering past one end. Garden strip + infinity pool on deck,
// bay water sheet in front.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

export function build(): Group {
  const g = new Group();
  const glass = mat("#7f99ae"); // muted curtain-wall blue
  const seamBlue = mat("#5e7386"); // darker recess between the two leaves
  const white = mat(TONES.white);
  const deck = mat("#e6e1d5");
  const green = mat(TONES.forest);
  const water = mat(TONES.water);

  g.add(plazaDisc(0.36));

  // ---- Marina Bay: rounded water sheet in front of the towers ----
  const bay = new Mesh(new CylinderGeometry(0.3, 0.3, 0.008, 24), water);
  bay.scale.z = 0.36;
  bay.position.set(0, 0.014, 0.2);
  g.add(bay);

  // ---- Podium slab under the tower row ----
  const podium = new Mesh(new BoxGeometry(0.58, 0.028, 0.17), white);
  podium.position.y = 0.014;
  g.add(podium);

  // ---- Three towers: vertical-edged slabs with an inverted-V leg notch ----
  // Lower section: one extruded polygon — two legs splitting from the merge
  // point (~42% height) down to the base, outer edges kept vertical.
  const lower = new Shape();
  lower.moveTo(-0.075, 0);
  lower.lineTo(-0.022, 0);
  lower.quadraticCurveTo(-0.019, 0.14, 0, 0.3);
  lower.quadraticCurveTo(0.019, 0.14, 0.022, 0);
  lower.lineTo(0.075, 0);
  lower.lineTo(0.075, 0.35);
  lower.lineTo(-0.075, 0.35);
  lower.closePath();
  const lowerGeo = new ExtrudeGeometry(lower, {
    depth: 0.09,
    bevelEnabled: false,
    curveSegments: 6,
  });
  for (const tx of [-0.19, 0, 0.19]) {
    const legs = new Mesh(lowerGeo, glass);
    legs.position.set(tx, 0.02, -0.045);
    g.add(legs);
    const slab = new Mesh(new BoxGeometry(0.15, 0.47, 0.09), glass);
    slab.position.set(tx, 0.605, 0);
    g.add(slab);
    // dark seam where the two leaning leaves meet, continuing to the top
    const seam = new Mesh(new BoxGeometry(0.007, 0.47, 0.094), seamBlue);
    seam.position.set(tx, 0.605, 0);
    g.add(seam);
    // white end walls on the narrow slab edges, full height, slightly proud
    for (const s of [1, -1] as const) {
      const fin = new Mesh(new BoxGeometry(0.008, 0.82, 0.092), white);
      fin.position.set(tx + s * 0.0725, 0.43, 0);
      g.add(fin);
    }
  }

  // ---- Skypark: surfboard slab, prow cantilevered past the +x tower ----
  const board = new Shape();
  board.moveTo(-0.25, 0.052);
  board.absarc(-0.25, 0, 0.052, Math.PI / 2, Math.PI * 1.5, false);
  board.lineTo(0.22, -0.052);
  board.quadraticCurveTo(0.32, -0.046, 0.37, 0);
  board.quadraticCurveTo(0.32, 0.046, 0.22, 0.052);
  board.closePath();
  const park = new Mesh(
    new ExtrudeGeometry(board, {
      depth: 0.04,
      bevelEnabled: false,
      curveSegments: 8,
    }),
    white
  );
  park.rotation.x = -Math.PI / 2;
  park.position.y = 0.835;
  g.add(park);

  // Deck inlay strip (slightly proud, warmer tone)
  const inlay = new Mesh(new BoxGeometry(0.52, 0.008, 0.07), deck);
  inlay.position.set(0.02, 0.878, 0);
  g.add(inlay);

  // Garden strip: little tree tufts along the deck
  for (const [x, w] of [
    [-0.22, 0.05],
    [-0.14, 0.06],
    [-0.06, 0.05],
    [0.03, 0.06],
    [0.11, 0.05],
  ] as const) {
    const tuft = new Mesh(new BoxGeometry(w, 0.022, 0.05), green);
    tuft.position.set(x, 0.892, 0);
    g.add(tuft);
  }

  // Infinity pool on the cantilevered prow
  const pool = new Mesh(new BoxGeometry(0.11, 0.007, 0.055), water);
  pool.position.set(0.24, 0.883, 0);
  g.add(pool);

  // ---- ArtScience Museum: little lotus cup on an islet in the bay ----
  const islet = new Mesh(new CylinderGeometry(0.058, 0.063, 0.014, 12), deck);
  islet.position.set(0.22, 0.021, 0.19);
  g.add(islet);
  const lotus = new Mesh(new CylinderGeometry(0.046, 0.014, 0.068, 10), white);
  lotus.position.set(0.22, 0.062, 0.19);
  g.add(lotus);

  return g;
}
