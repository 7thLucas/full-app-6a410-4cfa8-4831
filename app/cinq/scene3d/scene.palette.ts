/**
 * Stylized-luxe palette for the 3D world — deep navy/teal base with warm gold
 * accents, mirroring Cinq's brand tokens. Kept as plain hex numbers so the
 * three.js layer never has to read CSS variables at runtime.
 */
export const PALETTE = {
  // Base navy/teal
  background: 0x0b1f2a,
  fog: 0x0b242f,
  floorDeep: 0x0e2c33,
  floorLight: 0x13323d,
  wall: 0x122e38,
  wallTrim: 0x1e4450,
  // Warm gold accents
  gold: 0xc8a24b,
  goldBright: 0xe0bc6b,
  // Soft warm light
  warmLight: 0xffe7c2,
  coolFill: 0x6fa0b0,
  // Supporting stylized tones
  cream: 0xf5efe3,
  teal: 0x2f7d72,
  water: 0x1f6f74,
  waterDeep: 0x124a52,
  plant: 0x3f7d5c,
} as const;
