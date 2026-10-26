import styles from "./Tape.module.scss";

export type TapeEntry = {
  /** What the entry is about: a package, a check, a page count. */
  subject: string;
  /** What was proven. */
  detail: string;
  /** Where the proof is: a digest, a commit, a run. */
  ref: string;
};

/**
 * The receipt tape (scnx-platform instrument.css `.ix-tape`): the evidence of the
 * documented build, printed as a row that runs continuously. It pauses under the
 * pointer and on focus, and stands still, scrollable, under reduced motion.
 */
export function Tape({ label, entries }: { label: string; entries: TapeEntry[] }) {
  const row = (hidden: boolean) => (
    <ol className={styles.row} aria-hidden={hidden || undefined}>
      {entries.map((entry) => (
        <li key={entry.subject + entry.ref}>
          <span className={styles.ok}>verified</span>
          <b>{entry.subject}</b>
          {entry.detail}
          <span className={styles.ref}>{entry.ref}</span>
        </li>
      ))}
    </ol>
  );
  return (
    <div className={styles.tape} role="region" aria-label={label}>
      <div className={styles.track}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
