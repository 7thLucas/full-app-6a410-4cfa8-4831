import { useMemo, useState } from "react";
import { Send, X, Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";
import { useConfigurables } from "~/modules/configurables";
import type {
  TRequestCategory,
  TAmenity,
} from "~/modules/configurables/src/constants/configurables.default";
import { placeRequest } from "../client/requests.api";
import type { GuestRole, StaffRole } from "../client/types";

const FALLBACK_CATEGORIES: TRequestCategory[] = [
  { id: "dining", label: "Dining", routeTo: "chef" },
  { id: "spa", label: "Spa & Wellness", routeTo: "employee" },
  { id: "amenities", label: "Amenities", routeTo: "employee" },
  { id: "service", label: "Service", routeTo: "employee" },
];

interface Props {
  role: GuestRole;
  guestName: string;
  /** Category id the tapped hotspot maps to (e.g. "dining"). */
  categoryId: string;
  /** Display label of the hotspot for the panel header. */
  hotspotLabel: string;
  onClose: () => void;
  /** Called after a successful placement so the world tracker can refresh. */
  onPlaced: () => void;
}

/**
 * InWorldRequestPanel — the in-scene drawer a guest opens by tapping a request
 * hotspot. It is a thin presentation layer over Cinq's existing request loop:
 * it calls the same `placeRequest` API, with the same VIP→priority and
 * category→staff routing handled server-side. No backend logic is duplicated.
 */
export function InWorldRequestPanel({
  role,
  guestName,
  categoryId,
  hotspotLabel,
  onClose,
  onPlaced,
}: Props) {
  const isVip = role === "vip";
  const { config } = useConfigurables();

  const categories: TRequestCategory[] = config?.requestCategories?.length
    ? config.requestCategories
    : FALLBACK_CATEGORIES;
  const amenities: TAmenity[] = config?.amenities ?? [];

  const category =
    categories.find((c) => c.id === categoryId) ?? categories[0];

  const items = useMemo(
    () => amenities.filter((a) => a.categoryId === category?.id),
    [amenities, category?.id],
  );

  const [selected, setSelected] = useState<TAmenity | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!selected || !category || !guestName.trim()) return;
    setSubmitting(true);
    try {
      const res = await placeRequest({
        guestName: guestName.trim(),
        guestRole: role,
        categoryId: category.id,
        categoryLabel: category.label,
        itemName: selected.name,
        note: note.trim(),
        routeTo: category.routeTo as StaffRole,
      });
      if (res.success) {
        setDone(true);
        onPlaced();
        setTimeout(onClose, 1100);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex items-end justify-center sm:items-center">
      {/* scrim */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
      />

      <div className="relative m-0 w-full max-w-lg rounded-t-2xl border border-border bg-card p-6 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.7)] sm:m-4 sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary/80">
              {category?.label}
              {category?.routeTo === "chef" ? " · Kitchen" : " · Floor"}
            </p>
            <h3 className="mt-1 flex items-center gap-2 font-serif text-2xl text-card-foreground">
              {isVip && (
                <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.5} />
              )}
              {hotspotLabel}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/50 bg-primary/15 text-primary">
              <Send className="h-5 w-5" />
            </span>
            <p className="font-serif text-xl text-card-foreground">
              Request sent
            </p>
            <p className="text-sm text-muted-foreground">
              {isVip
                ? "Surfaced to our staff with priority."
                : "Our staff have it — track it live."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid max-h-[40vh] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {items.length === 0 && (
                <p className="col-span-full rounded-lg border border-dashed border-border bg-secondary/40 px-4 py-6 text-center text-sm text-muted-foreground">
                  No items in this category yet.
                </p>
              )}
              {items.map((item) => {
                const active = selected?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-all",
                      active
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                        : "border-border bg-secondary/40 hover:border-primary/40",
                    )}
                  >
                    <span className="block font-serif text-base text-card-foreground">
                      {item.name}
                    </span>
                    {item.description && (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for our staff (optional)"
              rows={2}
              className="mt-3 w-full resize-none rounded-lg border border-input bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />

            <button
              onClick={submit}
              disabled={!selected || submitting || !guestName.trim()}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
              {!guestName.trim()
                ? "Set your name first"
                : submitting
                  ? "Sending…"
                  : selected
                    ? `Request ${selected.name}`
                    : "Select an item"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
