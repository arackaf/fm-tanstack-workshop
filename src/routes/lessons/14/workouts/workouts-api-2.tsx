import { getDb } from "@/data/db";
import { createFileRoute } from "@tanstack/react-router";

import { workout as workoutTable } from "@/drizzle/schema";
import { desc } from "drizzle-orm";
import { createMiddleware } from "@tanstack/react-start";

export const pocRequestMiddleware = createMiddleware({
  type: "request",
}).server(async ({ next }) => {
  const result = await next();

  console.log("In middleware");

  return result;
});

export const Route = createFileRoute("/lessons/14/workouts/workouts-api-2")({
  server: {
    middleware: [pocRequestMiddleware],
    handlers: {
      GET: async ({}) => {
        const db = await getDb();
        const workouts = await db
          .select()
          .from(workoutTable)
          .orderBy(desc(workoutTable.workoutDate), desc(workoutTable.id))
          .limit(3);

        return Response.json(workouts);
      },
    },
  },
});
