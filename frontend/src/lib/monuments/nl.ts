// Kinderdijk — papercraft polder: a water ring with two grass banks cut by a
// straight channel, and a receding row of three brick/thatch smock windmills,
// each with 4-blade lattice sails frozen at a different angle.

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

const R_LAND = 0.355; // grass island radius
const R_WATER = 0.37; // waterline ring radius (footprint 0.74)
const GRASS_TOP = 0.04;
const CH_BACK = 0.03; // channel back edge (z)
const CH_FRONT = 0.17; // channel front edge (z)

const thatch = mat("#6e5f4c");
const thatchDark = mat("#57493a");
const brick = mat(TONES.brick);
const wood = mat("#6b5a44");
const white = mat(TONES.white);
const stock = mat(TONES.white);
const lattice = mat("#cfc4a8");
const grass = mat(TONES.forest);
const reedMat = mat("#8a915f");
const reedBed = mat("#b3a476");

/** Circular segment of the land disc, cut by a chord at world-z = c. */
function bank(c: number, keepFront: boolean): Mesh {
  const a = Math.asin(c / R_LAND);
  const s = new Shape();
  // shape (x, y) maps to world (x, z) after rotation.x = PI/2
  s.absarc(0, 0, R_LAND, a, Math.PI - a, !keepFront);
  s.closePath();
  const geo = new ExtrudeGeometry(s, {
    depth: 0.036,
    bevelEnabled: false,
    curveSegments: 20,
  });
  const m = new Mesh(geo, grass);
  m.rotation.x = Math.PI / 2; // shape-y -> world z, extrude goes downward
  m.position.y = GRASS_TOP;
  return m;
}

/** One smock windmill, base at local y = 0. */
function windmill(scale: number, sailAngle: number, yaw: number): Group {
  const g = new Group();

  // Brick foot
  const foot = new Mesh(new CylinderGeometry(0.055, 0.062, 0.05, 8), brick);
  foot.rotation.y = Math.PI / 8; // flat face fronts +z
  foot.position.y = 0.025;
  g.add(foot);

  // Thatched octagonal smock body (tapered)
  const body = new Mesh(new CylinderGeometry(0.034, 0.056, 0.16, 8), thatch);
  body.rotation.y = Math.PI / 8;
  body.position.y = 0.13;
  g.add(body);

  // Rounded thatch cap
  const cap = new Mesh(
    new SphereGeometry(0.042, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.55),
    thatchDark
  );
  cap.scale.set(1, 0.85, 1.05);
  cap.position.y = 0.208;
  g.add(cap);

  // Door + window (paper stickers on the front face)
  const door = new Mesh(new BoxGeometry(0.02, 0.032, 0.006), white);
  door.position.set(0, 0.022, 0.056);
  g.add(door);
  const win = new Mesh(new BoxGeometry(0.014, 0.014, 0.006), white);
  win.position.set(0, 0.115, 0.047);
  g.add(win);

  // Tail pole (staart) slanting from cap down to the back
  const tail = new Mesh(new BoxGeometry(0.008, 0.21, 0.008), wood);
  tail.position.set(0, 0.1, -0.057);
  tail.rotation.x = 0.26;
  g.add(tail);

  // ---- Sail cross ----
  const sails = new Group();
  const R_S = 0.16;
  // axle hub
  const hub = new Mesh(new CylinderGeometry(0.011, 0.011, 0.03, 6), wood);
  hub.rotation.x = Math.PI / 2;
  hub.position.z = -0.008;
  sails.add(hub);
  // two crossing stocks
  for (const rot of [0, Math.PI / 2]) {
    const st = new Mesh(new BoxGeometry(0.009, R_S * 2, 0.007), stock);
    st.rotation.z = rot;
    sails.add(st);
  }
  // four lattice panels, same chirality (offset to one side of each stock)
  for (let i = 0; i < 4; i++) {
    const p = new Mesh(new BoxGeometry(0.034, 0.12, 0.004), lattice);
    p.position.set(0.02, 0.105, 0);
    const arm = new Group();
    arm.add(p);
    arm.rotation.z = (i * Math.PI) / 2;
    sails.add(arm);
  }
  sails.rotation.z = sailAngle;
  const sailRig = new Group();
  sailRig.add(sails);
  sailRig.rotation.x = -0.15; // sail plane leans back at the top
  sailRig.position.set(0, 0.2, 0.052);
  g.add(sailRig);

  g.scale.setScalar(scale);
  g.rotation.y = yaw;
  return g;
}

function reed(x: number, z: number, h: number): Mesh {
  const r = new Mesh(new ConeGeometry(0.012, h, 5), reedMat);
  r.position.set(x, GRASS_TOP + h / 2 - 0.004, z);
  return r;
}

export function build(): Group {
  const g = new Group();

  // Waterline ring / channel water
  const water = new Mesh(
    new CylinderGeometry(R_WATER, R_WATER, 0.022, 40),
    mat(TONES.water)
  );
  water.position.y = 0.011;
  g.add(water);

  // Grass banks on either side of the channel
  g.add(bank(CH_BACK, false));
  g.add(bank(CH_FRONT, true));

  // ---- Windmill row on the back bank, receding left -> right ----
  const mills: Array<[number, number, number, number, number]> = [
    // x, z, scale, sailAngle, yaw
    [-0.17, -0.06, 1.1, 0.35, -0.3],
    [0.02, -0.14, 0.97, 0.85, 0.05],
    [0.19, -0.16, 0.87, -0.55, 0.3],
  ];
  for (const [x, z, s, sa, yw] of mills) {
    const m = windmill(s, sa, yw);
    m.position.set(x, GRASS_TOP, z);
    g.add(m);
  }

  // ---- Golden reed beds hugging the water edges (winter reeds) ----
  const beds: Array<[number, number, number, number]> = [
    // x, z, width, rotY
    [-0.27, 0.015, 0.14, 0.1],
    [0.28, 0.012, 0.12, -0.12],
    [-0.1, 0.19, 0.16, -0.06],
    [0.19, 0.195, 0.13, 0.15],
  ];
  for (const [x, z, w, ry] of beds) {
    const bed = new Mesh(new BoxGeometry(w, 0.008, 0.032), reedBed);
    bed.position.set(x, GRASS_TOP + 0.002, z);
    bed.rotation.y = ry;
    g.add(bed);
  }

  // ---- Reed tufts ----
  const reeds: Array<[number, number, number]> = [
    [-0.3, 0.02, 0.055],
    [-0.25, 0.01, 0.07],
    [-0.29, -0.04, 0.05],
    [0.26, 0.015, 0.065],
    [0.3, 0.05, 0.05],
    [-0.13, 0.19, 0.06],
    [-0.07, 0.2, 0.05],
    [0.04, 0.19, 0.055],
    [0.17, 0.2, 0.065],
    [0.22, 0.19, 0.05],
    [0.25, 0.22, 0.05],
  ];
  for (const [x, z, h] of reeds) g.add(reed(x, z, h));

  // ---- Small wooden mooring dock on the front bank ----
  const plank = new Mesh(new BoxGeometry(0.05, 0.008, 0.022), wood);
  plank.position.set(0.1, GRASS_TOP + 0.004, 0.185);
  g.add(plank);
  for (const px of [0.085, 0.115]) {
    const post = new Mesh(new CylinderGeometry(0.004, 0.004, 0.026, 5), wood);
    post.position.set(px, GRASS_TOP + 0.016, 0.174);
    g.add(post);
  }

  return g;
}
