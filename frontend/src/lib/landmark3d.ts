// 3D landmark registry + globe placement helpers.
//
// Monuments are stylized "papercraft" parametric models (unit height 1 along
// +Y, base at y=0), loaded per-country via dynamic import so the globe bundle
// stays slim. A future asset pipeline (curated/AI-generated .glb) plugs into
// the same loadLandmarkModel() contract without touching the globe code.

import { Mesh, Object3D, Quaternion, Vector3 } from "three";
import type { Group } from "three";

const UP = new Vector3(0, 1, 0);

const BUILDERS: Record<string, () => Promise<{ build: () => Group }>> = {
  FR: () => import("./monuments/fr"),
  EG: () => import("./monuments/eg"),
  GB: () => import("./monuments/gb"),
  IT: () => import("./monuments/it"),
  KR: () => import("./monuments/kr"),
  KP: () => import("./monuments/kp"),
  AE: () => import("./monuments/ae"),
  JP: () => import("./monuments/jp"),
};

export function hasLandmarkModel(iso: string | null): boolean {
  return iso !== null && iso in BUILDERS;
}

export async function loadLandmarkModel(iso: string): Promise<Group | null> {
  const loader = BUILDERS[iso];
  if (!loader) return null;
  const monument = await loader();
  return monument.build();
}

/**
 * Position a unit-height model on the sphere: base on the surface at the
 * given anchor point, +Y aligned with the surface normal, scaled to `height`
 * world units.
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
