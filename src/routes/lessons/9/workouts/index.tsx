import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { exercisesQueryOptions } from "@/server-functions/exercises";
import { workoutHistoryQueryOptions } from "@/server-functions/in-class/workouts-simple";

export const Route = createFileRoute("/lessons/9/workouts/")({
  component: RouteComponent,
  // loaders are ...
  loader: async ({ context }) => {
    // TODO: load data here
  },
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  // TODO: seed client-side data - verify in dev tools
  const { data: workoutsPayload, isLoading: isWorkoutsLoading } = useQuery(
    workoutHistoryQueryOptions(),
  );
  const { data: exercises, isLoading: isExercisesLoading } = useQuery(
    exercisesQueryOptions(),
  );

  const exerciseLookup = useMemo(() => {
    return new Map(exercises?.map(exercise => [exercise.id, exercise]) ?? []);
  }, [exercises]);

  if (
    isWorkoutsLoading ||
    isExercisesLoading ||
    !workoutsPayload ||
    !exercises
  ) {
    return (
      <div className="flex flex-col gap-4">
        <h1>Workouts</h1>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1>Workouts</h1>
      {workoutsPayload.workouts.map(workout => (
        <div key={workout.id}>
          <span className="flex gap-2">
            <span>{workout.name}</span>
            <span>Exercises:</span>
            <span>
              (
              {workout.exercises
                .map(exercise => exerciseLookup.get(exercise)!.name)
                .join(", ")}
              )
            </span>
            <Link
              to={`/lessons/9/workouts/$id`}
              params={{ id: String(workout.id) }}
              className="ml-auto"
              preload={false}
            >
              View
            </Link>
          </span>
        </div>
      ))}
    </div>
  );
}
