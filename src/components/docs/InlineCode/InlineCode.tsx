import type { ReactNode } from "react";
import styles from "./InlineCode.module.scss";

/** Code in running text or a table cell: mono, on the drawing's lines. */
export function InlineCode({ children }: { children: ReactNode }) {
  return <code className={styles.code}>{children}</code>;
}
