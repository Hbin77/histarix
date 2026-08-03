// Zuma Rock (Nigeria) — "Giant of Africa": a single massive granite
// monolith. Papercraft take: elongated superellipse loaf with steep sides
// and a broad flattened crown, faceted by angular jitter, dark vertical
// water streaks down the flanks, a pale weathered patch (the famous "face"
// wall), and tiny trees on a green terrain apron to sell the colossal
// scale. Natural landform: no plaza disc — it stands on its own bush base.

import {
  BoxGeometry,
  ConeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Vector2,
} from "three";
import { mat, TONES } from "./materials";

const H = 0.44; // rock summit height (above terrain)
const R = 0.25; // unscaled loaf radius at ground
const SX = 1.42; // stretch along x (long axis, faces the front view)
const SZ = 0.78; // squash along z
const SEG = 26; // radial facets

const ROCK = "#9c9484"; // muted warm granite gray
const ROCK_DARK = "#615b4f"; // wet-season water streaks
const ROCK_DARK2 = "#746c5e"; // lighter streak variant
const FACE = "#aba394"; // pale weathered "face" wall
const ROCK_BASE = "#867e6f"; // shadowed vegetation line at the foot
const BUSH_DARK = "#66805a"; // darker tree variant

/** Superellipse loaf profile: steep flanks, broad flattened crown. */
function profR(t: number): number {
  const s = Math.min(Math.max(t, 0), 1);
  return R * Math.pow(1 - Math.pow(s, 5), 0.58);
}

/**
 * Angular facet noise (rock-local, pre-scale). Shared between the dome
 * vertex jitter and the flank-slab placement so streaks hug the surface.
 * The cos(a)*t term skews the crown toward +x: one full, steep end and
 * one longer tapering end, like the real rock.
 */
function facetN(a: number, t: number): number {
  return (
    (0.04 * Math.sin(3 * a + 1.3) +
      0.028 * Math.sin(5 * a + 4.1) +
      0.02 * Math.sin(7 * a + t * 5)) *
      (1 - 0.45 * t) +
    0.09 * Math.cos(a) * t * (1.35 - t)
  );
}

/** Effective jittered radius at angle `a`, normalized height `t`. */
function rEff(a: number, t: number): number {
  return profR(t) * (1 + facetN(a, t));
}

function jitterRock(mesh: Mesh): void {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 0.02) continue;
    const a = Math.atan2(z, x);
    const f = 1 + facetN(a, y / H);
    pos.setXYZ(i, x * f, y, z * f);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

/**
 * Thin slab hugging the loaf flank at angle `a` (rock-local, pre-scale),
 * spanning heights y0→y1, split into stacked segments that follow the
 * surface curvature over the shoulder. Used for the water streaks and the
 * pale face wall.
 */
function flankSlab(
  a: number,
  y0: number,
  y1: number,
  w: number,
  color: string,
  offset: number
): Group {
  const slab = new Group();
  const m = Math.hypot(SX * Math.sin(a), SZ * Math.cos(a));
  const nSeg = Math.max(2, Math.ceil((y1 - y0) / 0.08));
  for (let s = 0; s < nSeg; s++) {
    const ya = y0 + ((y1 - y0) * s) / nSeg;
    const yb = y0 + ((y1 - y0) * (s + 1)) / nSeg;
    const tMid = (ya + yb) / 2 / H;
    const ra = rEff(a, ya / H);
    const rb = rEff(a, yb / H);
    // fade the outward offset with height and sink upper segments into
    // the rock so streak tops never poke above the flattening crown
    const off = offset * (1 - tMid) - 0.007 * tMid;
    const rm = rEff(a, tMid) + off;
    const len = Math.hypot(yb - ya, rb - ra) + 0.006;
    const seg = new Mesh(new BoxGeometry(w / m, len, 0.012), mat(color));
    seg.position.set(Math.cos(a) * rm, (ya + yb) / 2, Math.sin(a) * rm);
    seg.rotation.order = "YXZ";
    seg.rotation.y = Math.PI / 2 - a;
    seg.rotation.x = Math.atan2(rb - ra, yb - ya);
    slab.add(seg);
  }
  return slab;
}

function tree(x: number, z: number, h: number, r: number, color: string): Mesh {
  const cone = new Mesh(new ConeGeometry(r, h, 7), mat(color));
  cone.position.set(x, 0.016 + h / 2 - 0.008, z);
  return cone;
}

