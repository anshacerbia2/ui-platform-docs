import type { ReactNode } from "react";
import styles from "./FactGrid.module.scss";

export type GridFact = { term: string; value: ReactNode; aside?: ReactNode };

/**
 * Facts as cells that share their lines (scnx-platform Docs-Button.html,
 * "Accessibility contract"): a term, an optional measure beside it, and the value.
 */
export function FactGrid({ label, items }: { label: string; items: GridFact[] }) {
  return (
    <dl className={styles.grid} aria-label={label}>
      {items.map((fact) => (
        <div key={fact.term}>
          <dt>
            <span>{fact.term}</span>
            {fact.aside ? <span className={styles.aside}>{fact.aside}</span> : null}
          </dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
