import type { ReactNode } from "react";
import styles from "./Type.module.scss";

type TypeProps = {
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div" | "strong";
  id?: string;
  /** A smaller step of the same voice: a closing headline, a lead in a narrow cell. */
  size?: "medium";
  className?: string;
  children: ReactNode;
};

// The chrome's two voices (scnx-platform brand book, "Type"): Inter speaks the
// content, the mono HUD voice speaks the instrument. Weights are typography
// tokens; the display, section heading and lede sizes have none and are the
// reference's (brand book, "Status").

function make(className: string | undefined, fallback: NonNullable<TypeProps["as"]>) {
  function TypeElement({ as: Tag = fallback, id, size, className: extra, children }: TypeProps) {
    return (
      <Tag id={id} className={extra ? `${className} ${extra}` : className} data-size={size}>
        {children}
      </Tag>
    );
  }
  return TypeElement;
}

/** The page's headline: Inter 500, tracked tight. */
export const Display = make(styles.display, "h1");
/** A sheet's large heading. */
export const Title = make(styles.title, "h2");
/** A cell's heading. */
export const Subtitle = make(styles.subtitle, "h3");
/** The paragraph that opens a sheet. */
export const Lede = make(styles.lede, "p");
/** Body copy in a cell, in the muted role. */
export const Body = make(styles.body, "p");
/** A kicker in the HUD voice. */
export const Eyebrow = make(styles.eyebrow, "p");
