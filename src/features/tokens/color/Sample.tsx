import { Check } from "@/components/docs/Icons";
import styles from "./Color.module.scss";

/**
 * A color token drawn the way its role is used (static rules from
 * src/generated/swatches.css, so it renders on the server): a surface or a shadow
 * color as a fill, text as letters, an icon as a glyph, a border as an outline. A
 * `contrast` token sits on its scheme's solid fill, the only ground it is for.
 */
export function Sample({ token, size = "medium" }: { token: string; size?: "small" | "medium" }) {
  const [, scheme, role, emphasis] = token.split(".");
  if (role === "text" || role === "icon") {
    return (
      <span
        className={styles.sample}
        data-kind="ink"
        data-size={size}
        data-swatch={emphasis === "contrast" ? `color.${scheme}.surface.solid.default` : undefined}
        aria-hidden="true"
      >
        <span className={styles.ink} data-color-token={token}>
          {role === "text" ? "Aa" : <Check size={size === "small" ? 14 : 20} />}
        </span>
      </span>
    );
  }
  if (role === "border") {
    return (
      <span
        className={styles.sample}
        data-kind="edge"
        data-size={size}
        data-color-token={token}
        aria-hidden="true"
      />
    );
  }
  return (
    <span
      className={styles.sample}
      data-kind="fill"
      data-size={size}
      data-swatch={token}
      aria-hidden="true"
    />
  );
}
