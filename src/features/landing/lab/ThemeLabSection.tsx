import { landing } from "@/shared/lib/reference";
import styles from "../sections/sections.module.scss";
import { ThemeLab } from "./ThemeLab";

export function ThemeLabSection() {
  return (
    <section className={styles.split} aria-labelledby="lab-title">
      <div className={styles.splitCopy}>
        <span className={styles.eyebrow}>Bring your brand</span>
        <h2 id="lab-title" className={styles.title}>
          One root.
          <br />A verified theme.
        </h2>
        <p className={styles.splitText}>
          Switch the theme and the mode. The form is the real Tabs, TextField, and Button, inside a
          real theme root, and every foreground and background pair it renders is checked against
          WCAG 2.2 in each theme and mode before a release.
        </p>
      </div>
      <ThemeLab lab={landing.lab} swatches={landing.swatches} />
    </section>
  );
}
