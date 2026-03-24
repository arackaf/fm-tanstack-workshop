import { useState } from "react";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lessons/14/workouts/")({
  component: RouteComponent,
  loader: async ({}) => {},
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  const [page, setPage] = useState(1);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(
    null,
  );

  return null;
}
