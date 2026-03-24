import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/lessons/14/workouts/")({
  component: RouteComponent,
  loader: async () => {
    const workoutsResp = await fetch(
      "http://localhost:3000/lessons/14/workouts/workouts-api",
    );
    const workouts: { id: number; name: string }[] = await workoutsResp.json();

    return {
      workouts,
    };
  },
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  const { workouts } = Route.useLoaderData();
  return (
    <div className="flex flex-col gap-4">
      {workouts.map(workout => (
        <div key={workout.id}>{workout.name}</div>
      ))}
      <hr />
      <Link
        to="/lessons/14/workouts/workouts-client-side"
        className="self-start rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-800"
        preload={false}
      >
        Call server route from client
      </Link>
    </div>
  );
}
