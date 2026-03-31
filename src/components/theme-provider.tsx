import { DARK_MODE } from "@/APPLICATION-SETTINGS";
import { useRouterState } from "@tanstack/react-router";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(DARK_MODE ? "dark" : "light");
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isLessonsRoute =
    pathname === "/lessons" || pathname.startsWith("/lessons/");
  const appliedTheme: Theme = isLessonsRoute ? "light" : theme;

  useEffect(() => {
    const rootElement = document.documentElement;
    rootElement.classList.toggle("dark", appliedTheme === "dark");
    rootElement.style.colorScheme = appliedTheme;
  }, [appliedTheme]);

  const value = useMemo(() => ({ theme: appliedTheme, setTheme }), [appliedTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
