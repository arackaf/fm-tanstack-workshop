import { pgTable, unique, integer, varchar, timestamp, text, index, foreignKey, check, boolean, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const muscleGroup = pgEnum("muscle_group", ["chest", "shoulders", "biceps", "triceps", "quadriceps", "hamstrings", "calves", "lats", "back"]);

export const users = pgTable(
  "users",
  {
    id: integer()
      .primaryKey()
      .generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
    username: varchar({ length: 250 }).notNull(),
    password: varchar({ length: 250 }).notNull(),
    displayName: varchar("display_name", { length: 250 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
  },
  (table) => [unique("users_username_key").on(table.username)]
);

export const workout = pgTable("workout", {
  id: integer()
    .primaryKey()
    .generatedAlwaysAsIdentity({ name: "workout_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
  name: varchar({ length: 50 }),
  description: text(),
});

export const workoutSegment = pgTable(
  "workout_segment",
  {
    id: integer()
      .primaryKey()
      .generatedAlwaysAsIdentity({ name: "workout_segment_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
    workoutId: integer("workout_id").notNull(),
    segmentOrder: integer("segment_order").notNull(),
    sets: integer().notNull(),
  },
  (table) => [
    index("idx_workout_segment_workout_id_segment_order").using(
      "btree",
      table.workoutId.asc().nullsLast().op("int4_ops"),
      table.segmentOrder.asc().nullsLast().op("int4_ops")
    ),
    foreignKey({
      columns: [table.workoutId],
      foreignColumns: [workout.id],
      name: "workout_segment_workout_id_fkey",
    }).onDelete("cascade"),
    check("workout_segment_segment_order_check", sql`segment_order > 0`),
    check("workout_segment_sets_check", sql`sets > 0`),
  ]
);

export const workoutSegmentExercise = pgTable(
  "workout_segment_exercise",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "workout_segment_exercise_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    workoutSegmentId: integer("workout_segment_id").notNull(),
    exerciseOrder: integer("exercise_order").notNull(),
    exerciseId: integer("exercise_id").notNull(),
    reps: integer().notNull(),
  },
  (table) => [
    index("idx_workout_segment_exercise_segment_id_exercise_order").using(
      "btree",
      table.workoutSegmentId.asc().nullsLast().op("int4_ops"),
      table.exerciseOrder.asc().nullsLast().op("int4_ops")
    ),
    foreignKey({
      columns: [table.workoutSegmentId],
      foreignColumns: [workoutSegment.id],
      name: "workout_segment_exercise_workout_segment_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.exerciseId],
      foreignColumns: [exercises.id],
      name: "workout_segment_exercise_exercise_id_fkey",
    }),
    check("workout_segment_exercise_exercise_order_check", sql`exercise_order > 0`),
    check("workout_segment_exercise_reps_check", sql`reps > 0`),
  ]
);

export const exercises = pgTable(
  "exercises",
  {
    id: integer()
      .primaryKey()
      .generatedAlwaysAsIdentity({ name: "exercises_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
    name: varchar({ length: 150 }),
    description: text(),
    muscleGroups: muscleGroup("muscle_groups").array(),
    isCompound: boolean("is_compound"),
  },
  (table) => [index("idx_exercises_muscle_groups_gin").using("gin", table.muscleGroups.asc().nullsLast().op("array_ops"))]
);
