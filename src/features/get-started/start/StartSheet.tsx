import { Cells } from "@/components/docs/Cells";
import { Chip } from "@/components/docs/Chip";
import { Cta } from "@/components/docs/Cta";
import { ArrowRight } from "@/components/docs/Icons";
import { Install } from "@/components/docs/Install";
import { MetaList } from "@/components/docs/MetaList";
import { Sheet } from "@/components/docs/Sheet";
import { Display, Lede } from "@/components/docs/Type";
import { INSTALL, lineages } from "../data";
import { Lineage } from "./Lineage";
import styles from "./Start.module.scss";

const SUPPORT = ["React ^19", "SSR and RSC", "Strict CSP", "Zero runtime CSS", "OKLCH, P3"];

/** Sheet 01: the page's promise, the install line, and one component traced through its contracts. */
export function StartSheet() {
  return (
    <Sheet
      id="get-started"
      title="Get started"
      labelledBy="start-title"
      meta={[
        { term: "Release", value: "beta" },
        { term: "Sign-in", value: "none" },
      ]}
    >
      <Cells className={styles.over}>
        <div className={styles.copy}>
          <Chip tag="Beta">Attested builds · npm release staged</Chip>
          <Display id="start-title" size="medium">
            Start with the contract you need.
          </Display>
          <Lede>
            Behavior primitives, styled components, tokens and the release evidence behind them, all
            in one place and open to read. Install two packages, scope a theme root, and build.
          </Lede>
          <div className={styles.actions}>
            <Cta href="/components" variant="primary" icon={<ArrowRight size={16} />}>
              Browse components
            </Cta>
            <Install command={INSTALL} />
          </div>
          <MetaList label="Supported" items={SUPPORT} />
        </div>
        <Lineage lineages={lineages} />
      </Cells>
    </Sheet>
  );
}
