import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getExercises } from "@/data/exercises/get-exercises";

const getExercisesServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return getExercises();
  },
);

export const exercisesQueryOptions = () =>
  queryOptions({
    queryKey: ["exercises"],
    queryFn: () => {
      console.log("Exercises Query");
      return getExercisesServerFn();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
