import { Cells } from "@/components/docs/Cells";
import { Chip } from "@/components/docs/Chip";
import { Cta } from "@/components/docs/Cta";
import { Facts } from "@/components/docs/Facts";
import { ArrowRight } from "@/components/docs/Icons";
import { Install } from "@/components/docs/Install";
import { MetaList } from "@/components/docs/MetaList";
import { Sheet } from "@/components/docs/Sheet";
import { Tape } from "@/components/docs/Tape";
import { Display, Lede } from "@/components/docs/Type";
import { landing } from "@/shared/lib/reference";
import { INSTALL, releaseFacts, tape, version, versionTag } from "../data";
import { Assembly } from "./Assembly";
import styles from "./Proof.module.scss";

const SUPPORT = ["React 19", "SSR and RSC", "Strict CSP", "WCAG 2.2", "OKLCH, P3"];

/** Sheet 01: the claim, the install line, and the four contracts of a component assembling. */
export function ProofSheet() {
  return (
    <Sheet
      id="proof"
      title="Proof"
      label="Scnehaux UI"
      labelledBy="hero-title"
      meta={[
        { term: "Design system", value: versionTag },
        { term: "Build", value: "attested" },
      ]}
    >
      <Cells className={styles.hero}>
        <div className={styles.copy}>
          <Chip tag={versionTag}>Attested builds · npm release staged</Chip>
          <Display id="hero-title">
            Build interfaces you can prove
            <svg
              className={styles.mark}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              role="img"
              aria-label="."
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </Display>
          <Lede>
            An accessible React design system with perceptual color, scoped multi-brand theming, and
            zero runtime CSS. Every release ships with the evidence that it works.
          </Lede>
          <div className={styles.actions}>
            <Cta href="/get-started" variant="primary" icon={<ArrowRight size={16} />}>
              Get started
            </Cta>
            <Install command={INSTALL} />
          </div>
          <MetaList label="Supported" items={SUPPORT} />
        </div>
        <Assembly swatches={landing.swatches} version={version} />
      </Cells>
      <Facts label="Release" items={releaseFacts} />
      <Tape label="Evidence of the documented build" entries={tape} />
    </Sheet>
  );
}
