// PoC: stylized procedural 3D landmarks placed on the globe surface.
// Unit convention: models are built with height 1 along +Y, base at y=0;
// placeOnGlobe() scales them to world units and aligns +Y with the surface
// normal so they stand upright anywhere on the sphere.

import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  Quaternion,
  Vector3,
} from "three";

const UP = new Vector3(0, 1, 0);

function lambert(color: Color | string): MeshLambertMaterial {
  return new MeshLambertMaterial({
    color: color instanceof Color ? color : new Color(color),
    flatShading: true,
  });
}

/**
 * Stylized Eiffel-like tower: four splayed legs, two platforms, tapering
 * shaft, spire. Recognizable silhouette at diorama scale, ~300 triangles.
 */
export function buildEiffelTower(): Group {
  const g = new Group();
  const iron = lambert("#8a6134");
  const ironDark = lambert("#6f4d26");
  const plaza = lambert("#dfe5f0");

  // plaza disc grounds the monument
  const disc = new Mesh(new CylinderGeometry(0.34, 0.34, 0.012, 28), plaza);
  disc.position.y = 0.006;
  g.add(disc);

  // four slender legs, splayed
  const legGeometry = new BoxGeometry(0.034, 0.36, 0.034);
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
    const leg = new Mesh(legGeometry, iron);
    leg.position.set(sx * 0.105, 0.17, sz * 0.105);
    leg.rotation.z = -sx * 0.3;
    leg.rotation.x = sz * 0.3;
    g.add(leg);
  }
  // first platform
  const p1 = new Mesh(new BoxGeometry(0.22, 0.024, 0.22), ironDark);
  p1.position.y = 0.335;
  g.add(p1);
  // mid tapering shaft
  const mid = new Mesh(new CylinderGeometry(0.042, 0.084, 0.24, 4, 1), iron);
  mid.rotation.y = Math.PI / 4;
  mid.position.y = 0.46;
  g.add(mid);
  // second platform
  const p2 = new Mesh(new BoxGeometry(0.115, 0.02, 0.115), ironDark);
  p2.position.y = 0.59;
  g.add(p2);
  // upper shaft, long and slender
  const upper = new Mesh(new CylinderGeometry(0.016, 0.04, 0.31, 4, 1), iron);
  upper.rotation.y = Math.PI / 4;
  upper.position.y = 0.755;
  g.add(upper);
  // top deck + spire
  const top = new Mesh(new BoxGeometry(0.05, 0.016, 0.05), ironDark);
  top.position.y = 0.918;
  g.add(top);
  const spire = new Mesh(new CylinderGeometry(0.003, 0.01, 0.09, 6, 1), iron);
  spire.position.y = 0.965;
  g.add(spire);
  return g;
}

export interface Landmark3D {
  build: () => Group;
  /** real-world coordinates of the monument itself */
  lat: number;
  lng: number;
}

/** PoC registry: iso → model + coords. Real rollout would load .glb assets. */
export const LANDMARK_MODELS: Record<string, Landmark3D> = {
  FR: { build: buildEiffelTower, lat: 48.8584, lng: 2.2945 },
};

/**
 * Position a unit-height model on the sphere: base on the surface at
 * lat/lng, +Y aligned with the surface normal, scaled to `height` world
 * units. `surfacePoint` is the already-computed anchor on the sphere.
 */
export function placeOnGlobe(
  model: Object3D,
  surfacePoint: Vector3,
  height: number
): void {
  model.position.copy(surfacePoint);
  model.quaternion.copy(
    new Quaternion().setFromUnitVectors(UP, surfacePoint.clone().normalize())
  );
  model.scale.setScalar(height);
}

export function disposeModel(model: Object3D): void {
  model.traverse((child) => {
    if (child instanceof Mesh) {
      child.geometry.dispose();
      const material = child.material;
      for (const m of Array.isArray(material) ? material : [material]) {
        m.dispose();
      }
    }
  });
}
