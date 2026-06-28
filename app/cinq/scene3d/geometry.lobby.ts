import * as THREE from "three";
import { PALETTE } from "./scene.palette";

/**
 * Builds the stylized-luxe Grand Lobby as a single THREE.Group of low-poly
 * primitives. No external assets — everything is generated from boxes,
 * cylinders and lathed shapes so the scene streams instantly in the browser.
 *
 * Materials are flat/standard with low metalness for a charming, hand-rendered
 * five-star feel rather than photoreal.
 */
export function buildLobby(): THREE.Group {
  const group = new THREE.Group();

  const matWall = new THREE.MeshStandardMaterial({
    color: PALETTE.wall,
    roughness: 0.95,
    metalness: 0,
  });
  const matTrim = new THREE.MeshStandardMaterial({
    color: PALETTE.wallTrim,
    roughness: 0.7,
    metalness: 0.1,
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
    metalness: 0,
  });

  // --- Floor: two-tone inlay, like a polished marble rug ---
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(20, 0.2, 24),
    new THREE.MeshStandardMaterial({
      color: PALETTE.floorDeep,
      roughness: 0.4,
      metalness: 0.15,
    }),
  );
  floor.position.y = -0.1;
  floor.receiveShadow = true;
  group.add(floor);

  const inlay = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.21, 14),
    new THREE.MeshStandardMaterial({
      color: PALETTE.floorLight,
      roughness: 0.3,
      metalness: 0.2,
    }),
  );
  inlay.position.set(0, -0.09, -1);
  inlay.receiveShadow = true;
  group.add(inlay);

  // Gold inlay border around the rug
  const borderMat = matGold;
  const borderGeoLR = new THREE.BoxGeometry(0.15, 0.22, 14);
  const borderGeoFB = new THREE.BoxGeometry(8.3, 0.22, 0.15);
  [
    new THREE.Mesh(borderGeoLR, borderMat),
    new THREE.Mesh(borderGeoLR, borderMat),
  ].forEach((m, i) => {
    m.position.set(i === 0 ? -4.05 : 4.05, -0.08, -1);
    group.add(m);
  });
  [
    new THREE.Mesh(borderGeoFB, borderMat),
    new THREE.Mesh(borderGeoFB, borderMat),
  ].forEach((m, i) => {
    m.position.set(0, -0.08, i === 0 ? 6 : -8);
    group.add(m);
  });

  // --- Walls ---
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 0.4), matWall);
  backWall.position.set(0, 4, -11.8);
  backWall.receiveShadow = true;
  group.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 24), matWall);
  leftWall.position.set(-9.8, 4, 0);
  leftWall.receiveShadow = true;
  group.add(leftWall);

  const rightWall = leftWall.clone();
  rightWall.position.x = 9.8;
  group.add(rightWall);

  // Tall warm-lit niches on the back wall (gold panels)
  for (let i = -2; i <= 2; i++) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.1, 5, 0.1), matTrim);
    panel.position.set(i * 3, 3.4, -11.55);
    group.add(panel);
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 4),
      new THREE.MeshBasicMaterial({ color: PALETTE.goldBright }),
    );
    glow.position.set(i * 3, 3.4, -11.49);
    group.add(glow);
  }

  // Crown trim near ceiling
  const crown = new THREE.Mesh(new THREE.BoxGeometry(20, 0.25, 0.5), matGold);
  crown.position.set(0, 7.2, -11.6);
  group.add(crown);

  // --- Reception desk (curved, gold-fronted) ---
  const desk = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3, 1.1, 24, 1, false, Math.PI, Math.PI),
    matTrim,
  );
  desk.position.set(0, 0.55, -5);
  desk.castShadow = true;
  group.add(desk);

  const deskTop = new THREE.Mesh(
    new THREE.CylinderGeometry(3.25, 3.25, 0.12, 24, 1, false, Math.PI, Math.PI),
    matGold,
  );
  deskTop.position.set(0, 1.16, -5);
  group.add(deskTop);

  // --- Central chandelier (stylized gold rings + warm core) ---
  const chandelier = new THREE.Group();
  for (let r = 0; r < 3; r++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.6 - r * 0.45, 0.06, 8, 32),
      matGold,
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -r * 0.45;
    chandelier.add(ring);
  }
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 16, 16),
    new THREE.MeshStandardMaterial({
      color: PALETTE.warmLight,
      emissive: PALETTE.warmLight,
      emissiveIntensity: 1.4,
      roughness: 0.4,
    }),
  );
  chandelier.add(core);
  chandelier.position.set(0, 6.2, 0);
  group.add(chandelier);

  // --- Lounge cluster (left): sofas + low table + fireplace glow ---
  const lounge = new THREE.Group();
  lounge.position.set(-6.2, 0, -1.5);
  const sofaMat = new THREE.MeshStandardMaterial({
    color: PALETTE.teal,
    roughness: 0.9,
    metalness: 0,
  });
  function sofa(x: number, z: number, rotY: number) {
    const s = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 0.9), sofaMat);
    base.position.y = 0.35;
    base.castShadow = true;
    const back = new THREE.Mesh(new THREE.BoxGeometry(2, 0.7, 0.25), sofaMat);
    back.position.set(0, 0.7, -0.33);
    s.add(base, back);
    s.position.set(x, 0, z);
    s.rotation.y = rotY;
    return s;
  }
  lounge.add(sofa(0, 1.1, Math.PI));
  lounge.add(sofa(0, -1.1, 0));
  const table = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.6, 0.4, 16),
    matGold,
  );
  table.position.y = 0.2;
  lounge.add(table);
  group.add(lounge);

  // --- Fountain cluster (right) ---
  const fountain = new THREE.Group();
  fountain.position.set(6.2, 0, -1.5);
  const basin = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.6, 0.5, 24),
    matCream,
  );
  basin.position.y = 0.25;
  const waterTop = new THREE.Mesh(
    new THREE.CylinderGeometry(1.25, 1.25, 0.05, 24),
    new THREE.MeshStandardMaterial({
      color: PALETTE.water,
      roughness: 0.1,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85,
    }),
  );
  waterTop.position.y = 0.5;
  const spout = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 1.4, 12),
    matGold,
  );
  spout.position.y = 1.2;
  fountain.add(basin, waterTop, spout);
  group.add(fountain);

  // Potted palms by the entrance
  function palm(x: number, z: number) {
    const p = new THREE.Group();
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.28, 0.6, 12),
      matGold,
    );
    pot.position.y = 0.3;
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 1.3, 8),
      new THREE.MeshStandardMaterial({ color: 0x6b4f2a, roughness: 1 }),
    );
    trunk.position.y = 1.2;
    const leaves = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.7, 0),
      new THREE.MeshStandardMaterial({ color: PALETTE.plant, roughness: 1 }),
    );
    leaves.position.y = 2;
    leaves.scale.set(1.2, 0.7, 1.2);
    p.add(pot, trunk, leaves);
    p.position.set(x, 0, z);
    return p;
  }
  group.add(palm(-3, 8), palm(3, 8));

  // Soft warm rug under chandelier
  const rug = new THREE.Mesh(
    new THREE.CircleGeometry(3, 32),
    new THREE.MeshStandardMaterial({
      color: PALETTE.gold,
      roughness: 1,
      transparent: true,
      opacity: 0.12,
    }),
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.02;
  group.add(rug);

  return group;
}
