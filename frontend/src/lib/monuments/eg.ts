// Pyramids of Giza — papercraft miniature.
// One large Great Pyramid (limestone cap) + two companions on a diagonal,
// three queens' pyramids and a tiny sphinx hint, all on a desert-sand disc.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
} from "three";
import { mat, TONES } from "./materials";

const SQRT2 = Math.SQRT2;

/**
 * Four-sided pyramid with faces axis-aligned (flat face toward +z).
 * Optional white limestone cap on the top fraction.
 */
function pyramid(
  side: number,
  height: number,
  hex: string,
  capFraction = 0
): Group {
  const g = new Group();
  const r = side / SQRT2; // circumradius of the square base
  if (capFraction > 0) {
    const bodyH = height * (1 - capFraction);
    const rTop = r * capFraction;
    const body = new Mesh(
      new CylinderGeometry(rTop, r, bodyH, 4, 1),
      mat(hex)
    );
    body.position.y = bodyH / 2;
    body.rotation.y = Math.PI / 4;
    g.add(body);
    const cap = new Mesh(
      new ConeGeometry(rTop, height * capFraction, 4),
      mat(TONES.white)
    );
    cap.position.y = bodyH + (height * capFraction) / 2;
    cap.rotation.y = Math.PI / 4;
    g.add(cap);
  } else {
    const cone = new Mesh(new ConeGeometry(r, height, 4), mat(hex));
    cone.position.y = height / 2;
    cone.rotation.y = Math.PI / 4;
    g.add(cone);
  }
  return g;
}

/** Tiny stylized sphinx lying along +x, head at the +x end (profile view). */
function sphinx(): Group {
  const g = new Group();
  const stone = "#c9ad82";
  // long low couched body
  const body = new Mesh(new BoxGeometry(0.15, 0.03, 0.042), mat(stone));
  body.position.y = 0.015;
  g.add(body);
  // gentle haunch rise at the back
  const haunch = new Mesh(new BoxGeometry(0.048, 0.04, 0.046), mat(stone));
  haunch.position.set(-0.05, 0.02, 0);
  g.add(haunch);
  // front paws — lower slab stretched forward
  const paws = new Mesh(new BoxGeometry(0.055, 0.014, 0.05), mat(stone));
  paws.position.set(0.072, 0.007, 0);
  g.add(paws);
  // nemes headdress — thin flared slab behind the head
  const nemes = new Mesh(new BoxGeometry(0.014, 0.036, 0.05), mat(stone));
  nemes.position.set(0.05, 0.047, 0);
  g.add(nemes);
  // raised head at the front end — the single tall point of the profile
  const head = new Mesh(new BoxGeometry(0.028, 0.04, 0.03), mat(stone));
  head.position.set(0.063, 0.057, 0);
  g.add(head);
  return g;
}

export function build(): Group {
  const g = new Group();

  // Desert-sand plaza disc (instead of the default plaza tone)
  const disc = new Mesh(
    new CylinderGeometry(0.375, 0.375, 0.012, 28),
    mat(TONES.sand)
  );
  disc.position.y = 0.006;
  g.add(disc);

  // Great Pyramid (Khufu) — largest, white limestone cap
  const khufu = pyramid(0.38, 0.44, "#d3c4a4", 0.17);
  khufu.position.set(-0.075, 0.012, 0.07);
  g.add(khufu);

  // Khafre — medium companion, behind-right
  const khafre = pyramid(0.25, 0.28, TONES.stoneDark);
  khafre.position.set(0.16, 0.012, -0.09);
  g.add(khafre);

  // Menkaure — small, front-right
  const menkaure = pyramid(0.15, 0.16, TONES.stoneDark);
  menkaure.position.set(0.23, 0.012, 0.15);
  g.add(menkaure);

  // Three queens' pyramids — neat row along the front rim, clear of Khufu
  const queens: Array<[number, number]> = [
    [-0.19, 0.27],
    [-0.115, 0.29],
    [-0.04, 0.31],
  ];
  for (const [qx, qz] of queens) {
    const q = pyramid(0.05, 0.055, "#b3a17e");
    q.position.set(qx, 0.012, qz);
    g.add(q);
  }

  // Khafre's causeway — thin strip running from Khafre down to the sphinx
  const causeway = new Mesh(
    new BoxGeometry(0.03, 0.01, 0.22),
    mat("#d5c39a")
  );
  causeway.position.set(0.125, 0.017, 0.155);
  causeway.rotation.y = -0.2;
  g.add(causeway);

  // Sphinx — front-right, profile toward the viewer, gazing right
  const guardian = sphinx();
  guardian.position.set(0.09, 0.012, 0.295);
  g.add(guardian);

  return g;
}
