import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/admin/workout-templates")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section>
      <h2>Workout Templates</h2>
      <p>Create and manage workout templates here.</p>
    </section>
  );
}
