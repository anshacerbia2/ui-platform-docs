import type { ReactNode } from "react";
import styles from "./sections.module.scss";

/** A landing section's heading row: eyebrow and title on one side, a note on the other. */
export function SectionHead({
  id,
  eyebrow,
  title,
  note,
}: {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  note?: ReactNode;
}) {
  return (
    <div className={styles.head}>
      <div className={styles.headTitle}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        <h2 id={id} className={styles.title}>
          {title}
        </h2>
      </div>
      {note ? <p className={styles.note}>{note}</p> : null}
    </div>
  );
}
