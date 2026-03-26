import { useMemo } from "react";
import { asc, desc, eq } from "drizzle-orm";

import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { getDb } from "@/data/db";

import {
  workout as workoutTable,
  exercises as exercisesTable,
} from "@/drizzle/schema";

const getExercises = createServerFn({
  method: "GET",
}).handler(async () => {
  const db = await getDb();

  return db.select().from(exercisesTable).orderBy(asc(exercisesTable.name));
});

const getWorkout = createServerFn({
  method: "GET",
})
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const db = await getDb();
    const workouts = await db
      .select()
      .from(workoutTable)
      .where(eq(workoutTable.id, data.id));

    const workout = workouts[0];
    return {
      ...workout,
      exercises: [1, 2],
    };
  });

export const Route = createFileRoute("/lessons/3/workouts/$id")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const [workout, exercises] = await Promise.all([
      getWorkout({ data: { id: Number(params.id) } }),
      getExercises(),
    ]);

    return {
      workout,
      exercises,
    };
  },
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  const { workout, exercises } = Route.useLoaderData();
  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex">
        <h1 className="text-lg">{workout.name}</h1>
        <Link to="/lessons/3/workouts" className="ml-auto" preload={false}>
          Back
        </Link>
      </div>
      <span>Id: {workout.id}</span>
      <span>Date: {workout.workoutDate}</span>
      <span>
        exercises:{" "}
        {workout.exercises
          .map(exercise => exerciseLookup.get(exercise)!.name)
          .join(", ")}
      </span>
    </div>
  );
}
