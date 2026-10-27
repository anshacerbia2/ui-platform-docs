"use client";

import type { ReactNode } from "react";
import { useThemeChoice } from "@/components/docs/ThemeChoice";
import { ToggleGroup } from "@/components/docs/ToggleGroup";
import { ThemeRoot } from "@/components/system/Theme";
import type { TokenRow } from "@/shared/lib/reference";
import { THEME_IDS } from "@/shared/lib/themes";
import { withoutTransitions } from "@/shared/lib/withoutTransitions";
import styles from "./Color.module.scss";

const MODES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

/**
 * The page's Theme × Mode switch. Every live sample and every value on the page answers
 * for this one choice; the mode follows the reader's until they pick one.
 */
export function ChoiceBar() {
  const { theme, setTheme, mode, setMode } = useThemeChoice(THEME_IDS);
  return (
    <div className={styles.choice}>
      <span className={styles.choiceLabel}>Values shown for</span>
      <ToggleGroup
        label="Theme"
        size="small"
        options={THEME_IDS.map((id) => ({ value: id }))}
        value={theme}
        onChange={(id) => withoutTransitions(() => setTheme(id))}
      />
      <ToggleGroup
        label="Mode"
        size="small"
        options={MODES}
        value={mode}
        onChange={(m) => withoutTransitions(() => setMode(m))}
      />
    </div>
  );
}

/** A theme root in the page's choice, on its own ground, with the choice named in its corner. */
export function ColorRoot({ children }: { children: ReactNode }) {
  const { theme, mode } = useThemeChoice(THEME_IDS);
  return (
    <ThemeRoot theme={theme} mode={mode}>
      <div className={styles.root}>
        <span className={styles.rootLabel} aria-hidden="true">
          {theme} · {mode}
        </span>
        {children}
      </div>
    </ThemeRoot>
  );
}

/** A token's value in the page's choice. */
export function TokenValue({ values }: { values: TokenRow["values"] }) {
  const { theme, mode } = useThemeChoice(THEME_IDS);
  return <code className={styles.value}>{values[theme]?.[mode] ?? "—"}</code>;
}

/** A ratio from a per-theme, per-mode list, in the page's choice. */
export function ChoiceRatio({
  results,
}: {
  results: { theme: string; mode: string; ratio: number; pass: boolean }[];
}) {
  const { theme, mode } = useThemeChoice(THEME_IDS);
  const result = results.find((r) => r.theme === theme && r.mode === mode);
  if (!result) return <span>—</span>;
  return (
    <span className={styles.ratio} data-pass={result.pass || undefined}>
      {result.ratio.toFixed(1)} : 1 <span>{result.pass ? "AA" : "fails"}</span>
    </span>
  );
}
