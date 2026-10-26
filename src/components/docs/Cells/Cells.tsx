import type { ElementType, ReactNode } from "react";
import styles from "./Cells.module.scss";

type CellsProps = {
  /** The element the grid renders as (a list of cells is a `ul`). */
  as?: ElementType;
  /** Equal columns from the large breakpoint up; the caller's class sets any other layout. */
  columns?: 2 | 3 | 4;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
};

/**
 * Cells that share their lines (scnx-platform square.css "Cells"): the grid shows the
 * line colour through a 1px gap, so a cell is never framed on its own, and cells
 * never sit in a box inside a box.
 */
export function Cells({ as: Tag = "div", columns, className, children, ...rest }: CellsProps) {
  return (
    <Tag
      className={className ? `${styles.cells} ${className}` : styles.cells}
      data-columns={columns}
      {...rest}
    >
      {children}
    </Tag>
  );
}
