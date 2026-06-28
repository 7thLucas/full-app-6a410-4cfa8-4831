import { cn } from "~/lib/utils";
import { STATUS_LABELS, type RequestStatus } from "../client/types";

const STYLES: Record<RequestStatus, string> = {
  received:
    "bg-primary/15 text-primary border-primary/30",
  in_progress:
    "bg-chart-2/15 text-chart-2 border-chart-2/40",
  fulfilled:
    "bg-chart-2/25 text-chart-2 border-chart-2/50",
};

export function StatusBadge({
  status,
  className,
}: {
  status: RequestStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider",
        STYLES[status],
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "received" && "bg-primary",
          status === "in_progress" && "bg-chart-2 animate-pulse",
          status === "fulfilled" && "bg-chart-2",
        )}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}
