import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { asc } from "drizzle-orm";

import { db } from "../../../drizzle/db";
import { exercises } from "../../../drizzle/schema";

const getExercises = createServerFn({ method: "GET" }).handler(async () => {
  return db.select().from(exercises).orderBy(asc(exercises.name));
});

const exercisesQueryOptions = () =>
  queryOptions({
    queryKey: ["exercises", "list"],
    queryFn: () => getExercises(),
  });

export const Route = createFileRoute("/app/admin/exercises")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(exercisesQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery(exercisesQueryOptions());

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-4xl px-6 py-10 md:px-8">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Exercises
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            All exercises in alphabetical order.
          </p>
        </header>

        <ul className="space-y-3">
          {data.map(exercise => (
            <li
              key={exercise.id}
              className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm transition hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-white">
                    {exercise.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {exercise.description ?? "No description yet."}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    exercise.isCompound
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-slate-700/80 text-slate-200"
                  }`}
                >
                  {exercise.isCompound ? "Compound" : "Isolation"}
                </span>
              </div>

              {exercise.muscleGroups?.length ? (
                <p className="mt-3 text-xs uppercase tracking-wide text-sky-300/90">
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
