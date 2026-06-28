import type { ReactNode } from "react";
import { Link } from "react-router";
import { cn } from "~/lib/utils";
import { useConfigurables } from "~/modules/configurables";

interface ShellProps {
  roleLabel: string;
  roleAccent?: "guest" | "vip" | "staff";
  children: ReactNode;
}

/**
 * Shell — the shared cozy-luxury frame for every role view: a slim brand
 * header with the Cinq wordmark, the active role, and a way back to the
 * five-star entry.
 */
export function Shell({ roleLabel, roleAccent = "guest", children }: ShellProps) {
  const { config } = useConfigurables();
  const appName = config?.appName || "Cinq";
  const logoUrl = config?.logoUrl;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-navbar/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/" className="group flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={appName}
                className="h-9 w-9 rounded-full object-cover ring-1 ring-primary/40"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 font-serif text-lg text-primary">
                5
              </span>
            )}
            <span className="font-serif text-2xl tracking-[0.2em] text-foreground transition-colors group-hover:text-primary">
              {appName}
            </span>
          </Link>
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em]",
              roleAccent === "vip"
                ? "border-primary/50 bg-primary/15 text-primary"
                : roleAccent === "staff"
                  ? "border-border bg-secondary text-secondary-foreground"
                  : "border-border bg-muted text-muted-foreground",
            )}
          >
            {roleLabel}
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-8">{children}</main>
    </div>
  );
}
