import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/admin")({
  component: RouteComponent,
  loader: async ({ location }) => {
    return {
      pathname: location.pathname.split("/").at(-1),
    };
  },
});

const sectionHeadings = {
  exercises: "Exercises",
  settings: "Settings",
  "workout-templates": "Workout Templates",
};

function RouteComponent() {
  const { pathname } = Route.useLoaderData();

  const sectionHeading =
    sectionHeadings[pathname as keyof typeof sectionHeadings];

  return (
    <div>
      <span className="text-sm text-muted-foreground dark:text-slate-400">
        Admin section: {sectionHeading}
      </span>
      <Outlet />
    </div>
  );
}
