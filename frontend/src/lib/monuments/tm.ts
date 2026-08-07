// Darvaza Gas Crater ("Door to Hell") — papercraft: a wide bowl sunk into a
// pale sand-ochre desert pan, its rim broken into a ragged crown, the
// interior glowing muted ember with flame tongues licking over the lip.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Vector2,
} from "three";
import { mat } from "./materials";

const SEG = 30;
const D2R = Math.PI / 180;
const SAND = "#dfc99e";
const SAND_PALE = "#e8d6b0";
const SCORCH = "#a58054"; // burnt ground just inside the lip
const EMBER = "#b0603c"; // crater wall
const EMBER_HOT = "#c47040"; // crater floor
const FLAME = "#ca7a3e";
const FLAME_TIP = "#d79a4c";
const CRUST = "#7d5a41";

const LIP_R = 0.265;
const LIP_Y = 0.19;
const FLOOR_Y = 0.042;

function lathe(pts: Array<[number, number]>, color: string, segs = SEG): Mesh {
  return new Mesh(
    new LatheGeometry(
      pts.map(([r, y]) => new Vector2(r, y)),
      segs
    ),
    mat(color)
  );
}

/** Angular wobble shared by every mesh that meets the crater lip. */
function lipWobble(a: number): number {
  return (
    0.5 * Math.sin(3 * a + 0.7) +
    0.32 * Math.sin(5 * a + 2.1) +
    0.28 * Math.sin(8 * a + 4.3) +
    0.16 * Math.sin(13 * a + 1.5)
  );
}

/**
 * Break one lathe ring into a ragged crown. Both the pan and the bowl share
 * this displacement so their rims stay welded together.
 */
function ragLip(mesh: Mesh, ringY: number, ampY: number, ampR: number): void {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    if (Math.abs(pos.getY(i) - ringY) > 1e-4) continue;
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const a = Math.atan2(z, x);
    const w = lipWobble(a);
    const len = Math.hypot(x, z) || 1;
    const nr = len + ampR * w;
    pos.setXYZ(i, (x / len) * nr, ringY + ampY * w, (z / len) * nr);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

export function build(): Group {
  const g = new Group();

  // ---- desert pan: low drum, flat top, sloping in to the crater lip ----
  const pan = lathe(
    [
      [0.37, 0],
      [0.368, 0.05],
      [0.362, 0.11],
      [0.355, 0.16],
      [0.34, 0.175],
      [0.3, 0.181],
      [LIP_R, LIP_Y],
    ],
    SAND
  );
  ragLip(pan, LIP_Y, 0.034, 0.021);
  g.add(pan);

  // bleached ring of sand right at the pan's outer shoulder
  g.add(
    lathe(
      [
        [0.356, 0.162],
        [0.341, 0.177],
        [0.302, 0.183],
        [0.3, 0.181],
        [0.339, 0.175],
        [0.354, 0.16],
      ],
      SAND_PALE
    )
  );

  // scorched ground between the pale sand and the lip
  const scorch = lathe(
    [
      [0.3, 0.181],
      [LIP_R, LIP_Y],
    ],
    SCORCH
  );
  ragLip(scorch, LIP_Y, 0.034, 0.021);
  g.add(scorch);

  // ---- glowing bowl: profile runs lip -> floor so it faces the sky ----
  const bowl = lathe(
    [
      [LIP_R, LIP_Y],
      [0.245, 0.152],
      [0.222, 0.114],
      [0.196, 0.079],
      [0.168, 0.054],
      [0.142, 0.044],
      [0.0001, FLOOR_Y],
    ],
    EMBER
  );
  ragLip(bowl, LIP_Y, 0.034, 0.021);
  g.add(bowl);

  // hotter floor pan, sitting just above the bowl's base
  const floor = new Mesh(
    new CylinderGeometry(0.155, 0.155, 0.008, SEG),
    mat(EMBER_HOT)
  );
  floor.position.y = FLOOR_Y + 0.004;
  g.add(floor);

  // ---- charred crust blocks on the rim and slumped down the walls ----
  const crust = (deg: number, r: number, y: number, s: number, tilt: number) => {
    const m = new Mesh(new BoxGeometry(s, s * 0.55, s * 0.8), mat(CRUST));
    const a = deg * D2R;
    m.position.set(Math.sin(a) * r, y, Math.cos(a) * r);
    m.rotation.set(tilt, a, tilt * 0.6);
    g.add(m);
  };
  crust(18, 0.252, 0.175, 0.06, 0.35);
  crust(-58, 0.238, 0.15, 0.05, 0.5);
  crust(112, 0.244, 0.162, 0.055, -0.3);
  crust(-136, 0.2, 0.1, 0.045, 0.6);
  crust(70, 0.185, 0.085, 0.04, 0.45);
  crust(-16, 0.12, 0.05, 0.038, 0.2);

  // ---- flame tongues: slim cones, the tallest breaking over the lip ----
  const flame = (deg: number, r: number, base: number, h: number, lean: number) => {
    const a = deg * D2R;
    const grp = new Group();
    grp.position.set(Math.sin(a) * r, base, Math.cos(a) * r);
    grp.rotation.y = a;
    const core = new Mesh(new ConeGeometry(h * 0.14, h, 5), mat(FLAME));
    core.position.y = h / 2;
    core.rotation.x = lean;
    grp.add(core);
    const tip = new Mesh(new ConeGeometry(h * 0.075, h * 0.5, 5), mat(FLAME_TIP));
    tip.position.y = h * 0.72;
    tip.rotation.x = lean * 1.4;
    grp.add(tip);
    g.add(grp);
  };
  flame(-24, 0.132, 0.046, 0.29, -0.16);
  flame(44, 0.176, 0.062, 0.235, -0.12);
  flame(126, 0.16, 0.055, 0.2, 0.14);
  flame(-104, 0.185, 0.07, 0.175, 0.1);
  flame(-160, 0.11, 0.045, 0.15, -0.08);
  flame(88, 0.088, 0.044, 0.125, 0.06);
  flame(170, 0.205, 0.088, 0.11, 0.18);
  flame(-70, 0.07, 0.044, 0.095, -0.1);

  // small flecks licking up the inner wall
  for (const [deg, r, y, h] of [
    [8, 0.216, 0.105, 0.055],
    [-46, 0.232, 0.13, 0.045],
    [98, 0.226, 0.12, 0.05],
    [-124, 0.212, 0.1, 0.04],
    [146, 0.198, 0.082, 0.042],
  ] as const) {
    const a = deg * D2R;
    const f = new Mesh(new ConeGeometry(h * 0.26, h, 4), mat(FLAME_TIP));
    f.position.set(Math.sin(a) * r, y + h / 2, Math.cos(a) * r);
    f.rotation.y = a;
    g.add(f);
  }

  return g;
}
