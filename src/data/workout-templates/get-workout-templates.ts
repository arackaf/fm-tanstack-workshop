import { and, asc, desc, eq, sql, type SQLWrapper } from "drizzle-orm";

import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import { getDb } from "@/data/db";
import {
  workoutTemplate as workoutTemplateTable,
  workoutTemplateSegment as workoutTemplateSegmentTable,
  workoutTemplateSegmentExercise as workoutTemplateSegmentExerciseTable,
  workoutTemplateSegmentExerciseMeasurement as workoutTemplateSegmentExerciseMeasurementTable,
} from "@/drizzle/schema";
import { formatNumericForDisplay } from "../util/format-numeric";

type GetWorkoutTemplatesParams = {
  id?: number;
  page?: number;
};

const WORKOUT_TEMPLATE_LIST_LIMIT = 3;
const WORKOUT_TEMPLATE_LIST_QUERY_LIMIT = WORKOUT_TEMPLATE_LIST_LIMIT + 1;

type WorkoutTemplatesPayload = {
  workoutTemplates: WorkoutTemplateState[];
  page: number;
  hasNextPage: boolean;
};

export const getWorkoutTemplates = async (
  params: GetWorkoutTemplatesParams = {},
): Promise<WorkoutTemplatesPayload> => {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const db = await getDb();
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const offset = (page - 1) * WORKOUT_TEMPLATE_LIST_LIMIT;

  const conditions: SQLWrapper[] = [];

  if (params.id != null) {
    conditions.push(eq(workoutTemplateTable.id, params.id));
  }

  const templateIds = db.$with("valid_workout_templates").as(
    db
      .select({
        workout_template_id: sql<number>`${workoutTemplateTable.id}`.as(
          "workout_template_id",
        ),
      })
      .from(workoutTemplateTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(workoutTemplateTable.id))
      .limit(WORKOUT_TEMPLATE_LIST_QUERY_LIMIT)
      .offset(offset),
  );

  const rows = await db
    .with(templateIds)
    .select({
      templateId: workoutTemplateTable.id,
      templateName: workoutTemplateTable.name,
      templateDescription: workoutTemplateTable.description,
      segmentRowId: workoutTemplateSegmentTable.id,
      segmentOrder: workoutTemplateSegmentTable.segmentOrder,
      segmentSets: workoutTemplateSegmentTable.sets,
      exerciseRowId: workoutTemplateSegmentExerciseTable.id,
      exerciseOrder: workoutTemplateSegmentExerciseTable.exerciseOrder,
      exerciseExerciseId: workoutTemplateSegmentExerciseTable.exerciseId,
      exerciseExecutionType: workoutTemplateSegmentExerciseTable.executionType,
      exerciseDurationUnit: workoutTemplateSegmentExerciseTable.durationUnit,
      exerciseDistanceUnit: workoutTemplateSegmentExerciseTable.distanceUnit,
      exerciseWeightUnit:
        workoutTemplateSegmentExerciseTable.exerciseWeightUnit,
      measurementId: workoutTemplateSegmentExerciseMeasurementTable.id,
      measurementSetOrder:
        workoutTemplateSegmentExerciseMeasurementTable.setOrder,
      measurementReps: workoutTemplateSegmentExerciseMeasurementTable.reps,
      measurementRepsToFailure:
        workoutTemplateSegmentExerciseMeasurementTable.repsToFailure,
      measurementWeightUsed:
        workoutTemplateSegmentExerciseMeasurementTable.weightUsed,
      measurementDuration:
        workoutTemplateSegmentExerciseMeasurementTable.duration,
      measurementDistance:
        workoutTemplateSegmentExerciseMeasurementTable.distance,
    })
    .from(workoutTemplateTable)
    .innerJoin(
      templateIds,
      eq(workoutTemplateTable.id, templateIds.workout_template_id),
    )
    .leftJoin(
      workoutTemplateSegmentTable,
      eq(
        workoutTemplateSegmentTable.workoutTemplateId,
        workoutTemplateTable.id,
      ),
    )
    .leftJoin(
      workoutTemplateSegmentExerciseTable,
      eq(
        workoutTemplateSegmentExerciseTable.workoutTemplateSegmentId,
        workoutTemplateSegmentTable.id,
      ),
    )
    .leftJoin(
      workoutTemplateSegmentExerciseMeasurementTable,
      eq(
        workoutTemplateSegmentExerciseMeasurementTable.workoutTemplateSegmentExerciseId,
        workoutTemplateSegmentExerciseTable.id,
      ),
    )
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(
      asc(workoutTemplateTable.id),
      asc(workoutTemplateSegmentTable.segmentOrder),
      asc(workoutTemplateSegmentExerciseTable.exerciseOrder),
      asc(workoutTemplateSegmentExerciseMeasurementTable.setOrder),
    );

  const workoutTemplates = new Map<number, WorkoutTemplateState>();
  const segmentsByTemplate = new Map<
    number,
    WorkoutTemplateState["segments"]
  >();
  const exercisesBySegment = new Map<
    number,
    WorkoutTemplateState["segments"][number]["exercises"]
  >();

  for (const row of rows) {
    let workoutTemplate = workoutTemplates.get(row.templateId);
    if (!workoutTemplate) {
      workoutTemplate = {
        id: row.templateId,
        name: row.templateName,
        description: row.templateDescription,
        segments: [],
      };

      workoutTemplates.set(row.templateId, workoutTemplate);
      segmentsByTemplate.set(row.templateId, []);
    }

    if (
      row.segmentRowId == null ||
      row.segmentOrder == null ||
      row.segmentSets == null
    ) {
      continue;
    }

    const templateSegments = segmentsByTemplate.get(row.templateId)!;
    const latestSegment = templateSegments.at(-1);
    let segment =
      latestSegment?.id === row.segmentRowId ? latestSegment : undefined;

    if (!segment) {
      segment = {
        id: row.segmentRowId,
        workoutTemplateId: row.templateId,
        segmentOrder: row.segmentOrder,
        sets: row.segmentSets,
        exercises: [],
      };

      templateSegments.push(segment);
      exercisesBySegment.set(row.segmentRowId, []);
      workoutTemplate.segments.push(segment);
    }

    if (
      row.exerciseRowId == null ||
      row.exerciseOrder == null ||
      row.exerciseExerciseId == null
    ) {
      continue;
    }

    const segmentExercises = exercisesBySegment.get(row.segmentRowId)!;
    const latestExercise = segmentExercises.at(-1);
    let exercise =
      latestExercise?.id === row.exerciseRowId ? latestExercise : undefined;

    if (!exercise) {
      exercise = {
        id: row.exerciseRowId,
        workoutTemplateSegmentId: row.segmentRowId,
        exerciseOrder: row.exerciseOrder,
        exerciseId: row.exerciseExerciseId,
        executionType: row.exerciseExecutionType ?? null,
        exerciseWeightUnit: row.exerciseWeightUnit ?? null,
        durationUnit: row.exerciseDurationUnit ?? null,
        distanceUnit: row.exerciseDistanceUnit ?? null,
        measurements: [],
      };

      segmentExercises.push(exercise);
      segment.exercises.push(exercise);
    }

    if (row.measurementSetOrder != null) {
      exercise.measurements.push({
        id: row.measurementId ?? undefined,
        workoutTemplateSegmentExerciseId: row.exerciseRowId,
        setOrder: row.measurementSetOrder,
        reps: row.measurementReps,
        repsToFailure: row.measurementRepsToFailure,
        weightUsed: formatNumericForDisplay(row.measurementWeightUsed),
        duration: row.measurementDuration,
        distance: row.measurementDistance,
      });
    }
  }

  const templates = Array.from(workoutTemplates.values());
  const hasNextPage = templates.length > WORKOUT_TEMPLATE_LIST_LIMIT;
  const currentPageTemplates = hasNextPage
    ? templates.slice(0, WORKOUT_TEMPLATE_LIST_LIMIT)
    : templates;

  return {
    workoutTemplates: currentPageTemplates,
    page,
    hasNextPage,
  };
};
