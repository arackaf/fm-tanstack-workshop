import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/log-workout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section>
      <h2>Log Workout</h2>
      <p>Create a new workout here.</p>
    </section>
  );
}
