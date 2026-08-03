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
  AE: () => import("./monuments/ae"),
  AF: () => import("./monuments/af"),
  AL: () => import("./monuments/al"),
  AM: () => import("./monuments/am"),
  AR: () => import("./monuments/ar"),
  AT: () => import("./monuments/at"),
  AU: () => import("./monuments/au"),
  AZ: () => import("./monuments/az"),
  BD: () => import("./monuments/bd"),
  BE: () => import("./monuments/be"),
  BG: () => import("./monuments/bg"),
  BR: () => import("./monuments/br"),
  BY: () => import("./monuments/by"),
  CA: () => import("./monuments/ca"),
  CH: () => import("./monuments/ch"),
  CL: () => import("./monuments/cl"),
  CN: () => import("./monuments/cn"),
  CO: () => import("./monuments/co"),
  CR: () => import("./monuments/cr"),
  CU: () => import("./monuments/cu"),
  CY: () => import("./monuments/cy"),
  CZ: () => import("./monuments/cz"),
  DE: () => import("./monuments/de"),
  DK: () => import("./monuments/dk"),
  DZ: () => import("./monuments/dz"),
  EC: () => import("./monuments/ec"),
  EE: () => import("./monuments/ee"),
  EG: () => import("./monuments/eg"),
  ES: () => import("./monuments/es"),
  ET: () => import("./monuments/et"),
  FI: () => import("./monuments/fi"),
  FR: () => import("./monuments/fr"),
  GB: () => import("./monuments/gb"),
  GE: () => import("./monuments/ge"),
  GH: () => import("./monuments/gh"),
  GR: () => import("./monuments/gr"),
  HR: () => import("./monuments/hr"),
  HU: () => import("./monuments/hu"),
  ID: () => import("./monuments/id"),
  IE: () => import("./monuments/ie"),
  IL: () => import("./monuments/il"),
  IN: () => import("./monuments/in"),
  IQ: () => import("./monuments/iq"),
  IR: () => import("./monuments/ir"),
  IS: () => import("./monuments/is"),
  IT: () => import("./monuments/it"),
  JO: () => import("./monuments/jo"),
  JP: () => import("./monuments/jp"),
  KE: () => import("./monuments/ke"),
  KH: () => import("./monuments/kh"),
  KP: () => import("./monuments/kp"),
  KR: () => import("./monuments/kr"),
  KZ: () => import("./monuments/kz"),
  LA: () => import("./monuments/la"),
  LB: () => import("./monuments/lb"),
  LK: () => import("./monuments/lk"),
  LT: () => import("./monuments/lt"),
  LU: () => import("./monuments/lu"),
  MA: () => import("./monuments/ma"),
  MM: () => import("./monuments/mm"),
  MN: () => import("./monuments/mn"),
  MX: () => import("./monuments/mx"),
  MY: () => import("./monuments/my"),
  NG: () => import("./monuments/ng"),
  NL: () => import("./monuments/nl"),
  NO: () => import("./monuments/no"),
  NP: () => import("./monuments/np"),
  NZ: () => import("./monuments/nz"),
  PA: () => import("./monuments/pa"),
  PE: () => import("./monuments/pe"),
  PH: () => import("./monuments/ph"),
  PK: () => import("./monuments/pk"),
  PL: () => import("./monuments/pl"),
  PT: () => import("./monuments/pt"),
  RO: () => import("./monuments/ro"),
  RS: () => import("./monuments/rs"),
  RU: () => import("./monuments/ru"),
  SA: () => import("./monuments/sa"),
  SE: () => import("./monuments/se"),
  SG: () => import("./monuments/sg"),
  SI: () => import("./monuments/si"),
  SK: () => import("./monuments/sk"),
  SY: () => import("./monuments/sy"),
  TH: () => import("./monuments/th"),
  TN: () => import("./monuments/tn"),
  TR: () => import("./monuments/tr"),
  TW: () => import("./monuments/tw"),
  TZ: () => import("./monuments/tz"),
  UA: () => import("./monuments/ua"),
  US: () => import("./monuments/us"),
  VE: () => import("./monuments/ve"),
  VN: () => import("./monuments/vn"),
  ZA: () => import("./monuments/za"),
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
