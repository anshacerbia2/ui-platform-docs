import styles from "./Swatch.module.scss";

/**
 * A colour token's swatch: a small square painted by the generated swatch rule
 * (`[data-swatch]`, src/generated/swatches.css), so it resolves in whatever theme
 * root holds it.
 */
export function Swatch({ token }: { token: string }) {
  return <span className={styles.swatch} data-swatch={token} title={token} aria-hidden="true" />;
}
