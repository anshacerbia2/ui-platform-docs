import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./ToolButton.module.scss";

type ToolButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "type" | "aria-label" | "aria-pressed"
> & {
  /** The accessible name; also the tooltip. Required, so an icon alone is never unnamed. */
  label: string;
  icon?: ReactNode;
  /** A toggle's state; leave it out for a plain action. */
  pressed?: boolean;
  children?: ReactNode;
};

/**
 * A tool on the drawing's lines: a square button with an icon, a short label, or both
 * (the docs' own control). With `pressed` it is a toggle, a raised cell when on.
 */
export function ToolButton({ label, icon, pressed, children, ...rest }: ToolButtonProps) {
  return (
    <button
      type="button"
      className={styles.tool}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
