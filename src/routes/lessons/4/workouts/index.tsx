import { useRef, type FC } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mutateWorkoutName } from "@/server-functions/in-class/mutate-workout-name";
import {
  getInClassWorkoutHistoryServerFn,
  type InClassWorkout,
} from "@/server-functions/in-class/workouts-simple";

export const Route = createFileRoute("/lessons/4/workouts/")({
  component: RouteComponent,
  loader: async () => {
    console.log("\nLoading workouts\n");

    const workoutsPayload = await getInClassWorkoutHistoryServerFn({
      data: { operation: "load-workouts" },
    });

    return {
      workouts: workoutsPayload.workouts,
    };
  },
  pendingComponent: () => <div>Loading...</div>,
  pendingMs: 0,
  gcTime: 1000 * 60 * 5,
  staleTime: 1000 * 60 * 5,
});

function RouteComponent() {
  const { workouts } = Route.useLoaderData();

  const { isFetching } = Route.useMatch();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h1>Workouts</h1>
        {isFetching ? (
          <span className="text-sm text-pink-500">Reloading...</span>
        ) : null}
      </div>
      {workouts.map(workout => (
        <RenderWorkout key={workout.id} workout={workout} />
      ))}
      <Link to="/lessons/4/workouts/other-path">Other path</Link>
    </div>
  );
}

const RenderWorkout: FC<{
  workout: InClassWorkout;
}> = props => {
  const { workout } = props;
  const workoutNameInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2">
      <div>
        <span className="flex gap-2">
          <span>{workout.name}</span>

          <Link
            to={`/lessons/4/workouts/$id`}
            params={{ id: String(workout.id) }}
            className="ml-auto"
            preload={false}
          >
            View
          </Link>
        </span>
      </div>
      <div className="flex gap-2">
        <Input ref={workoutNameInputRef} defaultValue={workout.name} />
        <Button
          type="button"
          onClick={async () => {
            const newName = workoutNameInputRef.current?.value ?? "";
            await mutateWorkoutName({
              data: {
                id: workout.id,
                newName,
              },
            });
            await router.invalidate({
              filter: route => route.routeId === "/lessons/4/workouts/",
            });
            await router.invalidate({
              filter: route =>
                route.routeId === "/lessons/4/workouts/$id" &&
                route.params.id === String(workout.id),
            });
          }}
        >
          Update name
        </Button>
      </div>
    </div>
  );
};
