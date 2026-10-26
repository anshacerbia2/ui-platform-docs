import { DarkRoot } from "@/components/system/Theme";
import { CopyButton } from "@/components/docs/CopyButton";
import styles from "./CodeBlock.module.scss";

type CodeBlockProps = {
  code: string;
  /** The bar's label: a file name, or the shell it runs in. */
  title?: string;
  language?: string;
  numbered?: boolean;
  /** A terminal session: `$` lines are commands, `✓` lines are results, `#` lines are notes. */
  shell?: boolean;
};

const toneOf = (line: string) => {
  if (line.startsWith("$ ")) return "command";
  if (line.startsWith("✓")) return "ok";
  if (/^\s*(#|\/\/)/.test(line)) return "note";
  return undefined;
};

/**
 * A block of code or a terminal session on a dark theme root, in either site mode
 * (scnx-platform instrument.css `.ix-term`): a bar with its lamps and label, the
 * lines, and a copy cell.
 */
export function CodeBlock({
  code,
  title = "code",
  language,
  numbered = true,
  shell = false,
}: CodeBlockProps) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <DarkRoot>
      <figure className={styles.block}>
        <figcaption className={styles.bar}>
          <span className={styles.lamps} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className={styles.title}>{title}</span>
          <CopyButton value={code} label={`Copy ${title}`} />
        </figcaption>
        <pre className={styles.pre} data-numbered={numbered || undefined} data-language={language}>
          <code>
            {lines.map((line, index) => (
              // Lines are positional; the index is their identity.
              // oxlint-disable-next-line react/no-array-index-key
              <span
                key={index}
                className={styles.line}
                data-tone={shell ? toneOf(line) : undefined}
              >
                {line || " "}
              </span>
            ))}
          </code>
        </pre>
      </figure>
    </DarkRoot>
  );
}
