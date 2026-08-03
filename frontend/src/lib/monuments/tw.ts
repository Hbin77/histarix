// Taipei 101 — papercraft miniature. Tapering pedestal, eight stacked
// outward-flaring "dou" (rice-measure) segments in jade-green glass,
// pinnacle block and needle spire. Coin medallions on the pedestal faces.

import { BoxGeometry, CylinderGeometry, Group, Mesh } from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;

const GLASS = "#8aab9c"; // muted jade curtain glass
const GLASS_DARK = "#6d9484"; // shaded segment rims
const GLASS_DEEP = "#5f8374"; // pedestal glass

/** Square frustum: half-widths at bottom/top, faces axis-aligned. */
function frustum(hwBot: number, hwTop: number, h: number, color: string): Mesh {
  const geo = new CylinderGeometry(hwTop * SQ2, hwBot * SQ2, h, 4, 1);
  geo.rotateY(Math.PI / 4);
  return new Mesh(geo, mat(color));
}

export function build(): Group {
  const g = new Group();

  g.add(plazaDisc(0.34));

  // ---- Pedestal: two-stage taper gives a slightly concave pyramid ----
  const BASE_H = 0.23;
  const baseLow = frustum(0.117, 0.092, 0.13, GLASS_DEEP);
  baseLow.position.y = 0.065;
  g.add(baseLow);
  const baseHigh = frustum(0.092, 0.074, 0.1, GLASS_DEEP);
  baseHigh.position.y = 0.18;
  g.add(baseHigh);

  // Coin medallions just under the first segment (the ruyi-coin emblems)
  const coinGeo = new CylinderGeometry(0.017, 0.017, 0.012, 12);
  for (let i = 0; i < 4; i++) {
    const holder = new Group();
    holder.rotation.y = (i * Math.PI) / 2;
    const coin = new Mesh(coinGeo, mat(TONES.gold));
    coin.rotation.x = Math.PI / 2; // flat face outward along local +z
    coin.position.set(0, 0.2, 0.082);
    holder.add(coin);
    g.add(holder);
  }

  // Transfer band where the pedestal meets the segment stack
  const band = new Mesh(new BoxGeometry(0.158, 0.008, 0.158), mat(GLASS_DARK));
  band.position.y = BASE_H + 0.002;
  g.add(band);

  // ---- Eight stacked flaring segments ----
  const SEG_H = 0.06;
  const LEDGE_T = 0.006;
  const PITCH = SEG_H + 0.004;
  const SEG_BOT = 0.064;
  const SEG_TOP = 0.096;
  let y = BASE_H;
  for (let i = 0; i < 8; i++) {
    const seg = frustum(SEG_BOT, SEG_TOP, SEG_H, GLASS);
    seg.position.y = y + SEG_H / 2;
    g.add(seg);
    const ledge = new Mesh(
      new BoxGeometry(0.197, LEDGE_T, 0.197),
      mat(GLASS_DARK)
    );
    ledge.position.y = y + SEG_H + LEDGE_T / 2 - 0.0015;
    g.add(ledge);
    y += PITCH;
  }

  // ---- Pinnacle turret + needle spire ----
  const pinA = frustum(0.036, 0.03, 0.055, GLASS_DEEP);
  pinA.position.y = y + 0.0275;
  g.add(pinA);
  const pinB = frustum(0.021, 0.015, 0.045, GLASS_DARK);
  pinB.position.y = y + 0.0775;
  g.add(pinB);
  const spire = new Mesh(
    new CylinderGeometry(0.0022, 0.009, 0.14, 6, 1),
    mat(TONES.slate)
  );
  spire.position.y = y + 0.17;
  g.add(spire);

  // ---- Podium annex (the low mall block beside the tower) ----
  const annex = new Mesh(new BoxGeometry(0.13, 0.07, 0.11), mat(GLASS_DEEP));
  annex.position.set(0.2, 0.035, 0.06);
  g.add(annex);
  const annexTop = new Mesh(new BoxGeometry(0.09, 0.03, 0.08), mat(GLASS));
  annexTop.position.set(0.2, 0.085, 0.06);
  g.add(annexTop);

  return g;
}
