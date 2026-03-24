import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/lessons/14/workouts/workouts-client-side",
)({
  component: RouteComponent,
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  const { data } = useQuery({
    queryKey: ["workouts-server-route"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const workoutsResp = await fetch("/lessons/14/workouts/workouts-api-2");
      const workouts: { id: number; name: string }[] =
        await workoutsResp.json();

      console.log(workouts);

      return {
        workouts,
      };
    },
  });

  const workouts = data?.workouts;

  return (
    <div className="flex flex-col gap-4">
      {!workouts ? (
        <span>Loading...</span>
      ) : (
        workouts.map(workout => <div key={workout.id}>{workout.name}</div>)
      )}
      <hr />
      <Link
        to="/lessons/14/workouts"
        className="self-start rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-800"
        preload={false}
      >
        Call server route from server
      </Link>
    </div>
  );
}
