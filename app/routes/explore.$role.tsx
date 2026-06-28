import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import type { GuestRole } from "~/cinq/client/types";

/**
 * /explore/:role — the stylized-luxe 3D hotel for the guest-facing roles.
 *
 * Only `customer` and `vip` may enter the world (staff keep their fast 2D
 * queues). The heavy three.js experience is mounted client-side only: it is
 * lazily imported after hydration so the WebGL engine never runs during SSR
 * and never bloats the initial server render.
 */
export default function ExploreRoute() {
  const params = useParams();
  const role = params.role as string;
  const valid = role === "customer" || role === "vip";

  const [Experience, setExperience] =
    useState<null | React.ComponentType<{ role: GuestRole }>>(null);

  useEffect(() => {
    if (!valid) return;
    let active = true;
    import("~/cinq/scene3d/ExploreExperience").then((mod) => {
      if (active) setExperience(() => mod.ExploreExperience);
    });
    return () => {
      active = false;
    };
  }, [valid]);

  if (!valid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
        <h1 className="font-serif text-3xl">The world is for guests</h1>
        <p className="max-w-sm text-muted-foreground">
          The 3D hotel is open to Customers and VIPs. Staff have their live
          queues in the classic view.
        </p>
        <Link
          to="/"
          className="rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground"
        >
          Back to entry
        </Link>
      </div>
    );
  }

  if (!Experience) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-3 bg-background text-foreground">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 font-serif text-2xl text-primary">
          5
        </span>
        <p className="animate-pulse text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Entering the hotel…
        </p>
      </div>
    );
  }

  return <Experience role={role as GuestRole} />;
}
