import { Link } from "react-router";
import { Crown, ConciergeBell, ChefHat, UserRound } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";

interface RoleCard {
  to: string;
  label: string;
  side: string;
  blurb: string;
  Icon: typeof Crown;
  highlight?: boolean;
}

const ROLES: RoleCard[] = [
  {
    to: "/customer",
    label: "Customer",
    side: "Guest",
    blurb: "Browse the hotel's experiences and place your requests.",
    Icon: UserRound,
  },
  {
    to: "/vip",
    label: "VIP",
    side: "Guest · Priority",
    blurb: "Every request you make is surfaced first, with perks.",
    Icon: Crown,
    highlight: true,
  },
  {
    to: "/employee",
    label: "Employee",
    side: "Staff",
    blurb: "Receive and handle guest requests across the floor.",
    Icon: ConciergeBell,
  },
  {
    to: "/chef",
    label: "Chef",
    side: "Staff · Kitchen",
    blurb: "See and fulfill the kitchen's incoming orders, live.",
    Icon: ChefHat,
  },
];

export default function EntryPage() {
  const { config } = useConfigurables();
  const appName = config?.appName || "Cinq";
  const tagline = config?.tagline || "Step into a five-star world.";
  const headline = config?.welcomeHeadline || `Welcome to ${appName}`;
  const subcopy =
    config?.welcomeSubcopy ||
    "A living five-star hotel, lived through four roles. Choose yours — guests ask, staff deliver, in real time.";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-chart-2/10 blur-[100px]" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-12">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-primary/80">
            {tagline}
          </p>
          <h1 className="mt-4 font-serif text-6xl tracking-[0.18em] text-foreground sm:text-7xl">
            {appName}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground">
            <span className="block font-serif text-2xl text-foreground/90">
              {headline}
            </span>
            <span className="mt-2 block">{subcopy}</span>
          </p>
        </header>

        <section className="mt-12 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          {ROLES.map(({ to, label, side, blurb, Icon, highlight }) => (
            <Link
              key={to}
              to={to}
              className={`group relative flex flex-col rounded-2xl border bg-card p-7 transition-all duration-300 hover:-translate-y-1 ${
                highlight
                  ? "border-primary/50 shadow-[0_0_0_1px_rgba(200,162,75,0.2)] hover:shadow-[0_20px_50px_-20px_rgba(200,162,75,0.5)]"
                  : "border-border hover:border-primary/40 hover:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.6)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${
                    highlight
                      ? "border-primary/50 bg-primary/15 text-primary"
                      : "border-border bg-secondary text-primary/90 group-hover:border-primary/40"
                  }`}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {side}
                </span>
              </div>
              <h2 className="mt-5 font-serif text-3xl tracking-wide text-card-foreground">
                {label}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {blurb}
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Enter as {label}
                <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </section>

        <footer className="mt-12 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
          Browser-native · No install · Five-star, always
        </footer>
      </div>
    </div>
  );
}
