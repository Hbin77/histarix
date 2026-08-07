// Sossusvlei — papercraft landform: towering rust-orange dunes whose razor
// crests sway in a long S across the sand sea, rising over the bone white
// cracked clay pan of Deadvlei with its charcoal camelthorn skeletons.
// Natural landform: no plaza disc, its own terrain base.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Shape,
} from "three";
import { mat } from "./materials";

const PLAIN = "#dcae7e"; // apricot sand plain
const PLAIN_EDGE = "#c2915f";
// each dune is a lit windward slope and a shaded lee face meeting at the crest
const DUNE_A = ["#dda069", "#bb7c46"]; // the towering one
const DUNE_B = ["#d2925c", "#b0713d"]; // flanking ridges
const DUNE_C = ["#e0aa7c", "#bd8250"]; // low foreground bar
const PAN = "#f0ecdf"; // bone white cracked clay
const PAN_EDGE = "#ddd6c3";
const CHARCOAL = "#4a443d";
const SCRUB = "#7e8560";

const R = 0.36; // terrain radius (footprint 0.72)
const GROUND = 0.042; // sand plain top

/**
 * Dune ridge: a long convex windward slope and a short steep lee face,
 * built as two meshes meeting exactly along the crest so the crest reads as
 * a razor line between sunlit and shaded sand. The pair is swept along Z,
 * tapered to nothing at both tips and swayed sideways into an S.
 * Base at local y = 0, ridge centered on local z = 0.
 */
