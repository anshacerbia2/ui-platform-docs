import Link from "next/link";
import { Block } from "@/components/docs/Block";
import { Cells } from "@/components/docs/Cells";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DataTable } from "@/components/docs/DataTable";
import { FactGrid } from "@/components/docs/FactGrid";
import { ArrowRight } from "@/components/docs/Icons";
import { Facts } from "@/components/docs/Facts";
import { InlineCode } from "@/components/docs/InlineCode";
import { PageHead } from "@/components/docs/PageHead";
import { Sheet } from "@/components/docs/Sheet";
import { TextLink } from "@/components/docs/TextLink";
import { Body, Eyebrow, Subtitle } from "@/components/docs/Type";
import { DocsLayout } from "@/components/shell/DocsLayout";
import { ThemeRoot } from "@/components/system/Theme";
import { tokenList, tokenThemes } from "@/shared/lib/reference";

import { TokenName } from "../TokenName";
import { CATEGORIES } from "../tokens";
import styles from "./Overview.module.scss";

const SECTIONS = [
  { id: "tiers", title: "Three tiers" },
  { id: "names", title: "Names" },
  { id: "modes", title: "Light and dark" },
  { id: "use", title: "Using tokens" },
  { id: "categories", title: "Categories" },
];

const TIERS = [
  {
    tier: "Tier 1",
    name: "Core primitives",
    pattern: "color.{hue}.{axis}.{step}",
    text: "The raw scales the values are built from. Internal: never published, never used by a component or a product.",
    tag: "Internal",
  },
  {
    tier: "Tier 2",
    name: "Semantic tokens",
    pattern: "--ds-color-primary-surface-solid-default",
    text: "The public contract. A name says what a value is for, and it stays when the value changes. This is what you use.",
    tag: "Use these",
    current: true,
  },
  {
    tier: "Tier 3",
    name: "Component hooks",
    pattern: "--scnx-button-background",
    text: "One component's styling API. Each falls back to a Tier-2 token; set it on a scope you own to restyle that component there.",
    tag: "Per component",
  },
];

const USE = `.invoice {
  padding: var(--ds-dimension-spacing-inset-default);
  border-radius: var(--ds-dimension-radius-container);
  background: var(--ds-color-neutral-surface-raised-default);
  box-shadow: var(--ds-effect-material-raised);
  color: var(--ds-color-neutral-text-default-default);
}

.invoice-total {
  color: var(--ds-color-neutral-text-strong-default);
}`;

/** One name, both modes: the same markup in a light root and a dark one. */
function Specimen({ mode }: { mode: "light" | "dark" }) {
  return (
    <figure className={styles.specimenCell}>
      <ThemeRoot mode={mode}>
        <div className={styles.specimen}>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Invoice 2041</p>
            <p className={styles.cardBody}>Due 30 November 2026</p>
            <span className={styles.cardAction}>Pay now</span>
          </div>
        </div>
      </ThemeRoot>
      <figcaption className={styles.caption}>{mode} mode</figcaption>
    </figure>
  );
}

