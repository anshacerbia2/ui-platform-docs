import type { ReactNode } from "react";
import styles from "./reference.module.scss";

/** A page section: an anchor heading, an optional note on where its facts come from, and content. */
export function Section({ id, title, source, children }: { id: string; title: string; source?: ReactNode; children: ReactNode }) {
  return (
    <section className={styles.section} aria-labelledby={`${id}-title`}>
      <div className={styles.sectionHead}>
        <h2 id={`${id}-title`} className={styles.sectionTitle}>
          <a id={id} href={`#${id}`} className={styles.anchor}>
            {title}
          </a>
        </h2>
        {source ? <p className={styles.source}>{source}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className={styles.subHeading}>{children}</h3>;
}

export function Table({ head, rows, caption }: { head: string[]; rows: ReactNode[][]; caption: string }) {
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

export const Code = ({ children }: { children: ReactNode }) => <code className={styles.code}>{children}</code>;
