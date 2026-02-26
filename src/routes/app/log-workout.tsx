import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { asc } from "drizzle-orm";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Header } from "@/components/Header";

import { db } from "../../drizzle/db";
import { exercises } from "../../drizzle/schema";

type DraftSegmentExercise = {
  exerciseId: string;
  reps: string;
  repsToFailure: boolean;
};

type DraftSegment = {
  sets: string;
  exercises: DraftSegmentExercise[];
};

const createDraftExercise = (): DraftSegmentExercise => ({
  exerciseId: "",
  reps: "8",
  repsToFailure: false,
});

const createDraftSegment = (): DraftSegment => ({
  sets: "3",
  exercises: [createDraftExercise()],
});

const getExercisesForSelection = createServerFn({ method: "GET" }).handler(
  async () => {
    return db
      .select({
        id: exercises.id,
        name: exercises.name,
      })
      .from(exercises)
      .orderBy(asc(exercises.name));
  },
);

const exercisesQueryOptions = () =>
  queryOptions({
    queryKey: ["exercises", "for-workout-create"],
    queryFn: () => getExercisesForSelection(),
  });

export const Route = createFileRoute("/app/log-workout")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(exercisesQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: exerciseOptions } = useSuspenseQuery(exercisesQueryOptions());
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workoutDate, setWorkoutDate] = useState(
    new Date().toISOString().split("T")[0] ?? "",
  );
  const [segments, setSegments] = useState<DraftSegment[]>([
    createDraftSegment(),
  ]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const updateSegment = (segmentIndex: number, nextSegment: DraftSegment) => {
    setSegments(current =>
      current.map((segment, index) =>
        index === segmentIndex ? nextSegment : segment,
      ),
    );
  };

  const addSegment = () => {
    setSegments(current => [...current, createDraftSegment()]);
  };

  const removeSegment = (segmentIndex: number) => {
    setSegments(current =>
      current.length === 1
        ? current
        : current.filter((_, index) => index !== segmentIndex),
    );
  };

  const addExerciseToSegment = (segmentIndex: number) => {
    setSegments(current =>
      current.map((segment, index) =>
        index === segmentIndex
          ? {
              ...segment,
              exercises: [...segment.exercises, createDraftExercise()],
            }
          : segment,
      ),
    );
  };

  const removeExerciseFromSegment = (
    segmentIndex: number,
    exerciseIndex: number,
  ) => {
    setSegments(current =>
      current.map((segment, index) => {
        if (index !== segmentIndex) {
          return segment;
        }

        if (segment.exercises.length === 1) {
          return segment;
        }

        return {
          ...segment,
          exercises: segment.exercises.filter(
            (_, idx) => idx !== exerciseIndex,
          ),
        };
      }),
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    setIsSaving(true);

    try {
      // TODO
      setName("");
      setDescription("");
      setWorkoutDate(new Date().toISOString().split("T")[0] ?? "");
      setSegments([createDraftSegment()]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create workout.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section>
      <Header title="Log Workout" />
      <p className="mb-8 text-sm text-muted-foreground dark:text-slate-300/80">
        Create a full workout with segments and ordered exercises.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 rounded-xl border border-border bg-card p-4 dark:border-slate-700/80 dark:bg-slate-800/55 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Workout name</span>
            <input
              required
              value={name}
              onChange={event => setName(event.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2"
              placeholder="Push Day - Week 6"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Workout date</span>
            <input
              required
              type="date"
              value={workoutDate}
              onChange={event => setWorkoutDate(event.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm md:col-span-2">
            <span className="font-medium">Description</span>
            <textarea
              value={description}
              onChange={event => setDescription(event.target.value)}
              className="min-h-20 rounded-md border border-input bg-background px-3 py-2"
              placeholder="Optional notes about this workout."
            />
          </label>
        </div>

        {segments.map((segment, segmentIndex) => (
          <div
            key={`segment-${segmentIndex + 1}`}
            className="space-y-4 rounded-xl border border-border bg-card p-4 dark:border-slate-700/80 dark:bg-slate-800/55"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">
                Segment {segmentIndex + 1}
              </h2>
              <button
                type="button"
                onClick={() => removeSegment(segmentIndex)}
                disabled={segments.length === 1}
                className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Remove segment
              </button>
            </div>

            <label className="flex max-w-36 flex-col gap-2 text-sm">
              <span className="font-medium">Sets</span>
              <input
                required
                min={1}
                type="number"
                value={segment.sets}
                onChange={event =>
                  updateSegment(segmentIndex, {
                    ...segment,
                    sets: event.target.value,
                  })
                }
                className="rounded-md border border-input bg-background px-3 py-2"
              />
            </label>

            <div className="space-y-3">
              {segment.exercises.map((segmentExercise, exerciseIndex) => (
                <div
                  key={`segment-${segmentIndex + 1}-exercise-${exerciseIndex + 1}`}
                  className="grid gap-3 rounded-lg border border-border/80 bg-background/70 p-3 md:grid-cols-[1.2fr_0.7fr_auto]"
                >
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium">
                      Exercise {exerciseIndex + 1}
                    </span>
                    <select
                      required
                      value={segmentExercise.exerciseId}
                      onChange={event =>
                        setSegments(current =>
                          current.map((currentSegment, idx) => {
                            if (idx !== segmentIndex) {
                              return currentSegment;
                            }

                            return {
                              ...currentSegment,
                              exercises: currentSegment.exercises.map(
                                (exercise, exerciseIdx) =>
                                  exerciseIdx === exerciseIndex
                                    ? {
                                        ...exercise,
                                        exerciseId: event.target.value,
                                      }
                                    : exercise,
                              ),
                            };
                          }),
                        )
                      }
                      className="rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="">Select an exercise</option>
                      {exerciseOptions.map(option => (
                        <option key={option.id} value={option.id}>
                          {option.name ?? `Exercise #${option.id}`}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="flex flex-col gap-2 text-sm">
                    <span className="font-medium">Reps</span>
                    <input
                      required={!segmentExercise.repsToFailure}
                      disabled={segmentExercise.repsToFailure}
                      min={1}
                      type="number"
                      value={segmentExercise.reps}
                      onChange={event =>
                        setSegments(current =>
                          current.map((currentSegment, idx) => {
                            if (idx !== segmentIndex) {
                              return currentSegment;
                            }

                            return {
                              ...currentSegment,
                              exercises: currentSegment.exercises.map(
                                (exercise, exerciseIdx) =>
                                  exerciseIdx === exerciseIndex
                                    ? {
                                        ...exercise,
                                        reps: event.target.value,
                                      }
                                    : exercise,
                              ),
                            };
                          }),
                        )
                      }
                      className="rounded-md border border-input bg-background px-3 py-2 disabled:opacity-60"
                    />

                    <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={segmentExercise.repsToFailure}
                        onChange={event =>
                          setSegments(current =>
                            current.map((currentSegment, idx) => {
                              if (idx !== segmentIndex) {
                                return currentSegment;
                              }

                              return {
                                ...currentSegment,
                                exercises: currentSegment.exercises.map(
                                  (exercise, exerciseIdx) =>
                                    exerciseIdx === exerciseIndex
                                      ? {
                                          ...exercise,
                                          repsToFailure: event.target.checked,
                                        }
                                      : exercise,
                                ),
                              };
                            }),
                          )
                        }
                      />
                      Reps to failure
                    </label>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() =>
                        removeExerciseFromSegment(segmentIndex, exerciseIndex)
                      }
                      disabled={segment.exercises.length === 1}
                      className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addExerciseToSegment(segmentIndex)}
                className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-xs font-semibold"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add exercise
              </button>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={addSegment}
            className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm font-semibold"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add segment
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Create workout"}
          </button>
        </div>

        {errorMessage ? (
          <p className="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-md border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            {successMessage}
          </p>
        ) : null}
      </form>
    </section>
  );
}
