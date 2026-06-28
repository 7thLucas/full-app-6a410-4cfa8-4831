import * as THREE from "three";
import type { HotspotDef, SceneDef, SceneId } from "./scene.types";
import { SCENES } from "./scene.defs";
import { PALETTE } from "./scene.palette";
import { buildLobby } from "./geometry.lobby";
import { buildPool } from "./geometry.pool";
import { buildHotspot, type HotspotObject } from "./hotspot.sprite";

export interface EngineCallbacks {
  /** A `request` hotspot was tapped — open the in-world panel. */
  onRequestHotspot: (def: HotspotDef) => void;
  /** A `portal` hotspot was tapped — scene changed. */
  onSceneChange: (id: SceneId) => void;
  /** Emitted once the first frame has rendered (hide the loader). */
  onReady: () => void;
}

/**
 * CinqEngine — a lean, vanilla three.js controller for the stylized-luxe hotel.
 *
 * Responsibilities:
 *  - own the renderer / camera / lights,
 *  - build a scene's geometry + hotspots on demand and dispose the old one,
 *  - glide the camera smoothly between authored waypoints (tap-to-travel),
 *  - raycast taps to hotspots (travel / portal / request),
 *  - keep the frame loop cheap and pause when the tab is hidden.
 *
 * It deliberately holds NO product logic — request hotspots are surfaced to
 * React via `onRequestHotspot`, which wires into Cinq's existing request API.
 */
