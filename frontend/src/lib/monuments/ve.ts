// Angel Falls — papercraft tepui: a sheer-cliffed table mountain (Auyán-tepui)
// with a thin white waterfall ribbon falling the full face into a misty
// jungle base. Natural landform: no plaza disc, irregular forest terrain.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const SEG = 12; // radial segments — visible papercraft facets
const THETA0 = -Math.PI / SEG; // center a flat face on +z (waterfall face)

const CLIFF_LO = 0.12; // cliff base (tucked into talus)
const CLIFF_HI = 0.52; // cliff top (rim band above)
const RIM_HI = 0.562; // top of dark caprock band
const CAP_TOP = 0.582; // plateau surface

/**
 * Angle-keyed radial jitter: pushes columns of a cylinder/lathe in and out
 * so cliffs read as folded rock faces. Offsets depend only on (angle, y),
 * so shared/duplicated vertices stay welded. `frontDamp` keeps the +z face
 * (where the waterfall hangs) close to its true radius.
 */
function jitterRadial(mesh: Mesh, amp: number, phase: number, frontDamp = true): void {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (Math.hypot(x, z) < 1e-4) continue;
    const a = Math.atan2(x, z); // 0 at +z
    const damp = frontDamp ? Math.min(1, Math.max(0.12, Math.abs(a) / 0.55)) : 1;
    const s =
      1 +
      damp *
        amp *
        (0.5 * Math.sin(3 * a + phase) +
          0.35 * Math.sin(7 * a + 2.1 * phase) +
          0.3 * Math.sin(11 * a + y * 17));
    pos.setX(i, x * s);
    pos.setZ(i, z * s);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

function lathe(pts: [number, number][], color: string, seg = SEG): Mesh {
  return new Mesh(
    new LatheGeometry(pts.map(([r, y]) => new Vector2(r, y)), seg),
    mat(color)
  );
}

/** Interpolated cliff wall radius at height y (before jitter/ellipse). */
function cliffR(y: number): number {
  return 0.148 - ((0.148 - 0.135) * (y - CLIFF_LO)) / (CLIFF_HI - CLIFF_LO);
}

function mound(a: number, dist: number, r: number, y: number, color: string): Mesh {
  const m = new Mesh(new SphereGeometry(r, 7, 5), mat(color));
  m.position.set(Math.sin(a) * dist, y, Math.cos(a) * dist);
  m.scale.set(1.15, 0.62, 1);
  m.rotation.y = a * 2.3;
  return m;
}

export function build(): Group {
  const g = new Group();
  const jungleDark = "#5c7a4f";

  // ---------- Tepui massif (elliptically squashed: broad front face) ----------
  const tp = new Group();
  tp.scale.set(1.22, 1, 0.82);
  g.add(tp);

  // Rocky talus apron, rising up under the cliff base (no seam)
  const talus = lathe(
    [
      [0.205, 0.014],
      [0.175, 0.06],
      [0.157, 0.11],
      [0.144, 0.17],
    ],
    TONES.brickDark
  );
  jitterRadial(talus, 0.05, 0.7);
  tp.add(talus);

  // Jungle skirt climbing the lower talus (uneven treeline)
  const skirt = lathe(
    [
      [0.235, 0.006],
      [0.21, 0.03],
      [0.184, 0.06],
      [0.165, 0.092],
    ],
    TONES.forest
  );
  jitterRadial(skirt, 0.07, 2.4);
  tp.add(skirt);

  // Sheer main cliff wall — tall and slender, the defining silhouette
  const cliff = new Mesh(
    new CylinderGeometry(0.135, 0.148, CLIFF_HI - CLIFF_LO, SEG, 3, false, THETA0),
    mat(TONES.brick)
  );
  cliff.position.y = (CLIFF_LO + CLIFF_HI) / 2;
  jitterRadial(cliff, 0.05, 1.3);
  tp.add(cliff);

  // Buttress mesas flanking the waterfall face — stepped lower massifs that
  // break the circular plan into a sprawling table mountain (left tall,
  // right short, like the cliff buttresses framing the real falls)
  const buttress = (
    bx: number,
    bz: number,
    rBot: number,
    rTop: number,
    top: number,
    phase: number
  ): void => {
    const body = new Mesh(
      new CylinderGeometry(rTop, rBot, top - 0.02, 8, 2, false, 0.4),
      mat(TONES.brickDark)
    );
    body.position.set(bx, (top + 0.02) / 2, bz);
    jitterRadial(body, 0.07, phase, false);
    tp.add(body);
    const bRim = new Mesh(
      new CylinderGeometry(rTop * 1.05, rTop * 0.98, 0.028, 8, 1, false, 0.4),
      mat(TONES.ironDark)
    );
    bRim.position.set(bx, top + 0.012, bz);
    tp.add(bRim);
    const bCap = new Mesh(
      new CylinderGeometry(rTop * 0.99, rTop * 1.05, 0.013, 8, 1, false, 0.4),
      mat("#7a6e5e")
    );
    bCap.position.set(bx, top + 0.032, bz);
    tp.add(bCap);
    const bGreen = new Mesh(
      new CylinderGeometry(rTop * 0.42, rTop * 0.5, 0.009, 7),
      mat(jungleDark)
    );
    bGreen.position.set(bx - rTop * 0.2, top + 0.042, bz + rTop * 0.15);
    tp.add(bGreen);
  };
  buttress(-0.115, 0.028, 0.108, 0.092, 0.375, 3.1);
  buttress(0.118, 0.012, 0.092, 0.078, 0.28, 5.4);

  // Dark caprock band, slightly overhanging
  const rim = new Mesh(
    new CylinderGeometry(0.141, 0.134, RIM_HI - CLIFF_HI, SEG, 1, false, THETA0),
    mat(TONES.ironDark)
  );
  rim.position.y = (CLIFF_HI + RIM_HI) / 2;
  jitterRadial(rim, 0.035, 1.3);
  tp.add(rim);

  // Flat plateau cap
  const cap = new Mesh(
    new CylinderGeometry(0.134, 0.141, CAP_TOP - RIM_HI, SEG, 1, false, THETA0),
    mat("#7a6e5e")
  );
  cap.position.y = (RIM_HI + CAP_TOP) / 2;
  jitterRadial(cap, 0.035, 1.3);
  tp.add(cap);

  // Sparse low vegetation patches on the mostly-bare plateau
  const topPatches: [number, number, number, string][] = [
    [-0.05, 0.03, 0.034, jungleDark],
    [0.055, -0.025, 0.026, TONES.forest],
    [-0.005, 0.08, 0.022, jungleDark],
  ];
  for (const [px, pz, pr, pc] of topPatches) {
    const p = new Mesh(new CylinderGeometry(pr, pr * 1.15, 0.01, 8), mat(pc));
    p.position.set(px, CAP_TOP + 0.005, pz);
    tp.add(p);
  }

  // Horizontal strata bands — sedimentary layers hugging the cliff wall
  // (same jitter params as the cliff, so they sit flush at +1.5% radius)
  const strata: [number, number, string][] = [
    [0.315, 0.024, TONES.brickDark],
    [0.445, 0.013, TONES.brickDark],
  ];
  for (const [sy, sh, sc] of strata) {
    const r = cliffR(sy) * 1.015;
    const band = new Mesh(
      new CylinderGeometry(r * 0.998, r * 1.002, sh, SEG, 1, true, THETA0),
      mat(sc)
    );
    band.position.y = sy;
    jitterRadial(band, 0.05, 1.3);
    tp.add(band);
  }

  // ---------- Waterfall (front face, +z) ----------
  // Spout leaping from the rim
  const spout = new Mesh(new BoxGeometry(0.026, 0.016, 0.03), mat(TONES.white));
  spout.position.set(0, 0.558, 0.112);
  g.add(spout);

  // Free-falling ribbon: narrow at the lip, widening as it dissolves down
  const fallShape = new Shape();
  fallShape.moveTo(-0.01, 0.555);
  fallShape.lineTo(0.01, 0.555);
  fallShape.lineTo(0.028, 0.112);
  fallShape.lineTo(-0.028, 0.112);
  fallShape.closePath();
  const fall = new Mesh(
    new ExtrudeGeometry(fallShape, { depth: 0.012, bevelEnabled: false }),
    mat(TONES.white)
  );
  fall.position.z = 0.132;
  fall.rotation.x = -0.03; // lean back with the cliff face
  g.add(fall);

  // Small mist puffs where the fall shatters at the talus foot
  const mists: [number, number, number, number, number][] = [
    [0.026, 0.108, 0.148, 0.028, 1.15],
    [-0.024, 0.095, 0.15, 0.026, 1.1],
    [0, 0.06, 0.17, 0.034, 1.4],
  ];
  for (const [mx, my, mz, mr, sx] of mists) {
    const m = new Mesh(new SphereGeometry(mr, 8, 6), mat(TONES.white));
    m.position.set(mx, my, mz);
    m.scale.set(sx, 0.65, 0.9);
    g.add(m);
  }

  // Lower cascade step + jungle stream running out the front
  const casc = new Mesh(new BoxGeometry(0.03, 0.04, 0.02), mat(TONES.white));
  casc.position.set(0.002, 0.036, 0.192);
  casc.rotation.x = 0.5;
  g.add(casc);

  const streamParts: [number, number, number, number, number, number][] = [
    [0, 0.026, 0.212, 0.036, 0.055, 0.15],
    [0.018, 0.017, 0.242, 0.032, 0.06, -0.25],
  ];
  for (const [sx0, sy, sz, sw, sl, rot] of streamParts) {
    const s = new Mesh(new BoxGeometry(sw, 0.01, sl), mat(TONES.water));
    s.position.set(sx0, sy, sz);
    s.rotation.y = rot;
    g.add(s);
  }

  // ---------- Jungle terrain base ----------
  const terrain = lathe(
    [
      [0.27, 0],
      [0.265, 0.01],
      [0.23, 0.022],
      [0.175, 0.032],
      [0.12, 0.038],
    ],
    TONES.forest,
    22
  );
  jitterRadial(terrain, 0.045, 4.2, false);
  g.add(terrain);

  // Canopy mounds ringing the foot (kept clear of the stream at the front)
  const mounds: [number, number, number, string][] = [
    [0.75, 0.22, 0.038, jungleDark],
    [1.2, 0.235, 0.032, TONES.forest],
    [1.75, 0.225, 0.042, TONES.forest],
    [2.45, 0.235, 0.034, jungleDark],
    [3.1, 0.22, 0.038, TONES.forest],
    [-2.55, 0.23, 0.04, jungleDark],
    [-1.85, 0.235, 0.035, TONES.forest],
    [-1.15, 0.225, 0.038, jungleDark],
    [-0.68, 0.23, 0.032, TONES.forest],
  ];
  for (const [ma, md, mr, mc] of mounds) g.add(mound(ma, md, mr, 0.02, mc));

  return g;
}
