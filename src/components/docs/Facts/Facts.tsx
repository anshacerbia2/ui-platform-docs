import type { ReactNode } from "react";
import styles from "./Facts.module.scss";

export type Fact = {
  term: string;
  value: ReactNode;
  /** A fact that reports a passing check. */
  ok?: boolean;
};

/**
 * A title block set as a full-width row of cells (scnx-platform square.css "Facts"):
 * a term in the HUD voice over its value, one line between any two.
 */
export function Facts({ label, items }: { label: string; items: Fact[] }) {
  return (
    <dl className={styles.facts} aria-label={label}>
      {items.map((fact) => (
        <div key={fact.term}>
          <dt>{fact.term}</dt>
          <dd data-ok={fact.ok || undefined}>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
