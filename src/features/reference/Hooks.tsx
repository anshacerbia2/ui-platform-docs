"use client";

import { Block } from "@/components/docs/Block";
import { DataTable } from "@/components/docs/DataTable";
import { InlineCode } from "@/components/docs/InlineCode";
import { useThemeChoice } from "@/components/docs/ThemeChoice";
import styles from "./Reference.module.scss";

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
 * specification: the hook, where it applies, its Tier-2 fallback, that fallback's
 * value in the theme and mode the preview shows, and the floor that bounds it
 * whatever the hook says.
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
      <Block>
        <p>
          Each value reads a <InlineCode>--scnx-*</InlineCode> hook that falls back to a Tier-2
          token. Set a hook on a scope your product owns to change one value there; a theme changes
          the token behind it everywhere. A floor holds whatever the hook says. The value column
          follows the theme and mode chosen in the preview.
        </p>
        {hookScope ? <p>{hookScope}</p> : null}
      </Block>
      <DataTable
        caption="Hooks"
        head={["Hook", "Sets", "Tier-2 fallback", `Value · ${theme} ${mode}`, "Floor"]}
        rows={rows.map((r) => [
          <span key="h" title={r.purpose}>
            <InlineCode>{r.hook}</InlineCode>
          </span>,
          `${r.parts.join(", ")} · ${r.properties.join(", ")}`,
          <span key="f" className={styles.value}>
            {r.fallbacks.map((f) => (
              <InlineCode key={f}>{plain(f)}</InlineCode>
            ))}
          </span>,
          <span key="v" className={styles.value}>
            {(r.values[theme]?.[mode] ?? []).map((v, i) => (
              <InlineCode key={`${i}-${v}`}>{v}</InlineCode>
            ))}
          </span>,
          r.floor ? <InlineCode key="fl">{`≥ ${r.floor}`}</InlineCode> : "—",
        ])}
      />
    </>
  );
}
