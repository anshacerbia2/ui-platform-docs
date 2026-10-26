"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useTheme } from "@/components/system/Theme";
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
 * A Theme × Mode choice. The mode follows the page's own until the reader picks one,
 * so a preview opens in the mode the reader is in.
 */
function useChoice(themes: string[]): Choice {
  const page = useTheme();
  const [theme, setTheme] = useState(themes[0] ?? SITE_THEME);
  const [picked, setMode] = useState<Mode | null>(null);
  return { themes, theme, mode: picked ?? page.resolvedMode, setTheme, setMode };
}

/**
 * The page's Theme × Mode choice: the preview renders in it, and the hooks table
 * shows each hook's value in it, so both answer for the same theme and mode.
 */
export function ThemeChoice({ themes, children }: { themes: string[]; children: ReactNode }) {
  const choice = useChoice(themes);
  return <ThemeChoiceContext value={choice}>{children}</ThemeChoiceContext>;
}

/** The page's choice, or a local one when no ThemeChoice wraps the caller. */
export function useThemeChoice(themes: string[]): Choice {
  const shared = useContext(ThemeChoiceContext);
  const own = useChoice(themes);
  return shared ?? own;
}
