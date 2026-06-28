import * as THREE from "three";
import { PALETTE } from "./scene.palette";

/**
 * Builds the stylized-luxe Pool Deck — an open-air evening terrace with a glowing
 * pool, cabanas, a gold-trimmed bar, and palms against a deep navy sky. Same
 * primitive-only, low-poly approach as the lobby for a lean payload.
 *
 * Returns the group plus the animated water mesh so the engine can ripple it.
 */
export function buildPool(): { group: THREE.Group; water: THREE.Mesh } {
  const group = new THREE.Group();

  const matDeck = new THREE.MeshStandardMaterial({
    color: PALETTE.floorLight,
    roughness: 0.85,
    metalness: 0.05,
  });
  const matGold = new THREE.MeshStandardMaterial({
    color: PALETTE.gold,
    roughness: 0.35,
    metalness: 0.6,
    emissive: PALETTE.gold,
    emissiveIntensity: 0.05,
  });
  const matCream = new THREE.MeshStandardMaterial({
    color: PALETTE.cream,
    roughness: 0.8,
  });

  // --- Deck floor ---
  const deck = new THREE.Mesh(new THREE.BoxGeometry(24, 0.2, 26), matDeck);
  deck.position.y = -0.1;
  deck.receiveShadow = true;
  group.add(deck);

  // Gold deck seams
  for (let i = -10; i <= 10; i += 2.5) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.21, 26), matGold);
    seam.position.set(i, -0.08, 0);
    seam.material = new THREE.MeshStandardMaterial({
      color: PALETTE.wallTrim,
      roughness: 0.7,
    });
    group.add(seam);
  }

  // --- The pool (sunken basin + glowing water) ---
  const poolWell = new THREE.Mesh(
    new THREE.BoxGeometry(10, 1.4, 6),
    new THREE.MeshStandardMaterial({
      color: PALETTE.waterDeep,
      roughness: 0.6,
    }),
  );
  poolWell.position.set(0, -0.8, -4);
  group.add(poolWell);

  // Gold pool coping
  const coping = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.18, 6.6), matGold);
  coping.position.set(0, 0.02, -4);
  group.add(coping);

  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(9.8, 5.8, 24, 16),
    new THREE.MeshStandardMaterial({
      color: PALETTE.water,
      roughness: 0.15,
      metalness: 0.5,
      transparent: true,
      opacity: 0.9,
      emissive: PALETTE.water,
      emissiveIntensity: 0.25,
    }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -0.15, -4);
  group.add(water);

  // --- Cabana (left) ---
  const cabana = new THREE.Group();
  cabana.position.set(-7, 0, -1);
  const postMat = matCream;
  for (const [px, pz] of [
    [-1.2, -1],
    [1.2, -1],
    [-1.2, 1],
    [1.2, 1],
  ] as const) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 2.6, 8),
      postMat,
    );
    post.position.set(px, 1.3, pz);
    post.castShadow = true;
    cabana.add(post);
  }
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.18, 2.6),
    new THREE.MeshStandardMaterial({ color: PALETTE.teal, roughness: 0.9 }),
  );
  canopy.position.y = 2.7;
  cabana.add(canopy);
  const bed = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.3, 1.2),
    matCream,
  );
  bed.position.set(0, 0.35, 0);
  bed.castShadow = true;
  cabana.add(bed);
  group.add(cabana);

  // --- Pool bar (right) ---
  const bar = new THREE.Group();
  bar.position.set(7.5, 0, -1);
  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 1.1, 1.2),
    new THREE.MeshStandardMaterial({ color: PALETTE.wallTrim, roughness: 0.6 }),
  );
  counter.position.y = 0.55;
  counter.castShadow = true;
  const counterTop = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.12, 1.4),
    matGold,
  );
  counterTop.position.y = 1.16;
  bar.add(counter, counterTop);
  // Stools
  for (const sx of [-1, 0, 1]) {
    const stool = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.2, 0.9, 12),
      matGold,
    );
    stool.position.set(sx, 0.45, 1.2);
    bar.add(stool);
  }
  // Back shelf glow
  const shelf = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 1.6, 0.2),
    new THREE.MeshStandardMaterial({
      color: PALETTE.floorLight,
      emissive: PALETTE.goldBright,
      emissiveIntensity: 0.35,
      roughness: 0.5,
    }),
  );
  shelf.position.set(0, 1.6, -0.9);
  bar.add(shelf);
  group.add(bar);

  // --- Palms framing the deck ---
  function palm(x: number, z: number, scale = 1) {
    const p = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.14, 3, 8),
      new THREE.MeshStandardMaterial({ color: 0x6b4f2a, roughness: 1 }),
    );
    trunk.position.y = 1.5;
    const fronds = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.MeshStandardMaterial({ color: PALETTE.plant, roughness: 1 }),
    );
    fronds.position.y = 3.1;
    fronds.scale.set(1.4, 0.6, 1.4);
    p.add(trunk, fronds);
    p.position.set(x, 0, z);
    p.scale.setScalar(scale);
    return p;
  }
  group.add(
    palm(-9, 7, 1.1),
    palm(9, 7, 1.1),
    palm(-9, -7, 1),
    palm(9, -7, 1),
  );

  // --- Low parapet wall at the far edge (infinity-pool horizon) ---
  const parapet = new THREE.Mesh(
    new THREE.BoxGeometry(24, 0.9, 0.4),
    matCream,
  );
  parapet.position.set(0, 0.45, -12.8);
  group.add(parapet);

  // Warm lantern posts along the deck
  function lantern(x: number, z: number) {
    const l = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 1.8, 8),
      matGold,
    );
    pole.position.y = 0.9;
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 12),
      new THREE.MeshStandardMaterial({
        color: PALETTE.warmLight,
        emissive: PALETTE.warmLight,
        emissiveIntensity: 1.6,
      }),
    );
    lamp.position.y = 1.9;
    l.add(pole, lamp);
    l.position.set(x, 0, z);
    return l;
  }
  group.add(
    lantern(-5, 6.5),
    lantern(5, 6.5),
    lantern(-2.8, -7.6),
    lantern(2.8, -7.6),
  );

  return { group, water };
}
