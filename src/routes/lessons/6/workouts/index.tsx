import { useEffect, useMemo, useState, type FC } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { getInClassWorkoutHistoryServerFn } from "@/server-functions/in-class/workouts-simple";
import { getExercisesServerFn } from "@/server-functions/exercises";

type WorkoutHistoryPayload = Awaited<
  ReturnType<typeof getInClassWorkoutHistoryServerFn>
>;
type Workout = WorkoutHistoryPayload["workouts"][number];
type Exercise = Awaited<ReturnType<typeof getExercisesServerFn>>[number];

export const Route = createFileRoute("/lessons/6/workouts/")({
  component: RouteComponent,
  loader: async () => {
    const workouts = getInClassWorkoutHistoryServerFn({
      data: { operation: "load-workouts" },
    });
    const exercises = getExercisesServerFn({
      data: { operation: "load-exercises" },
    });

    return {
      workouts,
      exercises,
    };
  },
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  const { workouts: workoutsPromise, exercises: exercisesPromise } =
    Route.useLoaderData();

  const [workouts, setWorkouts] = useState<Workout[] | null>(null);
  const [exercises, setExercises] = useState<Exercise[] | null>(null);

  useEffect(() => {
    Promise.all([workoutsPromise, exercisesPromise]).then(
      ([workoutsPayload, exercises]) => {
        setWorkouts(workoutsPayload.workouts);
        setExercises(exercises);
      },
    );
  }, [workoutsPromise, exercisesPromise]);

  return (
    <div className="flex flex-col gap-4">
      <h1>Workouts</h1>
      {workouts && exercises ? (
        <RouteContents workouts={workouts} exercises={exercises} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

const RouteContents: FC<{
  workouts: Workout[];
  exercises: Exercise[];
}> = ({ workouts, exercises }) => {
  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  return (
    <>
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
              to={`/lessons/6/workouts/$id`}
              params={{ id: String(workout.id) }}
              className="ml-auto"
              preload={false}
            >
              View
            </Link>
          </span>
        </div>
      ))}
    </>
  );
};
