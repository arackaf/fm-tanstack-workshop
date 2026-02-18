import { sql } from "drizzle-orm";
import { boolean, check, integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const muscleGroupEnum = pgEnum("muscle_group", [
  "chest",
  "shoulders",
  "biceps",
  "triceps",
  "quadriceps",
  "hamstrings",
  "calves",
  "lats",
  "back",
]);

export const users = pgTable("users", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  username: varchar({ length: 250 }).notNull().unique(),
  password: varchar({ length: 250 }).notNull(),
  displayName: varchar("display_name", { length: 250 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const exercises = pgTable("exercises", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  name: varchar({ length: 150 }),
  description: text(),
  muscleGroups: muscleGroupEnum("muscle_groups").array(),
  isCompound: boolean("is_compound"),
});

export const workout = pgTable("workout", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  name: varchar({ length: 50 }),
  description: text(),
});

export const workoutSegment = pgTable(
  "workout_segment",
  {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    workoutId: integer("workout_id")
      .notNull()
      .references(() => workout.id, { onDelete: "cascade" }),
    segmentOrder: integer("segment_order").notNull(),
    sets: integer().notNull(),
  },
  (table) => [
    check("workout_segment_segment_order_check", sql`${table.segmentOrder} > 0`),
    check("workout_segment_sets_check", sql`${table.sets} > 0`),
  ]
);

export const workoutSegmentExercise = pgTable(
  "workout_segment_exercise",
  {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    workoutSegmentId: integer("workout_segment_id")
      .notNull()
      .references(() => workoutSegment.id, { onDelete: "cascade" }),
    exerciseOrder: integer("exercise_order").notNull(),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id),
    reps: integer().notNull(),
  },
  (table) => [
    check("workout_segment_exercise_exercise_order_check", sql`${table.exerciseOrder} > 0`),
    check("workout_segment_exercise_reps_check", sql`${table.reps} > 0`),
  ]
);
