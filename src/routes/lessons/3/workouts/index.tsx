import { useMemo } from "react";
import { asc, desc } from "drizzle-orm";

import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import {
  workout as workoutTable,
  exercises as exercisesTable,
} from "@/drizzle/schema";
import { getDb } from "@/data/db";

const getWorkouts = () => {
  return [
    { id: 1, name: "Workout 1", exercises: [1, 2] },
    { id: 2, name: "Workout 2", exercises: [1, 2] },
    { id: 3, name: "Workout 3", exercises: [1, 2] },
  ];
};

const getExercises = () => {
  return [
    { id: 1, name: "Exercise 1" },
    { id: 2, name: "Exercise 2" },
  ];
};

// TODO: 1. add server function and call in loader
// TODO: 2. Call with ssr
// TODO: 3. Call with csr and note call in dev tools

export const Route = createFileRoute("/lessons/3/workouts/")({
  // TODO: 4. Add a pending component and note when it works
  component: RouteComponent,
  loader: async () => {
    const [workouts, exercises] = await Promise.all([
      getWorkouts(),
      getExercises(),
    ]);

    return {
      workouts,
      exercises,
    };
  },
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  const { workouts, exercises } = Route.useLoaderData();
  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  return (
    <div className="flex flex-col gap-4">
      <h1>Workouts</h1>
      {workouts.map(workout => (
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
              to={`/lessons/3/workouts/$id`}
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
