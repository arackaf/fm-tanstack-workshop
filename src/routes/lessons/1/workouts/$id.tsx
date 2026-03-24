import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/lessons/1/workouts/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex">
        <h1 className="text-lg">Workout #{id}</h1>
        {/* TODO: Link to index (add ml-auto) */}
      </div>
    </div>
  );
}
