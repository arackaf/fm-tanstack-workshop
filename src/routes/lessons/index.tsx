import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/lessons/")({
  component: RouteComponent,
});

type LessonKey =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15";
const lessonSummaryHeading: { [key in LessonKey]: string } = {
  1: "Routing",
  2: "Loaders",
  3: "Loading data",
  4: "Route caching",
  5: "Data in layouts",
  6: "Streaming I",
  7: "Streaming and Suspense",
  8: "Introducing TanStack Query",
  9: "Integrating TanStack Query",
  10: "TanStack Query and Suspense I",
  11: "TanStack Query and Suspense II",
  12: "Middleware",
  13: "Advanced Middleware",
  14: "API Routes",
  15: "Static Pre-rendering",
};

type PageledLessonKey = "11";
type PagelessLessonKey = Exclude<LessonKey, PageledLessonKey | "15">;

function RouteComponent() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      <h1 className="text-3xl font-extrabold tracking-tight">Lessons</h1>
      <div className="flex flex-col gap-2">
        {Object.entries(lessonSummaryHeading).map(([idx, desc]) =>
          idx === "11" ? (
            <Link
              to={`/lessons/${idx as PageledLessonKey}/workouts`}
              search={{ page: 1 }}
              preload={false}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-800"
              key={idx}
            >
              Lesson {idx} - {desc}
            </Link>
          ) : idx === "15" ? (
            <Link
              to={`/lessons/${idx}`}
              preload={false}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-800"
              key={idx}
            >
              Lesson {idx} - {desc}
            </Link>
          ) : (
            <Link
              to={`/lessons/${idx as PagelessLessonKey}/workouts`}
              preload={false}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-800"
              key={idx}
            >
              Lesson {idx} - {desc}
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
