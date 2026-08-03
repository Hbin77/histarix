// Flame Towers, Baku — papercraft miniature. Three flame-shaped glass
// towers of staggered heights: elliptical petal cross-section, swelling
// low then tapering to a curled point (bend via stacked offset segments),
// slate-blue glass over a low white retail podium.

import { CylinderGeometry, Group, Mesh } from "three";
import { mat, plazaDisc, TONES } from "./materials";

const GLASS = "#6e90ad"; // muted slate-blue curtain glass
const GLASS_DARK = "#688aa4"; // alternating band tone (subtle)
const GLASS_TIP = "#82a2bc"; // pale sky-lit tip

/** One flame petal: base at local y=0, bends toward local +x. */
function flameTower(height: number, rMax: number, bend: number): Group {
  const tower = new Group();
  const glass = mat(GLASS);
  const glassDark = mat(GLASS_DARK);
  const glassTip = mat(GLASS_TIP);

  // Sine petal profile: belly ~27% up, long smooth taper to a true point.
  const rAt = (t: number) => rMax * Math.sin(Math.PI * (0.3 + 0.7 * t));
  // Flame curl: straight through the body, licking outward in the top third.
  const offAt = (t: number) => bend * Math.pow(t, 2.6);

  const SEGS = 12;
  for (let i = 0; i < SEGS; i++) {
    const t0 = i / SEGS;
    const t1 = (i + 1) / SEGS;
    const yA = height * t0;
    const yB = height * t1;
    const offA = offAt(t0);
    const offB = offAt(t1);
    const len = Math.hypot(yB - yA, offB - offA) + 0.008; // overlap joints
    const last = i === SEGS - 1;
    const seg = new Mesh(
      new CylinderGeometry(last ? 0.002 : rAt(t1), rAt(t0), len, 12, 1),
      i >= SEGS - 2 ? glassTip : i % 2 === 0 ? glass : glassDark
    );
    seg.position.set((offA + offB) / 2, (yA + yB) / 2, 0);
    seg.rotation.z = -Math.atan2(offB - offA, yB - yA);
    tower.add(seg);
  }

  tower.scale.z = 0.78; // elliptical petal cross-section
  return tower;
}

export function build(): Group {
  const g = new Group();

  g.add(plazaDisc(0.36));

  // ---- Low white retail podium threading between the towers ----
  const podium = new Mesh(
    new CylinderGeometry(0.22, 0.245, 0.03, 12),
    mat(TONES.white)
  );
  podium.position.y = 0.015 + 0.012;
  g.add(podium);
  const podiumTop = new Mesh(
    new CylinderGeometry(0.14, 0.175, 0.026, 12),
    mat(TONES.plaza)
  );
  podiumTop.position.y = 0.052;
  g.add(podiumTop);

  // ---- Three flames: staggered heights, bases splayed, tips curling out ----
  const towers: Array<[angle: number, h: number, r: number, R: number]> = [
    [Math.PI * 0.5, 0.96, 0.122, 0.18], // tallest, front
    [Math.PI * 0.5 + Math.PI * 0.64, 0.84, 0.114, 0.18],
    [Math.PI * 0.5 - Math.PI * 0.72, 0.78, 0.108, 0.18],
  ];
  for (const [angle, h, r, R] of towers) {
    const outer = new Group();
    outer.rotation.y = angle;
    const inner = new Group();
    inner.position.set(R, 0.012, 0);
    inner.rotation.z = 0.085; // whole flame leans in toward the trio
    inner.add(flameTower(h, r, 0.15));
    outer.add(inner);
    g.add(outer);
  }

  return g;
}
