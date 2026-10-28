import styles from "./TokenName.module.scss";

export type NameSegment = {
  /** The segment as written in the name. */
  code: string;
  /** What the segment is: scheme, role, emphasis, state. */
  part: string;
  /** The values the segment may take, listed under it. */
  values?: readonly string[];
};

/**
 * A token name taken apart (STD-UIP-TKN-001, "Canonical grammar per domain"): each
 * segment in the HUD voice over what it is, and, when given, the closed vocabulary
 * it is drawn from. The last segment is the signal.
 */
export function TokenName({ label, segments }: { label: string; segments: NameSegment[] }) {
  return (
    <figure className={styles.name} aria-label={label}>
      <ol className={styles.segments}>
        {segments.map((segment, i) => (
          <li
            key={segment.part}
            className={styles.segment}
            data-last={i === segments.length - 1 || undefined}
          >
            <code className={styles.code}>
              {segment.code}
              {i < segments.length - 1 ? <span className={styles.dot}>.</span> : null}
            </code>
            <span className={styles.part}>{segment.part}</span>
            {segment.values ? (
              <ul className={styles.values} aria-label={`${segment.part} values`}>
                {segment.values.map((value) => (
                  <li key={value} data-current={value === segment.code || undefined}>
                    {value}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>
    </figure>
  );
}
