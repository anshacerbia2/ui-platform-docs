import { DarkRoot } from "@/components/system/Theme";
import { CopyButton } from "./CopyButton";
import styles from "./CodeBlock.module.scss";

/** A block of code or a terminal session, with line numbers and a copy button. */
export function CodeBlock({
  code,
  title,
  language,
  numbered = true,
}: {
  code: string;
  title?: string;
  language?: string;
  numbered?: boolean;
}) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <DarkRoot>
      <figure className={styles.block}>
        {title ? (
          <figcaption className={styles.caption}>
            <span>{title}</span>
            <CopyButton value={code} label={`Copy ${title}`} />
          </figcaption>
        ) : null}
        <pre className={styles.pre} data-numbered={numbered || undefined} data-language={language}>
          <code>
            {lines.map((line, index) => (
              // Lines are positional; the index is their identity.
              // oxlint-disable-next-line react/no-array-index-key
              <span key={index} className={styles.line}>
                {line || " "}
              </span>
            ))}
          </code>
        </pre>
        {title ? null : (
          <span className={styles.floating}>
            <CopyButton value={code} label="Copy code" />
          </span>
        )}
      </figure>
    </DarkRoot>
  );
}
