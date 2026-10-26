import type { ReactNode } from "react";
import styles from "./Panel.module.scss";

type PanelProps = {
  /** Draw the panel's own frame. A panel that fills a cell takes the cell's lines instead. */
  framed?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * A panel of the line drawing (scnx-platform square.css `.mat-panel`): one frame, and
 * what it holds is divided by its lines, never framed again.
 */
export function Panel({ framed = true, className, children }: PanelProps) {
  return (
    <div
      className={className ? `${styles.panel} ${className}` : styles.panel}
      data-framed={framed || undefined}
    >
      {children}
    </div>
  );
}
