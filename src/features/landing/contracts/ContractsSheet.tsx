import Link from "next/link";
import { Cta } from "@/components/docs/Cta";
import { Dim } from "@/components/docs/Dim";
import { Lead } from "@/components/docs/Lead";
import { Sheet } from "@/components/docs/Sheet";
import { Body, Display, Lede, Subtitle, Title } from "@/components/docs/Type";
import { REPOSITORY_URL, SECTIONS } from "@/shared/lib/site";
import styles from "./Contracts.module.scss";

const MEASURES = ["behavior", "look", "values", "proof"];

/** Sheet 07: the four contracts every page links, and the closing call to action. */
export function ContractsSheet() {
  return (
    <Sheet
      id="contracts"
      title="Contracts"
      label="Four contracts, one system"
      labelledBy="contracts-title"
      meta={[{ term: "Adopt", value: "behavior alone, or the full look" }]}
    >
      <Lead>
        <Title id="contracts-title">
          Every page links its primitive, its tokens and its evidence.
        </Title>
      </Lead>
      <div className={styles.contracts}>
        <div className={styles.measures} aria-hidden="true">
          {MEASURES.map((measure, i) => (
            <Dim key={measure} signal={i === MEASURES.length - 1}>
              {measure}
            </Dim>
          ))}
        </div>
        {SECTIONS.map((section, i) => (
          <Link key={section.href} href={section.href} className={styles.contract}>
            <span className={styles.no}>{String(i + 1).padStart(2, "0")}</span>
            <Subtitle as="span">{section.label}</Subtitle>
            <Body as="span">{section.description}</Body>
            <span className={styles.package}>{section.package}</span>
          </Link>
        ))}
      </div>
      <div className={styles.closing}>
        <Display as="h2" size="medium">
          Ship the interface. Keep the receipts.
        </Display>
        <Lede>Bring your brand, keep your stack, and verify every release you install.</Lede>
        <div className={styles.actions}>
          <Cta href="/get-started" variant="primary">
            Get started
          </Cta>
          <Cta href={REPOSITORY_URL} variant="secondary">
            View on GitHub
          </Cta>
        </div>
      </div>
    </Sheet>
  );
}
