import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getWorkouts } from "@/data/workouts/get-workouts";
import type { WorkoutNextPageToken } from "@/data/workouts/get-workouts";
import { insertWorkout } from "@/data/workouts/insert-workout";
import { updateWorkout as updateWorkoutData } from "@/data/workouts/update-workout";
import type { WorkoutState } from "@/data/workouts/workout-state";

type WorkoutHistoryInput = {
  nextPage?: WorkoutNextPageToken;
  previousPage?: WorkoutNextPageToken;
};

export const workoutHistoryQueryOptions = (input?: WorkoutHistoryInput) =>
  queryOptions({
    queryKey: ["workouts", input],
    queryFn: () => {
      console.log("Workouts Query");
      return getWorkoutHistory({ data: input ?? {} });
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

const getWorkoutHistory = createServerFn({ method: "GET" })
  .inputValidator((input: WorkoutHistoryInput) => input)
  .handler(async ({ data }) => {
    const payload = await getWorkouts({
      nextPage: data.nextPage,
      previousPage: data.previousPage,
    });

    return {
      ...payload,
    };
  });

export const workoutByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["workout", id],
    queryFn: () => getWorkoutById({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

const getWorkoutById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const { workouts } = await getWorkouts({ id: data.id });

    return workouts[0] ?? null;
  });

export const saveWorkout = createServerFn({ method: "POST" })
  .inputValidator((input: WorkoutState) => input)
  .handler(async ({ data }) => {
    await insertWorkout(data);
  });

export const updateWorkout = createServerFn({ method: "POST" })
  .inputValidator((input: WorkoutState) => input)
  .handler(async ({ data }) => {
    await updateWorkoutData(data);
  });
