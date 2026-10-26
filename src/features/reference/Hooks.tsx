"use client";

import { Code, Table } from "./Section";
import { useThemeChoice } from "./ThemeChoice";
import styles from "./reference.module.scss";

export type HookRow = {
  hook: string;
  parts: string[];
  properties: string[];
  /** Tier-2 fallback templates, one per rule that reads the hook. */
  fallbacks: string[];
  floor: string | null;
  purpose: string;
  /** Each fallback's value per theme and mode, from the published tokens. */
  values: Record<string, Record<string, string[]>>;
};

const plain = (template: string) => template.replace(/\{([a-z0-9.-]+)\}/g, "$1");

/**
 * The hooks a component reads (ui-platform TDD styled HK2, HK5), from its
 * specification: the hook, where it applies, its Tier-2 fallback, that
 * fallback's value in the theme and mode the preview shows, and the floor that
 * bounds it whatever the hook says.
 */
export function Hooks({
  rows,
  hookScope,
  themes,
}: {
  rows: HookRow[];
  hookScope?: string;
  themes: string[];
}) {
  const { theme, mode } = useThemeChoice(themes);
  return (
    <>
      {hookScope ? <p className={styles.lead}>{hookScope}</p> : null}
      <Table
        caption="Hooks"
        head={["Hook", "Sets", "Tier-2 fallback", `Value · ${theme} ${mode}`, "Floor"]}
        rows={rows.map((r) => [
          <span key="h" title={r.purpose}>
            <Code>{r.hook}</Code>
          </span>,
          `${r.parts.join(", ")} · ${r.properties.join(", ")}`,
          <span key="f" className={styles.value}>
            {r.fallbacks.map((f) => (
              <Code key={f}>{plain(f)}</Code>
            ))}
          </span>,
          <span key="v" className={styles.value}>
            {(r.values[theme]?.[mode] ?? []).map((v, i) => (
              <Code key={`${i}-${v}`}>{v}</Code>
            ))}
          </span>,
          r.floor ? <Code key="fl">{`≥ ${r.floor}`}</Code> : "—",
        ])}
      />
    </>
  );
}
