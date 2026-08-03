// Sky Tower (Auckland, Aotearoa) — papercraft: ribbed drum base, slender
// concrete shaft, flared observation pod of stacked discs with dark glass
// bands, small upper drum, and a needle mast to full height.

import { CylinderGeometry, Group, Mesh } from "three";
import { mat, plazaDisc, TONES } from "./materials";

export function build(): Group {
  const g = new Group();
  const concrete = mat(TONES.white);
  const concreteDim = mat(TONES.stone);
  const glass = mat(TONES.ink);
  const glassLight = mat(TONES.slate);

  g.add(plazaDisc(0.3));

  // ---- Base drum with vertical ribs (the fluted "legs" skirt) ----
  const baseDrum = new Mesh(
    new CylinderGeometry(0.072, 0.086, 0.13, 14, 1),
    concreteDim
  );
  baseDrum.position.y = 0.065;
  g.add(baseDrum);

  const RIBS = 8;
  for (let i = 0; i < RIBS; i++) {
    const a = (i / RIBS) * Math.PI * 2;
    const rib = new Mesh(new CylinderGeometry(0.012, 0.014, 0.135, 6, 1), concrete);
    rib.position.set(Math.sin(a) * 0.082, 0.0675, Math.cos(a) * 0.082);
    g.add(rib);
  }

  // shoulder easing base into shaft
  const shoulder = new Mesh(
    new CylinderGeometry(0.04, 0.072, 0.045, 14, 1),
    concrete
  );
  shoulder.position.y = 0.1525;
  g.add(shoulder);

  // ---- Shaft: very slender, gently tapering ----
  const shaft = new Mesh(
    new CylinderGeometry(0.033, 0.041, 0.43, 14, 1),
    concrete
  );
  shaft.position.y = 0.39;
  g.add(shaft);

  // ---- Observation pod: long flare up to the widest ring, quick taper ----
  // flared underside (wine-glass sweep, two frustums for concave feel)
  const flareA = new Mesh(
    new CylinderGeometry(0.062, 0.033, 0.04, 16, 1),
    concrete
  );
  flareA.position.y = 0.618;
  g.add(flareA);
  const flareB = new Mesh(
    new CylinderGeometry(0.1, 0.062, 0.042, 16, 1),
    concreteDim
  );
  flareB.position.y = 0.659;
  g.add(flareB);

  // main observation ring (widest, dark glass)
  const mainRing = new Mesh(
    new CylinderGeometry(0.104, 0.102, 0.034, 16, 1),
    glass
  );
  mainRing.position.y = 0.697;
  g.add(mainRing);

  // white ledge disc
  const ledge = new Mesh(
    new CylinderGeometry(0.108, 0.108, 0.014, 16, 1),
    concrete
  );
  ledge.position.y = 0.721;
  g.add(ledge);

  // upper glass ring, inset and shorter
  const upperRing = new Mesh(
    new CylinderGeometry(0.088, 0.096, 0.024, 16, 1),
    glassLight
  );
  upperRing.position.y = 0.74;
  g.add(upperRing);

  // pod cap: quick contraction
  const cap = new Mesh(
    new CylinderGeometry(0.048, 0.086, 0.022, 16, 1),
    concrete
  );
  cap.position.y = 0.763;
  g.add(cap);

  // ---- Small upper drum (Sky Deck) ----
  const skyDeck = new Mesh(
    new CylinderGeometry(0.036, 0.041, 0.032, 12, 1),
    glassLight
  );
  skyDeck.position.y = 0.79;
  g.add(skyDeck);

  const drumCap = new Mesh(
    new CylinderGeometry(0.013, 0.038, 0.02, 12, 1),
    concrete
  );
  drumCap.position.y = 0.816;
  g.add(drumCap);

  // ---- Long slender needle mast with tiny collars ----
  const mast = new Mesh(
    new CylinderGeometry(0.0035, 0.009, 0.17, 8, 1),
    concreteDim
  );
  mast.position.y = 0.917;
  g.add(mast);

  for (const [y, r] of [
    [0.852, 0.017],
    [0.888, 0.014],
    [0.936, 0.011],
  ] as const) {
    const collar = new Mesh(new CylinderGeometry(r, r, 0.009, 8, 1), concrete);
    collar.position.y = y;
    g.add(collar);
  }

  return g;
}
