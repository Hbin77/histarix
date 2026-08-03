// Vasa (Vasamuseet, Stockholm) — papercraft miniature of the 1628 warship:
// tarred galleon hull with double gunport rows, tall ornate stern castle with
// gold trim and lanterns, beakhead + steeved bowsprit, three masts with bare
// yards, all resting on a low dry-dock cradle.

import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Shape,
  SphereGeometry,
  Vector3,
} from "three";
import { mat, plazaDisc, TONES } from "./materials";

const HULL = "#6b563f"; // tarred oak
const HULL_DARK = "#4c3c2b"; // wales / lower hull
const PORT = "#3b2e21"; // open gunports
const MAST = "#7a6248"; // spar wood

// deck-plan constants shared by the strakes and the gunport placer
const STERN = -0.26;
const TIP = 0.27;
const SHOULDER = TIP - (TIP - STERN) * 0.34;

/** Deck-plan outline: flat transom at `stern`, bulged sides, pointed bow. */
function hullPlan(stern: number, tip: number, w: number): Shape {
  const s = new Shape();
  const shoulder = tip - (tip - stern) * 0.34;
  const mid = stern + (tip - stern) * 0.42;
  s.moveTo(stern, -w * 0.8);
  s.quadraticCurveTo(mid, -w * 1.1, shoulder, -w * 0.8);
  s.quadraticCurveTo(tip - 0.015, -w * 0.28, tip, 0);
  s.quadraticCurveTo(tip - 0.015, w * 0.28, shoulder, w * 0.8);
  s.quadraticCurveTo(mid, w * 1.1, stern, w * 0.8);
  s.closePath();
  return s;
}

/** Approximate half-breadth of the side curve at station x (belt width w). */
function sideZ(x: number, w: number): number {
  const t = Math.min(1, Math.max(0, (x - STERN) / (SHOULDER - STERN)));
  const a = 0.8 * w;
  const c = 1.1 * w;
  return (1 - t) * (1 - t) * a + 2 * t * (1 - t) * c + t * t * a;
}

/** Horizontal hull strake: extruded deck plan, bottom at y0. */
function slab(
  stern: number,
  tip: number,
  w: number,
  y0: number,
  h: number,
  m: MeshLambertMaterial
): Mesh {
  const geo = new ExtrudeGeometry(hullPlan(stern, tip, w), {
    depth: h,
    bevelEnabled: false,
    curveSegments: 4,
  });
  const mesh = new Mesh(geo, m);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y0;
  return mesh;
}

/** Thin spar/stay between two points. */
function strut(a: Vector3, b: Vector3, r: number, m: MeshLambertMaterial): Mesh {
  const len = a.distanceTo(b);
  const mesh = new Mesh(new CylinderGeometry(r, r, len, 5), m);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(
    new Vector3(0, 1, 0),
    b.clone().sub(a).normalize()
  );
  return mesh;
}

function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  m: MeshLambertMaterial
): Mesh {
  const mesh = new Mesh(new BoxGeometry(w, h, d), m);
  mesh.position.set(x, y, z);
  return mesh;
}

