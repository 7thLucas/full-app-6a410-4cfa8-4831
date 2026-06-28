import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Crown, MapPin, Compass, ChevronLeft } from "lucide-react";
import { cn } from "~/lib/utils";
import { useConfigurables } from "~/modules/configurables";
import { CinqEngine } from "./engine";
import { SCENES, SCENE_ORDER } from "./scene.defs";
import type { HotspotDef, SceneId } from "./scene.types";
import { InWorldRequestPanel } from "./InWorldRequestPanel";
import { useGuestName } from "../client/use-identity";
import { usePoll } from "../client/use-poll";
import { fetchGuestRequests } from "../client/requests.api";
import { StatusBadge } from "../ui/StatusBadge";
import type { GuestRole, HotelRequestDTO } from "../client/types";

/**
 * ExploreExperience — the guest-facing 3D world. Mounts the vanilla three.js
 * engine into a container ref (client-only) and frames it with a luxe HUD:
 * a scene switcher, the guest's name (shared with the 2D views via localStorage),
 * an in-world request panel, and a live status tracker — all driven by Cinq's
 * existing request loop.
 *
 * The 3D layer is purely additive: the 2D `/customer` and `/vip` views keep
 * working untouched.
 */
export function ExploreExperience({ role }: { role: GuestRole }) {
  const isVip = role === "vip";
  const { config } = useConfigurables();
  const { name, ready: nameReady, save } = useGuestName();

  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<CinqEngine | null>(null);

  const [sceneId, setSceneId] = useState<SceneId>("lobby");
  const [loading, setLoading] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<HotspotDef | null>(null);
  const [showTracker, setShowTracker] = useState(false);

  const pollMs = config?.statusPollIntervalMs ?? 3000;

  const { data: requests, refresh } = usePoll<HotelRequestDTO[]>(
    async () => {
      if (!name) return [];
      const res = await fetchGuestRequests(name);
      return res.success && res.data ? res.data : [];
    },
    pollMs,
    [name],
  );

  // Mount the engine once.
  useEffect(() => {
    if (!mountRef.current) return;
    const engine = new CinqEngine(mountRef.current, {
      onRequestHotspot: (def) => setActiveHotspot(def),
      onSceneChange: (id) => setSceneId(id),
      onReady: () => setLoading(false),
    });
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  function switchScene(id: SceneId) {
    engineRef.current?.goToScene(id);
    setSceneId(id);
  }

  const scene = SCENES[sceneId];
  const activeCount = (requests ?? []).filter(
    (r) => r.status !== "fulfilled",
  ).length;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      {/* 3D canvas mount */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* Loading veil */}
      {loading && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-background">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 font-serif text-2xl text-primary">
            5
          </span>
          <p className="font-serif text-2xl tracking-[0.2em] text-foreground">
            {config?.appName || "Cinq"}
          </p>
          <p className="animate-pulse text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Preparing your suite…
          </p>
        </div>
      )}

      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-4">
        <div className="pointer-events-auto flex items-center gap-2">
          <Link
            to={isVip ? "/vip" : "/customer"}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-2 text-xs font-medium text-foreground backdrop-blur-md transition-colors hover:border-primary/40"
          >
            <ChevronLeft className="h-4 w-4" />
            Classic view
          </Link>
        </div>

        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-2 backdrop-blur-md">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-serif text-sm tracking-wide text-foreground">
            {scene.name}
          </span>
          {isVip && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              <Crown className="h-3 w-3" /> VIP
            </span>
          )}
        </div>
      </div>

      {/* Name prompt (first run) */}
      {nameReady && !name && !loading && (
        <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 mx-auto mb-24 w-full max-w-sm px-4">
          <div className="rounded-2xl border border-border bg-card/90 p-4 backdrop-blur-md">
            <p className="mb-2 font-serif text-lg text-card-foreground">
              Welcome — who shall we serve?
            </p>
            <input
              autoFocus
              onChange={(e) => save(e.target.value)}
              placeholder="Enter your name to begin"
              className="w-full rounded-lg border border-input bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      )}

      {/* Bottom dock: scene switcher + tracker toggle */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-center gap-3 p-4">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-card/80 p-1 backdrop-blur-md">
          {SCENE_ORDER.map((id) => (
            <button
              key={id}
              onClick={() => switchScene(id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                sceneId === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {SCENES[id].name}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowTracker((v) => !v)}
          className="pointer-events-auto relative flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2.5 text-sm font-medium text-foreground backdrop-blur-md transition-colors hover:border-primary/40"
        >
          <Compass className="h-4 w-4 text-primary" />
          Requests
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Hint strip */}
      {!loading && name && !activeHotspot && !showTracker && (
        <div className="pointer-events-none absolute inset-x-0 top-20 z-10 flex justify-center">
          <p className="rounded-full bg-background/50 px-4 py-1.5 text-xs tracking-wide text-muted-foreground backdrop-blur-sm">
            Tap a gold marker to travel · tap a glowing disc to request
          </p>
        </div>
      )}

      {/* Live request tracker drawer */}
      {showTracker && (
        <div className="pointer-events-auto absolute inset-y-0 right-0 z-30 flex w-full max-w-sm flex-col border-l border-border bg-card/95 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="flex items-center gap-2 font-serif text-xl text-card-foreground">
              Your requests
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-chart-2" />
            </h3>
            <button
              onClick={() => setShowTracker(false)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {!name ? (
              <p className="rounded-lg border border-dashed border-border bg-secondary/40 px-4 py-6 text-center text-sm text-muted-foreground">
                Enter your name to start tracking.
              </p>
            ) : (requests ?? []).length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-secondary/40 px-4 py-6 text-center text-sm text-muted-foreground">
                No requests yet. Tap a glowing disc in the world to place one.
              </p>
            ) : (
              (requests ?? []).map((r) => (
                <div
                  key={r._id}
                  className={cn(
                    "rounded-xl border bg-secondary/40 p-4",
                    r.priority && r.status !== "fulfilled"
                      ? "border-primary/50"
                      : "border-border",
                    r.status === "fulfilled" && "opacity-70",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-serif text-lg text-card-foreground">
                        {r.itemName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.categoryLabel}
                        {r.priority && (
                          <span className="ml-2 text-primary">VIP Priority</span>
                        )}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  {r.note && (
                    <p className="mt-2 text-xs italic text-muted-foreground">
                      “{r.note}”
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* In-world request panel */}
      {activeHotspot && (
        <InWorldRequestPanel
          role={role}
          guestName={name}
          categoryId={activeHotspot.categoryId ?? "service"}
          hotspotLabel={activeHotspot.label}
          onClose={() => setActiveHotspot(null)}
          onPlaced={() => {
            refresh();
            setShowTracker(true);
          }}
        />
      )}
    </div>
  );
}
