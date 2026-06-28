import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Sparkles, Send, Compass } from "lucide-react";
import { cn } from "~/lib/utils";
import { useConfigurables } from "~/modules/configurables";
import type {
  TRequestCategory,
  TAmenity,
} from "~/modules/configurables/src/constants/configurables.default";
import { Shell } from "./Shell";
import { RequestCard } from "./RequestCard";
import { usePoll } from "../client/use-poll";
import { useGuestName } from "../client/use-identity";
import {
  fetchGuestRequests,
  placeRequest,
} from "../client/requests.api";
import type { GuestRole, HotelRequestDTO, StaffRole } from "../client/types";

const FALLBACK_CATEGORIES: TRequestCategory[] = [
  { id: "dining", label: "Dining", routeTo: "chef" },
  { id: "spa", label: "Spa & Wellness", routeTo: "employee" },
  { id: "amenities", label: "Amenities", routeTo: "employee" },
  { id: "service", label: "Service", routeTo: "employee" },
];

export function GuestView({ role }: { role: GuestRole }) {
  const isVip = role === "vip";
  const { config } = useConfigurables();
  const { name, ready, save } = useGuestName();

  const categories: TRequestCategory[] =
    config?.requestCategories?.length
      ? config.requestCategories
      : FALLBACK_CATEGORIES;
  const amenities: TAmenity[] = config?.amenities ?? [];
  const pollMs = config?.statusPollIntervalMs ?? 3000;

  const [activeCat, setActiveCat] = useState<string>(categories[0]?.id ?? "");
  const [selectedItem, setSelectedItem] = useState<TAmenity | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data, loading, refresh } = usePoll<HotelRequestDTO[]>(
    async () => {
      if (!name) return [];
      const res = await fetchGuestRequests(name);
      return res.success && res.data ? res.data : [];
    },
    pollMs,
    [name],
  );

  const visibleAmenities = useMemo(
    () => amenities.filter((a) => a.categoryId === activeCat),
    [amenities, activeCat],
  );

  const currentCategory = categories.find((c) => c.id === activeCat);

  async function submit() {
    if (!name.trim() || !selectedItem || !currentCategory) return;
    setSubmitting(true);
    try {
      const res = await placeRequest({
        guestName: name.trim(),
        guestRole: role,
        categoryId: currentCategory.id,
        categoryLabel: currentCategory.label,
        itemName: selectedItem.name,
        note: note.trim(),
        routeTo: currentCategory.routeTo as StaffRole,
      });
      if (res.success) {
        setSelectedItem(null);
        setNote("");
        refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Shell roleLabel={isVip ? "VIP" : "Customer"} roleAccent={isVip ? "vip" : "guest"}>
      {/* Identity */}
      <section className="mb-8">
        <h1 className="flex items-center gap-2 font-serif text-4xl text-foreground">
          {isVip && <Sparkles className="h-7 w-7 text-primary" strokeWidth={1.5} />}
          {isVip ? "Your VIP Suite" : "Your Stay"}
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          {isVip
            ? "Request anything — your wishes are routed to our staff with priority."
            : "Browse our experiences and send a request to our staff. We'll keep you posted live."}
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="max-w-md flex-1">
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
              Your name
            </label>
            <input
              value={name}
              onChange={(e) => save(e.target.value)}
              placeholder="Enter your name to begin"
              className="w-full rounded-lg border border-input bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <Link
            to={`/explore/${role}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-5 py-3 font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Compass className="h-4 w-4" />
            Explore in 3D
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Request builder */}
        <section className="lg:col-span-3">
          <h2 className="mb-4 font-serif text-2xl text-foreground">
            Place a request
          </h2>

          {/* Category tabs */}
          <div className="mb-5 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setActiveCat(c.id);
                  setSelectedItem(null);
                }}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  activeCat === c.id
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Items */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {visibleAmenities.length === 0 && (
              <p className="col-span-full rounded-lg border border-dashed border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
                No items in this category yet.
              </p>
            )}
            {visibleAmenities.map((item) => {
              const active = selectedItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all",
                    active
                      ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <span className="block font-serif text-lg text-card-foreground">
                    {item.name}
                  </span>
                  {item.description && (
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Note + submit */}
          <div className="mt-5">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for our staff (optional)"
              rows={2}
              className="w-full resize-none rounded-lg border border-input bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={submit}
              disabled={!name.trim() || !selectedItem || submitting}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              <Send className="h-4 w-4" />
              {submitting
                ? "Sending…"
                : selectedItem
                  ? `Request ${selectedItem.name}`
                  : "Select an item"}
            </button>
          </div>
        </section>

        {/* Live status tracker */}
        <section className="lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-2xl text-foreground">
            Your requests
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-chart-2" />
          </h2>
          {!ready || (loading && !data) ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !name ? (
            <p className="rounded-lg border border-dashed border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
              Enter your name to start tracking requests.
            </p>
          ) : data && data.length > 0 ? (
            <div className="space-y-3">
              {data.map((r) => (
                <RequestCard key={r._id} request={r} />
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
              No requests yet. Place one and watch it move live.
            </p>
          )}
        </section>
      </div>
    </Shell>
  );
}
