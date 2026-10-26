import { CopyButton } from "@/components/docs/CopyButton";
import styles from "./Install.module.scss";

/** An install line on the drawing's lines (scnx-platform square.css `.ix-install`): the command and its copy cell. */
export function Install({
  command,
  label = "Copy the install command",
}: {
  command: string;
  label?: string;
}) {
  return (
    <span className={styles.install}>
      <code className={styles.command}>
        <span className={styles.prompt} aria-hidden="true">
          $
        </span>
        {command}
      </code>
      <CopyButton value={command} label={label} variant="cell" />
    </span>
  );
}
