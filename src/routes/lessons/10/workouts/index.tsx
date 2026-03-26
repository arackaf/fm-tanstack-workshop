import {
  Suspense,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FC,
} from "react";
import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { ExerciseSelector, type Exercise } from "@/components/ExerciseSelector";
import {
  editExercise,
  exercisesQueryOptions,
} from "@/server-functions/exercises";
import { workoutHistoryQueryOptions } from "@/server-functions/in-class/workouts-simple";
import { Input } from "@/components/ui/input";
import { getMuscleGroupsServerFn } from "@/server-functions/muscle-groups";

export const Route = createFileRoute("/lessons/10/workouts/")({
  component: RouteComponent,
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
  const [page, setPage] = useState(1);
  const { data: workoutsPayload } = useSuspenseQuery(
    workoutHistoryQueryOptions(page),
  );
  const { data: exercises, isFetching: isExercisesFetching } = useSuspenseQuery(
    exercisesQueryOptions(),
  );
  const [isPending, startTransition] = useTransition();

  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  const queryClient = useQueryClient();

  const onExerciseSaved = () => {
    queryClient.invalidateQueries({
      queryKey: exercisesQueryOptions().queryKey,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <SelectAndEditExercise exercises={exercises} onSaved={onExerciseSaved} />
      {isExercisesFetching ? (
        <span className="text-pink-500">Re-loading exercises...</span>
      ) : null}
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
              to={`/lessons/10/workouts/$id`}
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
            startTransition(() => {
              setPage(currentPage => currentPage - 1);
            });
          }}
          disabled={workoutsPayload.page <= 1}
        >
          Previous
        </Button>
        <Button
          onClick={() => {
            startTransition(() => {
              setPage(currentPage => currentPage + 1);
            });
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
