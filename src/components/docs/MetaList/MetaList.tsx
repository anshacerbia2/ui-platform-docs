import styles from "./MetaList.module.scss";

/** A row of short facts in the HUD voice, each after a small blue square (scnx-platform square.css `.ix-meta`). */
export function MetaList({ label, items }: { label: string; items: string[] }) {
  return (
    <ul className={styles.meta} aria-label={label}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
