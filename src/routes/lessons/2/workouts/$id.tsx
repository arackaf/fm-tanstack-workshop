import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

type Workout = {
  id: number;
  name: string;
  date: string;
  exercises: number[];
};

type Exercise = {
  id: number;
  name: string;
};

export const Route = createFileRoute("/lessons/2/workouts/$id")({
  component: RouteComponent,
  loader: ({ params }) => {
    console.log("\n\nI'm in the $id loader!\n\n");

    const workout: Workout = {
      id: Number(params.id),
      name: "My Workout",
      date: "2026-01-01",
      exercises: [1, 2, 3],
    };

    const exercises: Exercise[] = [
      { id: 1, name: "Pull-ups" },
      { id: 2, name: "Push-ups" },
      { id: 3, name: "Bench Press" },
    ];

    return {
      workout,
      exercises,
    };
  },
  staleTime: 0,
  gcTime: 0,
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
        <Link className="ml-auto" to="/lessons/2/workouts" preload={false}>
          Back
        </Link>
      </div>
      <span>Id: {workout.id}</span>
      <span>Date: {workout.date}</span>
      <span>
        exercises:
        {workout.exercises
          .map(exercise => exerciseLookup.get(exercise)!.name)
          .join(", ")}
      </span>
    </div>
  );
}
