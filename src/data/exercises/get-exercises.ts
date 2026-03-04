import { asc } from "drizzle-orm";

import { getDb } from "@/drizzle/db";
import { exercises as exercisesTable } from "@/drizzle/schema";

export const getExercises = async () => {
  console.log("Get Exercises from DB");
  const db = await getDb();
  return db.select().from(exercisesTable).orderBy(asc(exercisesTable.name));
};
