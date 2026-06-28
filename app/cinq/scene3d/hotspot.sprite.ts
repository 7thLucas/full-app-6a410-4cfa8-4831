import * as THREE from "three";
import type { HotspotDef } from "./scene.types";
import { PALETTE } from "./scene.palette";

/**
 * Builds a floating, tappable marker sprite for a hotspot. Travel/portal markers
 * read as a soft gold ring; request markers get a warmer filled disc with a dot,
 * so guests can tell "go here" from "ask for something" at a glance.
 *
 * The label is baked into a small canvas texture (cheap, crisp, no font loading
 * dependency on the GPU side) and shown as a billboard plane above the marker.
 */

function makeLabelTexture(def: HotspotDef): THREE.CanvasTexture {
  const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1);
  const w = 512;
  const h = 160;
  const canvas = document.createElement("canvas");
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  // Pill background
  const pad = 18;
  const radius = 28;
  ctx.fillStyle = "rgba(11,31,42,0.82)";
  roundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, radius);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(200,162,75,0.7)";
  ctx.stroke();

  // Title
  ctx.fillStyle = "#F5EFE3";
  ctx.font = "600 40px Georgia, 'Cormorant Garamond', serif";
  ctx.textBaseline = "middle";
  ctx.fillText(def.label, pad + 26, def.hint ? 64 : 80);

  // Hint
  if (def.hint) {
    ctx.fillStyle = "rgba(224,188,107,0.9)";
    ctx.font = "400 24px Arial, 'Lato', sans-serif";
    ctx.fillText(def.hint, pad + 26, 104);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export interface HotspotObject {
  def: HotspotDef;
  group: THREE.Group;
  /** The mesh used for raycasting (the disc). */
  hitMesh: THREE.Mesh;
  ring?: THREE.Mesh;
  setHover(on: boolean): void;
}

export function buildHotspot(def: HotspotDef): HotspotObject {
  const group = new THREE.Group();
  group.position.set(...def.position);

  const isRequest = def.kind === "request";
  const accent = isRequest ? PALETTE.goldBright : PALETTE.gold;

  // Tappable disc
  const discMat = new THREE.MeshBasicMaterial({
    color: accent,
    transparent: true,
    opacity: isRequest ? 0.85 : 0.4,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const hitMesh = new THREE.Mesh(new THREE.CircleGeometry(0.42, 32), discMat);
  group.add(hitMesh);

  // Outer ring (animated pulse)
  const ringMat = new THREE.MeshBasicMaterial({
    color: accent,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.58, 32), ringMat);
  group.add(ring);

  // Center dot for request markers
  if (isRequest) {
    const dot = new THREE.Mesh(
      new THREE.CircleGeometry(0.16, 24),
      new THREE.MeshBasicMaterial({
        color: PALETTE.background,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      }),
    );
    dot.position.z = 0.01;
    group.add(dot);
  }

  // Floating label
  const labelTex = makeLabelTexture(def);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 0.5),
    new THREE.MeshBasicMaterial({
      map: labelTex,
      transparent: true,
      depthWrite: false,
    }),
  );
  label.position.y = 0.75;
  group.add(label);

  // Billboard children toward camera each frame via userData flag
  group.userData.billboard = true;

  const setHover = (on: boolean) => {
    discMat.opacity = on ? (isRequest ? 1 : 0.65) : isRequest ? 0.85 : 0.4;
    ringMat.opacity = on ? 0.9 : 0.6;
    const s = on ? 1.15 : 1;
    group.scale.setScalar(s);
  };

  return { def, group, hitMesh, ring, setHover };
}
