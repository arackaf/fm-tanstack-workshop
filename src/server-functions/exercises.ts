import { eq } from "drizzle-orm";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getDb } from "@/data/db";
import { getExercises } from "@/data/exercises/get-exercises";
import { exercises as exercisesTable } from "@/drizzle/schema";
import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import { loggingMiddleware } from "@/middleware/logging-full";

export const getExercisesServerFn = createServerFn({ method: "GET" })
  // .middleware([loggingMiddleware])
  .handler(async () => {
    return getExercises();
  });

export const exercisesQueryOptions = () =>
  queryOptions({
    queryKey: ["exercises"],
    queryFn: () => {
      return getExercisesServerFn();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

export type EditExerciseInput = {
  id: number;
  name: string;
};

export const editExercise = createServerFn({ method: "POST" })
  .inputValidator((input: EditExerciseInput) => input)
  .handler(async ({ data }) => {
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    const name = data.name.trim();

    const db = await getDb();
    await db
      .update(exercisesTable)
      .set({ name })
      .where(eq(exercisesTable.id, data.id));
  });
