import { useMemo, useRef, useState, type FC } from "react";
import {
  createFileRoute,
  getRouteApi,
  Link,
  useLoaderData,
  useRouter,
} from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { editExercise } from "@/server-functions/exercises";
import { mutateWorkoutName } from "@/server-functions/in-class/mutate-workout-name";
import {
  getInClassWorkoutHistoryServerFn,
  type InClassWorkout,
} from "@/server-functions/in-class/workouts-simple";

type InClassExercise = {
  id: number;
  name: string;
};

export const Route = createFileRoute("/lessons/5/workouts/")({
  component: RouteComponent,
  loader: async () => {
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

  const layoutRoute = getRouteApi("/lessons/5/workouts");
  const { isFetching: isLayoutFetching } = layoutRoute.useMatch();

  const { exercises } = useLoaderData({
    from: "/lessons/5/workouts",
  });

  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h1>Workouts</h1>
        {isFetching ? (
          <span className="text-sm text-pink-500">Reloading...</span>
        ) : null}
        {isLayoutFetching ? (
          <span className="text-sm text-purple-500">Layout Reloading...</span>
        ) : null}
      </div>
      {workouts.map(workout => (
        <RenderWorkout
          key={workout.id}
          workout={workout}
          exerciseLookup={exerciseLookup}
        />
      ))}
      <hr className="my-4" />
      <ExerciseList workouts={workouts} exercises={exercises} />
    </div>
  );
}

const RenderWorkout: FC<{
  workout: InClassWorkout;
  exerciseLookup: Map<number, { name: string }>;
}> = props => {
  const { workout, exerciseLookup } = props;
  const workoutNameInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2">
      <div>
        <span className="flex gap-2">
          <span>{workout.name}</span>
          <Link
            to={`/lessons/5/workouts/$id`}
            params={{ id: String(workout.id) }}
            className="ml-auto"
            preload={false}
          >
            View
          </Link>
        </span>
        <div>
          <span>Exercises:</span>
          <span>
            (
            {workout.exercises
              .map(exercise => exerciseLookup.get(exercise)!.name)
              .join(", ")}
            )
          </span>
        </div>
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
              filter: route => route.routeId === "/lessons/5/workouts/",
            });
            await router.invalidate({
              filter: route =>
                route.routeId === "/lessons/5/workouts/$id" &&
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

const ExerciseList: FC<{
  workouts: InClassWorkout[];
  exercises: InClassExercise[];
}> = props => {
  const { workouts, exercises } = props;

  const exercisesToRender = useMemo(() => {
    const exerciseIds = new Set(workouts.flatMap(workout => workout.exercises));

    return exercises.filter(exercise => exerciseIds.has(exercise.id));
  }, [workouts, exercises]);

  return (
    <div className="flex flex-col gap-2">
      {exercisesToRender.map(exercise => (
        <Exercise key={exercise.id} exercise={exercise} />
      ))}
    </div>
  );
};

const Exercise: FC<{
  exercise: InClassExercise;
}> = props => {
  const { exercise } = props;
  const [saving, setSaving] = useState(false);
  const exerciseNameInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Input ref={exerciseNameInputRef} defaultValue={exercise.name} />
      <Button
        type="button"
        disabled={saving}
        onClick={async () => {
          const name = exerciseNameInputRef.current?.value ?? "";

          setSaving(true);
          await editExercise({
            data: {
              id: exercise.id,
              name,
            },
          });
          setSaving(false);

          await router.invalidate({
            filter: route => route.routeId === "/lessons/5/workouts",
          });
        }}
      >
        Update exercise
      </Button>
    </div>
  );
};
