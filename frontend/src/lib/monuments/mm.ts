// Shwedagon Pagoda (Yangon) — papercraft miniature. Giant gilded bell stupa
// on octagonal terraces, banded "turban" and lotus taper into the slender
// hti umbrella spire, ringed by a crowd of small gold stupas.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const SQ2 = Math.SQRT2;
const GOLD_DEEP = "#a87f38";
const GOLD_PALE = "#dcc07a";

/** Small satellite stupa: plinth, bell, long cone spire. */
function smallStupa(s: number): Group {
  const g = new Group();
  const gold = mat(TONES.gold);
  const deep = mat(GOLD_DEEP);

  const plinth = new Mesh(
    new CylinderGeometry(0.03 * s, 0.036 * s, 0.026 * s, 6, 1),
    mat(TONES.white)
  );
  plinth.position.y = 0.013 * s;
  g.add(plinth);

  const bell = new Mesh(
    new CylinderGeometry(0.016 * s, 0.027 * s, 0.038 * s, 6, 1),
    deep
  );
  bell.position.y = 0.045 * s;
  g.add(bell);

  const spire = new Mesh(new ConeGeometry(0.019 * s, 0.105 * s, 6, 1), gold);
  spire.position.y = 0.116 * s;
  g.add(spire);

  return g;
}

/** Tiny pyatthat: white pavilion under stacked receding gold roofs. */
function pyatthat(): Group {
  const g = new Group();
  const gold = mat(TONES.gold);

  const body = new Mesh(new BoxGeometry(0.05, 0.045, 0.05), mat(TONES.white));
  body.position.y = 0.0225;
  g.add(body);

  const roofs: Array<[number, number, number, number]> = [
    // [bottom half-extent, top half-extent, height, baseY]
    [0.042, 0.028, 0.02, 0.045],
    [0.032, 0.02, 0.018, 0.067],
    [0.022, 0.011, 0.016, 0.087],
  ];
  for (const [b, t, h, y] of roofs) {
    const geo = new CylinderGeometry(t * SQ2, b * SQ2, h, 4, 1);
    geo.rotateY(Math.PI / 4);
    const roof = new Mesh(geo, gold);
    roof.position.y = y + h / 2;
    g.add(roof);
  }

  const tip = new Mesh(new ConeGeometry(0.009, 0.075, 6, 1), gold);
  tip.position.y = 0.14;
  g.add(tip);

  return g;
}

export function build(): Group {
  const g = new Group();
  const gold = mat(TONES.gold);
  const goldDeep = mat(GOLD_DEEP);
  const goldPale = mat(GOLD_PALE);

  g.add(plazaDisc(0.368));

  // ---- Paved platform terrace (pale stone) ----
  const platform = new Mesh(
    new CylinderGeometry(0.35, 0.358, 0.03, 24, 1),
    mat(TONES.stone)
  );
  platform.position.y = 0.015;
  g.add(platform);

  // ---- Terraced base: three receding octagonal tiers, gold ----
  const tiers: Array<[number, number, number]> = [
    // [radius, height, centerY]
    [0.285, 0.05, 0.055],
    [0.248, 0.046, 0.102],
    [0.215, 0.043, 0.145],
  ];
  for (const [r, h, y] of tiers) {
    const tier = new Mesh(
      new CylinderGeometry(r - 0.014, r, h, 8, 1),
      goldDeep
    );
    tier.position.y = y;
    g.add(tier);
  }

  // ---- Main stupa: lathe — bulging bell shoulder, long concave taper ----
  const pts: Vector2[] = [
    new Vector2(0.175, 0.0),
    new Vector2(0.19, 0.04),
    new Vector2(0.193, 0.085), // widest bulge of the bell
    new Vector2(0.185, 0.14),
    new Vector2(0.165, 0.2),
    new Vector2(0.138, 0.26),
    new Vector2(0.11, 0.31),
    new Vector2(0.09, 0.35), // bell rim
    new Vector2(0.098, 0.362), // turban band
    new Vector2(0.08, 0.38),
    new Vector2(0.088, 0.392), // turban band
    new Vector2(0.066, 0.415),
    new Vector2(0.073, 0.427), // inverted lotus lip
    new Vector2(0.052, 0.465),
    new Vector2(0.036, 0.51), // banana bud
    new Vector2(0.023, 0.55),
    new Vector2(0.013, 0.585),
    new Vector2(0.006, 0.61),
  ];
  const stupa = new Mesh(new LatheGeometry(pts, 16), gold);
  stupa.position.y = 0.163;
  g.add(stupa);

  // ---- Hti (umbrella crown): tiered discs climbing the tip ----
  const htiTiers: Array<[number, number]> = [
    // [radius, centerY]
    [0.046, 0.779],
    [0.037, 0.795],
    [0.029, 0.81],
    [0.021, 0.824],
    [0.014, 0.837],
  ];
  for (const [r, y] of htiTiers) {
    const disc = new Mesh(
      new CylinderGeometry(r - 0.005, r, 0.011, 10, 1),
      goldPale
    );
    disc.position.y = y;
    g.add(disc);
  }
  const needle = new Mesh(new CylinderGeometry(0.004, 0.007, 0.09, 8, 1), goldDeep);
  needle.position.y = 0.885;
  g.add(needle);
  const orb = new Mesh(new SphereGeometry(0.012, 8, 6), goldPale);
  orb.position.y = 0.938;
  g.add(orb);
  const vane = new Mesh(new ConeGeometry(0.006, 0.028, 6, 1), goldDeep);
  vane.position.y = 0.96;
  g.add(vane);

  // ---- Ring of satellite stupas + pyatthat pavilions on the terrace ----
  const N = 16;
  const RING_R = 0.302;
  const SCALES = [1.5, 0.95, 1.18, 0.95]; // cardinal shrines + varied fill
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const st = i % 4 === 2 ? pyatthat() : smallStupa(SCALES[i % 4]);
    st.position.set(Math.sin(a) * RING_R, 0.03, Math.cos(a) * RING_R);
    st.rotation.y = a;
    g.add(st);
  }

  return g;
}
