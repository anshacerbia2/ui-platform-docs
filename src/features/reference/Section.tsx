import type { ReactNode } from "react";
import styles from "./reference.module.scss";

/**
 * A page section drawn as a sheet (TDD docs-site D14; scnehaux-design
 * scnx-platform SCROLL.md 2): a rule across the page column at its top, a
 * cross where the rule meets each column line, and a bar held under the nav
 * while it is read, `NN / Name ··· source`. The section itself carries the id
 * and the sheet's name, so "here", the contents, and the ruler measure the
 * section's line, never the held bar.
 */
export function Section({
  id,
  title,
  source,
  children,
}: {
  id: string;
  title: string;
  source?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} data-sheet={title} className={styles.section} aria-labelledby={`${id}-title`}>
      <div className={styles.sectionHead}>
        <span className={styles.sectionNo} aria-hidden="true" />
        <h2 id={`${id}-title`} className={styles.sectionTitle}>
          <a href={`#${id}`} className={styles.anchor}>
            {title}
          </a>
        </h2>
        {source ? <p className={styles.source}>{source}</p> : null}
      </div>
      <div className={styles.sectionBody} data-sheet-body="">
        {children}
      </div>
    </section>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className={styles.subHeading}>{children}</h3>;
}

export function Table({
  head,
  rows,
  caption,
}: {
  head: string[];
  rows: ReactNode[][];
  caption: string;
}) {
  return (
    <div className={styles.tableWrap}>
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

export const Code = ({ children }: { children: ReactNode }) => (
  <code className={styles.code}>{children}</code>
);