export function build(): Group {
  const g = new Group();
  g.add(plazaDisc(0.36));

  const ship = new Group();
  ship.position.x = -0.07; // recenter: bowsprit reaches far forward
  g.add(ship);

  const hull = mat(HULL);
  const hullDark = mat(HULL_DARK);
  const port = mat(PORT);
  const red = mat(TONES.woodRed);
  const gold = mat(TONES.gold);
  const deck = mat(TONES.sandDark);
  const mast = mat(MAST);
  const cradle = mat(TONES.ink);

  // ---- dry-dock cradle: two transverse chocks + keel line ----
  for (const x of [-0.1, 0.1]) {
    ship.add(box(0.04, 0.055, 0.16, x, 0.0395, 0, cradle));
  }
  ship.add(box(0.44, 0.032, 0.016, 0.0, 0.05, 0, hullDark)); // keel

  // ---- hull strakes (stepped papercraft cross-section) ----
  ship.add(slab(-0.235, 0.24, 0.05, 0.05, 0.06, hullDark)); // lower hull
  ship.add(slab(STERN, TIP, 0.068, 0.105, 0.095, hull)); // gun-deck belt
  ship.add(slab(-0.265, 0.272, 0.0695, 0.146, 0.011, hullDark)); // mid wale
  ship.add(slab(-0.265, 0.272, 0.0695, 0.196, 0.01, hullDark)); // sheer rail
  ship.add(slab(-0.255, 0.255, 0.06, 0.204, 0.032, red)); // bulwark strake
  ship.add(slab(-0.245, 0.24, 0.05, 0.236, 0.012, deck)); // weather deck

  // ---- double row of open gunports (the Vasa signature) ----
  for (const x of [-0.18, -0.11, -0.04, 0.03, 0.1, 0.17]) {
    for (const y of [0.125, 0.176]) {
      const z = sideZ(x, 0.068);
      ship.add(box(0.017, 0.016, 0.012, x, y, z, port));
      ship.add(box(0.017, 0.016, 0.012, x, y, -z, port));
    }
  }

  // ---- forecastle step at the bow ----
  ship.add(box(0.08, 0.028, 0.092, 0.19, 0.25, 0, red));

  // ---- stern castle: rising quarterdeck/poop + tall raked transom ----
  ship.add(box(0.14, 0.05, 0.115, -0.19, 0.264, 0, red));
  ship.add(box(0.085, 0.042, 0.1, -0.227, 0.31, 0, red));
  const stern = new Group();
  stern.position.set(-0.272, 0.315, 0);
  stern.rotation.z = 0.12; // top of the transom leans aft (Vasa rake)
  ship.add(stern);
  stern.add(box(0.02, 0.185, 0.095, 0, 0, 0, red)); // transom plate
  for (const dy of [-0.066, -0.016, 0.034]) {
    stern.add(box(0.008, 0.012, 0.084, -0.011, dy, 0, gold)); // ornament bands
  }
  stern.add(box(0.01, 0.016, 0.048, -0.011, 0.074, 0, gold)); // crest
  for (const z of [-0.032, 0.032]) {
    const lamp = new Mesh(new SphereGeometry(0.0095, 8, 6), gold);
    lamp.position.set(0, 0.1, z); // stern lanterns perched on the transom
    stern.add(lamp);
  }
  // gold side galleries along the quarter
  for (const z of [-0.058, 0.058]) {
    ship.add(box(0.1, 0.008, 0.007, -0.19, 0.253, z, gold));
  }

  // ---- bow: beakhead + steeved bowsprit ----
  const beak = new Mesh(new CylinderGeometry(0.005, 0.019, 0.15, 4), hull);
  beak.rotation.z = -Math.PI / 2 + 0.22; // points forward, slight rise
  beak.position.set(0.315, 0.208, 0);
  ship.add(beak);
  const beakTip = new Mesh(new SphereGeometry(0.009, 8, 6), gold); // figurehead
  beakTip.position.set(0.388, 0.224, 0);
  ship.add(beakTip);
  const sprit = new Mesh(new CylinderGeometry(0.004, 0.0075, 0.21, 5), mast);
  sprit.rotation.z = -Math.PI / 2 + 0.48; // ~27° steeve
  sprit.position.set(0.335, 0.29, 0);
  ship.add(sprit);

  // ---- masts: fore / main with fighting tops, mizzen single pole ----
  const mastAt = (
    x: number,
    deckY: number,
    topY: number,
    headY: number,
    r: number
  ) => {
    const lower = new Mesh(
      new CylinderGeometry(r * 0.75, r, topY - deckY, 6),
      mast
    );
    lower.position.set(x, (deckY + topY) / 2, 0);
    ship.add(lower);
    const top = new Mesh(new CylinderGeometry(0.017, 0.021, 0.011, 8), hullDark);
    top.position.set(x, topY, 0);
    ship.add(top);
    const upper = new Mesh(
      new CylinderGeometry(r * 0.38, r * 0.62, headY - topY, 5),
      mast
    );
    upper.position.set(x, (topY + headY) / 2, 0);
    ship.add(upper);
  };
  mastAt(0.14, 0.21, 0.5, 0.78, 0.013); // fore
  mastAt(-0.03, 0.21, 0.58, 0.92, 0.015); // main
  const mizzen = new Mesh(new CylinderGeometry(0.005, 0.011, 0.41, 6), mast);
  mizzen.position.set(-0.155, 0.485, 0);
  ship.add(mizzen);

  // ---- bare yards (no sails), squared across the ship ----
  const yard = (x: number, y: number, len: number) => {
    const spar = new Mesh(
      new CylinderGeometry(0.0045, 0.0045, len, 5),
      hullDark
    );
    spar.rotation.x = Math.PI / 2;
    spar.position.set(x, y, 0);
    ship.add(spar);
  };
  yard(0.14, 0.335, 0.27); // fore course
  yard(0.14, 0.475, 0.2); // fore top
  yard(0.14, 0.63, 0.13); // fore topgallant
  yard(-0.03, 0.35, 0.32); // main course
  yard(-0.03, 0.555, 0.24); // main top
  yard(-0.03, 0.73, 0.15); // main topgallant
  // mizzen lateen yard, raked in the fore-aft plane
  const lateen = new Mesh(new CylinderGeometry(0.004, 0.004, 0.27, 5), hullDark);
  lateen.rotation.z = 0.62;
  lateen.position.set(-0.125, 0.53, 0);
  ship.add(lateen);

  // ---- standing rigging: stays give the sailing-ship triangle ----
  ship.add(
    strut(new Vector3(-0.03, 0.9, 0), new Vector3(0.14, 0.76, 0), 0.0022, mast)
  );
  ship.add(
    strut(new Vector3(0.14, 0.76, 0), new Vector3(0.428, 0.33, 0), 0.0022, mast)
  );
  ship.add(
    strut(new Vector3(-0.03, 0.9, 0), new Vector3(-0.155, 0.67, 0), 0.0022, mast)
  );

  // ---- masthead pennant trailing aft (muted Swedish blue) ----
  ship.add(box(0.05, 0.011, 0.002, -0.058, 0.925, 0, mat(TONES.domeBlue)));

  return g;
}
