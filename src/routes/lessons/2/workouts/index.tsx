import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

type Workout = {
  id: number;
  name: string;
  exercises: number[];
};

type Exercise = {
  id: number;
  name: string;
};

type RouteData = {
  exercises: Exercise[];
  workouts: Workout[];
};
function getWorkoutsAndExercises() {
  const workouts: Workout[] = [
    { id: 1, name: "Workout 1", exercises: [1, 2, 3] },
    { id: 2, name: "Workout 2", exercises: [1, 2, 3] },
    { id: 3, name: "Workout 3", exercises: [1, 2, 3] },
  ];
  const exercises: Exercise[] = [
    { id: 1, name: "Pull-ups" },
    { id: 2, name: "Push-ups" },
    { id: 3, name: "Bench Press" },
  ];

  return {
    workouts,
    exercises,
  };
}

// TODO: loads are isomorphic!!!!!

export const Route = createFileRoute("/lessons/2/workouts/")({
  component: RouteComponent,
  loader: async () => {
    const { exercises, workouts } = getWorkoutsAndExercises();

    // TODO: Add a console.log statement here
    return {
      workouts,
      exercises,
    };
  },
  staleTime: 0,
  gcTime: 0,
});

function RouteComponent() {
  // TODO: load loader data

  // TODO: use getRouteApi

  const workouts: any[] = [];
  const exercises: any = [];

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
              className="ml-auto"
              to={`/lessons/2/workouts/$id`}
              params={{ id: String(workout.id) }}
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
