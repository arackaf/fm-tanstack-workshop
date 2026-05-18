import { Suspense, type ReactNode } from "react";
import { UserInfo } from "./user-info";

type RscLayoutProps = {
  children?: ReactNode;
};

export function RscLayout({ children }: RscLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-emerald-950/40 bg-linear-to-br from-emerald-600 via-teal-600 to-emerald-700 px-6 py-4 shadow-md">
        <div className="flex max-w-5xl items-center gap-6">
          <Suspense
            fallback={
              <div className="flex h-[52px] items-center gap-3 w-36 rounded-xl bg-black/15 px-3 py-2 ring-1 ring-white/25 backdrop-blur-sm"></div>
            }
          >
            <UserInfo />
          </Suspense>
          <div>
            <h1 className="ml-12 text-lg font-bold tracking-tight text-white drop-shadow-sm sm:text-xl">
              Fitness Tracker
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
