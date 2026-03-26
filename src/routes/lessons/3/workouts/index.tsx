import { useMemo } from "react";
import { asc, desc } from "drizzle-orm";

import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import {
  workout as workoutTable,
  exercises as exercisesTable,
} from "@/drizzle/schema";
import { getDb } from "@/data/db";

const getWorkouts = createServerFn({
  method: "GET",
}).handler(async () => {
  const db = await getDb();
  const workouts = await db
    .select()
    .from(workoutTable)
    .orderBy(desc(workoutTable.workoutDate))
    .limit(3);

  return workouts.map(workout => {
    return {
      ...workout,
      exercises: [1, 2],
    };
  });
});

const getExercises = createServerFn({
  method: "GET",
}).handler(async () => {
  const db = await getDb();

  return db.select().from(exercisesTable).orderBy(asc(exercisesTable.name));
});

export const Route = createFileRoute("/lessons/3/workouts/")({
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
