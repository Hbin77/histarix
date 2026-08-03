// CN Tower — papercraft: three concave concrete fins around a hex core,
// bulbous main pod (radome ring + window band), upper shaft, SkyPod, antenna.

import {
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Shape,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

export function build(): Group {
  const g = new Group();
  const concrete = mat("#c9c4b6");
  const concreteDark = mat("#aba695");
  const white = mat(TONES.white);
  const glass = mat(TONES.ink);
  const steel = mat(TONES.slate);

  g.add(plazaDisc(0.26));

  // ---- Base pad ----
  const pad = new Mesh(
    new CylinderGeometry(0.105, 0.115, 0.018, 12),
    concreteDark
  );
  pad.position.y = 0.009;
  g.add(pad);

  // ---- Hexagonal core shaft up to the pod (darker: reads as the recess
  // between the three fins) ----
  const core = new Mesh(new CylinderGeometry(0.037, 0.042, 0.59, 6), concreteDark);
  core.position.y = 0.295;
  g.add(core);

  // ---- Three concave fins (the Y-shaped leg cross-section) ----
  const FIN_H = 0.575;
  const R_FOOT = 0.115;
  const R_TOP = 0.041;
  const shape = new Shape();
  shape.moveTo(0, 0);
  shape.lineTo(R_FOOT, 0);
  const STEPS = 6;
  for (let i = 1; i <= STEPS; i++) {
    const t = i / STEPS;
    const x = R_TOP + (R_FOOT - R_TOP) * Math.pow(1 - t, 2.6);
    shape.lineTo(x, FIN_H * t);
  }
  shape.lineTo(0, FIN_H);
  shape.closePath();
  const finGeo = new ExtrudeGeometry(shape, {
    depth: 0.027,
    bevelEnabled: false,
  });
  for (let i = 0; i < 3; i++) {
    const fin = new Mesh(finGeo, concrete);
    fin.position.y = 0.018;
    const holder = new Group();
    fin.position.z = -0.0135;
    holder.add(fin);
    holder.rotation.y = (i * 2 * Math.PI) / 3 + Math.PI / 6;
    g.add(holder);
  }

  // ---- Main pod (base at 0.585) ----
  // Flared bracket where the fins meet the pod
  const flare = new Mesh(new CylinderGeometry(0.084, 0.044, 0.034, 12), concrete);
  flare.position.y = 0.602;
  g.add(flare);
  // Radome ring (white donut at the pod bottom)
  const radome = new Mesh(new CylinderGeometry(0.1, 0.086, 0.024, 12), white);
  radome.position.y = 0.631;
  g.add(radome);
  // Observation window band
  const band = new Mesh(new CylinderGeometry(0.102, 0.102, 0.024, 12), glass);
  band.position.y = 0.655;
  g.add(band);
  // Upper pod wall
  const upperPod = new Mesh(new CylinderGeometry(0.092, 0.102, 0.014, 12), white);
  upperPod.position.y = 0.674;
  g.add(upperPod);
  // Tapered pod roof
  const podRoof = new Mesh(new CylinderGeometry(0.042, 0.092, 0.018, 12), white);
  podRoof.position.y = 0.69;
  g.add(podRoof);

  // ---- Upper shaft to the SkyPod ----
  const upperShaft = new Mesh(
    new CylinderGeometry(0.025, 0.033, 0.112, 6),
    concrete
  );
  upperShaft.position.y = 0.754;
  g.add(upperShaft);

  // ---- SkyPod ----
  const skyPodBase = new Mesh(
    new CylinderGeometry(0.042, 0.03, 0.014, 12),
    white
  );
  skyPodBase.position.y = 0.814;
  g.add(skyPodBase);
  const skyPodBand = new Mesh(
    new CylinderGeometry(0.042, 0.042, 0.013, 12),
    glass
  );
  skyPodBand.position.y = 0.8275;
  g.add(skyPodBand);
  const skyPodRoof = new Mesh(
    new CylinderGeometry(0.016, 0.042, 0.014, 12),
    white
  );
  skyPodRoof.position.y = 0.841;
  g.add(skyPodRoof);

  // ---- Antenna mast ----
  const mastLow = new Mesh(new CylinderGeometry(0.009, 0.014, 0.07, 6), steel);
  mastLow.position.y = 0.883;
  g.add(mastLow);
  const mastHigh = new Mesh(new CylinderGeometry(0.004, 0.009, 0.078, 6), steel);
  mastHigh.position.y = 0.957;
  g.add(mastHigh);
  // Small collar rings on the mast
  for (const [y, r] of [
    [0.905, 0.016],
    [0.935, 0.012],
  ] as const) {
    const collar = new Mesh(new CylinderGeometry(r, r, 0.008, 8), concreteDark);
    collar.position.y = y;
    g.add(collar);
  }
  const tip = new Mesh(new CylinderGeometry(0.0012, 0.004, 0.014, 5), steel);
  tip.position.y = 0.993; // top exactly at y = 1.0
  g.add(tip);

  return g;
}
