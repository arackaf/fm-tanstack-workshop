import { Input } from "@/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/lessons/16/")({
  component: RouteComponent,
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <h1>Static prerendering</h1>

      <span>And now, for something completely different</span>
    </div>
  );
}
