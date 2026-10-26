import type { ReactNode } from "react";
import styles from "./Block.module.scss";

type BlockProps = {
  /** A heading of the block, in the HUD voice: "Anatomy", "Keyboard". */
  title?: string;
  /** The block's body; a block with a title alone heads the table that follows it. */
  children?: ReactNode;
};

/**
 * A padded block of a sheet: text, a figure or a specimen, with the sheet's inline
 * pad. Tables and cells run edge to edge beside it, so a sheet stacks blocks and
 * tables without framing either.
 */
export function Block({ title, children }: BlockProps) {
  return (
    <div className={styles.block}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      {children}
    </div>
  );
}
