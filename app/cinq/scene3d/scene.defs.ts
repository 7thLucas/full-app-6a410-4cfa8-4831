import type { SceneDef, SceneId } from "./scene.types";

/**
 * Authored vantage points and hotspots for the two navigable spaces. These are
 * intentionally hand-placed (tap-a-spot-to-travel) so movement always lands on
 * a flattering, composed shot — premium, not free-roam.
 */

const LOBBY: SceneDef = {
  id: "lobby",
  name: "Grand Lobby",
  startWaypointId: "entrance",
  waypoints: [
    { id: "entrance", position: [0, 1.6, 9.5], target: [0, 1.5, 0] },
    { id: "reception", position: [0, 1.6, 3.4], target: [0, 1.4, -4.5] },
    { id: "lounge", position: [-5.2, 1.5, 2.5], target: [-6.2, 1.2, -2] },
    { id: "fountain", position: [4.6, 1.5, 2.2], target: [5.6, 0.9, -1.5] },
  ],
  hotspots: [
    // Travel
    {
      id: "go-reception",
      kind: "travel",
      label: "Reception",
      hint: "Approach the front desk",
      waypointId: "reception",
      position: [0, 1.3, 1.2],
    },
    {
      id: "go-lounge",
      kind: "travel",
      label: "The Lounge",
      hint: "Step to the fireside seats",
      waypointId: "lounge",
      position: [-5.4, 1.1, 3.2],
    },
    {
      id: "go-fountain",
      kind: "travel",
      label: "Atrium Fountain",
      hint: "Visit the gold fountain",
      waypointId: "fountain",
      position: [4.6, 1.0, 3.2],
    },
    {
      id: "back-entrance",
      kind: "travel",
      label: "Entrance",
      hint: "Return to the doors",
      waypointId: "entrance",
      position: [0, 1.3, 7.2],
    },
    // In-world requests
    {
      id: "req-service",
      kind: "request",
      label: "Concierge Desk",
      hint: "Request service & amenities",
      categoryId: "service",
      position: [-1.6, 1.5, -3.4],
    },
    {
      id: "req-spa-lobby",
      kind: "request",
      label: "Spa Booking",
      hint: "Reserve spa & wellness",
      categoryId: "spa",
      position: [1.6, 1.5, -3.4],
    },
    // Portal to pool
    {
      id: "to-pool",
      kind: "portal",
      label: "Pool Deck",
      hint: "Travel outside to the water",
      to: "pool",
      position: [6.4, 1.4, 5.0],
    },
  ],
};

const POOL: SceneDef = {
  id: "pool",
  name: "Pool Deck",
  startWaypointId: "deck",
  waypoints: [
    { id: "deck", position: [0, 1.7, 9], target: [0, 1, 0] },
    { id: "cabana", position: [-5.5, 1.6, 4], target: [-6.5, 1, -1] },
    { id: "bar", position: [5.4, 1.6, 3.6], target: [6.4, 1.1, -1.5] },
    { id: "wateredge", position: [0, 1.5, 4.2], target: [0, 0.4, -5] },
  ],
  hotspots: [
    {
      id: "go-cabana",
      kind: "travel",
      label: "Cabana",
      hint: "Recline in the shade",
      waypointId: "cabana",
      position: [-5.6, 1.1, 5.4],
    },
    {
      id: "go-bar",
      kind: "travel",
      label: "Pool Bar",
      hint: "Step up to the bar",
      waypointId: "bar",
      position: [5.4, 1.1, 5.0],
    },
    {
      id: "go-wateredge",
      kind: "travel",
      label: "Water's Edge",
      hint: "Look across the pool",
      waypointId: "wateredge",
      position: [0, 1.1, 6.4],
    },
    {
      id: "back-deck",
      kind: "travel",
      label: "Deck",
      hint: "Return to the deck",
      waypointId: "deck",
      position: [2.4, 1.2, 7.6],
    },
    // In-world requests
    {
      id: "req-dining-bar",
      kind: "request",
      label: "Poolside Dining",
      hint: "Order food & drinks",
      categoryId: "dining",
      position: [5.4, 1.5, 1.8],
    },
    {
      id: "req-amenities-pool",
      kind: "request",
      label: "Towel & Service",
      hint: "Request poolside amenities",
      categoryId: "amenities",
      position: [-5.5, 1.5, 1.8],
    },
    // Portal back to lobby
    {
      id: "to-lobby",
      kind: "portal",
      label: "Grand Lobby",
      hint: "Head back inside",
      to: "lobby",
      position: [-3.2, 1.4, 8.4],
    },
  ],
};

export const SCENES: Record<SceneId, SceneDef> = {
  lobby: LOBBY,
  pool: POOL,
};

export const SCENE_ORDER: SceneId[] = ["lobby", "pool"];
