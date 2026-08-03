// El Capitolio (Havana) — papercraft: broad neoclassical body with upper
// loggia band, projecting columned portico over a grand stair, twin end
// pavilions, and a tall central dome on a colonnaded drum with lantern.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const DOME = "#b9b09d"; // grayer stone for the dome shell, reads vs the body

function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  color: string
): Mesh {
  const m = new Mesh(new BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z);
  return m;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.37));

  // ---- podium + portico floor ----
  g.add(box(0.7, 0.038, 0.25, 0, 0.031, 0, TONES.stone));
  g.add(box(0.3, 0.038, 0.08, 0, 0.031, 0.135, TONES.stone));

  // ---- grand front stair (three broad flights) ----
  g.add(box(0.34, 0.013, 0.1, 0, 0.0185, 0.24, TONES.stone));
  g.add(box(0.32, 0.013, 0.075, 0, 0.0315, 0.2225, TONES.stone));
  g.add(box(0.3, 0.013, 0.05, 0, 0.0445, 0.2, TONES.stone));

  // flanking statue plinths (the two bronze figures)
  for (const sx of [1, -1]) {
    g.add(box(0.032, 0.05, 0.032, sx * 0.185, 0.037, 0.205, TONES.white));
    const fig = new Mesh(
      new CylinderGeometry(0.007, 0.009, 0.038, 6),
      mat(TONES.verdigris)
    );
    fig.position.set(sx * 0.185, 0.081, 0.205);
    g.add(fig);
    const head = new Mesh(new SphereGeometry(0.0065, 6, 5), mat(TONES.verdigris));
    head.position.set(sx * 0.185, 0.106, 0.205);
    g.add(head);
  }

  // ---- main body ----
  g.add(box(0.58, 0.16, 0.2, 0, 0.13, 0, TONES.stone));

  // upper-storey loggia recess bands (front interrupted by portico, back full)
  for (const sx of [1, -1])
    g.add(box(0.1, 0.085, 0.01, sx * 0.18, 0.158, 0.098, TONES.stoneDark));
  g.add(box(0.44, 0.085, 0.01, 0, 0.158, -0.098, TONES.stoneDark));

  // white pilaster strips over the loggia bands
  for (const sx of [1, -1])
    for (const px of [0.145, 0.185, 0.225])
      g.add(box(0.013, 0.09, 0.014, sx * px, 0.158, 0.102, TONES.white));
  for (let i = -5; i <= 5; i++)
    g.add(box(0.013, 0.09, 0.014, i * 0.042, 0.158, -0.102, TONES.white));

  // ground-floor arched-entrance rhythm along the front
  for (const sx of [1, -1])
    for (const ax of [0.155, 0.188, 0.221])
      g.add(box(0.02, 0.038, 0.008, sx * ax, 0.078, 0.101, TONES.stoneDark));

  // main cornice + roof balustrade + darker roof inset
  g.add(box(0.5, 0.02, 0.225, 0, 0.22, 0, TONES.stone));
  g.add(box(0.5, 0.016, 0.012, 0, 0.238, 0.105, TONES.white));
  g.add(box(0.5, 0.016, 0.012, 0, 0.238, -0.105, TONES.white));
  g.add(box(0.48, 0.008, 0.19, 0, 0.232, 0, TONES.stoneDark));

  // ---- end pavilions ----
  for (const sx of [1, -1]) {
    g.add(box(0.12, 0.19, 0.235, sx * 0.29, 0.145, 0, TONES.stone));
    g.add(box(0.14, 0.018, 0.255, sx * 0.29, 0.249, 0, TONES.stone));
    g.add(box(0.1, 0.022, 0.2, sx * 0.29, 0.269, 0, TONES.stone));
    g.add(box(0.09, 0.008, 0.18, sx * 0.29, 0.283, 0, TONES.stoneDark));
    // pavilion pilasters, front + back faces
    for (const sz of [1, -1])
      for (const dx of [-0.033, 0.033])
        g.add(
          box(0.013, 0.125, 0.012, sx * 0.29 + dx, 0.155, sz * 0.12, TONES.white)
        );
  }

  // ---- portico: column row, entablature, attic ----
  const colGeo = new CylinderGeometry(0.01, 0.012, 0.14, 6);
  const colMat = mat(TONES.white);
  for (let i = 0; i < 10; i++) {
    const c = new Mesh(colGeo, colMat);
    c.position.set(-0.126 + i * 0.028, 0.12, 0.135);
    g.add(c);
  }
  g.add(box(0.29, 0.03, 0.075, 0, 0.205, 0.125, TONES.stone));
  g.add(box(0.29, 0.026, 0.07, 0, 0.233, 0.12, TONES.stone));
  // recessed dark entrance wall behind the columns
  g.add(box(0.27, 0.14, 0.01, 0, 0.12, 0.098, TONES.stoneDark));

  // ---- dome base tiers (square, then round transition) ----
  g.add(box(0.24, 0.06, 0.22, 0, 0.26, 0, TONES.stone));
  const tierRound = new Mesh(
    new CylinderGeometry(0.108, 0.108, 0.045, 16),
    mat(TONES.stone)
  );
  tierRound.position.y = 0.3125;
  g.add(tierRound);

  // ---- drum: solid base, tall colonnade ring, entablature, attic ----
  const drumBase = new Mesh(
    new CylinderGeometry(0.097, 0.097, 0.06, 16),
    mat(TONES.stone)
  );
  drumBase.position.y = 0.365;
  g.add(drumBase);

  const drumCore = new Mesh(
    new CylinderGeometry(0.07, 0.07, 0.18, 16),
    mat(TONES.stoneDark)
  );
  drumCore.position.y = 0.485;
  g.add(drumCore);

  const drumColGeo = new CylinderGeometry(0.008, 0.008, 0.18, 6);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const c = new Mesh(drumColGeo, colMat);
    c.position.set(Math.sin(a) * 0.087, 0.485, Math.cos(a) * 0.087);
    g.add(c);
  }

  const entab = new Mesh(
    new CylinderGeometry(0.099, 0.099, 0.026, 16),
    mat(TONES.white)
  );
  entab.position.y = 0.588;
  g.add(entab);

  const attic = new Mesh(
    new CylinderGeometry(0.08, 0.08, 0.022, 16),
    mat(TONES.stone)
  );
  attic.position.y = 0.612;
  g.add(attic);

  // ---- dome shell (gently stretched hemisphere) ----
  const dome = new Mesh(
    new SphereGeometry(0.09, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(DOME)
  );
  dome.scale.y = 1.5;
  dome.position.y = 0.617;
  g.add(dome);

  // ---- lantern + finial ----
  const lantern = new Mesh(new CylinderGeometry(0.017, 0.017, 0.05, 8), colMat);
  lantern.position.y = 0.768;
  g.add(lantern);
  const cap = new Mesh(
    new SphereGeometry(0.021, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(DOME)
  );
  cap.scale.y = 1.3;
  cap.position.y = 0.791;
  g.add(cap);
  const finial = new Mesh(new ConeGeometry(0.0045, 0.034, 5), mat(TONES.stone));
  finial.position.y = 0.833;
  g.add(finial);

  // ---- royal palms flanking the stair (Havana flavor) ----
  const trunkGeo = new CylinderGeometry(0.005, 0.007, 0.12, 5);
  const trunkMat = mat(TONES.stoneDark);
  const frondMat = mat(TONES.forest);
  for (const sx of [1, -1]) {
    const px = sx * 0.25;
    const pz = 0.205;
    const trunk = new Mesh(trunkGeo, trunkMat);
    trunk.position.set(px, 0.072, pz);
    g.add(trunk);
    const crown = new Mesh(new SphereGeometry(0.011, 6, 5), frondMat);
    crown.position.set(px, 0.134, pz);
    g.add(crown);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + sx;
      const frond = new Mesh(new BoxGeometry(0.048, 0.006, 0.016), frondMat);
      frond.position.set(
        px + Math.sin(a) * 0.022,
        0.136,
        pz + Math.cos(a) * 0.022
      );
      // local +X points along the outward radial; tip droops down
      frond.rotation.y = a - Math.PI / 2;
      frond.rotation.z = -0.35;
      g.add(frond);
    }
  }

  return g;
}
