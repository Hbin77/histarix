// Casbah of Algiers — papercraft hillside: terraced cascade of stacked white
// cubic houses stepping down to the bay, tiny ink window notches, one square
// minaret with a green cap, low harbor dome at the waterfront.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
} from "three";
import { mat, TONES } from "./materials";

export function build(): Group {
  const g = new Group();

  // Deterministic PRNG so the cascade is stable between builds.
  let s = 20260731;
  const rnd = (): number => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  const whiteMats = [
    mat(TONES.white),
    mat("#eae4d6"),
    mat("#f0ebe0"),
    mat("#e3ddcf"),
  ];
  const pickWhite = () => whiteMats[(rnd() * whiteMats.length) | 0];
  const terra = mat(TONES.stoneDark);
  const ink = mat(TONES.ink);

  // --- Bay of Algiers: water half-disc in front (+z), ground behind ---
  const water = new Mesh(
    new CylinderGeometry(0.36, 0.36, 0.012, 20, 1, false, -Math.PI / 2, Math.PI),
    mat(TONES.water)
  );
  water.position.y = 0.006;
  g.add(water);
  const ground = new Mesh(
    new CylinderGeometry(0.36, 0.36, 0.012, 20, 1, false, Math.PI / 2, Math.PI),
    mat(TONES.stone)
  );
  ground.position.y = 0.006;
  g.add(ground);

  // --- Harbor quay strip at the waterline ---
  const quay = new Mesh(new BoxGeometry(0.42, 0.028, 0.04), mat(TONES.stone));
  quay.position.set(0, 0.014, 0.228);
  g.add(quay);

  // Two tiny boats on the bay.
  for (const [bx, bz] of [
    [0.15, 0.3],
    [-0.19, 0.285],
  ] as const) {
    const boat = new Mesh(new BoxGeometry(0.028, 0.01, 0.012), mat(TONES.woodRed));
    boat.position.set(bx, 0.015, bz);
    boat.rotation.y = rnd() * 0.9;
    g.add(boat);
  }

  // --- Terraced hillside rows, front (sea) to back (summit) ---
  const rows = [
    { z: 0.16, base: 0.02, w: 0.52, xc: 0 },
    { z: 0.07, base: 0.078, w: 0.6, xc: 0.01 },
    { z: -0.02, base: 0.138, w: 0.56, xc: -0.015 },
    { z: -0.11, base: 0.2, w: 0.48, xc: 0.02 },
    { z: -0.2, base: 0.262, w: 0.38, xc: -0.03 },
    { z: -0.285, base: 0.322, w: 0.26, xc: 0.04 },
  ];

  const winGeo = new BoxGeometry(0.011, 0.017, 0.007);
  const doorGeo = new BoxGeometry(0.014, 0.023, 0.006);
  const teal = mat(TONES.roofTeal);

  for (let ri = 0; ri < rows.length; ri++) {
    const row = rows[ri];
    // Terrain slab the row of houses stands on.
    const slab = new Mesh(new BoxGeometry(row.w + 0.012, row.base, 0.105), terra);
    slab.position.set(row.xc, row.base / 2, row.z);
    g.add(slab);

    let x = -row.w / 2;
    while (x < row.w / 2 - 0.028) {
      const bw = 0.048 + rnd() * 0.042;
      const bh = 0.052 + rnd() * 0.068;
      const bd = 0.08 + rnd() * 0.022;
      const cx = row.xc + x + bw / 2;
      const cz = row.z + (rnd() - 0.5) * 0.014;

      // Keep the harbor-mosque parcel in the front row clear of houses.
      if (ri === 0 && cx > -0.21 && cx < -0.08) {
        x += bw + 0.005 + rnd() * 0.01;
        continue;
      }

      const house = new Mesh(new BoxGeometry(bw, bh, bd), pickWhite());
      house.position.set(cx, row.base + bh / 2, cz);
      g.add(house);

      // Rooftop stair bulkhead on some taller houses.
      if (bh > 0.08 && rnd() < 0.45) {
        const t = new Mesh(
          new BoxGeometry(bw * 0.4, 0.02, bd * 0.45),
          pickWhite()
        );
        t.position.set(
          cx + (rnd() - 0.5) * bw * 0.3,
          row.base + bh + 0.01,
          cz
        );
        g.add(t);
      }

      // Tiny window notches on the seaward face.
      const n = bh > 0.075 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const w = new Mesh(winGeo, ink);
        w.position.set(
          cx + (rnd() - 0.5) * bw * 0.5,
          row.base + bh * (n === 1 ? 0.55 : 0.42 + 0.33 * i),
          cz + bd / 2 + 0.003
        );
        g.add(w);
      }

      // Occasional teal casbah door at street level.
      if (rnd() < 0.24) {
        const door = new Mesh(doorGeo, teal);
        door.position.set(
          cx + (rnd() - 0.5) * bw * 0.35,
          row.base + 0.0135,
          cz + bd / 2 + 0.003
        );
        g.add(door);
      }

      x += bw + 0.005 + rnd() * 0.01;
    }
  }

  // --- Summit citadel: rampart wall with merlons along the back crest ---
  const rampart = new Mesh(new BoxGeometry(0.26, 0.08, 0.016), terra);
  rampart.position.set(0.04, 0.32, -0.34);
  g.add(rampart);
  const merlonGeo = new BoxGeometry(0.022, 0.02, 0.016);
  for (let i = 0; i < 5; i++) {
    const m = new Mesh(merlonGeo, terra);
    m.position.set(-0.06 + i * 0.05, 0.37, -0.34);
    g.add(m);
  }
  for (const bx of [-0.085, 0.165] as const) {
    const bastion = new Mesh(new CylinderGeometry(0.02, 0.022, 0.1, 8), terra);
    bastion.position.set(bx, 0.325, -0.335);
    g.add(bastion);
  }

  // --- Square minaret with green pyramid cap (mid-hill) ---
  const minaret = new Group();
  const shaft = new Mesh(new BoxGeometry(0.042, 0.29, 0.042), mat(TONES.white));
  shaft.position.y = 0.145;
  minaret.add(shaft);
  const balcony = new Mesh(new BoxGeometry(0.058, 0.012, 0.058), mat("#e3ddcf"));
  balcony.position.y = 0.296;
  minaret.add(balcony);
  const lantern = new Mesh(new BoxGeometry(0.03, 0.038, 0.03), mat(TONES.white));
  lantern.position.y = 0.321;
  minaret.add(lantern);
  const cap = new Mesh(new ConeGeometry(0.026, 0.034, 4), mat(TONES.roofGreen));
  cap.position.y = 0.357;
  cap.rotation.y = Math.PI / 4;
  minaret.add(cap);
  for (let i = 0; i < 2; i++) {
    const w = new Mesh(winGeo, ink);
    w.position.set(0, 0.14 + i * 0.075, 0.0245);
    minaret.add(w);
  }
  minaret.position.set(0.1, 0.2, -0.095);
  g.add(minaret);

  // --- Harbor mosque: low drum + white dome on the cleared quay parcel ---
  const drum = new Mesh(new BoxGeometry(0.105, 0.056, 0.105), mat(TONES.white));
  drum.position.set(-0.145, 0.048, 0.155);
  g.add(drum);
  const dome = new Mesh(
    new SphereGeometry(0.056, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    mat("#eae4d6")
  );
  dome.scale.y = 0.85;
  dome.position.set(-0.145, 0.076, 0.155);
  g.add(dome);

  return g;
}
