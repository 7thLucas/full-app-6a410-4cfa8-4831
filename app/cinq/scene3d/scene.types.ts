/**
 * Shared types for the Cinq stylized-luxe 3D experience.
 *
 * The 3D layer is a *new medium* for the existing Cinq request loop — it does
 * not own any backend logic. Hotspots that place requests carry only the
 * payload the existing request API already understands (category + item +
 * routing), so the world reuses Cinq's heartbeat unchanged.
 */

export type SceneId = "lobby" | "pool";

/** A camera vantage point a guest can glide to by tapping a travel hotspot. */
export interface Waypoint {
  id: string;
  /** Eye position. */
  position: [number, number, number];
  /** Point the camera looks toward when seated at this vantage. */
  target: [number, number, number];
}

/** Kind of in-world hotspot. */
export type HotspotKind =
  /** Glide the camera to another waypoint in the same scene. */
  | "travel"
  /** Jump to the other scene (lobby <-> pool). */
  | "portal"
  /** Open the in-world request panel pre-filled to a category. */
  | "request";

export interface HotspotDef {
  id: string;
  kind: HotspotKind;
  label: string;
  /** World position of the floating marker. */
  position: [number, number, number];
  /** For `travel`: the waypoint id to glide to. */
  waypointId?: string;
  /** For `portal`: the scene to load. */
  to?: SceneId;
  /** For `request`: the configurable category id to pre-select (e.g. "dining"). */
  categoryId?: string;
  /** Short helper line shown under the label. */
  hint?: string;
}

export interface SceneDef {
  id: SceneId;
  name: string;
  waypoints: Waypoint[];
  /** Waypoint id the guest starts at. */
  startWaypointId: string;
  hotspots: HotspotDef[];
}

/** Event the engine emits up to React when a hotspot is activated. */
export interface HotspotActivation {
  hotspot: HotspotDef;
}
