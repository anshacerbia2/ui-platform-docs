"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { SITE_THEME } from "@/shared/lib/themes";

type Mode = "light" | "dark";
type Choice = {
  themes: string[];
  theme: string;
  mode: Mode;
  setTheme: (theme: string) => void;
  setMode: (mode: Mode) => void;
};

const ThemeChoiceContext = createContext<Choice | null>(null);

/**
 * The page's Theme × Mode choice: the preview renders in it, and the hooks table
 * shows each hook's value in it, so both answer for the same theme and mode.
 */
export function ThemeChoice({ themes, children }: { themes: string[]; children: ReactNode }) {
  const [theme, setTheme] = useState(themes[0] ?? SITE_THEME);
  const [mode, setMode] = useState<Mode>("light");
  return (
    <ThemeChoiceContext value={{ themes, theme, mode, setTheme, setMode }}>
      {children}
    </ThemeChoiceContext>
  );
}

/** The page's choice, or a local one when no ThemeChoice wraps the caller. */
export function useThemeChoice(themes: string[]): Choice {
  const shared = useContext(ThemeChoiceContext);
  const [theme, setTheme] = useState(themes[0] ?? SITE_THEME);
  const [mode, setMode] = useState<Mode>("light");
  return shared ?? { themes, theme, mode, setTheme, setMode };
}
