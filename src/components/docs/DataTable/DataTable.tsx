import type { ReactNode } from "react";
import styles from "./DataTable.module.scss";

type DataTableProps = {
  /** The table's accessible caption. */
  caption: string;
  head: string[];
  rows: ReactNode[][];
};

/**
 * A table of the line drawing (scnx-platform Docs-Button.html, "Props"): heads in the
 * HUD voice, one line under each row, the first column set as the row's name.
 */
export function DataTable({ caption, head, rows }: DataTableProps) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className="u-visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            // Rows are positional within a generated table.
            // oxlint-disable-next-line react/no-array-index-key
            <tr key={i}>
              {row.map((cell, j) => (
                // oxlint-disable-next-line react/no-array-index-key
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
