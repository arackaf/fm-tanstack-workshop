import { ClipboardPen, History, Menu, PencilRuler, Shield } from "lucide-react";
import { useState } from "react";

import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <main className="min-h-screen bg-background text-foreground dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b border-border bg-card/60 px-6 py-4 backdrop-blur-md md:px-8">
        <nav className="mx-auto hidden w-full max-w-4xl flex-wrap items-center gap-2 px-6 md:flex">
          <Link
            to="/app/log-workout"
            className={navLinkClassName}
            activeProps={activeNavLinkProps}
            inactiveProps={inactiveNavLinkProps}
          >
            <ClipboardPen className="size-4" aria-hidden="true" />
            Workout
          </Link>
          <Link
            to="/app/log-measurement"
            className={navLinkClassName}
            activeProps={activeNavLinkProps}
            inactiveProps={inactiveNavLinkProps}
          >
            <PencilRuler className="size-4" aria-hidden="true" />
            Measure
          </Link>
          <Link
            to="/app/workouts"
            className={navLinkClassName}
            activeProps={activeNavLinkProps}
            inactiveProps={inactiveNavLinkProps}
            activeOptions={{ exact: false, includeSearch: false }}
            search={{ page: 1 }}
          >
            <History className="size-4" aria-hidden="true" />
            Workouts
          </Link>
          <Link
            to="/app/measurements"
            className={navLinkClassName}
            activeProps={activeNavLinkProps}
            inactiveProps={inactiveNavLinkProps}
          >
            <History className="size-4" aria-hidden="true" />
            Measurements
          </Link>
          <div className="ml-auto mr-1 h-5 w-px bg-border" aria-hidden="true" />
          <Link
            to="/app/admin"
            className={navLinkClassName}
            activeProps={activeNavLinkProps}
            inactiveProps={inactiveNavLinkProps}
          >
            <Shield className="size-4" aria-hidden="true" />
            Admin
          </Link>
        </nav>
        <div className="mx-auto w-full max-w-4xl px-0 md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4">
                <Link
                  to="/app/log-workout"
                  className={`${navLinkClassName} w-full justify-start`}
                  activeProps={activeNavLinkProps}
                  inactiveProps={inactiveNavLinkProps}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ClipboardPen className="size-4" aria-hidden="true" />
                  Workout
                </Link>
                <Link
                  to="/app/log-measurement"
                  className={`${navLinkClassName} w-full justify-start`}
                  activeProps={activeNavLinkProps}
                  inactiveProps={inactiveNavLinkProps}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <PencilRuler className="size-4" aria-hidden="true" />
                  Measure
                </Link>
                <Link
                  to="/app/workouts"
                  className={`${navLinkClassName} w-full justify-start`}
                  activeProps={activeNavLinkProps}
                  inactiveProps={inactiveNavLinkProps}
                  activeOptions={{ exact: false, includeSearch: false }}
                  search={{ page: 1 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <History className="size-4" aria-hidden="true" />
                  Workouts
                </Link>
                <Link
                  to="/app/measurements"
                  className={`${navLinkClassName} w-full justify-start`}
                  activeProps={activeNavLinkProps}
                  inactiveProps={inactiveNavLinkProps}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <History className="size-4" aria-hidden="true" />
                  Measurements
                </Link>
                <div
                  className="my-1 h-px w-full bg-border"
                  aria-hidden="true"
                />
                <Link
                  to="/app/admin"
                  className={`${navLinkClassName} w-full justify-start`}
                  activeProps={activeNavLinkProps}
                  inactiveProps={inactiveNavLinkProps}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Shield className="size-4" aria-hidden="true" />
                  Admin
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <div className="mx-auto w-full max-w-4xl px-6 py-6 md:py-10 md:px-8">
        <Outlet />
      </div>
    </main>
  );
}
