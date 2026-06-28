import { cn } from "~/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { ROLE_LABELS, type HotelRequestDTO } from "../client/types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

interface RequestCardProps {
  request: HotelRequestDTO;
  /** Staff action row (advance buttons), rendered at the card foot. */
  actions?: React.ReactNode;
  /** Show who placed it — used in staff queues. */
  showGuest?: boolean;
}

export function RequestCard({ request, actions, showGuest }: RequestCardProps) {
  const isFulfilled = request.status === "fulfilled";
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-5 transition-all",
        request.priority && !isFulfilled
          ? "border-primary/50 shadow-[0_0_0_1px_rgba(200,162,75,0.25),0_8px_30px_-12px_rgba(200,162,75,0.45)]"
          : "border-border",
        isFulfilled && "opacity-70",
      )}
    >
      {request.priority && (
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-xl leading-tight text-card-foreground">
              {request.itemName}
            </h3>
            {request.priority && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                VIP Priority
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {request.categoryLabel}
            {showGuest && (
              <>
                {" · "}
                <span className="text-card-foreground/80">
                  {request.guestName}
                </span>{" "}
                <span className="text-muted-foreground">
                  ({ROLE_LABELS[request.guestRole]})
                </span>
              </>
            )}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {request.note && (
        <p className="mt-3 rounded-lg border border-border/60 bg-secondary/50 px-3 py-2 text-sm italic text-secondary-foreground/90">
          “{request.note}”
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {timeAgo(request.createdAt)}
        </span>
        {actions}
      </div>
    </article>
  );
}
