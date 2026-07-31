// Big Ben (Elizabeth Tower) — papercraft miniature.
// Slender square clock tower: ribbed golden-stone shaft, four white clock
// faces in ink frames, belfry stage, steep green spire with gold tip.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const stone = mat(TONES.sand);
const stoneDark = mat(TONES.sandDark);
const ink = mat(TONES.ink);
const white = mat(TONES.white);
const gold = mat(TONES.gold);
const roof = mat(TONES.roofGreen);

function box(
  w: number,
  h: number,
  d: number,
  m = stone,
  x = 0,
  y = 0,
  z = 0
): Mesh {
  const mesh = new Mesh(new BoxGeometry(w, h, d), m);
  mesh.position.set(x, y, z);
  return mesh;
}

/** Clone a face-detail group onto all four sides of the tower. */
function fourSides(makeFace: () => Group): Group {
  const g = new Group();
  for (let i = 0; i < 4; i++) {
    const face = makeFace();
    face.rotation.y = (i * Math.PI) / 2;
    g.add(face);
  }
  return g;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.24));

  // ---- base plinth (two steps) ----
  g.add(box(0.22, 0.03, 0.22, stoneDark, 0, 0.015));
  g.add(box(0.18, 0.03, 0.18, stone, 0, 0.045));

  // ---- shaft ----
  const shaftW = 0.138;
  const shaftH = 0.485;
  const shaftY = 0.06 + shaftH / 2; // 0.06 → 0.545
  g.add(box(shaftW, shaftH, shaftW, stone, 0, shaftY));

  // corner ribs (full height, slightly proud)
  const cr = 0.02;
  const off = shaftW / 2;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      g.add(box(cr, shaftH, cr, stoneDark, sx * off, shaftY, sz * off));

  // face pilasters: two thin vertical strips per face + tiny window slits
  g.add(
    fourSides(() => {
      const f = new Group();
      const z = shaftW / 2 + 0.004;
      for (const x of [-0.037, 0.037])
        f.add(box(0.013, shaftH - 0.02, 0.009, stoneDark, x, shaftY, z));
      // window slits between pilasters
      for (const y of [0.17, 0.29, 0.41])
        f.add(box(0.024, 0.052, 0.006, ink, 0, y, z));
      return f;
    })
  );

  // ---- clock stage ----
  const clockW = 0.176;
  const clockY = 0.625; // 0.555 → 0.695
  g.add(box(0.19, 0.014, 0.19, stoneDark, 0, 0.552));
  g.add(box(clockW, 0.14, clockW, stone, 0, clockY));

  g.add(
    fourSides(() => {
      const f = new Group();
      const z = clockW / 2;
      // ink frame + white dial
      f.add(box(0.138, 0.138, 0.012, ink, 0, clockY, z + 0.002));
      f.add(box(0.108, 0.108, 0.014, white, 0, clockY, z + 0.004));
      // hands (≈10:10) — thin ink boxes pivoting at dial centre
      const zh = z + 0.013;
      const minute = box(0.008, 0.05, 0.005, ink, 0, 0, zh);
      const aM = (14 * Math.PI) / 180;
      minute.rotation.z = -aM;
      minute.position.x = Math.sin(aM) * 0.025;
      minute.position.y = clockY + Math.cos(aM) * 0.025;
      f.add(minute);
      const hour = box(0.009, 0.036, 0.005, ink, 0, 0, zh);
      const aH = (-55 * Math.PI) / 180;
      hour.rotation.z = -aH;
      hour.position.x = Math.sin(aH) * 0.018;
      hour.position.y = clockY + Math.cos(aH) * 0.018;
      f.add(hour);
      return f;
    })
  );

  // cornice above clock stage
  g.add(box(0.2, 0.015, 0.2, stoneDark, 0, 0.7025));

  // corner pinnacles on the clock-stage cornice
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const px = sx * 0.088;
      const pz = sz * 0.088;
      g.add(box(0.02, 0.06, 0.02, stone, px, 0.74, pz));
      const tip = new Mesh(new ConeGeometry(0.015, 0.045, 4), stoneDark);
      tip.rotation.y = Math.PI / 4;
      tip.position.set(px, 0.7925, pz);
      g.add(tip);
    }

  // ---- belfry stage ----
  const belW = 0.128;
  const belY = 0.755; // 0.71 → 0.80
  g.add(box(belW, 0.09, belW, stone, 0, belY));
  g.add(
    fourSides(() => {
      const f = new Group();
      const z = belW / 2 + 0.003;
      for (const x of [-0.027, 0.027])
        f.add(box(0.03, 0.068, 0.006, ink, x, belY, z));
      return f;
    })
  );
  g.add(box(0.16, 0.013, 0.16, stoneDark, 0, 0.8065));

  // ---- spire: steep pyramid → dormer band → long needle → gold tip ----
  const pyramid = new Mesh(new CylinderGeometry(0.026, 0.112, 0.092, 4), roof);
  pyramid.rotation.y = Math.PI / 4;
  pyramid.position.y = 0.859;
  g.add(pyramid);
  const band = new Mesh(new CylinderGeometry(0.022, 0.028, 0.018, 4), stone);
  band.rotation.y = Math.PI / 4;
  band.position.y = 0.913;
  g.add(band);
  const needle = new Mesh(new ConeGeometry(0.023, 0.064, 4), roof);
  needle.rotation.y = Math.PI / 4;
  needle.position.y = 0.951;
  g.add(needle);

  // gold finial: ball + slender spike
  const ball = new Mesh(new SphereGeometry(0.011, 8, 6), gold);
  ball.position.y = 0.982;
  g.add(ball);
  const spike = new Mesh(new ConeGeometry(0.006, 0.022, 4), gold);
  spike.rotation.y = Math.PI / 4;
  spike.position.y = 0.988;
  g.add(spike);

  return g;
}
