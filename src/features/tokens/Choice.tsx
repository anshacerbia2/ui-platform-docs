"use client";

import type { ReactNode } from "react";
import { useThemeChoice } from "@/components/docs/ThemeChoice";
import { ToggleGroup } from "@/components/docs/ToggleGroup";
import { ThemeRoot } from "@/components/system/Theme";
import { SITE_THEME } from "@/shared/lib/themes";
import { withoutTransitions } from "@/shared/lib/withoutTransitions";
import type { ModeValues } from "./tokens";
import styles from "./Choice.module.scss";

const MODES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

// The token pages show one set of values, the site's own, as the example; the
// names are what they document, so no theme is named or offered.
const EXAMPLE = [SITE_THEME];

/**
 * The page's mode switch. Every live sample and every value on the page answers for
 * this one choice; it follows the reader's mode until they pick one.
 */
export function ChoiceBar() {
  const { mode, setMode } = useThemeChoice(EXAMPLE);
  return (
    <div className={styles.choice}>
      <span className={styles.choiceLabel}>Values shown in</span>
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

/** A root in the page's mode, on its own ground, with the mode named in its corner. */
export function ColorRoot({ children }: { children: ReactNode }) {
  const { mode } = useThemeChoice(EXAMPLE);
  return (
    <ThemeRoot mode={mode}>
      <div className={styles.root}>
        <span className={styles.rootLabel} aria-hidden="true">
          {mode} mode
        </span>
        {children}
      </div>
    </ThemeRoot>
  );
}

/** A token's value in the page's mode. */
export function TokenValue({ values }: { values: ModeValues }) {
  const { mode } = useThemeChoice(EXAMPLE);
  return <code className={styles.value}>{values[mode] ?? "—"}</code>;
}

/** A ratio from a per-mode list, in the page's mode. */
export function ChoiceRatio({
  results,
}: {
  results: { mode: string; ratio: number; pass: boolean }[];
}) {
  const { mode } = useThemeChoice(EXAMPLE);
  const result = results.find((r) => r.mode === mode);
  if (!result) return <span>—</span>;
  return (
    <span className={styles.ratio} data-pass={result.pass || undefined}>
      {result.ratio.toFixed(1)} : 1 <span>{result.pass ? "AA" : "fails"}</span>
    </span>
  );
}