/** The tokens' front page: what a token is, how it is named and used, and the categories. */
export function OverviewPage() {
  const standard = Object.values(tokenThemes)[0]?.standard;
  return (
    <DocsLayout toc={SECTIONS}>
      <PageHead
        title="Tokens"
        lead="A token is a design decision with a name. Use the name, never the value: the value changes in dark mode or in a later release, and your product follows without a change to its code."
      />
      <Facts
        label="Tokens"
        items={[
          { term: "Public tokens", value: String(tokenList.length) },
          { term: "Modes", value: "light, dark" },
          { term: standard?.id ?? "Standard", value: `version ${standard?.version}` },
        ]}
      />

      <Sheet id="tiers" title="Three tiers" meta={[{ term: "Public", value: "Tier 2" }]}>
        <Cells as="ol" columns={3} className={styles.tiers} aria-label="Token tiers">
          {TIERS.map((t) => (
            <li key={t.tier} className={styles.tier} data-current={t.current || undefined}>
              <Eyebrow>{t.tier}</Eyebrow>
              <Subtitle size="large">{t.name}</Subtitle>
              <Body>{t.text}</Body>
              <code className={styles.pattern}>{t.pattern}</code>
              <span className={styles.tag}>{t.tag}</span>
            </li>
          ))}
        </Cells>
      </Sheet>

      <Sheet id="names" title="Names" label="Anatomy of a name">
        <TokenName
          label="The token name color.primary.surface.solid.default, segment by segment"
          segments={[
            { code: "color", part: "Domain" },
            { code: "primary", part: "Scheme" },
            { code: "surface", part: "Role" },
            { code: "solid", part: "Emphasis" },
            { code: "default", part: "State" },
          ]}
        />
        <Block>
          <p>
            A name is a path from the general to the particular. In CSS it becomes a custom property
            with the <InlineCode>--ds-</InlineCode> prefix and hyphens between segments:{" "}
            <InlineCode>color.primary.surface.solid.default</InlineCode> is{" "}
            <InlineCode>--ds-color-primary-surface-solid-default</InlineCode>. Every domain has its
            own grammar, and each segment comes from a closed list, so a name that is not in the
            list does not exist.
          </p>
        </Block>
        <DataTable
          caption="The grammar of each token domain"
          head={["Domain", "Grammar", "Tokens"]}
          rows={CATEGORIES.map((c) => [
            c.title,
            <InlineCode key="p">{c.pattern}</InlineCode>,
            String(c.count),
          ])}
        />
      </Sheet>

      <Sheet id="modes" title="Light and dark" meta={[{ term: "Modes", value: "light, dark" }]}>
        <Block>
          <p>
            Every token has a value for light and one for dark. The names never change between them;
            the values do. Below, the same card reads the same tokens in both.
          </p>
        </Block>
        <Cells columns={2} className={styles.specimens} aria-label="One card in light and dark">
          <Specimen mode="light" />
          <Specimen mode="dark" />
        </Cells>
        <Block title="The mode">
          <p>
            <InlineCode>data-scnx-resolved-mode</InlineCode> on a root sets light or dark for
            everything inside it. A preference such as &ldquo;system&rdquo; is resolved to light or
            dark before it is set. Roots can nest: a dark panel on a light page is a root of its
            own.
          </p>
        </Block>
      </Sheet>
      <Sheet id="use" title="Using tokens" meta={[{ term: "In", value: "CSS custom properties" }]}>
        <Block title="In your CSS">
          <p>
            Reach for the role the value plays: a raised card, its body text, the gap inside it. The
            root above it decides what each resolves to.
          </p>
          <CodeBlock code={USE} title="invoice.css" language="css" />
        </Block>
        <Block title="Rules" />
        <FactGrid
          label="Rules"
          items={[
            {
              term: "Choose by role",
              value:
                "Pick the token whose name says what the value is for, never one whose value happens to match.",
            },
            {
              term: "Never type a value",
              value: "A hex code or a pixel size skips dark mode and every contrast check.",
            },
            {
              term: "Names are stable",
              value: "A value may change in a minor release; a name may not.",
            },
            {
              term: "Restyle a component",
              value: (
                <>
                  Set its hook on a scope you own. Each component page lists its hooks, as{" "}
                  <TextLink href="/components/button#hooks">Button</TextLink> does.
                </>
              ),
            },
          ]}
        />
        <Block title="Not tokens">
          <p>Some values are deliberately not tokens (STD-UIP-TKN-001):</p>
        </Block>
        <FactGrid
          label="Values that are not tokens"
          items={[
            {
              term: "Breakpoints",
              value:
                "A custom property cannot be used in a media query, so breakpoints are constants of your build.",
            },
            {
              term: "Opacity",
              value:
                "A translucent state is a colour token with its alpha in the value, checked on its real background.",
            },
            {
              term: "Component geometry",
              value:
                "A sidebar width or an avatar size belongs to its component, until it needs to vary.",
            },
            {
              term: "Transitions",
              value:
                "Compose a motion duration and easing with the property you animate; there is no shorthand token.",
            },
          ]}
        />
      </Sheet>

      <Sheet id="categories" title="Categories" meta={[{ term: "Domains", value: "5" }]}>
        <ul className={styles.categories} aria-label="Token categories">
          {CATEGORIES.map((c) => (
            <li key={c.domain}>
              <Link href={c.href} className={styles.category} data-page={c.page ? "" : undefined}>
                <span className={styles.count}>{c.count}</span>
                <span className={styles.categoryText}>
                  <span className={styles.categoryName}>{c.title}</span>
                  <span className={styles.categoryUse}>{c.use}</span>
                </span>
                <span className={styles.categoryLink}>
                  {c.page ? "Guide" : "All tokens"}
                  <ArrowRight size={14} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Sheet>
    </DocsLayout>
  );
}
