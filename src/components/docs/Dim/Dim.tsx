import styles from "./Dim.module.scss";

/**
 * A dimension line, `|<—— label ——>|` (scnx-platform instrument.css `.ix-dim`): it
 * names a measure of the drawing. `signal` draws it in blue, for the one measure a
 * sheet is about.
 */
export function Dim({ children, signal = false }: { children: string; signal?: boolean }) {
  return (
    <span className={styles.dim} data-signal={signal || undefined}>
      {children}
    </span>
  );
}
