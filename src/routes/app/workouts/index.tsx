import { useDeferredValue, useMemo, type FC } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { DisplayWorkout } from "@/components/display-workout/DisplayWorkout";
import { Button } from "@/components/ui/button";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { workoutHistoryQueryOptions } from "@/server-functions/workouts";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { Loading } from "@/components/loading-state/Loading";

export const Route = createFileRoute("/app/workouts/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        workoutHistoryQueryOptions({ page: 1 }),
      ),
      context.queryClient.ensureQueryData(exercisesQueryOptions()),
    ]);
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, string>) => {
    return {
      page: Number(search.page) || 1,
    };
  },
});

function RouteComponent() {
  return (
    <SuspensePageLayout title="Workouts">
      <RouteContent />
    </SuspensePageLayout>
  );
}

const RouteContent: FC = () => {
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const navigate = useNavigate();

  const { page } = Route.useSearch();
  const deferredPage = useDeferredValue(page);

  const { data: workoutsPayload } = useSuspenseQuery(
    workoutHistoryQueryOptions({
      page: deferredPage,
    }),
  );

  const workouts = workoutsPayload.workouts;
  const hasNextPage = workoutsPayload.hasNextPage;

  const exerciseNameById = useMemo(
    () => new Map(exercises.map(exercise => [exercise.id, exercise.name])),
    [exercises],
  );

  const pending = page !== deferredPage;

  return (
    <div>
      {pending ? <Loading placement="page" fadeIn /> : null}

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
            <Button
              disabled={page === 1}
              onClick={() => {
                navigate({
                  to: "/app/workouts",
                  search: {
                    page: page - 1,
                  },
                });
              }}
              variant="outline"
              className="self-start cursor-pointer"
            >
              Previous Page
            </Button>

            <Button
              disabled={!hasNextPage}
              onClick={() => {
                navigate({
                  to: "/app/workouts",
                  search: {
                    page: page + 1,
                  },
                });
              }}
              variant="outline"
              className="self-start cursor-pointer"
            >
              Next Page
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
