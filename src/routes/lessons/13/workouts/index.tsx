import { useRef, useState, type FC } from "react";
import { eq } from "drizzle-orm";

import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import { ExerciseSelector } from "@/components/ExerciseSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getExercisesServerFn,
  type EditExerciseInput,
} from "@/server-functions/exercises";
import { getWorkoutsWithExerciseNames } from "@/server-functions/in-class/workouts-simple";
import { getMuscleGroupsServerFn } from "@/server-functions/muscle-groups";
import { getDb } from "@/data/db";
import { exercises as exercisesTable } from "@/drizzle/schema";
import { refetchedQueryOptions } from "@/data/util/refetch-query-options";
import { refetchMiddleware } from "@/middleware/refetchMiddleware";

export const editExercise = createServerFn({ method: "POST" })
  .middleware([refetchMiddleware])
  .inputValidator((input: EditExerciseInput) => input)
  .handler(async ({ data }) => {
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    const name = data.name.trim();

    const db = await getDb();
    await db
      .update(exercisesTable)
      .set({ name })
      .where(eq(exercisesTable.id, data.id));
  });

type ArrayOf<T> = T extends Array<infer U> ? U : never;
type Workout = ArrayOf<
  Awaited<ReturnType<typeof getWorkoutsWithExerciseNames>>["workouts"]
>;
type Exercise = ArrayOf<Awaited<ReturnType<typeof getExercisesServerFn>>>;

const staleTime = 1000 * 60 * 10;
const gcTime = 1000 * 60 * 10;

const workoutListQueryOptions = (page: number = 1) => {
  console.log("workoutListQueryOptions", page);
  return queryOptions({
    ...refetchedQueryOptions(["workouts", page], getWorkoutsWithExerciseNames, {
      page,
    }),
    placeholderData: keepPreviousData,
    staleTime,
    gcTime,
  });
};

const exercisesQueryOptions = queryOptions({
  ...refetchedQueryOptions(["exercises"], getExercisesServerFn, {
    operation: "load-exercises",
  }),
  staleTime,
  gcTime,
});

const singleWorkoutQueryOptions = (workoutId: number) =>
  queryOptions({
    ...refetchedQueryOptions(
      ["workout", workoutId],
      getWorkoutsWithExerciseNames,
      { id: workoutId },
    ),
    select: data => data.workouts?.[0] ?? null,
    staleTime,
    gcTime,
  });

export const Route = createFileRoute("/lessons/13/workouts/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(workoutListQueryOptions(1));
    context.queryClient.ensureQueryData(exercisesQueryOptions);
  },
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  const [page, setPage] = useState(1);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(
    null,
  );

  const {
    data: exercises,
    isLoading: isExercisesLoading,
    isFetching: isExercisesFetching,
  } = useQuery(exercisesQueryOptions);

  const { data: muscleGroups } = useQuery({
    queryKey: ["muscleGroups"],
    queryFn: () => getMuscleGroupsServerFn(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const {
    data: workoutsPayload,
    isLoading: isWorkoutsLoading,
    isFetching: isWorkoutsFetching,
  } = useQuery(workoutListQueryOptions(page));

  const selectedExercise = exercises?.find(
    exercise => exercise.id === selectedExerciseId,
  );

  const isWorkoutsRefreshing = isWorkoutsFetching && !isWorkoutsLoading;
  const isExercisesRefreshing = isExercisesFetching && !isExercisesLoading;

  return (
    <div className="flex flex-col gap-4">
      <h1>Workouts</h1>
      {isExercisesLoading || !exercises || !muscleGroups ? (
        <span>Loading exercises...</span>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-1/2">
            <ExerciseSelector
              value={selectedExerciseId}
              exercises={exercises}
              muscleGroups={muscleGroups}
              onSelect={exerciseId => {
                setSelectedExerciseId(exerciseId);
              }}
            />
          </div>
          {isExercisesRefreshing ? (
            <div className="w-1/2">
              <span className="text-blue-500">Loading ...</span>
            </div>
          ) : null}
        </div>
      )}
      {selectedExercise ? (
        <EditExercise
          onSaved={() => {
            setSelectedExerciseId(null);
          }}
          key={selectedExercise.id}
          exercise={selectedExercise}
        />
      ) : null}
      <div className="border-t" />
      {!workoutsPayload ? (
        <span>Loading workouts...</span>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl">Workouts</h1>
            {isWorkoutsRefreshing ? (
              <span className="text-blue-500">Loading ...</span>
            ) : null}
          </div>
          {workoutsPayload.workouts.map(workout => (
            <WorkoutRow key={workout.id} workout={workout} />
          ))}
          <div className="flex gap-2 items-center">
            <Button
              type="button"
              onClick={() => {
                setPage(currentPage => currentPage - 1);
              }}
              disabled={workoutsPayload.page <= 1}
            >
              Previous
            </Button>
            <Button
              type="button"
              onClick={() => {
                setPage(currentPage => currentPage + 1);
              }}
              disabled={!workoutsPayload.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

type EditExerciseProps = {
  exercise: Exercise;
  onSaved: () => void;
};

const EditExercise: FC<EditExerciseProps> = props => {
  const { exercise, onSaved } = props;
  const exerciseNameInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: editExerciseMutation, isPending } = useMutation({
    mutationFn: async (name: string) => {
      await editExercise({
        data: {
          id: exercise.id,
          name,
          refetch: [["workouts"], ["workout"], ["exercises"]],
        },
      });
    },
    onSuccess: async () => {
      onSaved();
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <Input ref={exerciseNameInputRef} defaultValue={exercise.name} />
      <Button
        type="button"
        disabled={isPending}
        onClick={async () => {
          const name = exerciseNameInputRef.current?.value ?? "";
          await editExerciseMutation(name);
        }}
      >
        {isPending ? "Saving..." : "Edit"}
      </Button>
    </div>
  );
};

const WorkoutRow: FC<{
  workout: Workout;
}> = props => {
  const { workout } = props;
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-1">
          <span>{workout.name}</span>
          <span>Exercises: ({workout.exercises.join(", ")})</span>
        </div>
        <Button
          type="button"
          className="ml-auto"
          onClick={() => {
            setIsEditing(true);
          }}
        >
          View
        </Button>
      </div>
      {isEditing ? (
        <ViewWorkout
          workoutId={workout.id}
          onDone={() => {
            setIsEditing(false);
          }}
        />
      ) : null}
    </div>
  );
};

const ViewWorkout: FC<{ workoutId: number; onDone: () => void }> = props => {
  const { workoutId, onDone } = props;
  const {
    data: workout,
    isLoading,
    isFetching,
  } = useQuery(singleWorkoutQueryOptions(workoutId));

  return (
    <div className="ml-8 mt-2 flex flex-col gap-2">
      {isLoading ? (
        <span>Loading workout...</span>
      ) : !workout ? (
        <span>Workout not found.</span>
      ) : (
        <div className="flex flex-col gap-1">
          <span>ID: {workout.id}</span>
          <span>Name: {workout.name}</span>
          <span>Date: {new Date(workout.date).toLocaleDateString()}</span>
          <span>Exercises: {workout.exercises.join(", ")}</span>
          <div className="flex gap-2 items-center">
            <Button
              size="sm"
              className="self-start"
              type="button"
              onClick={onDone}
            >
              Done
            </Button>
            {isFetching ? (
              <span className="text-blue-500">Refreshing ...</span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
