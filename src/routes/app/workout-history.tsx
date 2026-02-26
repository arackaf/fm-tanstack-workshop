import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/workout-history")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section>
      <h2>Workout History</h2>
      <p>View your completed workouts here.</p>
    </section>
  );
}
