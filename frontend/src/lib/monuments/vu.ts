// Mount Yasur (Tanna) — stylized papercraft volcano: squat dark ash cone
// truncated by an open crater, bare slopes raked with lighter ash gullies,
// an ember glow on the crater floor and rim, and a puff of pale grey smoke
// drifting above. Natural landform: its own ash terrain, no plaza disc.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  SphereGeometry,
  Vector2,
} from "three";
import { mat } from "./materials";

const H = 0.4; // rim height
const R0 = 0.345; // cone radius at the ash field
const R_RIM = 0.13; // crater rim radius
const SEG = 24;

const ASH = "#6f6b66";
const ASH_D = "#59554f";
const ASH_L = "#87817a";
const CRATER = "#484441";
const EMBER = "#bf7442";
const SCRUB = "#6d8560";

/** Ash-cone slope: near-straight talus with a slight flare at the foot. */
function slopeR(t: number): number {
  const s = Math.min(Math.max(t, 0), 1);
  return R_RIM + (R0 - R_RIM) * Math.pow(1 - s, 0.92);
}

function lathe(pts: Array<[number, number]>, color: string, seg = SEG): Mesh {
  return new Mesh(
    new LatheGeometry(
      pts.map(([r, y]) => new Vector2(r, y)),
      seg
    ),
    mat(color)
  );
}

export function build(): Group {
  const g = new Group();

  // ---- ash field the cone stands on ----
  const field = new Mesh(new CylinderGeometry(0.375, 0.375, 0.024, 30), mat(ASH_D));
  field.position.y = 0.012;
  g.add(field);

  // ---- cone body ----
  const ts = [0, 0.06, 0.16, 0.3, 0.44, 0.58, 0.72, 0.86, 1];
  const body: Array<[number, number]> = [[R0 + 0.022, 0]];
  for (const t of ts) body.push([slopeR(t), t * H]);
  g.add(lathe(body, ASH));

  // ---- crater: dark bowl dropping in from the rim, glowing floor ----
  g.add(
    lathe(
      [
        [R_RIM - 0.002, H],
        [R_RIM - 0.03, H - 0.028],
        [0.075, H - 0.058],
        [0.05, H - 0.072],
        [0.0001, H - 0.076],
      ],
      CRATER
    )
  );
  const glow = new Mesh(new CylinderGeometry(0.062, 0.05, 0.012, 16), mat(EMBER));
  glow.position.y = H - 0.072;
  g.add(glow);
  // ember lip just inside the rim
  g.add(
    lathe(
      [
        [R_RIM - 0.004, H - 0.001],
        [R_RIM - 0.022, H - 0.02],
        [R_RIM - 0.028, H - 0.016],
        [R_RIM - 0.008, H + 0.004],
        [R_RIM - 0.004, H - 0.001],
      ],
      EMBER,
      18
    )
  );

  // ---- raked ash gullies streaking the bare slopes ----
  // Each streak is centred on one lathe facet so it lies flush with the
  // faceted slope instead of breaking the silhouette.
  const INSET = Math.cos(Math.PI / SEG);
  const streaks: Array<[number, number, number, number, string]> = [
    // facet index, t start, t end, width, tone
    [1, 0.1, 0.8, 0.028, ASH_L],
    [4, 0.18, 0.72, 0.02, ASH_D],
    [6, 0.06, 0.66, 0.032, ASH_L],
    [9, 0.22, 0.79, 0.024, ASH_D],
    [11, 0.08, 0.74, 0.028, ASH_L],
    [14, 0.26, 0.77, 0.018, ASH_D],
    [16, 0.12, 0.64, 0.03, ASH_L],
    [19, 0.2, 0.8, 0.022, ASH_D],
    [21, 0.05, 0.7, 0.026, ASH_L],
    [23, 0.3, 0.76, 0.02, ASH_L],
  ];
  for (const [facet, t0, t1, w, tone] of streaks) {
    const rA = slopeR(t0);
    const rB = slopeR(t1);
    const yA = t0 * H;
    const yB = t1 * H;
    const grp = new Group();
    grp.rotation.y = ((facet + 0.5) * 2 * Math.PI) / SEG;
    const seg = new Mesh(
      new BoxGeometry(w, Math.hypot(rB - rA, yB - yA), 0.008),
      mat(tone)
    );
    seg.position.set((((rA + rB) / 2) * INSET) + 0.0025, (yA + yB) / 2, 0);
    seg.rotation.z = Math.atan2(-(rB - rA), yB - yA);
    grp.add(seg);
    g.add(grp);
  }

  // ---- sparse scrub clinging to the foot of the cone ----
  g.add(
    lathe(
      [
        [R0 + 0.03, 0.012],
        [R0 + 0.018, 0.03],
        [slopeR(0.055) + 0.008, 0.055 * H],
        [slopeR(0.1) + 0.004, 0.1 * H],
      ],
      SCRUB
    )
  );

  // ---- pale grey smoke puff drifting off the crater ----
  const puffs: Array<[number, number, number, number, string]> = [
    [0.0, 0.425, 0.0, 0.05, "#c7c5c2"],
    [0.035, 0.475, -0.02, 0.042, "#d2d0cd"],
    [-0.035, 0.5, 0.025, 0.036, "#bcbab7"],
    [0.03, 0.545, 0.0, 0.031, "#cfcdca"],
    [-0.01, 0.585, -0.015, 0.023, "#c4c2bf"],
  ];
  for (const [x, y, z, r, c] of puffs) {
    const p = new Mesh(new SphereGeometry(r, 8, 6), mat(c));
    p.position.set(x, y, z);
    g.add(p);
  }

  return g;
}
