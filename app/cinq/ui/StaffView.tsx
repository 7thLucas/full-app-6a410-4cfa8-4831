import { useState } from "react";
import { useConfigurables } from "~/modules/configurables";
import { Shell } from "./Shell";
import { RequestCard } from "./RequestCard";
import { usePoll } from "../client/use-poll";
import { advanceRequest, fetchStaffQueue } from "../client/requests.api";
import type {
  HotelRequestDTO,
  RequestStatus,
  StaffRole,
} from "../client/types";

const COPY: Record<StaffRole, { title: string; sub: string; empty: string }> = {
  chef: {
    title: "The Kitchen",
    sub: "Incoming food and dining orders, routed live. VIP orders surface first.",
    empty: "No orders in the pass. The kitchen is quiet.",
  },
  employee: {
    title: "The Floor",
    sub: "Guest requests across the hotel, routed live. VIP requests surface first.",
    empty: "No requests on the floor right now.",
  },
};

const NEXT_LABEL: Record<RequestStatus, string | null> = {
  received: "Start",
  in_progress: "Mark Fulfilled",
  fulfilled: null,
};

export function StaffView({ role }: { role: StaffRole }) {
  const { config } = useConfigurables();
  const pollMs = config?.statusPollIntervalMs ?? 3000;
  const copy = COPY[role];
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, loading, refresh } = usePoll<HotelRequestDTO[]>(
    async () => {
      const res = await fetchStaffQueue(role);
      return res.success && res.data ? res.data : [];
    },
    pollMs,
    [role],
  );

  async function advance(r: HotelRequestDTO) {
    setBusyId(r._id);
    try {
      const res = await advanceRequest(r._id);
      if (res.success) refresh();
    } finally {
      setBusyId(null);
    }
  }

  const items = data ?? [];
  const active = items.filter((r) => r.status !== "fulfilled");
  const done = items.filter((r) => r.status === "fulfilled");

  return (
    <Shell roleLabel={role === "chef" ? "Chef" : "Employee"} roleAccent="staff">
      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 font-serif text-4xl text-foreground">
            {copy.title}
            <span className="h-2 w-2 animate-pulse rounded-full bg-chart-2" />
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">{copy.sub}</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-5 py-3 text-center">
          <span className="block font-serif text-3xl text-primary">
            {active.length}
          </span>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            In queue
          </span>
        </div>
      </section>

      {loading && !data ? (
        <p className="text-sm text-muted-foreground">Loading the queue…</p>
      ) : active.length === 0 && done.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-12 text-center text-muted-foreground">
          {copy.empty}
        </p>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {active.map((r) => {
              const nextLabel = NEXT_LABEL[r.status];
              return (
                <RequestCard
                  key={r._id}
                  request={r}
                  showGuest
                  actions={
                    nextLabel ? (
                      <button
                        onClick={() => advance(r)}
                        disabled={busyId === r._id}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {busyId === r._id ? "…" : nextLabel}
                      </button>
                    ) : null
                  }
                />
              );
            })}
          </div>

          {done.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Recently fulfilled
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {done.slice(0, 6).map((r) => (
                  <RequestCard key={r._id} request={r} showGuest />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}
