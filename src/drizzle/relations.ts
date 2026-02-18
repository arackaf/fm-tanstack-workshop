import { relations } from "drizzle-orm/relations";
import { workout, workoutSegment, workoutSegmentExercise, exercises } from "./schema";

export const workoutSegmentRelations = relations(workoutSegment, ({ one, many }) => ({
  workout: one(workout, {
    fields: [workoutSegment.workoutId],
    references: [workout.id],
  }),
  workoutSegmentExercises: many(workoutSegmentExercise),
}));

export const workoutRelations = relations(workout, ({ many }) => ({
  workoutSegments: many(workoutSegment),
}));

export const workoutSegmentExerciseRelations = relations(workoutSegmentExercise, ({ one }) => ({
  workoutSegment: one(workoutSegment, {
    fields: [workoutSegmentExercise.workoutSegmentId],
    references: [workoutSegment.id],
  }),
  exercise: one(exercises, {
    fields: [workoutSegmentExercise.exerciseId],
    references: [exercises.id],
  }),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutSegmentExercises: many(workoutSegmentExercise),
}));
