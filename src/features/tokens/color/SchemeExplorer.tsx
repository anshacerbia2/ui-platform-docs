"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/docs/CopyButton";
import { InlineCode } from "@/components/docs/InlineCode";
import { SegmentedControl } from "@/components/system/SegmentedControl";
import type { ModeValues } from "../tokens";
import { ColorRoot, TokenValue } from "../Choice";
import { Sample } from "./Sample";
import styles from "./Color.module.scss";

/** A token as the page sends it, compact: its path, then its light and dark values. */
export type TokenTuple = [name: string, light: string | undefined, dark: string | undefined];
type Cell = { name: string; cssName: string; values: ModeValues };

type Props = {
  schemes: readonly string[];
  roles: readonly string[];
  /** The vocabularies in the standard's order, so rows and columns read the same everywhere. */
  emphases: readonly string[];
  states: readonly string[];
  tokens: TokenTuple[];
};

/**
 * One scheme and one role as a grid: emphasis down, state across, a sample in each
 * cell that exists. Pick a cell to read its custom property and its value.
 */
export function SchemeExplorer({ schemes, roles, emphases, states, tokens }: Props) {
  const [scheme, setScheme] = useState(schemes[0] ?? "primary");
  const [role, setRole] = useState(roles[0] ?? "surface");
  const [picked, setPicked] = useState<string | null>(null);
  const prefix = `color.${scheme}.${role}.`;
  // the custom property is the path with hyphens, so only the path and values are sent
  const cells = useMemo(
    () =>
      new Map<string, Cell>(
        tokens
          .filter(([name]) => name.startsWith(prefix))
          .map(([name, light, dark]) => [
            name,
            { name, cssName: `--ds-${name.replaceAll(".", "-")}`, values: { light, dark } },
          ]),
      ),
    [tokens, prefix],
  );
  const has = (e: string, s: string) => cells.has(`${prefix}${e}.${s}`);
  const rows = emphases.filter((e) => states.some((s) => has(e, s)));
  const columns = states.filter((s) => rows.some((e) => has(e, s)));
  const first = rows
    .flatMap((e) => columns.map((s) => `${prefix}${e}.${s}`))
    .find((n) => cells.has(n));
  const current = cells.get(picked && cells.has(picked) ? picked : (first ?? "")) ?? null;
  return (
    <div className={styles.explorer}>
      <div className={styles.explorerBar}>
        <SegmentedControl aria-label="Scheme" size="small" value={scheme} onValueChange={setScheme}>
          {schemes.map((value) => (
            <SegmentedControl.Item key={value} value={value}>
              {value}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl>
        <SegmentedControl aria-label="Role" size="small" value={role} onValueChange={setRole}>
          {roles.map((value) => (
            <SegmentedControl.Item key={value} value={value}>
              {value}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl>
      </div>
      <ColorRoot>
        <div className={styles.gridWrap}>
          <table className={styles.grid}>
            <caption className="u-visually-hidden">
              {scheme} {role} tokens by emphasis and state
            </caption>
            <thead>
              <tr>
                <th scope="col">Emphasis</th>
                {columns.map((s) => (
                  <th key={s} scope="col">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e}>
                  <th scope="row">{e}</th>
                  {columns.map((s) => {
                    const name = `${prefix}${e}.${s}`;
                    if (!cells.has(name))
                      return (
                        <td key={s}>
                          <span className={styles.none}>—</span>
                        </td>
                      );
                    return (
                      <td key={s}>
                        <button
                          type="button"
                          className={styles.cell}
                          aria-pressed={current?.name === name}
                          aria-label={name}
                          title={name}
                          onClick={() => setPicked(name)}
                        >
                          <Sample token={name} />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {current ? (
          <div className={styles.detail} aria-live="polite">
            <Sample token={current.name} />
            <div className={styles.detailText}>
              <code className={styles.detailPath}>{current.name}</code>
              <span className={styles.detailVar}>
                <InlineCode>{current.cssName}</InlineCode>
                <CopyButton value={`var(${current.cssName})`} label={`Copy ${current.cssName}`} />
              </span>
              <TokenValue values={current.values} />
            </div>
          </div>
        ) : null}
      </ColorRoot>
    </div>
  );
}
