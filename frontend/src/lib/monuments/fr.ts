// Tour Eiffel — papercraft: four concave lattice legs converging into the
// first deck, face arches, two decks, concave upper taper, spire.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  TorusGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;

export function build(): Group {
  const g = new Group();
  const iron = mat(TONES.iron);
  const ironDark = mat(TONES.ironDark);

  g.add(plazaDisc(0.34));

  // ---- Legs: concave curve from splayed feet into first-deck corners ----
  const DECK1_Y = 0.3; // first deck center
  const LEG_TOP_Y = 0.295; // embeds into deck slab
  const R_FOOT = 0.26; // diagonal distance, feet
  const R_TOP = 0.15; // diagonal distance, deck corner
  const SEGS = 4;
  const rAt = (t: number) => R_TOP + (R_FOOT - R_TOP) * (1 - t) * (1 - t);
  const wAt = (t: number) => 0.05 - 0.018 * t; // leg thickness taper

  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
    const leg = new Group();
    leg.rotation.y = Math.atan2(-sz, sx); // local +x = outward diagonal
    for (let i = 0; i < SEGS; i++) {
      const t0 = i / SEGS;
      const t1 = (i + 1) / SEGS;
      const rA = rAt(t0);
      const rB = rAt(t1);
      const yA = LEG_TOP_Y * t0;
      const yB = LEG_TOP_Y * t1;
      const len = Math.hypot(rB - rA, yB - yA) + 0.012; // overlap joints
      const w = wAt((t0 + t1) / 2);
      const seg = new Mesh(new BoxGeometry(w, len, w), iron);
      seg.position.set((rA + rB) / 2, (yA + yB) / 2, 0);
      seg.rotation.z = Math.atan2(-(rB - rA), yB - yA);
      leg.add(seg);
    }
    // foot pad
    const foot = new Mesh(new BoxGeometry(0.07, 0.02, 0.07), ironDark);
    foot.position.set(R_FOOT - 0.004, 0.014, 0);
    leg.add(foot);
    g.add(leg);
  }

  // ---- Face arches under the first deck ----
  const archGeo = new TorusGeometry(0.098, 0.011, 6, 12, Math.PI);
  const ARCH_Y = 0.172; // arch top ≈ 0.27, just under the deck
  const ARCH_D = 0.113; // face-plane offset
  for (let i = 0; i < 4; i++) {
    const arch = new Mesh(archGeo, iron);
    const a = (i * Math.PI) / 2;
    arch.position.set(Math.sin(a) * ARCH_D, ARCH_Y, Math.cos(a) * ARCH_D);
    arch.rotation.y = a;
    g.add(arch);
  }

  // ---- First deck: distinct wide ledge over the arch section ----
  const deck1 = new Mesh(new BoxGeometry(0.222, 0.022, 0.222), ironDark);
  deck1.position.y = DECK1_Y;
  g.add(deck1);

  // ---- Body between decks (4-sided frustum, corners on the diagonals) ----
  const body1 = new Mesh(
    new CylinderGeometry(0.05 * SQ2, 0.088 * SQ2, 0.2, 4, 1),
    iron
  );
  body1.rotation.y = Math.PI / 4;
  body1.position.y = 0.41;
  g.add(body1);

  // ---- Second deck ----
  const deck2 = new Mesh(new BoxGeometry(0.138, 0.02, 0.138), ironDark);
  deck2.position.y = 0.52;
  g.add(deck2);

  // ---- Upper taper: two frustums give the concave sweep ----
  const upperA = new Mesh(
    new CylinderGeometry(0.027 * SQ2, 0.046 * SQ2, 0.17, 4, 1),
    iron
  );
  upperA.rotation.y = Math.PI / 4;
  upperA.position.y = 0.615;
  g.add(upperA);
  const upperB = new Mesh(
    new CylinderGeometry(0.015 * SQ2, 0.027 * SQ2, 0.155, 4, 1),
    iron
  );
  upperB.rotation.y = Math.PI / 4;
  upperB.position.y = 0.7775;
  g.add(upperB);

  // ---- Lattice suggestion: thin horizontal bands, barely proud ----
  const bands: Array<[number, number]> = [
    [0.365, 0.148],
    [0.45, 0.122],
    [0.6, 0.078],
    [0.675, 0.066],
    [0.75, 0.052],
  ];
  for (const [y, w] of bands) {
    const band = new Mesh(new BoxGeometry(w, 0.009, w), ironDark);
    band.position.y = y;
    g.add(band);
  }

  // ---- Top platform, cupola, spire ----
  const topDeck = new Mesh(new BoxGeometry(0.05, 0.014, 0.05), ironDark);
  topDeck.position.y = 0.862;
  g.add(topDeck);
  const cupola = new Mesh(new BoxGeometry(0.026, 0.024, 0.026), iron);
  cupola.position.y = 0.88;
  g.add(cupola);
  const spire = new Mesh(new CylinderGeometry(0.004, 0.011, 0.085, 6, 1), ironDark);
  spire.position.y = 0.938;
  g.add(spire);

  return g;
}
