import { Header } from "@/components/Header";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/admin")({
  component: RouteComponent,
  notFoundComponent: () => (
    <section>
      <Header title="Invalid" />
      <p className="text-muted-foreground">Couldn't find this admin link</p>
    </section>
  ),
});

function RouteComponent() {
  const navLinkClassName =
    "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors";

  const activeNavLinkProps = {
    className: "cursor-default bg-primary text-primary-foreground",
  };

  const inactiveNavLinkProps = {
    className:
      "text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:text-slate-300",
  };

  return (
    <div className="space-y-6">
      <nav className="flex w-full flex-wrap items-center gap-2">
        <Link
          to="/app/admin/exercises"
          className={navLinkClassName}
          activeProps={activeNavLinkProps}
          inactiveProps={inactiveNavLinkProps}
        >
          Exercises
        </Link>
        <Link
          to="/app/admin/workout-templates"
          className={navLinkClassName}
          activeOptions={{ exact: false }}
          activeProps={activeNavLinkProps}
          inactiveProps={inactiveNavLinkProps}
        >
          Workout templates
        </Link>
        <Link
          to="/app/admin/body-composition"
          className={navLinkClassName}
          activeProps={activeNavLinkProps}
          inactiveProps={inactiveNavLinkProps}
        >
          Body composition
        </Link>
      </nav>
      <Outlet />
    </div>
  );
}
