import type { ReactNode } from "react";
import styles from "./TokenRows.module.scss";

export type TokenRowItem = {
  /** The token's path, `dimension.spacing.inset-default`. */
  name: string;
  cssName: string;
  /** What the token is for. */
  note?: string;
  /** The token drawn: a bar, a shape, a line of type. */
  specimen: ReactNode;
  value: ReactNode;
};

/**
 * Tokens as rows of the line drawing: the specimen, then the name, its custom
 * property and what it is for, then the value. `wide` gives the specimen half the
 * row, for type and surfaces.
 */
export function TokenRows({
  label,
  rows,
  wide = false,
}: {
  label: string;
  rows: TokenRowItem[];
  wide?: boolean;
}) {
  return (
    <ul className={styles.rows} aria-label={label} data-wide={wide || undefined}>
      {rows.map((row) => (
        <li key={row.name} className={styles.row}>
          <div className={styles.specimen}>{row.specimen}</div>
          <div className={styles.text}>
            <code className={styles.name}>{row.name}</code>
            <code className={styles.css}>{row.cssName}</code>
            {row.note ? <span className={styles.note}>{row.note}</span> : null}
          </div>
          <div className={styles.value}>{row.value}</div>
        </li>
      ))}
    </ul>
  );
}
