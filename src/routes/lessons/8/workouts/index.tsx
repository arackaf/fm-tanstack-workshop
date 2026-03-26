import { useRef, useState, type FC } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ExerciseSelector } from "@/components/ExerciseSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  editExercise,
  getExercisesServerFn,
} from "@/server-functions/exercises";
import { getWorkoutsWithExerciseNames } from "@/server-functions/in-class/workouts-simple";
import { getMuscleGroupsServerFn } from "@/server-functions/muscle-groups";

type ArrayOf<T> = T extends Array<infer U> ? U : never;
type Workout = ArrayOf<
  Awaited<ReturnType<typeof getWorkoutsWithExerciseNames>>["workouts"]
>;
type Exercise = ArrayOf<Awaited<ReturnType<typeof getExercisesServerFn>>>;

export const Route = createFileRoute("/lessons/8/workouts/")({
  component: RouteComponent,
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(
    null,
  );

  // TODO: note queries
  const {
    data: exercises,
    isLoading: isExercisesLoading,
    isFetching: isExercisesFetching,
  } = useQuery({
    queryKey: ["exercises"],
    queryFn: () =>
      getExercisesServerFn({
        data: { operation: "load-exercises" },
      }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const { data: muscleGroups } = useQuery({
    queryKey: ["muscleGroups"],
    queryFn: () => getMuscleGroupsServerFn(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const {
    data: workouts,
    isLoading: isWorkoutsPending,
    isFetching: isWorkoutsFetching,
  } = useQuery({
    queryKey: ["workouts"],
    queryFn: async () => {
      const result = await getWorkoutsWithExerciseNames({ data: { page: 1 } });
      return result.workouts;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const selectedExercise = exercises?.find(
    exercise => exercise.id === selectedExerciseId,
  );

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
          {isExercisesFetching ? (
            <div className="w-1/2">
              <span className="text-blue-500">Refreshing ...</span>
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
      {isWorkoutsPending || !workouts ? (
        <span>Loading workouts...</span>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl">Workouts</h1>
            {isWorkoutsFetching ? (
              <span className="text-blue-500">Refreshing ...</span>
            ) : null}
          </div>
          {workouts.map(workout => (
            <WorkoutRow key={workout.id} workout={workout} />
          ))}
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
  const queryClient = useQueryClient();
  const { mutateAsync: editExerciseMutation, isPending } = useMutation({
    mutationFn: async (name: string) => {
      await editExercise({
        data: {
          id: exercise.id,
          name,
        },
      });
    },
    onSuccess: async () => {
      // TODO: note invalidation
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      // TODO: note the queryKey - we invalidate ALL workouts
      queryClient.invalidateQueries({ queryKey: ["workout"], exact: false });

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
  } = useQuery({
    // TODO: note queryKey - it's hierarchical
    queryKey: ["workout", workoutId],
    queryFn: async () => {
      const result = await getWorkoutsWithExerciseNames({
        data: { id: workoutId },
      });

      return result.workouts[0] ?? null;
    },
    staleTime: 1000 * 3,
    gcTime: 1000 * 6,
  });

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
