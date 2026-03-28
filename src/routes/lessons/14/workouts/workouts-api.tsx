import { createFileRoute } from "@tanstack/react-router";

// import { getDb } from "@/data/db";
// import { workout as workoutTable } from "@/drizzle/schema";
// import { desc } from "drizzle-orm";

export const Route = createFileRoute("/lessons/14/workouts/workouts-api")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Yo</div>;
}