export function build(): Group {
  const g = new Group();

  // --- Terrain apron: low green mound, squashed to an ellipse ---
  const groundPts = [
    new Vector2(0.372, 0),
    new Vector2(0.36, 0.014),
    new Vector2(0.3, 0.024),
    new Vector2(0.18, 0.03),
    new Vector2(0.0001, 0.032),
  ];
  const ground = new Mesh(new LatheGeometry(groundPts, 30), mat(TONES.forest));
  {
    const pos = ground.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const r = Math.hypot(x, z);
      if (r < 0.34) continue; // only ripple the outer rim
      const a = Math.atan2(z, x);
      const f =
        1 -
        0.045 * (0.5 + 0.5 * Math.sin(4 * a + 0.7)) -
        0.02 * (0.5 + 0.5 * Math.sin(7 * a));
      pos.setXYZ(i, x * f, pos.getY(i), z * f);
    }
    pos.needsUpdate = true;
    ground.geometry.computeVertexNormals();
  }
  ground.scale.z = 0.72;
  g.add(ground);

  // --- The monolith ---
  const rock = new Group();
  rock.scale.set(SX, 1, SZ);
  rock.position.y = 0.01;

  const ts = [0, 0.07, 0.15, 0.24, 0.34, 0.45, 0.56, 0.66, 0.75, 0.83, 0.895, 0.95, 0.985, 1];
  const domePts = ts.map((t) => new Vector2(Math.max(profR(t), 0.0001), t * H));
  const dome = new Mesh(new LatheGeometry(domePts, SEG), mat(ROCK));
  jitterRock(dome);
  rock.add(dome);

  // Shadowed band where the bush meets the rock foot
  const bandTs = [0.005, 0.06, 0.115];
  const bandPts = bandTs.map((t) => new Vector2(profR(t) + 0.002, t * H));
  const band = new Mesh(new LatheGeometry(bandPts, SEG), mat(ROCK_BASE));
  jitterRock(band);
  rock.add(band);

  // Pale weathered wall on the front flank (the "face" of Zuma) — nearly
  // flush so it reads as a color patch, with streaks layered above it.
  rock.add(flankSlab(1.35, 0.07, 0.32, 0.16, FACE, 0.0015));
  rock.add(flankSlab(1.74, 0.06, 0.25, 0.1, FACE, 0.0015));

  // Dark vertical water streaks pouring from near the crown — unevenly
  // clustered like the real striations; the tallest curl over the shoulder
  // so the aerial view catches them too.
  const streaks: Array<[number, number, number, number, string]> = [
    [0.72, 0.06, 0.36, 0.026, ROCK_DARK],
    [0.94, 0.12, 0.34, 0.02, ROCK_DARK2],
    [1.05, 0.08, 0.37, 0.024, ROCK_DARK],
    [1.3, 0.07, 0.3, 0.017, ROCK_DARK2],
    [1.52, 0.06, 0.37, 0.028, ROCK_DARK],
    [1.63, 0.1, 0.33, 0.018, ROCK_DARK2],
    [1.95, 0.08, 0.36, 0.022, ROCK_DARK],
    [2.24, 0.06, 0.27, 0.02, ROCK_DARK2],
    [2.78, 0.08, 0.33, 0.024, ROCK_DARK2],
    [3.6, 0.07, 0.3, 0.022, ROCK_DARK],
    [4.05, 0.06, 0.37, 0.026, ROCK_DARK],
    [4.2, 0.11, 0.34, 0.018, ROCK_DARK2],
    [4.52, 0.09, 0.36, 0.02, ROCK_DARK],
    [4.95, 0.06, 0.29, 0.024, ROCK_DARK2],
    [5.35, 0.08, 0.36, 0.022, ROCK_DARK],
    [5.92, 0.07, 0.3, 0.02, ROCK_DARK2],
    [0.25, 0.06, 0.24, 0.02, ROCK_DARK2],
  ];
  for (const [a, y0, y1, w, c] of streaks) {
    rock.add(flankSlab(a, y0, y1, w, c, 0.003));
  }
  g.add(rock);

  // --- Tiny trees hugging the base (scale cue) ---
  const trees: Array<[number, number, number, number, string]> = [
    [0.06, 0.235, 0.05, 0.018, TONES.forest],
    [0.14, 0.225, 0.04, 0.015, BUSH_DARK],
    [-0.09, 0.24, 0.046, 0.017, BUSH_DARK],
    [-0.2, 0.215, 0.038, 0.014, TONES.forest],
    [0.24, 0.2, 0.042, 0.016, TONES.forest],
    [0.33, 0.14, 0.036, 0.013, BUSH_DARK],
    [-0.3, 0.16, 0.04, 0.015, TONES.forest],
    [-0.35, 0.05, 0.036, 0.013, BUSH_DARK],
    [0.355, -0.02, 0.038, 0.014, TONES.forest],
    [-0.12, -0.23, 0.044, 0.016, BUSH_DARK],
    [0.1, -0.235, 0.04, 0.015, TONES.forest],
    [0.27, -0.18, 0.036, 0.013, BUSH_DARK],
    [-0.26, -0.18, 0.038, 0.014, TONES.forest],
  ];
  for (const [x, z, h, r, c] of trees) {
    g.add(tree(x, z, h, r, c));
  }

  return g;
}
