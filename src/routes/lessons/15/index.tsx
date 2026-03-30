import { Input } from "@/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

const LOCAL_STORAGE_KEY = "lesson-15-value";

export const Route = createFileRoute("/lessons/15/")({
  component: RouteComponent,
  // TODO: 2. move default value to loader
  gcTime: 0,
  staleTime: 0,
  // TODO: 3. Use pending component
});

function RouteComponent() {
  // TODO: 1. fix this
  const [value, setValue] = useState(
    () => localStorage.getItem(LOCAL_STORAGE_KEY) || "Default",
  );

  return (
    <div className="flex flex-col gap-4">
      <h1>Selective hydration</h1>

      <Input
        value={value}
        onChange={evt => {
          setValue(evt.target.value);
          localStorage.setItem(LOCAL_STORAGE_KEY, evt.target.value);
        }}
      />
    </div>
  );
}
