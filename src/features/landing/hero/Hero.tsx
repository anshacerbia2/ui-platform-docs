import Link from "next/link";
import { pin } from "@/shared/lib/reference";
import { CopyButton } from "@/shared/ui/CopyButton";
import { ArrowRight } from "@/shared/ui/icons";
import { HueTower } from "./HueTower";
import styles from "./Hero.module.scss";

const INSTALL = "pnpm add @scnx/system @scnx/core-ui";
const FACTS = ["React 19", "SSR · RSC", "strict CSP", "WCAG 2.2", "OKLCH · P3"];

export function Hero() {
  const version = pin.packages[0]?.version ?? "";
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.copy}>
        <span className={styles.badge}>
          <span className={styles.badgeTag}>{version.replace(/^(\d+\.\d+).*-(beta|alpha|rc).*$/, "$1 $2").toUpperCase()}</span>
          Attested builds · npm release staged
        </span>
        <h1 id="hero-title" className={styles.title}>
          Build interfaces
          <br />
          you can <span className={styles.accent}>prove.</span>
        </h1>
        <p className={styles.lead}>
          An accessible React design system with perceptual color, scoped multi-brand theming, and zero runtime CSS. Every release ships with the evidence that
          it works.
        </p>
        <div className={styles.actions}>
          <Link href="/components/button" className={styles.start}>
            Get started
            <ArrowRight size={16} />
          </Link>
          <div className={styles.install}>
            <span className={styles.prompt}>$</span>
            <code>{INSTALL}</code>
            <CopyButton value={INSTALL} label="Copy the install command" />
          </div>
        </div>
        <ul className={styles.facts} aria-label="Built for">
          {FACTS.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </div>
      <div className={styles.visual}>
        <HueTower />
      </div>
    </section>
  );
}
