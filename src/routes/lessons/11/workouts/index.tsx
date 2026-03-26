import { Suspense, useDeferredValue, useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { workoutHistoryQueryOptions } from "@/server-functions/in-class/workouts-simple";

export const Route = createFileRoute("/lessons/11/workouts/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, string>) => {
    return {
      page: Number(search.page) || 1,
    };
  },
  loader: async ({ context }) => {
    Promise.all([
      context.queryClient.ensureQueryData(workoutHistoryQueryOptions()),
      context.queryClient.ensureQueryData(exercisesQueryOptions()),
    ]);
  },
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <h1>Workouts</h1>
      <Suspense fallback={<span>Loading...</span>}>
        <WorkoutsListContent />
      </Suspense>
    </div>
  );
}

function WorkoutsListContent() {
  const { page } = Route.useSearch();
  const deferredPage = useDeferredValue(page);
  const { data: workoutsPayload } = useSuspenseQuery(
    workoutHistoryQueryOptions(deferredPage),
  );
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const navigate = useNavigate();

  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  const isPending = page !== deferredPage;

  return (
    <div className="flex flex-col gap-4">
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
              to={`/lessons/11/workouts/$id`}
              params={{ id: String(workout.id) }}
              className="ml-auto"
              preload={false}
            >
              View
            </Link>
          </span>
        </div>
      ))}
      <div className="flex gap-2 items-center">
        <Button
          onClick={() => {
            // startTransition(() => {
            navigate({
              to: "/lessons/11/workouts",
              search: {
                page: page - 1,
              },
            });
            // });
          }}
          disabled={workoutsPayload.page <= 1}
        >
          Previous
        </Button>
        <Button
          onClick={() => {
            // startTransition(() => {
            navigate({
              to: "/lessons/11/workouts",
              search: {
                page: page + 1,
              },
            });
            // });
          }}
          disabled={!workoutsPayload.hasNextPage}
        >
          Next
        </Button>
        {isPending ? <span>Loading...</span> : null}
      </div>
    </div>
  );
}
