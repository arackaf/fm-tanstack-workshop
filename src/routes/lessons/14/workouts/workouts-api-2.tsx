import { createFileRoute } from "@tanstack/react-router";

// import { getDb } from "@/data/db";
// import { workout as workoutTable } from "@/drizzle/schema";
// import { desc } from "drizzle-orm";
// import { createMiddleware } from "@tanstack/react-start";

export const Route = createFileRoute("/lessons/14/workouts/workouts-api-2")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Heyoooo</div>;
}
