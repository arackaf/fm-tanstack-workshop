import { createFileRoute, Outlet } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { RscLayout } from "@/components/rsc-layout/layout";
import type { FC, PropsWithChildren } from "react";

import {
  createCompositeComponent,
  CompositeComponent,
} from "@tanstack/react-start/rsc";

export const Route = createFileRoute("/rsc-demo")({
  component: RouteComponent,
  loader: async () => {
    const layout = null;

    return { layout };
  },
  pendingComponent: () => <div>Loading...</div>,
  pendingMs: 0,
  gcTime: 1000 * 60 * 5,
  staleTime: 1000 * 60 * 5,
});

function RouteComponent() {
  const { layout } = Route.useLoaderData();
  return (
    <div className="mx-auto w-full max-w-xl rounded-xl border border-slate-200 p-6 shadow-sm">
      <Outlet />
    </div>
  );
}
