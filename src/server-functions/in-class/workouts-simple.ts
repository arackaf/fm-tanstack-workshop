import { desc, eq, inArray } from "drizzle-orm";

import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getWorkouts } from "@/data/workouts/get-workouts";
import { getDb } from "@/data/db";

import {
  exercises as exercisesTable,
  workout as workoutTable,
  workoutSegment as workoutSegmentTable,
  workoutSegmentExercise as workoutSegmentExerciseTable,
} from "@/drizzle/schema";
import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import { loggingMiddleware } from "@/middleware/logging-full";

export const workoutHistoryQueryOptions = (page: number = 1) => {
  return queryOptions({
    queryKey: ["workouts", page],
    queryFn: () => {
      return getInClassWorkoutHistoryServerFn({
        data: { page, operation: "load-workouts" },
      });
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};

export type InClassWorkout = Awaited<
  ReturnType<typeof getInClassWorkoutHistoryServerFn>
>["workouts"][number];

export const getInClassWorkoutHistoryServerFn = createServerFn({
  method: "GET",
})
  .inputValidator((input: { page?: number }) => input)
  .middleware([loggingMiddleware])
  .handler(async ({ data }) => {
    const payload = await getWorkouts({
      page: data?.page ?? 1,
    });

    return {
      ...payload,
      workouts: payload.workouts.map(workout => {
        return {
          id: workout.id,
          name: workout.name,
          date: workout.workoutDate,
          exercises: Array.from(
            new Set(
              workout.segments.flatMap(segment =>
                segment.exercises.map(exercise => exercise.exerciseId),
              ),
            ),
          ),
        };
      }),
    };
  });

export const workoutByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["workout", id],
    queryFn: () => getInClassWorkoutById({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

export const getInClassWorkoutById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const { workouts } = await getWorkouts({ id: data.id });

    const workout = workouts[0] ?? null;
    if (workout) {
      return {
        id: workout.id,
        name: workout.name,
        date: workout.workoutDate,
        exercises: Array.from(
          new Set(
            workout.segments.flatMap(segment =>
              segment.exercises.map(exercise => exercise.exerciseId),
            ),
          ),
        ),
      };
    }

    return null;
  });

export const getWorkoutsWithExerciseNames = createServerFn({
  method: "GET",
})
  .inputValidator((input: { id?: number; page?: number }) => input)
  .handler(async ({ data }) => {
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));

    const db = await getDb();

    const page = data?.page ?? 1;
    const pageSize = 4;
    const queryLimit = data?.id !== undefined ? 1 : pageSize + 1;
    const queryOffset = data?.id !== undefined ? 0 : (page - 1) * pageSize;

    const workoutsBaseQuery = db
      .select({
        id: workoutTable.id,
        name: workoutTable.name,
        date: workoutTable.workoutDate,
      })
      .from(workoutTable);

    const workouts = await (
      data?.id !== undefined
        ? workoutsBaseQuery.where(eq(workoutTable.id, data.id))
        : workoutsBaseQuery
    )
      .orderBy(desc(workoutTable.workoutDate), desc(workoutTable.id))
      .limit(queryLimit)
      .offset(queryOffset);

    if (workouts.length === 0) {
      return {
        workouts: [],
        hasNextPage: false,
        page,
      };
    }

    const hasNextPage = data?.id === undefined && workouts.length > pageSize;
    const currentPageWorkouts = hasNextPage
      ? workouts.slice(0, pageSize)
      : workouts;
    const workoutIds = currentPageWorkouts.map(workout => workout.id);
    const workoutExerciseRows = await db
      .select({
        workoutId: workoutSegmentTable.workoutId,
        exerciseName: exercisesTable.name,
      })
      .from(workoutSegmentTable)
      .innerJoin(
        workoutSegmentExerciseTable,
        eq(
          workoutSegmentExerciseTable.workoutSegmentId,
          workoutSegmentTable.id,
        ),
      )
      .innerJoin(
        exercisesTable,
        eq(exercisesTable.id, workoutSegmentExerciseTable.exerciseId),
      )
      .where(inArray(workoutSegmentTable.workoutId, workoutIds))
      .orderBy(desc(workoutSegmentTable.workoutId));

    const exercisesByWorkoutId = new Map<number, string[]>();
    for (const row of workoutExerciseRows) {
      const existing = exercisesByWorkoutId.get(row.workoutId) ?? [];
      if (!existing.includes(row.exerciseName)) {
        existing.push(row.exerciseName);
      }
      exercisesByWorkoutId.set(row.workoutId, existing);
    }

    return {
      workouts: currentPageWorkouts.map(workout => {
        return {
          id: workout.id,
          name: workout.name,
          date: workout.date,
          exercises: exercisesByWorkoutId.get(workout.id) ?? [],
        };
      }),
      page,
      hasNextPage,
    };
  });
