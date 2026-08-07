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
  AO: () => import("./monuments/ao"),
  AQ: () => import("./monuments/aq"),
  AR: () => import("./monuments/ar"),
  AT: () => import("./monuments/at"),
  AU: () => import("./monuments/au"),
  AZ: () => import("./monuments/az"),
  BA: () => import("./monuments/ba"),
  BD: () => import("./monuments/bd"),
  BE: () => import("./monuments/be"),
  BF: () => import("./monuments/bf"),
  BG: () => import("./monuments/bg"),
  BI: () => import("./monuments/bi"),
  BJ: () => import("./monuments/bj"),
  BN: () => import("./monuments/bn"),
  BO: () => import("./monuments/bo"),
  BR: () => import("./monuments/br"),
  BS: () => import("./monuments/bs"),
  BT: () => import("./monuments/bt"),
  BW: () => import("./monuments/bw"),
  BY: () => import("./monuments/by"),
  BZ: () => import("./monuments/bz"),
  CA: () => import("./monuments/ca"),
  CD: () => import("./monuments/cd"),
  CF: () => import("./monuments/cf"),
  CG: () => import("./monuments/cg"),
  CH: () => import("./monuments/ch"),
  CI: () => import("./monuments/ci"),
  CL: () => import("./monuments/cl"),
  CM: () => import("./monuments/cm"),
  CN: () => import("./monuments/cn"),
  CO: () => import("./monuments/co"),
  CR: () => import("./monuments/cr"),
  CU: () => import("./monuments/cu"),
  CY: () => import("./monuments/cy"),
  CZ: () => import("./monuments/cz"),
  DE: () => import("./monuments/de"),
  DJ: () => import("./monuments/dj"),
  DK: () => import("./monuments/dk"),
  DO: () => import("./monuments/do"),
  DZ: () => import("./monuments/dz"),
  EC: () => import("./monuments/ec"),
  EE: () => import("./monuments/ee"),
  EG: () => import("./monuments/eg"),
  EH: () => import("./monuments/eh"),
  ER: () => import("./monuments/er"),
  ES: () => import("./monuments/es"),
  ET: () => import("./monuments/et"),
  FI: () => import("./monuments/fi"),
  FJ: () => import("./monuments/fj"),
  FK: () => import("./monuments/fk"),
  FR: () => import("./monuments/fr"),
  GA: () => import("./monuments/ga"),
  GB: () => import("./monuments/gb"),
  GE: () => import("./monuments/ge"),
  GH: () => import("./monuments/gh"),
  GL: () => import("./monuments/gl"),
  GM: () => import("./monuments/gm"),
  GN: () => import("./monuments/gn"),
  GQ: () => import("./monuments/gq"),
  GR: () => import("./monuments/gr"),
  GT: () => import("./monuments/gt"),
  GW: () => import("./monuments/gw"),
  GY: () => import("./monuments/gy"),
  HN: () => import("./monuments/hn"),
  HR: () => import("./monuments/hr"),
  HT: () => import("./monuments/ht"),
  HU: () => import("./monuments/hu"),
  ID: () => import("./monuments/id"),
  IE: () => import("./monuments/ie"),
  IL: () => import("./monuments/il"),
  IN: () => import("./monuments/in"),
  IQ: () => import("./monuments/iq"),
  IR: () => import("./monuments/ir"),
  IS: () => import("./monuments/is"),
  IT: () => import("./monuments/it"),
  JM: () => import("./monuments/jm"),
  JO: () => import("./monuments/jo"),
  JP: () => import("./monuments/jp"),
  KE: () => import("./monuments/ke"),
  KG: () => import("./monuments/kg"),
  KH: () => import("./monuments/kh"),
  KP: () => import("./monuments/kp"),
  KR: () => import("./monuments/kr"),
  KW: () => import("./monuments/kw"),
  KZ: () => import("./monuments/kz"),
  LA: () => import("./monuments/la"),
  LB: () => import("./monuments/lb"),
  LK: () => import("./monuments/lk"),
  LR: () => import("./monuments/lr"),
  LS: () => import("./monuments/ls"),
  LT: () => import("./monuments/lt"),
  LU: () => import("./monuments/lu"),
  LV: () => import("./monuments/lv"),
  LY: () => import("./monuments/ly"),
  MA: () => import("./monuments/ma"),
  MD: () => import("./monuments/md"),
  ME: () => import("./monuments/me"),
  MG: () => import("./monuments/mg"),
  MK: () => import("./monuments/mk"),
  ML: () => import("./monuments/ml"),
  MM: () => import("./monuments/mm"),
  MN: () => import("./monuments/mn"),
  MR: () => import("./monuments/mr"),
  MW: () => import("./monuments/mw"),
  MX: () => import("./monuments/mx"),
  MY: () => import("./monuments/my"),
  MZ: () => import("./monuments/mz"),
  NA: () => import("./monuments/na"),
  NC: () => import("./monuments/nc"),
  NE: () => import("./monuments/ne"),
  NG: () => import("./monuments/ng"),
  NI: () => import("./monuments/ni"),
  NL: () => import("./monuments/nl"),
  NO: () => import("./monuments/no"),
  NP: () => import("./monuments/np"),
  NZ: () => import("./monuments/nz"),
  OM: () => import("./monuments/om"),
  PA: () => import("./monuments/pa"),
  PE: () => import("./monuments/pe"),
  PG: () => import("./monuments/pg"),
  PH: () => import("./monuments/ph"),
  PK: () => import("./monuments/pk"),
  PL: () => import("./monuments/pl"),
  PR: () => import("./monuments/pr"),
  PS: () => import("./monuments/ps"),
  PT: () => import("./monuments/pt"),
  PY: () => import("./monuments/py"),
  QA: () => import("./monuments/qa"),
  RO: () => import("./monuments/ro"),
  RS: () => import("./monuments/rs"),
  RU: () => import("./monuments/ru"),
  RW: () => import("./monuments/rw"),
  SA: () => import("./monuments/sa"),
  SB: () => import("./monuments/sb"),
  SD: () => import("./monuments/sd"),
  SE: () => import("./monuments/se"),
  SG: () => import("./monuments/sg"),
  SI: () => import("./monuments/si"),
  SK: () => import("./monuments/sk"),
  SL: () => import("./monuments/sl"),
  SN: () => import("./monuments/sn"),
  SO: () => import("./monuments/so"),
  SR: () => import("./monuments/sr"),
  SS: () => import("./monuments/ss"),
  SV: () => import("./monuments/sv"),
  SY: () => import("./monuments/sy"),
  SZ: () => import("./monuments/sz"),
  TD: () => import("./monuments/td"),
  TF: () => import("./monuments/tf"),
  TG: () => import("./monuments/tg"),
  TH: () => import("./monuments/th"),
  TJ: () => import("./monuments/tj"),
  TL: () => import("./monuments/tl"),
  TM: () => import("./monuments/tm"),
  TN: () => import("./monuments/tn"),
  TR: () => import("./monuments/tr"),
  TT: () => import("./monuments/tt"),
  TW: () => import("./monuments/tw"),
  TZ: () => import("./monuments/tz"),
  UA: () => import("./monuments/ua"),
  UG: () => import("./monuments/ug"),
  US: () => import("./monuments/us"),
  UY: () => import("./monuments/uy"),
  UZ: () => import("./monuments/uz"),
  VE: () => import("./monuments/ve"),
  VN: () => import("./monuments/vn"),
  VU: () => import("./monuments/vu"),
  XK: () => import("./monuments/xk"),
  YE: () => import("./monuments/ye"),
  ZA: () => import("./monuments/za"),
  ZM: () => import("./monuments/zm"),
  ZW: () => import("./monuments/zw"),
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
