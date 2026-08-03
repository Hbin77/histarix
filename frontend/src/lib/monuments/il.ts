// Western Wall — papercraft: high ashlar wall (large weathered Herodian
// courses below, smaller courses above), caper plants in the crevices,
// Temple Mount trees peeking over the top, the tan Mughrabi ramp on the
// right, and a broad light-stone prayer plaza in front.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
  SphereGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.36));

  // Deterministic pseudo-random so the coursing is stable between builds.
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  const mortar = mat("#a5977c");
  const stones = [
    mat(TONES.stone),
    mat("#d3c3a2"),
    mat("#c9b895"),
    mat("#bfae8f"),
  ];
  const greens = [mat("#6d8560"), mat(TONES.forest), mat("#5f7a55")];

  // ---- Prayer plaza (light stone pavement) --------------------------------
  const plaza = new Mesh(new BoxGeometry(0.5, 0.012, 0.3), mat("#e7e0cd"));
  plaza.position.set(0, 0.014, 0.09);
  g.add(plaza);

  // Low partition dividing the prayer sections.
  const fence = new Mesh(new BoxGeometry(0.006, 0.02, 0.15), mat("#c9cfda"));
  fence.position.set(0.05, 0.03, 0.035);
  g.add(fence);

  // ---- The Wall -----------------------------------------------------------
  const L = 0.58; // wall length along x
  const H = 0.478; // total coursing height

  // Dark backing slab: shows through the joints as mortar shadow lines.
  const slab = new Mesh(new BoxGeometry(L, H, 0.06), mortar);
  slab.position.set(0, H / 2, -0.09);
  g.add(slab);

  // Coursing: 3 monumental Herodian courses, then smaller upper courses.
  const courses: Array<[h: number, wMin: number, wMax: number]> = [
    [0.098, 0.11, 0.17],
    [0.096, 0.11, 0.17],
    [0.092, 0.1, 0.16],
    [0.048, 0.05, 0.08],
    [0.048, 0.05, 0.08],
    [0.048, 0.05, 0.08],
    [0.048, 0.05, 0.08],
  ];
  const gap = 0.009;
  const joints: number[] = []; // course boundary heights (for plants)
  let y0 = 0;
  for (const [h, wMin, wMax] of courses) {
    let x = -L / 2;
    while (x < L / 2 - 0.02) {
      let w = wMin + rnd() * (wMax - wMin);
      if (x + w > L / 2) w = L / 2 - x;
      const d = 0.016 + rnd() * 0.014; // varied protrusion = weathering
      const r = rnd();
      const tone = r < 0.42 ? 0 : r < 0.72 ? 1 : r < 0.92 ? 2 : 3;
      const block = new Mesh(new BoxGeometry(w - gap, h - gap, d), stones[tone]);
      block.position.set(x + w / 2, y0 + h / 2, -0.061 + d / 2);
      g.add(block);
      x += w;
    }
    y0 += h;
    joints.push(y0);
  }

  // Irregular top edge: small parapet stones with jittered heights.
  let px = -L / 2;
  while (px < L / 2 - 0.01) {
    const w = 0.04 + rnd() * 0.025;
    const h = 0.016 + rnd() * 0.022;
    const stone = new Mesh(
      new BoxGeometry(Math.min(w, L / 2 - px), h, 0.052),
      stones[rnd() < 0.5 ? 1 : 2]
    );
    stone.position.set(px + w / 2, H + h / 2, -0.09);
    g.add(stone);
    px += w + 0.004;
  }

  // Caper plants tufting out of the crevices (tiny green bits).
  for (let i = 0; i < 9; i++) {
    const jy = joints[1 + Math.floor(rnd() * 5)];
    const s = 0.013 + rnd() * 0.009;
    const tuft = new Mesh(
      new BoxGeometry(s * 1.5, s, s),
      greens[Math.floor(rnd() * 3)]
    );
    tuft.position.set(-0.25 + rnd() * 0.5, jy, -0.036 + rnd() * 0.008);
    tuft.rotation.z = (rnd() - 0.5) * 0.6;
    g.add(tuft);
  }

  // ---- Temple Mount esplanade behind the wall -----------------------------
  const mount = new Mesh(new BoxGeometry(0.46, 0.36, 0.15), mat("#c4b391"));
  mount.position.set(0, 0.18, -0.195);
  g.add(mount);
  const esplanade = new Mesh(new BoxGeometry(0.46, 0.014, 0.15), mat(TONES.sand));
  esplanade.position.set(0, 0.367, -0.195);
  g.add(esplanade);

  // Dome of the Rock rising behind-left, as in the classic plaza view.
  const shrine = new Group();
  shrine.position.set(-0.14, 0.374, -0.195);
  const podium = new Mesh(new CylinderGeometry(0.07, 0.07, 0.024, 8), mat(TONES.sand));
  podium.position.y = 0.012;
  const octagon = new Mesh(
    new CylinderGeometry(0.058, 0.058, 0.055, 8),
    mat(TONES.domeBlue)
  );
  octagon.position.y = 0.0515;
  const drum = new Mesh(new CylinderGeometry(0.04, 0.04, 0.035, 10), mat("#5b7f9e"));
  drum.position.y = 0.0965;
  const dome = new Mesh(
    new SphereGeometry(0.05, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(TONES.gold)
  );
  dome.scale.y = 1.05;
  dome.position.y = 0.114;
  const finial = new Mesh(new CylinderGeometry(0.003, 0.003, 0.03, 4), mat(TONES.gold));
  finial.position.y = 0.178;
  shrine.add(podium, octagon, drum, dome, finial);
  g.add(shrine);

  // Trees peeking over the wall top (cypresses + one round tree).
  const cypress: Array<[x: number, z: number, h: number]> = [
    [-0.02, -0.17, 0.13],
    [0.07, -0.22, 0.11],
    [0.14, -0.16, 0.12],
    [0.2, -0.22, 0.1],
  ];
  for (const [x, z, h] of cypress) {
    const c = new Mesh(new ConeGeometry(0.024, h, 7), mat("#5e7a55"));
    c.position.set(x, 0.374 + h / 2, z);
    g.add(c);
  }
  const bush = new Mesh(new SphereGeometry(0.035, 7, 5), mat(TONES.forest));
  bush.scale.y = 0.8;
  bush.position.set(-0.21, 0.4, -0.22);
  g.add(bush);

  // ---- Mughrabi ramp: solid tan wedge descending along the wall's right ---
  const rampShape = new Shape();
  rampShape.moveTo(0.1, 0.0);
  rampShape.lineTo(0.33, 0.0);
  rampShape.lineTo(0.33, 0.04);
  rampShape.lineTo(0.125, 0.19);
  rampShape.lineTo(0.1, 0.19);
  rampShape.closePath();
  const ramp = new Mesh(
    new ExtrudeGeometry(rampShape, { depth: 0.055, bevelEnabled: false }),
    mat("#ab8f65")
  );
  ramp.position.z = -0.035;
  g.add(ramp);
  // Pale roof strip along the wedge's sloped top.
  const rail = new Mesh(new BoxGeometry(0.25, 0.012, 0.062), mat(TONES.sand));
  rail.rotation.z = -0.63;
  rail.position.set(0.225, 0.121, -0.007);
  g.add(rail);

  return g;
}
