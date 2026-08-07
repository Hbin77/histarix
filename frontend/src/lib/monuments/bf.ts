// Grande mosquée de Bobo-Dioulasso — papercraft: massive adobe prayer hall,
// two tapering pyramidal minarets bristling with toron stakes, rows of
// rounded buttress pinnacles, roof studded with conical vents.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.36));

  const adobe = mat("#d2a678"); // sun-baked earth
  const adobeDeep = mat("#c2945f"); // minarets / shadowed clay
  const clay = mat("#b98a58"); // buttresses
  const wood = mat(TONES.ironDark); // toron stakes
  const dark = mat("#6b5138"); // door opening

  // ---- Main prayer-hall block ----
  const hall = new Mesh(new BoxGeometry(0.46, 0.16, 0.26), adobe);
  hall.position.set(0, 0.08, -0.03);
  g.add(hall);

  // Door on the front face
  const door = new Mesh(new BoxGeometry(0.05, 0.085, 0.02), dark);
  door.position.set(0, 0.042, 0.096);
  g.add(door);

  // ---- Two tapering minaret pylons (square frustums on the diagonals) ----
  const SQ2 = Math.SQRT2;
  const halfWidthAt = (y: number) =>
    y < 0.28
      ? 0.06 + (0.032 - 0.06) * (y / 0.28)
      : 0.032 + (0.009 - 0.032) * ((y - 0.28) / 0.22);

  for (const mx of [-0.16, 0.16]) {
    const mz = 0.09;
    const lower = new Mesh(
      new CylinderGeometry(0.032 * SQ2, 0.06 * SQ2, 0.28, 4, 1),
      adobeDeep
    );
    lower.rotation.y = Math.PI / 4;
    lower.position.set(mx, 0.14, mz);
    g.add(lower);

    const upper = new Mesh(
      new CylinderGeometry(0.009 * SQ2, 0.032 * SQ2, 0.22, 4, 1),
      adobeDeep
    );
    upper.rotation.y = Math.PI / 4;
    upper.position.set(mx, 0.39, mz);
    g.add(upper);

    // Rounded clay finial at the summit
    const finial = new Mesh(new SphereGeometry(0.015, 6, 5), clay);
    finial.scale.y = 1.4;
    finial.position.set(mx, 0.508, mz);
    g.add(finial);

    // Toron stakes: horizontal timbers piercing the tower on both axes
    for (const y of [0.07, 0.14, 0.21, 0.29, 0.37]) {
      const hw = halfWidthAt(y);
      const len = 2 * hw + 0.055;
      const off = hw * 0.45;
      for (const s of [-1, 1]) {
        const sx = new Mesh(new BoxGeometry(len, 0.009, 0.009), wood);
        sx.position.set(mx, y, mz + s * off);
        g.add(sx);
        const sz = new Mesh(new BoxGeometry(0.009, 0.009, len), wood);
        sz.position.set(mx + s * off, y, mz);
        g.add(sz);
      }
    }
  }

  // ---- Facade pilasters between the minarets (rounded pinnacles) ----
  for (const x of [-0.09, -0.045, 0.045, 0.09]) {
    const p = new Mesh(new CylinderGeometry(0.01, 0.02, 0.26, 5), clay);
    p.position.set(x, 0.13, 0.1);
    g.add(p);
    const tip = new Mesh(new SphereGeometry(0.011, 5, 4), clay);
    tip.position.set(x, 0.262, 0.1);
    g.add(tip);
  }

  // ---- Facade stakes: short timbers protruding from the front wall ----
  for (const y of [0.06, 0.115])
    for (let i = 0; i < 7; i++) {
      const x = -0.099 + i * 0.033;
      if (Math.abs(x) < 0.04) continue; // keep the doorway clear
      const s = new Mesh(new BoxGeometry(0.009, 0.009, 0.05), wood);
      s.position.set(x, y, 0.108);
      g.add(s);
    }

  // ---- Side and rear buttresses with rounded tops ----
  const buttress = (x: number, z: number) => {
    const b = new Mesh(new CylinderGeometry(0.011, 0.019, 0.19, 5), clay);
    b.position.set(x, 0.095, z);
    g.add(b);
    const t = new Mesh(new SphereGeometry(0.011, 5, 4), clay);
    t.position.set(x, 0.192, z);
    g.add(t);
  };
  for (const z of [-0.12, -0.04, 0.04]) {
    buttress(-0.228, z);
    buttress(0.228, z);
  }
  for (const x of [-0.15, -0.05, 0.05, 0.15]) buttress(x, -0.158);

  // ---- Roof: field of small conical vents (reads from the aerial view) ----
  for (const x of [-0.15, -0.05, 0.05, 0.15])
    for (const z of [-0.12, -0.04, 0.04]) {
      const c = new Mesh(new ConeGeometry(0.016, 0.05, 5), adobeDeep);
      c.position.set(x, 0.183, z);
      g.add(c);
    }

  return g;
}
