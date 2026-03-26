import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/")({
  component: RouteComponent,
  loader: async () => {
    throw redirect({
      to: "/app/workouts",
      search: { page: 1 },
    });
  },
});

function RouteComponent() {
  return <div>Hello "/app/"!</div>;
}
