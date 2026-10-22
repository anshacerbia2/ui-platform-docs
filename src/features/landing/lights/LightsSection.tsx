import { SectionHead } from "../sections/SectionHead";
import styles from "../sections/sections.module.scss";
import { LightsSplit } from "./LightsSplit";

export function LightsSection() {
  return (
    <section className={styles.stack} aria-labelledby="lights-title">
      <SectionHead
        id="lights-title"
        eyebrow="One root · every mode"
        title="Drag to switch the lights."
        note="Same markup, same components. One attribute on the root resolves every token for light or dark, and contrast is verified in both."
      />
      <LightsSplit />
    </section>
  );
}
