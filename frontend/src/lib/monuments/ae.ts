// Burj Khalifa — triple-lobed Y-plan supertall as papercraft column stacks.
// Three tapering lobe stacks (staggered heights, spiral-setback feel) hug a
// taller central core that finishes in a needle spire. Cool glass-steel tones.

import { CylinderGeometry, Group, Mesh } from "three";
import { mat, plazaDisc, TONES } from "./materials";

const PALE = "#a0b1c7"; // pale glass blue
const SILVER = "#c4ccd9"; // silver band
const SLATE_DARK = "#66708a";

interface Tier {
  r: number;
  off: number;
  h: number;
  c: string;
}

/** One Y-plan lobe: a stack of progressively thinner, shorter, inward-stepping drums. */
function lobe(angle: number, hScale: number): Group {
  const g = new Group();
  const tiers: Tier[] = [
    { r: 0.042, off: 0.072, h: 0.28, c: PALE },
    { r: 0.036, off: 0.06, h: 0.2, c: SILVER },
    { r: 0.03, off: 0.05, h: 0.15, c: PALE },
    { r: 0.024, off: 0.041, h: 0.11, c: SILVER },
  ];
  let y = 0;
  for (const t of tiers) {
    const h = t.h * hScale;
    const m = new Mesh(new CylinderGeometry(t.r * 0.94, t.r, h, 8), mat(t.c));
    m.position.set(Math.cos(angle) * t.off, y + h / 2, Math.sin(angle) * t.off);
    g.add(m);
    y += h;
  }
  return g;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.18));

  // Three lobes 120° apart, one pointing toward the front (+Z), with the
  // staggered wing tops that give the real tower its spiral-setback profile.
  const A = Math.PI / 2;
  g.add(lobe(A, 1.0));
  g.add(lobe(A + (2 * Math.PI) / 3, 0.8));
  g.add(lobe(A + (4 * Math.PI) / 3, 0.62));

  // Central core — taller than every lobe, stepping to a slender top.
  const core: Tier[] = [
    { r: 0.038, off: 0, h: 0.34, c: TONES.slate },
    { r: 0.031, off: 0, h: 0.24, c: PALE },
    { r: 0.024, off: 0, h: 0.15, c: TONES.slate },
    { r: 0.017, off: 0, h: 0.09, c: SILVER },
  ];
  let y = 0;
  for (const t of core) {
    const m = new Mesh(new CylinderGeometry(t.r * 0.94, t.r, t.h, 8), mat(t.c));
    m.position.y = y + t.h / 2;
    g.add(m);
    y += t.h;
  }

  // Crown taper + needle spire to the full 1.0 height.
  const crown = new Mesh(new CylinderGeometry(0.004, 0.014, 0.05, 8), mat(SLATE_DARK));
  crown.position.y = y + 0.025;
  g.add(crown);
  const spire = new Mesh(new CylinderGeometry(0.0012, 0.0045, 0.13, 6), mat(SLATE_DARK));
  spire.position.y = y + 0.05 + 0.065;
  g.add(spire);

  return g;
}