export class CinqEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private clock = new THREE.Clock();

  private cb: EngineCallbacks;
  private currentSceneId: SceneId = "lobby";
  private sceneRoot: THREE.Group | null = null;
  private waterMesh: THREE.Mesh | null = null;
  private hotspots: HotspotObject[] = [];
  private hovered: HotspotObject | null = null;

  // Camera glide state
  private camFromPos = new THREE.Vector3();
  private camToPos = new THREE.Vector3();
  private camFromTarget = new THREE.Vector3();
  private camToTarget = new THREE.Vector3();
  private lookTarget = new THREE.Vector3();
  private glideT = 1; // 1 = settled
  private glideDuration = 1.4;

  private rafId = 0;
  private running = false;
  private disposed = false;
  private ready = false;

  constructor(container: HTMLElement, cb: EngineCallbacks) {
    this.container = container;
    this.cb = cb;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.touchAction = "none";
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.cursor = "grab";

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(PALETTE.background);
    this.scene.fog = new THREE.Fog(PALETTE.fog, 14, 38);

    this.camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      120,
    );

    this.addLights();
    this.bindEvents();
    this.loadScene("lobby");
    this.start();
  }

  private addLights() {
    // Soft warm key from above
    const key = new THREE.DirectionalLight(PALETTE.warmLight, 1.1);
    key.position.set(6, 14, 6);
    this.scene.add(key);

    // Cool teal fill so navy reads, not black
    const fill = new THREE.HemisphereLight(PALETTE.coolFill, PALETTE.floorDeep, 0.55);
    this.scene.add(fill);

    // Gentle ambient lift
    this.scene.add(new THREE.AmbientLight(PALETTE.cream, 0.25));

    // Warm point glow at hotel center (chandelier / pool warmth)
    const warmCore = new THREE.PointLight(PALETTE.warmLight, 1.2, 30, 1.6);
    warmCore.position.set(0, 5, 0);
    this.scene.add(warmCore);
  }

  // ---- Scene lifecycle -----------------------------------------------------

  private loadScene(id: SceneId) {
    this.disposeScene();
    this.currentSceneId = id;
    const def = SCENES[id];

    const root = new THREE.Group();
    if (id === "lobby") {
      root.add(buildLobby());
      this.waterMesh = null;
    } else {
      const { group, water } = buildPool();
      root.add(group);
      this.waterMesh = water;
    }

    // Hotspots
    this.hotspots = def.hotspots.map((h) => {
      const obj = buildHotspot(h);
      root.add(obj.group);
      return obj;
    });

    this.scene.add(root);
    this.sceneRoot = root;

    // Seat camera at the start waypoint (snap, no glide on load)
    const start =
      def.waypoints.find((w) => w.id === def.startWaypointId) ?? def.waypoints[0];
    this.camera.position.set(...start.position);
    this.lookTarget.set(...start.target);
    this.camera.lookAt(this.lookTarget);
    this.glideT = 1;
  }

  private disposeScene() {
    if (!this.sceneRoot) return;
    this.scene.remove(this.sceneRoot);
    this.sceneRoot.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => disposeMaterial(m));
      else if (mat) disposeMaterial(mat);
    });
    this.sceneRoot = null;
    this.hotspots = [];
    this.hovered = null;
    this.waterMesh = null;
  }

  // ---- Camera travel -------------------------------------------------------

  private travelTo(def: SceneDef, waypointId: string) {
    const wp = def.waypoints.find((w) => w.id === waypointId);
    if (!wp) return;
    this.camFromPos.copy(this.camera.position);
    this.camToPos.set(...wp.position);
    this.camFromTarget.copy(this.lookTarget);
    this.camToTarget.set(...wp.target);
    this.glideT = 0;
  }

  private updateGlide(dt: number) {
    if (this.glideT >= 1) return;
    this.glideT = Math.min(1, this.glideT + dt / this.glideDuration);
    const e = easeInOutCubic(this.glideT);
    this.camera.position.lerpVectors(this.camFromPos, this.camToPos, e);
    this.lookTarget.lerpVectors(this.camFromTarget, this.camToTarget, e);
    this.camera.lookAt(this.lookTarget);
  }

  // ---- Input ---------------------------------------------------------------

  private bindEvents() {
    const el = this.renderer.domElement;
    el.addEventListener("pointermove", this.onPointerMove);
    el.addEventListener("pointerdown", this.onPointerDown);
    el.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("resize", this.onResize);
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  private pointerDownPos = { x: 0, y: 0 };
  private dragging = false;
  private dragYaw = 0; // subtle look-around offset

  private setPointer(e: PointerEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private onPointerMove = (e: PointerEvent) => {
    this.setPointer(e);
    // Subtle drag-to-peek (does not move position — just a gentle yaw)
    if (this.dragging) {
      const dx = e.clientX - this.pointerDownPos.x;
      this.dragYaw = THREE.MathUtils.clamp(dx * 0.0016, -0.35, 0.35);
    }
    this.updateHover();
  };

  private onPointerDown = (e: PointerEvent) => {
    this.pointerDownPos = { x: e.clientX, y: e.clientY };
    this.dragging = true;
    this.renderer.domElement.style.cursor = "grabbing";
  };

  private onPointerUp = (e: PointerEvent) => {
    this.dragging = false;
    this.renderer.domElement.style.cursor = "grab";
    const moved =
      Math.abs(e.clientX - this.pointerDownPos.x) +
      Math.abs(e.clientY - this.pointerDownPos.y);
    // Treat as a tap only if the pointer barely moved
    if (moved < 8) this.handleTap();
  };

  private updateHover() {
    if (!this.hotspots.length) return;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const meshes = this.hotspots.map((h) => h.hitMesh);
    const hit = this.raycaster.intersectObjects(meshes, false)[0];
    const obj = hit
      ? this.hotspots.find((h) => h.hitMesh === hit.object) ?? null
      : null;
    if (obj !== this.hovered) {
      this.hovered?.setHover(false);
      obj?.setHover(true);
      this.hovered = obj;
      this.renderer.domElement.style.cursor = obj
        ? "pointer"
        : this.dragging
          ? "grabbing"
          : "grab";
    }
  }

  private handleTap() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const meshes = this.hotspots.map((h) => h.hitMesh);
    const hit = this.raycaster.intersectObjects(meshes, false)[0];
    if (!hit) return;
    const obj = this.hotspots.find((h) => h.hitMesh === hit.object);
    if (!obj) return;
    const def = obj.def;
    if (def.kind === "travel" && def.waypointId) {
      this.travelTo(SCENES[this.currentSceneId], def.waypointId);
    } else if (def.kind === "portal" && def.to) {
      this.goToScene(def.to);
    } else if (def.kind === "request") {
      this.cb.onRequestHotspot(def);
    }
  }

  /** Public: switch scenes (used by portal hotspots and external UI). */
  goToScene(id: SceneId) {
    if (id === this.currentSceneId) return;
    this.loadScene(id);
    this.cb.onSceneChange(id);
  }

  /** Public: glide to a named waypoint in the current scene. */
  goToWaypoint(waypointId: string) {
    this.travelTo(SCENES[this.currentSceneId], waypointId);
  }

  getCurrentScene(): SceneId {
    return this.currentSceneId;
  }

  // ---- Frame loop ----------------------------------------------------------

  private start() {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.loop();
  }

  private stop() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private loop = () => {
    if (!this.running || this.disposed) return;
    this.rafId = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, this.clock.getDelta());
    const t = this.clock.elapsedTime;

    this.updateGlide(dt);

    // Apply gentle drag-yaw + idle sway around the look target
    if (this.glideT >= 1) {
      const sway = Math.sin(t * 0.3) * 0.012;
      const yaw = this.dragYaw + sway;
      const look = this.lookTarget.clone();
      // rotate look target slightly around camera up
      const dir = look.sub(this.camera.position);
      dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
      const peek = this.camera.position.clone().add(dir);
      this.camera.lookAt(peek);
    }

    // Billboard hotspot labels toward camera + pulse rings
    for (const h of this.hotspots) {
      if (h.group.userData.billboard) {
        h.group.quaternion.copy(this.camera.quaternion);
      }
      if (h.ring) {
        const pulse = 1 + Math.sin(t * 2 + h.group.position.x) * 0.08;
        h.ring.scale.setScalar(pulse);
      }
    }

    // Ripple pool water
    if (this.waterMesh) {
      const geo = this.waterMesh.geometry as THREE.PlaneGeometry;
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        pos.setZ(i, Math.sin(x * 1.2 + t * 1.4) * 0.06 + Math.cos(y * 1.5 + t) * 0.05);
      }
      pos.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);

    if (!this.ready) {
      this.ready = true;
      this.cb.onReady();
    }
  };

  // ---- Misc ----------------------------------------------------------------

  private onResize = () => {
    if (this.disposed) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private onVisibility = () => {
    if (document.hidden) this.stop();
    else if (!this.disposed) this.start();
  };

  dispose() {
    this.disposed = true;
    this.stop();
    this.renderer.domElement.removeEventListener("pointermove", this.onPointerMove);
    this.renderer.domElement.removeEventListener("pointerdown", this.onPointerDown);
    this.renderer.domElement.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.disposeScene();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

function disposeMaterial(m: THREE.Material) {
  const anyM = m as unknown as { map?: THREE.Texture };
  if (anyM.map) anyM.map.dispose();
  m.dispose();
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
