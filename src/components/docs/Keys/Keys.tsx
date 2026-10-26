import styles from "./Keys.module.scss";

/** A key or a chord, `Shift+Tab`, as keycaps on the drawing's lines. */
export function Keys({ value }: { value: string }) {
  return (
    <span className={styles.keys}>
      {value.split("+").map((key) => (
        <kbd key={key} className={styles.key}>
          {key}
        </kbd>
      ))}
    </span>
  );
}
