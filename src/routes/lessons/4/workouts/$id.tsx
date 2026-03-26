import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { getExercisesServerFn } from "@/server-functions/exercises";
import { getInClassWorkoutById } from "@/server-functions/in-class/workouts-simple";

export const Route = createFileRoute("/lessons/4/workouts/$id")({
  component: RouteComponent,
  loader: async ({ params }) => {
    console.log("\nLoading workout ", params.id, "\n");

    const [workout, exercises] = await Promise.all([
      getInClassWorkoutById({
        data: { id: Number(params.id) },
      }),
      getExercisesServerFn({
        data: { operation: "load-exercises" },
      }),
    ]);

    return {
      workout: workout!,
      exercises,
    };
  },
  pendingComponent: () => <div>Loading...</div>,
  pendingMs: 0,
  gcTime: 1000 * 60 * 5,
  staleTime: 1000 * 60 * 5,
});

function RouteComponent() {
  const { workout, exercises } = Route.useLoaderData();
  const { isFetching } = Route.useMatch();

  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  return (
    <div className="flex flex-col gap-4">
      <span
        className={cn(
          "text-sm text-pink-500 -my-2 ml-auto",
          !isFetching && "invisible",
        )}
      >
        Reloading...
      </span>
      <div className="flex">
        <h1 className="text-lg">{workout.name}</h1>
        <Link to="/lessons/4/workouts" className="ml-auto" preload={false}>
          Back
        </Link>
      </div>
      <span>Id: {workout.id}</span>
      <span>Date: {workout.date}</span>
      <span>
        exercises:{" "}
        {workout.exercises
          .map(exercise => exerciseLookup.get(exercise)!.name)
          .join(", ")}
      </span>
      <Link to="/lessons/4/workouts/other-path">Other path</Link>
    </div>
  );
}
