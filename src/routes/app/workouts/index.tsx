import { useMemo, useState, useTransition } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DisplayWorkout } from "@/components/display-workout/DisplayWorkout";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { workoutHistoryQueryOptions } from "@/server-functions/workouts";
import type { WorkoutNextPageToken } from "@/data/workouts/get-workouts";

export const Route = createFileRoute("/app/workouts/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(workoutHistoryQueryOptions()),
      context.queryClient.ensureQueryData(exercisesQueryOptions()),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const [, startTransition] = useTransition();

  const [nextPageToken, setNextPageToken] = useState<
    WorkoutNextPageToken | undefined
  >();
  const [previousPageToken, setPreviousPageToken] = useState<
    WorkoutNextPageToken | undefined
  >();
  const { data: workoutsPayload } = useSuspenseQuery(
    workoutHistoryQueryOptions({
      nextPage: nextPageToken,
      previousPage: previousPageToken,
    }),
  );

  const workouts = workoutsPayload.workouts;
  const nextPage = workoutsPayload.nextPage;
  const previousPage = workoutsPayload.previousPage;

  const exerciseNameById = useMemo(
    () => new Map(exercises.map(exercise => [exercise.id, exercise.name])),
    [exercises],
  );

  return (
    <section>
      <Header title="Workouts" />

      {workouts.length === 0 ? (
        <p className="text-muted-foreground">
          No workouts yet. Start by logging your first one.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {workouts.map((workout, workoutIndex) => (
            <DisplayWorkout
              key={`${workout.workoutDate}-${workout.name}-${workoutIndex}`}
              workout={workout}
              exerciseNameById={exerciseNameById}
            />
          ))}
          <div className="flex gap-2">
            {previousPage ? (
              <Button
                onClick={() =>
                  startTransition(() => {
                    setPreviousPageToken(previousPage);
                    setNextPageToken(undefined);
                  })
                }
                variant="outline"
                className="self-start"
              >
                Previous Page
              </Button>
            ) : null}
            {nextPage ? (
              <Button
                onClick={() =>
                  startTransition(() => {
                    setPreviousPageToken(undefined);
                    setNextPageToken(nextPage);
                  })
                }
                variant="outline"
                className="self-start"
              >
                Next Page
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
