import { Input } from "@/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/lessons/15/")({
  component: RouteComponent,
  loader: () => {
    return {
      loaderValue: "123",
    };
  },
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  const [value, setValue] = useState(
    () => localStorage.getItem("lesson-15-value") || "Default",
  );
  return (
    <div className="flex flex-col gap-4">
      <h1>Selective hydration</h1>

      <Input
        onChange={evt => {
          localStorage.setItem("lesson-15-value", evt.target.value);
        }}
      />
    </div>
  );
}