function duneRidge(
  halfW: number, // windward slope run
  slipW: number, // lee-face run
  h: number, // crest height
  len: number, // ridge length
  sway: number, // plan-view meander of the crest
  phase: number,
  colors: readonly [string, string] | string[]
): Group {
  const windward = new Shape();
  windward.moveTo(-halfW, 0);
  windward.lineTo(-halfW * 0.66, h * 0.26);
  windward.lineTo(-halfW * 0.36, h * 0.56);
  windward.lineTo(-halfW * 0.15, h * 0.83);
  windward.lineTo(0, h);
  windward.lineTo(0, 0);
  windward.closePath();

  const lee = new Shape();
  lee.moveTo(0, 0);
  lee.lineTo(0, h);
  lee.lineTo(slipW * 0.34, h * 0.56);
  lee.lineTo(slipW * 0.7, h * 0.22);
  lee.lineTo(slipW, 0);
  lee.closePath();

  const g = new Group();
  for (const [i, shape] of [windward, lee].entries()) {
    const geo = new ExtrudeGeometry(shape, {
      depth: len,
      bevelEnabled: false,
      steps: 13,
    });
    geo.translate(0, 0, -len / 2);
    const pos = geo.attributes.position;
    for (let v = 0; v < pos.count; v++) {
      const u = Math.min(Math.max(pos.getZ(v) / len + 0.5, 0), 1);
      // near-constant over the middle, falling away at both tips
      const taper = Math.pow(Math.sin(Math.PI * u), 0.45);
      // the crest peaks and saddles as it runs
      const crest = 1 + 0.08 * Math.sin(Math.PI * 2.6 * u + phase * 1.7);
      pos.setX(v, pos.getX(v) * taper + sway * Math.sin(Math.PI * 2 * u + phase));
      pos.setY(v, pos.getY(v) * taper * crest);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    g.add(new Mesh(geo, mat(colors[i])));
  }
  return g;
}

/** Flat wobbly-edged slab, base at y = 0 — the clay pan and its rim. */
function panSlab(r: number, h: number, squash: number, color: string): Mesh {
  const s = new Shape();
  const N = 16;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const rr = r * (1 + 0.11 * Math.sin(3 * a + 0.7) + 0.07 * Math.sin(5 * a));
    if (i === 0) s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: h, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  geo.scale(1, 1, squash);
  return new Mesh(geo, mat(color));
}

/** Tapered stick, base at local y = 0, leaned by `tilt` then spun by `yaw`. */
function stick(
  len: number,
  r0: number,
  r1: number,
  tilt: number,
  yaw: number,
  m: MeshLambertMaterial
): Mesh {
  const geo = new CylinderGeometry(r1, r0, len, 4);
  geo.translate(0, len / 2, 0);
  const mesh = new Mesh(geo, m);
  mesh.rotation.set(0, yaw, tilt);
  return mesh;
}

/** Bare camelthorn skeleton: leaning trunk with forked charcoal limbs. */
function camelthorn(s: number, m: MeshLambertMaterial): Group {
  const g = new Group();
  g.add(stick(0.062 * s, 0.007 * s, 0.005 * s, 0.06, 0, m));
  const limbs: Array<[number, number, number, number]> = [
    [0.05, 0.72, 0.5, 0.054],
    [0.045, -0.62, 2.0, 0.05],
    [0.042, 0.52, 3.4, 0.058],
    [0.036, -0.85, 4.8, 0.046],
    [0.034, 0.25, 1.2, 0.064],
  ];
  for (const [len, tilt, yaw, y] of limbs) {
    const b = stick(len * s, 0.004 * s, 0.002 * s, tilt, yaw, m);
    b.position.y = y * s;
    g.add(b);
    const twig = stick(len * 0.55 * s, 0.0025 * s, 0.001 * s, tilt * 0.35, yaw + 0.9, m);
    twig.position.set(
      -Math.sin(tilt) * len * 0.78 * s * Math.cos(yaw),
      (y + len * 0.7) * s,
      Math.sin(tilt) * len * 0.78 * s * Math.sin(yaw)
    );
    g.add(twig);
  }
  return g;
}

export function build(): Group {
  const g = new Group();
  const charcoal = mat(CHARCOAL);

  // ---- sand plain ----
  const rim = new Mesh(new CylinderGeometry(R, R - 0.012, 0.028, 34), mat(PLAIN_EDGE));
  rim.position.y = 0.014;
  g.add(rim);
  const plain = new Mesh(
    new CylinderGeometry(R - 0.004, R - 0.004, GROUND, 34),
    mat(PLAIN)
  );
  plain.position.y = GROUND / 2;
  g.add(plain);

  // ---- Deadvlei: bone white clay floor, chalky rim, hairline cracks ----
  const PAN_X = 0.02;
  const PAN_Z = 0.185;
  const panRim = panSlab(0.152, 0.007, 0.72, PAN_EDGE);
  panRim.position.set(PAN_X, GROUND - 0.003, PAN_Z);
  g.add(panRim);
  const panFloor = panSlab(0.137, 0.008, 0.72, PAN);
  panFloor.position.set(PAN_X, GROUND - 0.001, PAN_Z);
  g.add(panFloor);
  const crackGeo = new BoxGeometry(0.17, 0.004, 0.0035);
  for (const [dx, dz, ry] of [
    [-0.015, -0.015, 0.35],
    [0.015, 0.03, -0.9],
    [-0.025, 0.045, 1.5],
  ] as const) {
    const c = new Mesh(crackGeo, mat(PAN_EDGE));
    c.position.set(PAN_X + dx, GROUND + 0.006, PAN_Z + dz);
    c.rotation.y = ry;
    g.add(c);
  }

  // ---- the sand sea: a towering crest wrapping behind the pan, lower
  //      ridges stepping away on either side ----
  const put = (d: Group, x: number, z: number, ry: number) => {
    d.position.set(x, GROUND - 0.008, z);
    d.rotation.y = ry;
    g.add(d);
  };
  put(duneRidge(0.24, 0.14, 0.34, 0.6, 0.065, 0.4, DUNE_A), 0, -0.14, 1.571);
  put(duneRidge(0.12, 0.085, 0.18, 0.32, 0.028, 2.4, DUNE_B), 0.19, -0.03, 2.3);
  put(duneRidge(0.13, 0.09, 0.17, 0.34, 0.026, 4.1, DUNE_B), -0.18, 0, 1.35);
  put(duneRidge(0.045, 0.04, 0.045, 0.26, 0.012, 1.1, DUNE_C), 0, 0.3, 1.5);

  // ---- camelthorn skeletons standing on the pan ----
  const trees: Array<[number, number, number, number]> = [
    [-0.03, 0.155, 1.0, 0.6],
    [0.075, 0.15, 0.76, 2.1],
    [-0.075, 0.215, 0.6, 4.0],
    [0.04, 0.225, 0.5, 5.2],
  ];
  for (const [x, z, s, ry] of trees) {
    const t = camelthorn(s, charcoal);
    t.position.set(x, GROUND + 0.005, z);
    t.rotation.y = ry;
    g.add(t);
  }

  // ---- sparse scrub tufts at the dune toes ----
  const tuft = (x: number, z: number, r: number, h: number) => {
    const m = new Mesh(new ConeGeometry(r, h, 5), mat(SCRUB));
    m.position.set(x, GROUND + h / 2 - 0.004, z);
    g.add(m);
  };
  tuft(-0.19, 0.235, 0.023, 0.03);
  tuft(0.235, 0.185, 0.02, 0.026);
  tuft(-0.275, 0.155, 0.018, 0.023);
  tuft(0.155, 0.26, 0.016, 0.021);

  return g;
}
