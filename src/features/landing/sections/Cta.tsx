import Link from "next/link";
import { REPOSITORY_URL } from "@/shared/lib/site";
import styles from "./closing.module.scss";

export function Cta() {
  return (
    <section className={styles.cta} aria-labelledby="cta-title">
      <h2 id="cta-title" className={styles.ctaTitle}>
        Ship the interface.
        <br />
        Keep the receipts.
      </h2>
      <p className={styles.ctaText}>
        Bring your brand, keep your stack, and verify every release you install.
      </p>
      <div className={styles.ctaActions}>
        <Link href="/components/button" className={styles.ctaPrimary}>
          Get started
        </Link>
        <a href={REPOSITORY_URL} className={styles.ctaSecondary}>
          View on GitHub
        </a>
      </div>
    </section>
  );
}
