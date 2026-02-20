import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { asc, sql } from "drizzle-orm";

import { Checkbox } from "@/components/ui/checkbox";

import { db } from "../../../drizzle/db";
import { exercises } from "../../../drizzle/schema";

const getExercises = createServerFn({ method: "GET" }).handler(async () => {
  return db.select().from(exercises).orderBy(asc(exercises.name));
});

const getMuscleGroups = createServerFn({ method: "GET" }).handler(async () => {
  const result = await db.execute<{ value: string }>(sql`
    select unnest(enum_range(null::muscle_group))::text as value
  `);

  return result.rows.map(row => row.value);
});

const exercisesQueryOptions = () =>
  queryOptions({
    queryKey: ["exercises", "list"],
    queryFn: () => getExercises(),
  });

const muscleGroupsQueryOptions = () =>
  queryOptions({
    queryKey: ["exercises", "muscle-groups"],
    queryFn: () => getMuscleGroups(),
  });

export const Route = createFileRoute("/app/admin/exercises")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(exercisesQueryOptions()),
      context.queryClient.ensureQueryData(muscleGroupsQueryOptions()),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const { data: muscleGroups } = useSuspenseQuery(muscleGroupsQueryOptions());
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>(
    [],
  );

  const filteredExercises = useMemo(() => {
    if (!selectedMuscleGroups.length) {
      return exercises;
    }

    return exercises.filter(exercise =>
      exercise.muscleGroups?.some(group =>
        selectedMuscleGroups.includes(group),
      ),
    );
  }, [exercises, selectedMuscleGroups]);

  const toggleMuscleGroup = (muscleGroup: string, checked: boolean) => {
    setSelectedMuscleGroups(current =>
      checked
        ? current.includes(muscleGroup)
          ? current
          : [...current, muscleGroup]
        : current.filter(group => group !== muscleGroup),
    );
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto w-full max-w-4xl px-6 py-10 md:px-8">
        <header className="mb-8">
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-50 md:text-4xl">
            Exercises
          </h1>
        </header>

        <section className="mb-8 rounded-xl border border-slate-700/80 bg-slate-800/55 p-4 backdrop-blur-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300/90">
            Filter by muscle group
          </h2>
          <div className="mt-3 flex flex-wrap gap-4">
            {muscleGroups.map(muscleGroup => {
              const isChecked = selectedMuscleGroups.includes(muscleGroup);

              return (
                <label
                  key={muscleGroup}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-200/90"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={checked =>
                      toggleMuscleGroup(muscleGroup, checked === true)
                    }
                  />
                  <span className="capitalize">{muscleGroup}</span>
                </label>
              );
            })}
          </div>
        </section>

        <ul className="space-y-3">
          {filteredExercises.map(exercise => (
            <li
              key={exercise.id}
              className="rounded-xl border border-slate-700/80 bg-slate-800/55 p-4 shadow-sm transition hover:border-slate-600"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-slate-50">
                    {exercise.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-300/80">
                    {exercise.description ?? "No description yet."}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    exercise.isCompound
                      ? "bg-emerald-400/20 text-emerald-200"
                      : "bg-slate-700/70 text-slate-100/90"
                  }`}
                >
                  {exercise.isCompound ? "Compound" : "Isolation"}
                </span>
              </div>

              {exercise.muscleGroups?.length ? (
                <p className="mt-3 text-xs uppercase tracking-wide text-sky-200/80">
                  {exercise.muscleGroups.join(" • ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
