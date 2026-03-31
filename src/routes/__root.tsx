import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";

import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";
import { DARK_MODE } from "@/APPLICATION-SETTINGS";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isLessonsRoute =
    pathname === "/lessons" || pathname.startsWith("/lessons/");

  return (
    <html lang="en" className={DARK_MODE && !isLessonsRoute ? "dark" : ""}>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
