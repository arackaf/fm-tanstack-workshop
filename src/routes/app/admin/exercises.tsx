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
    <div className="p-5">
      <ul>
        {data.map(exercise => (
          <li key={exercise.id}>
            {exercise.name} {exercise.isCompound ? "✅" : "❌"}
            <br />
            {exercise.muscleGroups?.join(", ")}
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}
