// Hungarian Parliament (Budapest) — papercraft: long symmetric neo-gothic
// riverside mass, central ribbed rust dome with spire, flanking gothic
// towers, end pavilions, rows of pinnacles, Danube water strip in front.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  SphereGeometry,
  Vector2,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const DOME = "#8d5a4e"; // muted oxidized rust of the real dome

export function build(): Group {
  const g = new Group();
  const white = mat(TONES.white);
  const stone = mat(TONES.stone);
  const stoneDark = mat(TONES.stoneDark);
  const slate = mat(TONES.slate);
  const dome = mat(DOME);

  g.add(plazaDisc(0.36));

  // ---- Danube: water slab along the front (+z) edge ----
  const water = new Mesh(new BoxGeometry(0.6, 0.012, 0.13), mat(TONES.water));
  water.position.set(0, 0.007, 0.145);
  g.add(water);
  const quay = new Mesh(new BoxGeometry(0.64, 0.026, 0.06), stone);
  quay.position.set(0, 0.014, 0.055);
  g.add(quay);

  // ---- Long main body ----
  const CZ = -0.045; // building center z
  const plinth = new Mesh(new BoxGeometry(0.68, 0.03, 0.15), stone);
  plinth.position.set(0, 0.025, CZ);
  g.add(plinth);
  const body = new Mesh(new BoxGeometry(0.66, 0.08, 0.125), white);
  body.position.set(0, 0.08, CZ);
  g.add(body);

  // gothic window strips on both long facades
  const winGeo = new BoxGeometry(0.013, 0.048, 0.008);
  for (const x of [0.105, 0.135, 0.165, 0.195, 0.225]) {
    for (const sx of [1, -1]) {
      for (const sz of [1, -1]) {
        const w = new Mesh(winGeo, stoneDark);
        w.position.set(sx * x, 0.08, CZ + sz * 0.0625);
        g.add(w);
      }
    }
  }

  // ---- Pitched roof over the long body ----
  const roofShape = new Shape();
  roofShape.moveTo(-0.0655, 0);
  roofShape.lineTo(0.0655, 0);
  roofShape.lineTo(0, 0.05);
  roofShape.closePath();
  const roofGeo = new ExtrudeGeometry(roofShape, {
    depth: 0.64,
    bevelEnabled: false,
  });
  roofGeo.translate(0, 0, -0.32);
  roofGeo.rotateY(Math.PI / 2);
  const roof = new Mesh(roofGeo, slate);
  roof.position.set(0, 0.118, CZ);
  g.add(roof);

  // ---- Central pavilion under the dome ----
  const center = new Mesh(new BoxGeometry(0.17, 0.155, 0.18), white);
  center.position.set(0, 0.115, CZ);
  g.add(center);
  const centerCornice = new Mesh(new BoxGeometry(0.182, 0.012, 0.192), stone);
  centerCornice.position.set(0, 0.196, CZ);
  g.add(centerCornice);

  // front gable + portal + rose window on the river facade
  const gableShape = new Shape();
  gableShape.moveTo(-0.05, 0);
  gableShape.lineTo(0.05, 0);
  gableShape.lineTo(0, 0.04);
  gableShape.closePath();
  const gableGeo = new ExtrudeGeometry(gableShape, {
    depth: 0.014,
    bevelEnabled: false,
  });
  const gable = new Mesh(gableGeo, stone);
  gable.position.set(0, 0.196, CZ + 0.09);
  g.add(gable);
  const portal = new Mesh(new BoxGeometry(0.05, 0.07, 0.008), stoneDark);
  portal.position.set(0, 0.075, CZ + 0.09);
  g.add(portal);
  const rose = new Mesh(new CylinderGeometry(0.016, 0.016, 0.008, 12), stoneDark);
  rose.rotation.x = Math.PI / 2;
  rose.position.set(0, 0.15, CZ + 0.09);
  g.add(rose);

  // ---- Drum + ribbed dome + lantern spire ----
  const drum = new Mesh(new CylinderGeometry(0.058, 0.063, 0.07, 16), white);
  drum.position.set(0, 0.225, CZ);
  g.add(drum);
  const drumBand = new Mesh(
    new CylinderGeometry(0.0595, 0.0605, 0.022, 16),
    stoneDark
  );
  drumBand.position.set(0, 0.235, CZ);
  g.add(drumBand);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const pin = new Mesh(new ConeGeometry(0.006, 0.026, 4), stone);
    pin.position.set(Math.cos(a) * 0.064, 0.268, CZ + Math.sin(a) * 0.064);
    g.add(pin);
  }
  const domeProfile = [
    new Vector2(0.06, 0),
    new Vector2(0.063, 0.02),
    new Vector2(0.057, 0.048),
    new Vector2(0.044, 0.075),
    new Vector2(0.026, 0.098),
    new Vector2(0.011, 0.114),
    new Vector2(0, 0.122),
  ];
  const cupola = new Mesh(new LatheGeometry(domeProfile, 12), dome);
  cupola.position.set(0, 0.26, CZ);
  g.add(cupola);
  const lantern = new Mesh(new CylinderGeometry(0.011, 0.013, 0.024, 8), white);
  lantern.position.set(0, 0.39, CZ);
  g.add(lantern);
  const spire = new Mesh(new ConeGeometry(0.009, 0.08, 8), dome);
  spire.position.set(0, 0.442, CZ);
  g.add(spire);
  const tip = new Mesh(new SphereGeometry(0.006, 6, 4), mat(TONES.gold));
  tip.position.set(0, 0.487, CZ);
  g.add(tip);

  // ---- Two gothic towers flanking the dome ----
  for (const sx of [1, -1]) {
    const tower = new Mesh(new BoxGeometry(0.034, 0.2, 0.034), white);
    tower.position.set(sx * 0.115, 0.12, CZ + 0.045);
    g.add(tower);
    const ledge = new Mesh(new BoxGeometry(0.042, 0.01, 0.042), stone);
    ledge.position.set(sx * 0.115, 0.222, CZ + 0.045);
    g.add(ledge);
    const tSpire = new Mesh(new ConeGeometry(0.025, 0.085, 4), dome);
    tSpire.rotation.y = Math.PI / 4;
    tSpire.position.set(sx * 0.115, 0.27, CZ + 0.045);
    g.add(tSpire);
  }

  // ---- End pavilions with pyramid roofs + corner pinnacles ----
  for (const sx of [1, -1]) {
    const X = sx * 0.3;
    const pav = new Mesh(new BoxGeometry(0.085, 0.115, 0.14), white);
    pav.position.set(X, 0.09, CZ);
    g.add(pav);
    const cornice = new Mesh(new BoxGeometry(0.095, 0.01, 0.15), stone);
    cornice.position.set(X, 0.152, CZ);
    g.add(cornice);
    const pRoof = new Mesh(new CylinderGeometry(0, 0.046, 0.055, 4), slate);
    pRoof.rotation.y = Math.PI / 4;
    pRoof.scale.z = 1.35;
    pRoof.position.set(X, 0.184, CZ);
    g.add(pRoof);
    const pSpire = new Mesh(new ConeGeometry(0.007, 0.065, 4), slate);
    pSpire.position.set(X, 0.24, CZ);
    g.add(pSpire);
    for (const cx of [1, -1]) {
      for (const cz of [1, -1]) {
        const pin = new Mesh(new ConeGeometry(0.006, 0.032, 4), stone);
        pin.position.set(X + cx * 0.04, 0.17, CZ + cz * 0.065);
        g.add(pin);
      }
    }
  }

  // ---- Mid-wing spirelets breaking the roofline (gothic rhythm) ----
  for (const sx of [1, -1]) {
    const mid = new Mesh(new BoxGeometry(0.026, 0.06, 0.026), white);
    mid.position.set(sx * 0.185, 0.14, CZ + 0.052);
    g.add(mid);
    const midSpire = new Mesh(new ConeGeometry(0.018, 0.05, 4), slate);
    midSpire.rotation.y = Math.PI / 4;
    midSpire.position.set(sx * 0.185, 0.195, CZ + 0.052);
    g.add(midSpire);
  }

  // ---- Pinnacle rows along both rooflines ----
  const shaftGeo = new BoxGeometry(0.007, 0.024, 0.007);
  const pinGeo = new ConeGeometry(0.005, 0.03, 4);
  for (const x of [0.105, 0.135, 0.165, 0.215, 0.245]) {
    for (const sx of [1, -1]) {
      for (const sz of [1, -1]) {
        const shaft = new Mesh(shaftGeo, white);
        shaft.position.set(sx * x, 0.13, CZ + sz * 0.063);
        g.add(shaft);
        const pin = new Mesh(pinGeo, white);
        pin.position.set(sx * x, 0.157, CZ + sz * 0.063);
        g.add(pin);
      }
    }
  }

  return g;
}
