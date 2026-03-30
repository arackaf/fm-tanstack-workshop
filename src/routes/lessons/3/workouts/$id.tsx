import { useMemo } from "react";

import { createFileRoute, Link } from "@tanstack/react-router";

// import { createServerFn } from "@tanstack/react-start";
// import { asc, desc, eq } from "drizzle-orm";
// import { getDb } from "@/data/db";

// TODO: implement same server functions here
// don't forget to return a SINGLE workout

import {
  workout as workoutTable,
  exercises as exercisesTable,
} from "@/drizzle/schema";

const getWorkout = (id: number) => {
  return {
    id: 1,
    name: "Workout 1",
    workoutDate: "2026-01-01",
    exercises: [1, 2],
  };
};

const getExercises = () => {
  return [
    { id: 1, name: "Exercise 1" },
    { id: 2, name: "Exercise 2" },
  ];
};

export const Route = createFileRoute("/lessons/3/workouts/$id")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const [workout, exercises] = await Promise.all([
      getWorkout(Number(params.id)),
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
