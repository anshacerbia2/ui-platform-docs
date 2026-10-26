import type { ReactNode } from "react";
import styles from "./Sheet.module.scss";

export type SheetFact = { term: string; value: ReactNode };

type SheetProps = {
  /** The section's id: its jump target and the key of its "here". */
  id: string;
  /** The sheet's short name: the ruler's title and the contents entry. */
  title: string;
  /** The bar's label, when it says more than the title ("One root, every mode"). */
  label?: string;
  /** The bar's facts, set to the right of its label. */
  meta?: SheetFact[];
  /** The heading that names the sheet. Without one, the bar's label is the sheet's h2. */
  labelledBy?: string;
  /** Pad the body and stack its blocks (the reference pages); otherwise blocks run edge to edge. */
  padded?: boolean;
  children: ReactNode;
};

/**
 * A section drawn as a sheet (TDD docs-site D14; scnx-platform SCROLL.md 2): a rule
 * across the page at its top, a cross where the rule meets each column line, and a
 * bar, `NN / Label ··· facts`, held under the nav while the sheet is read. The
 * section carries the id and the name, so "here", the contents and the ruler
 * measure its line, never the held bar.
 */
export function Sheet({
  id,
  title,
  label,
  meta,
  labelledBy,
  padded = false,
  children,
}: SheetProps) {
  const headingId = labelledBy ?? `${id}-title`;
  const name = label ?? title;
  return (
    <section id={id} data-sheet={title} className={styles.sheet} aria-labelledby={headingId}>
      <div className={styles.bar}>
        <span className={styles.number} aria-hidden="true" />
        {labelledBy ? (
          <span className={styles.label}>{name}</span>
        ) : (
          <h2 id={headingId} className={styles.label}>
            <a href={`#${id}`} className={styles.anchor}>
              {name}
            </a>
          </h2>
        )}
        {meta?.length ? (
          <dl className={styles.meta}>
            {meta.map((fact) => (
              <div key={fact.term}>
                <dt>{fact.term}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
      <div className={styles.body} data-sheet-body="" data-padded={padded || undefined}>
        {children}
      </div>
    </section>
  );
}
