import styles from "./Logo.module.scss";

// The mark: two slanted bars, the upper one set right (scnehaux-horizontal-open-black.svg,
// the owner, 2026-10-29), drawn in its own 21 × 9 box.
const MARK = "M23 8L20 12L9 12L12 8ZM16 13L13 17L2 17L5 13Z";

/**
 * The Scnehaux UI mark in the ink role, so it is dark on a light page and light on a
 * dark one. It is wider than tall: `size` sets its height to 0.6 of it and its width
 * to 1.4, the mark's 21:9.
 */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      className={styles.logo}
      width={size * 1.4}
      height={size * 0.6}
      viewBox="2 8 21 9"
      aria-hidden="true"
      focusable="false"
    >
      <path className={styles.mark} d={MARK} />
    </svg>
  );
}
