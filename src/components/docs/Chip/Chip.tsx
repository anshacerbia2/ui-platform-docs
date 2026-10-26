import type { ReactNode } from "react";
import { Badge } from "@/components/system/Badge";
import styles from "./Chip.module.scss";

/**
 * A chip on the drawing's lines (scnx-platform square.css `.ix-chip`): the system's
 * Badge, square through its radius hook, beside a note in the HUD voice.
 */
export function Chip({ tag, children }: { tag: string; children: ReactNode }) {
  return (
    <span className={styles.chip}>
      <Badge emphasis="solid" size="small">
        {tag}
      </Badge>
      {children}
    </span>
  );
}
