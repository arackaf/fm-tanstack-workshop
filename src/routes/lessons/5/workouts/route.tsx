import { createFileRoute, Outlet } from "@tanstack/react-router";

import { getExercisesServerFn } from "@/server-functions/exercises";

// TODO: limited ability to split data amongst layouts

export const Route = createFileRoute("/lessons/5/workouts")({
  component: RouteComponent,
  loader: async () => {
    const exercises = await getExercisesServerFn({
      data: { operation: "load-exercises" },
    });

    return {
      exercises,
    };
  },
  pendingComponent: () => <div>Loading...</div>,
  pendingMs: 0,
  gcTime: 1000 * 60 * 5,
  staleTime: 1000 * 60 * 5,
});

function RouteComponent() {
  return <Outlet />;
}
