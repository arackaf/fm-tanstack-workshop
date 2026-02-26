import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ClipboardPen, History, Shield } from "lucide-react";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
});

function RouteComponent() {
  const navLinkClassName =
    "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors";

  const activeNavLinkProps = {
    className: "bg-primary text-primary-foreground",
  };

  const inactiveNavLinkProps = {
    className:
      "text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:text-slate-300",
  };

  return (
    <main className="min-h-screen bg-background text-foreground dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b border-border bg-card/60 px-6 py-4 backdrop-blur-md md:px-8">
        <nav className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-2 px-6">
          <Link
            to="/app/log-workout"
            className={navLinkClassName}
            activeProps={activeNavLinkProps}
            inactiveProps={inactiveNavLinkProps}
          >
            <ClipboardPen className="size-4" aria-hidden="true" />
            Log Workout
          </Link>
          <Link
            to="/app/workout-history"
            className={navLinkClassName}
            activeProps={activeNavLinkProps}
            inactiveProps={inactiveNavLinkProps}
          >
            <History className="size-4" aria-hidden="true" />
            Workout History
          </Link>
          <div className="ml-auto mr-1 h-5 w-px bg-border" aria-hidden="true" />
          <Link
            to="/app/admin/exercises"
            className={navLinkClassName}
            activeProps={activeNavLinkProps}
            inactiveProps={inactiveNavLinkProps}
          >
            <Shield className="size-4" aria-hidden="true" />
            Admin
          </Link>
        </nav>
      </header>
      <div className="mx-auto w-full max-w-4xl px-6 py-10 md:px-8">
        <Outlet />
      </div>
    </main>
  );
}
