// Shared "papercraft monument" material kit — flat-shaded Lambert in muted
// tones that sit well on the light atlas globe. Monument builders compose
// from these (plus mat() for landmark-specific colors kept equally muted).

import { Color, CylinderGeometry, Mesh, MeshLambertMaterial } from "three";

export function mat(hex: string): MeshLambertMaterial {
  return new MeshLambertMaterial({ color: new Color(hex), flatShading: true });
}

export const TONES = {
  stone: "#d8cdb9",
  stoneDark: "#bbae96",
  sand: "#dcc292",
  sandDark: "#c2a672",
  brick: "#c08b6c",
  brickDark: "#a06f52",
  iron: "#8a6134",
  ironDark: "#6f4d26",
  ink: "#3a4258",
  slate: "#7d879c",
  white: "#f2efe8",
  gold: "#cfa84c",
  roofGreen: "#5d8f74",
  roofTeal: "#4d8a82",
  woodRed: "#a35a4a",
  plaza: "#dfe5f0",
  snow: "#f5f4f0",
  forest: "#7a9367",
  water: "#8fb4d4",
  verdigris: "#6fa287",
  domeBlue: "#4f7ea8",
} as const;

/** Standard grounding disc most monuments stand on (base at y=0). */
export function plazaDisc(radius = 0.3): Mesh {
  const disc = new Mesh(
    new CylinderGeometry(radius, radius, 0.012, 28),
    mat(TONES.plaza)
  );
  disc.position.y = 0.006;
  return disc;
}
