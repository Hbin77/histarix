// Statue of Liberty — papercraft: verdigris robed figure, raised torch arm
// (her right, world -x), tablet in the left arm, 7-ray crown fan, on a
// tapering granite pedestal over an 11-point star fort on a water-ringed isle.

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
import { mat, TONES } from "./materials";

function starShape(points: number, rOuter: number, rInner: number): Shape {
  const s = new Shape();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = (i * Math.PI) / points;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}

export function build(): Group {
  const g = new Group();
  const verd = mat(TONES.verdigris);
  const verdDark = mat("#5f8f79");
  const granite = mat(TONES.stone);
  const graniteDark = mat(TONES.stoneDark);
  const fortGray = mat("#aaa79b");
  const gold = mat(TONES.gold);

  // ---- Liberty Island: water ring + grass isle (no plazaDisc) ----
  const water = new Mesh(
    new CylinderGeometry(0.36, 0.36, 0.012, 32),
    mat(TONES.water)
  );
  water.position.y = 0.006;
  g.add(water);
  const isle = new Mesh(
    new CylinderGeometry(0.285, 0.3, 0.024, 24),
    mat(TONES.forest)
  );
  isle.position.y = 0.022;
  g.add(isle);

  // ---- Fort Wood: 11-point star rampart + terreplein cap ----
  const wall = new Mesh(
    new ExtrudeGeometry(starShape(11, 0.26, 0.185), {
      depth: 0.05,
      bevelEnabled: false,
    }),
    fortGray
  );
  wall.rotation.x = -Math.PI / 2;
  wall.position.y = 0.03;
  g.add(wall);
  const cap = new Mesh(
    new ExtrudeGeometry(starShape(11, 0.244, 0.172), {
      depth: 0.014,
      bevelEnabled: false,
    }),
    graniteDark
  );
  cap.rotation.x = -Math.PI / 2;
  cap.position.y = 0.08;
  g.add(cap);

  // ---- Pedestal: terrace, base block, tapered shaft, loggia, balcony ----
  const terrace = new Mesh(new BoxGeometry(0.21, 0.026, 0.21), granite);
  terrace.position.y = 0.104;
  g.add(terrace);
  const baseBlock = new Mesh(new BoxGeometry(0.168, 0.042, 0.168), graniteDark);
  baseBlock.position.y = 0.135;
  g.add(baseBlock);
  const SQ2 = Math.SQRT2;
  const shaft = new Mesh(
    new CylinderGeometry(0.055 * SQ2, 0.076 * SQ2, 0.2, 4, 1),
    granite
  );
  shaft.rotation.y = Math.PI / 4;
  shaft.position.y = 0.255;
  g.add(shaft);
  const loggia = new Mesh(new BoxGeometry(0.124, 0.05, 0.124), mat(TONES.white));
  loggia.position.y = 0.377;
  g.add(loggia);
  // colonnade suggestion: recessed slate band + proud white corner posts
  const colBand = new Mesh(new BoxGeometry(0.128, 0.028, 0.128), mat(TONES.slate));
  colBand.position.y = 0.377;
  g.add(colBand);
  const postGeo = new BoxGeometry(0.024, 0.05, 0.024);
  for (const [px, pz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
    const post = new Mesh(postGeo, mat(TONES.white));
    post.position.set(px * 0.06, 0.377, pz * 0.06);
    g.add(post);
  }
  const balcony = new Mesh(new BoxGeometry(0.15, 0.016, 0.15), graniteDark);
  balcony.position.y = 0.407;
  g.add(balcony);
  const plinth = new Mesh(new BoxGeometry(0.076, 0.026, 0.076), granite);
  plinth.position.y = 0.427;
  g.add(plinth);

  // ---- Figure (own group, slight yaw so no camera hits a dead profile) ----
  const fig = new Group();
  fig.rotation.y = 0.35;
  g.add(fig);
  const hem = new Mesh(new CylinderGeometry(0.048, 0.063, 0.1, 9), verd);
  hem.position.y = 0.489;
  fig.add(hem);
  const robe = new Mesh(new CylinderGeometry(0.035, 0.048, 0.165, 9), verd);
  robe.position.y = 0.619;
  fig.add(robe);
  // drape fold accent on the front
  const drape = new Mesh(new CylinderGeometry(0.008, 0.018, 0.2, 5), verdDark);
  drape.position.set(0.015, 0.545, 0.033);
  fig.add(drape);
  const chest = new Mesh(new BoxGeometry(0.078, 0.055, 0.048), verd);
  chest.position.y = 0.715;
  fig.add(chest);
  const neck = new Mesh(new CylinderGeometry(0.013, 0.016, 0.026, 7), verd);
  neck.position.y = 0.752;
  fig.add(neck);
  const head = new Mesh(new SphereGeometry(0.026, 8, 6), verd);
  head.position.set(0, 0.784, 0.003);
  fig.add(head);

  // Crown: band + 7 rays fanning over the head, tilted slightly back
  const band = new Mesh(new CylinderGeometry(0.027, 0.028, 0.012, 8), verdDark);
  band.position.set(0, 0.795, 0.003);
  fig.add(band);
  const rayGeo = new ConeGeometry(0.005, 0.044, 5);
  for (let i = 0; i < 7; i++) {
    const a = (Math.PI / 180) * (27 + (126 / 6) * i); // 27°..153° fan
    const ray = new Mesh(rayGeo, verd);
    const dist = 0.026 + 0.022;
    ray.position.set(
      Math.cos(a) * dist,
      0.796 + Math.sin(a) * dist,
      -0.004
    );
    ray.rotation.z = a - Math.PI / 2;
    ray.rotation.x = -0.14;
    fig.add(ray);
  }

  // ---- Right arm raised with torch (world -x) ----
  const arm = new Mesh(new BoxGeometry(0.024, 0.15, 0.026), verd);
  arm.position.set(-0.046, 0.795, 0.005);
  arm.rotation.z = 0.18;
  fig.add(arm);
  const cuff = new Mesh(new BoxGeometry(0.03, 0.03, 0.032), verdDark);
  cuff.position.set(-0.058, 0.868, 0.005);
  fig.add(cuff);
  const handle = new Mesh(new CylinderGeometry(0.006, 0.006, 0.055, 6), verd);
  handle.position.set(-0.06, 0.905, 0.005);
  fig.add(handle);
  const torchRing = new Mesh(new CylinderGeometry(0.016, 0.011, 0.015, 8), verdDark);
  torchRing.position.set(-0.06, 0.936, 0.005);
  fig.add(torchRing);
  const flame = new Mesh(new ConeGeometry(0.014, 0.048, 6), gold);
  flame.position.set(-0.06, 0.967, 0.005);
  fig.add(flame);

  // ---- Left arm holding the tablet (world +x) ----
  const forearm = new Mesh(new BoxGeometry(0.02, 0.07, 0.022), verd);
  forearm.position.set(0.05, 0.685, 0.01);
  forearm.rotation.z = -0.35;
  fig.add(forearm);
  const tablet = new Mesh(new BoxGeometry(0.038, 0.07, 0.014), verdDark);
  tablet.position.set(0.06, 0.716, 0.016);
  tablet.rotation.z = -0.12;
  tablet.rotation.x = -0.1;
  fig.add(tablet);

  return g;
}
