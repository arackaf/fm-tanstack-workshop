import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";

// TODO: 6. Add a layout

// TODO: 1. desscribe route structure / show off dev tools
export const Route = createFileRoute("/lessons/1/workouts/")({
  component: RouteComponent,
  // TODO: 2. add search param
});

function RouteComponent() {
  // TODO: 3. make this go away
  const { search } = Route.useSearch();
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const workouts = [
    { id: 1, name: "Workout 1" },
    { id: 2, name: "Workout 2" },
    { id: 3, name: "Workout 3" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1>Workouts</h1>

      <div>Current search term: {search}</div>
      <div className="flex gap-2">
        <Input ref={searchRef} type="text" />
        <Button
          variant="outline"
          onClick={() => {
            // 4. TODO: Set search param
          }}
        >
          Search
        </Button>
      </div>
      {workouts.map(workout => (
        <div key={workout.id}>
          <span className="flex gap-2">
            <span>{workout.name}</span>

            {/* 5. TODO: Link to workout (add ml-auto) */}
          </span>
        </div>
      ))}
    </div>
  );
}
