import {
  Suspense,
  use,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FC,
} from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

import {
  editExercise,
  getExercisesServerFn,
} from "@/server-functions/exercises";
import { getInClassWorkoutHistory } from "@/server-functions/in-class/workouts-simple";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExerciseSelector } from "@/components/ExerciseSelector";
import { getMuscleGroupsServerFn } from "@/server-functions/muscle-groups";
import { useQuery } from "@tanstack/react-query";

type WorkoutHistoryPayload = Awaited<
  ReturnType<typeof getInClassWorkoutHistory>
>;
type Workout = WorkoutHistoryPayload["workouts"][number];
type Exercise = Awaited<ReturnType<typeof getExercisesServerFn>>[number];

export const Route = createFileRoute("/lessons/7/workouts/")({
  component: RouteComponent,
  loader: async () => {
    const workouts = getInClassWorkoutHistory({
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
  const { workouts, exercises } = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-4">
      <h1>Workouts</h1>

      <Suspense fallback={<div>Loading...</div>}>
        <RouteContents
          workoutsPromise={workouts}
          exercisesPromise={exercises}
        />
      </Suspense>
    </div>
  );
}

const RouteContents: FC<{
  workoutsPromise: Promise<WorkoutHistoryPayload>;
  exercisesPromise: Promise<Exercise[]>;
}> = ({ workoutsPromise, exercisesPromise }) => {
  const workoutsPayload = use(workoutsPromise);
  const exercises = use(exercisesPromise);

  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onExerciseSaved = () => {
    startTransition(() => {
      router.invalidate();
    });
  };

  return (
    <>
      <SelectAndEditExercise exercises={exercises} onSaved={onExerciseSaved} />
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
              to={`/lessons/7/workouts/$id`}
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

const SelectAndEditExercise: FC<{
  exercises: Exercise[];
  onSaved: () => void;
}> = props => {
  const { exercises, onSaved } = props;
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(
    null,
  );

  const { data: muscleGroups } = useQuery({
    queryKey: ["muscleGroups"],
    queryFn: () => getMuscleGroupsServerFn(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  return (
    <div className="flex flex-col gap-2">
      <ExerciseSelector
        value={selectedExerciseId}
        exercises={exercises}
        muscleGroups={muscleGroups ?? []}
        onSelect={exerciseId => {
          setSelectedExerciseId(exerciseId);
        }}
      />

      {selectedExerciseId ? (
        <EditExercise
          exercise={
            exercises.find(exercise => exercise.id === selectedExerciseId)!
          }
          onSaved={() => {
            setSelectedExerciseId(null);
            onSaved();
          }}
        />
      ) : null}
    </div>
  );
};

type EditExerciseProps = {
  exercise: Exercise;
  onSaved: () => void;
};
const EditExercise: FC<EditExerciseProps> = props => {
  const { exercise, onSaved } = props;
  const exerciseNameInputRef = useRef<HTMLInputElement>(null);

  const [isPending, setIsPending] = useState(false);

  const runEdit = async (newName: string) => {
    setIsPending(true);
    await editExercise({
      data: {
        id: exercise.id,
        name: newName,
      },
    });
    setIsPending(false);
    onSaved();
  };

  return (
    <div className="flex flex-col gap-2 w-1/2">
      <Input ref={exerciseNameInputRef} defaultValue={exercise.name} />
      <Button
        type="button"
        disabled={isPending}
        onClick={async () => {
          const name = exerciseNameInputRef.current?.value ?? "";
          await runEdit(name);
        }}
      >
        {isPending ? "Saving..." : "Edit"}
      </Button>
    </div>
  );
};
