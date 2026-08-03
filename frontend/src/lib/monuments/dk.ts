// Nyhavn, Copenhagen — papercraft miniature.
// A row of seven narrow, colorful gabled townhouses on a stone quay, a canal
// strip in front with two wooden boats and a tall mast suggestion.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const OCHRE = "#c8a45e"; // muted Nyhavn yellow-ochre
const NAVY = "#5c6a84"; // muted deep-blue facade
const TILE = "#996152"; // muted red roof tile

function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  color: string
): Mesh {
  const m = new Mesh(new BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z);
  return m;
}

/** Triangular prism, ridge along Z. Base sits at local y = 0. */
function prismZ(w: number, h: number, d: number, color: string): Mesh {
  const s = new Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(0, h);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
  geo.translate(0, 0, -d / 2);
  return new Mesh(geo, mat(color));
}

/** Triangular prism, ridge along X. Base sits at local y = 0. */
function prismX(w: number, h: number, d: number, color: string): Mesh {
  const m = prismZ(d, h, w, color);
  m.geometry.rotateY(Math.PI / 2);
  return m;
}

interface House {
  w: number; // facade width
  h: number; // eave height
  wall: string;
  roof: string;
  gableFront: boolean; // true = gable faces the canal
}

export function build(): Group {
  const g = new Group();
  const disc = plazaDisc(0.35);
  disc.position.z = 0.025; // balance row + canal over the disc
  g.add(disc);

  const QUAY_TOP = 0.024;
  const DEPTH = 0.13; // house depth
  const ZC = -0.12; // house row center
  const ZF = ZC - DEPTH / 2; // back face z
  const FRONT = ZC + DEPTH / 2; // canal-side facade z (-0.055)

  // ---- quay platform under the row + walkway ----
  g.add(box(0.61, QUAY_TOP, 0.25, 0, QUAY_TOP / 2, -0.07, TONES.stone));
  // quay edge lip over the water
  g.add(box(0.61, 0.016, 0.02, 0, 0.02, 0.058, TONES.stoneDark));

  // ---- canal water + far quay strip (narrower: keeps footprint ≤ 0.75) ----
  g.add(box(0.58, 0.012, 0.16, 0, 0.008, 0.148, TONES.water));
  g.add(box(0.52, 0.02, 0.032, 0, 0.01, 0.243, TONES.stoneDark));

  // ---- the townhouse row (left to right along X) ----
  const houses: House[] = [
    { w: 0.092, h: 0.2, wall: TONES.woodRed, roof: TILE, gableFront: false },
    { w: 0.08, h: 0.25, wall: OCHRE, roof: TONES.ink, gableFront: true },
    { w: 0.088, h: 0.22, wall: TONES.domeBlue, roof: TILE, gableFront: false },
    { w: 0.076, h: 0.3, wall: TONES.white, roof: TILE, gableFront: true },
    { w: 0.09, h: 0.21, wall: TONES.roofTeal, roof: TONES.ink, gableFront: false },
    { w: 0.078, h: 0.26, wall: TONES.brick, roof: TONES.slate, gableFront: true },
    { w: 0.086, h: 0.235, wall: NAVY, roof: TILE, gableFront: false },
  ];

  let x = -0.295; // running left edge of the row
  let awning: string = TONES.woodRed;
  for (const hs of houses) {
    const cx = x + hs.w / 2;
    x += hs.w;

    // body
    g.add(box(hs.w, hs.h, DEPTH, cx, QUAY_TOP + hs.h / 2, ZC, hs.wall));

    const eaveY = QUAY_TOP + hs.h;
    if (hs.gableFront) {
      // steep Dutch gable facing the canal: roof prism + facade gable plate
      const gh = 0.085;
      const roof = prismZ(hs.w - 0.004, gh, DEPTH + 0.008, hs.roof);
      roof.position.set(cx, eaveY, ZC);
      g.add(roof);
      const plate = prismZ(hs.w, gh, 0.012, hs.wall);
      plate.position.set(cx, eaveY, FRONT + 0.002);
      g.add(plate);
      // tiny ridge finial cap
      g.add(box(0.014, 0.016, 0.014, cx, eaveY + gh + 0.006, ZC - 0.01, hs.roof));
    } else {
      // ridge parallel to the street, slight eave overhang
      const roof = prismX(hs.w + 0.008, 0.058, DEPTH + 0.014, hs.roof);
      roof.position.set(cx, eaveY, ZC);
      g.add(roof);
      // chimney
      g.add(box(0.016, 0.03, 0.016, cx + hs.w * 0.22, eaveY + 0.06, ZC - 0.03, hs.roof));
    }

    // canal-side facade: door + window grid (white, ink on the white house)
    const win = hs.wall === TONES.white ? TONES.slate : TONES.white;
    g.add(box(0.022, 0.055, 0.008, cx, QUAY_TOP + 0.0275, FRONT + 0.002, win));
    const cols = [cx - hs.w / 4, cx + hs.w / 4];
    for (let y = QUAY_TOP + 0.095; y < eaveY - 0.038; y += 0.062) {
      for (const wx of cols) {
        g.add(box(0.02, 0.027, 0.008, wx, y, FRONT + 0.002, win));
      }
    }
    if (hs.gableFront) {
      // one small attic window in the gable
      g.add(box(0.016, 0.022, 0.008, cx, eaveY + 0.03, FRONT + 0.006, win));
    }

    // café awning strip over the quay walk (alternating muted tones)
    const awn = new Mesh(
      new BoxGeometry(hs.w - 0.028, 0.005, 0.021),
      mat(awning)
    );
    awn.position.set(cx, 0.092, FRONT + 0.012);
    awn.rotation.x = 0.55;
    g.add(awn);
    awning = awning === TONES.woodRed ? TONES.white : TONES.woodRed;
  }

  // ---- boats in the canal ----
  const schooner = new Group();
  schooner.position.set(-0.09, 0, 0.135);
  schooner.rotation.y = 0.05;
  schooner.add(box(0.17, 0.028, 0.05, 0, 0.024, 0, TONES.ink));
  schooner.add(box(0.174, 0.008, 0.054, 0, 0.042, 0, TONES.white));
  schooner.add(box(0.05, 0.022, 0.034, 0.03, 0.057, 0, TONES.woodRed));
  const mastGeo = new CylinderGeometry(0.0035, 0.0045, 0.36, 6);
  const mastMat = mat(TONES.iron);
  const mast1 = new Mesh(mastGeo, mastMat);
  mast1.position.set(-0.05, 0.22, 0);
  schooner.add(mast1);
  // small muted pennant at the masthead
  schooner.add(box(0.02, 0.011, 0.003, -0.037, 0.39, 0, TONES.woodRed));
  const mast2 = new Mesh(new CylinderGeometry(0.003, 0.004, 0.24, 6), mastMat);
  mast2.position.set(0.045, 0.16, 0);
  schooner.add(mast2);
  // gaff spars: short, raked diagonals (nautical, not cross-shaped)
  const gaff1 = box(0.06, 0.005, 0.005, -0.028, 0.3, 0, TONES.iron);
  gaff1.rotation.z = 0.55;
  schooner.add(gaff1);
  const gaff2 = box(0.05, 0.005, 0.005, 0.063, 0.215, 0, TONES.iron);
  gaff2.rotation.z = 0.5;
  schooner.add(gaff2);
  // low horizontal booms
  schooner.add(box(0.06, 0.005, 0.005, -0.028, 0.075, 0, TONES.iron));
  schooner.add(box(0.05, 0.005, 0.005, 0.062, 0.07, 0, TONES.iron));
  g.add(schooner);

  const dinghy = new Group();
  dinghy.position.set(0.17, 0, 0.115);
  dinghy.rotation.y = -0.12;
  dinghy.add(box(0.09, 0.02, 0.04, 0, 0.02, 0, TONES.white));
  dinghy.add(box(0.036, 0.018, 0.028, -0.01, 0.038, 0, TONES.roofTeal));
  g.add(dinghy);

  // ---- quay bollards ----
  const bolGeo = new CylinderGeometry(0.006, 0.007, 0.02, 6);
  const bolMat = mat(TONES.ironDark);
  for (const bx of [-0.26, -0.13, 0.0, 0.13, 0.26]) {
    const b = new Mesh(bolGeo, bolMat);
    b.position.set(bx, QUAY_TOP + 0.01, 0.042);
    g.add(b);
  }

  return g;
}
