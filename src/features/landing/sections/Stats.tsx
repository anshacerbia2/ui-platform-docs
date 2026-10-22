import { sourceUrl } from "@/shared/lib/reference";
import styles from "./closing.module.scss";

// Each figure links to where it is enforced at the pinned ui-platform commit.
const STATS = [
  { value: "0", text: "styles injected at run time. Static CSS that runs under a strict CSP.", source: sourceUrl("scripts/nextjs-consumer.mjs") },
  { value: "13", text: "evidence rows every release must pass, from clean install to strict CSP.", source: sourceUrl("scripts/evidence.mjs") },
  {
    value: "AA",
    text: "contrast for every pair a component renders, in every theme and mode.",
    source: sourceUrl("packages/design-system/scripts/tokens/check.mjs"),
  },
  { value: "L2", text: "SLSA build provenance, signed through Sigstore and publicly logged.", source: sourceUrl(".github/workflows/ci.yml") },
];

export function Stats() {
  return (
    <section className={styles.stats} aria-label="By the numbers">
      {STATS.map((s) => (
        <a key={s.value} href={s.source} className={styles.stat}>
          <span className={styles.statValue}>{s.value}</span>
          <span className={styles.statText}>{s.text}</span>
        </a>
      ))}
    </section>
  );
}
