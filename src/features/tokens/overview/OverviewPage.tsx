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
import { PageToc } from "@/components/shell/PageToc";
import { ThemeRoot } from "@/components/system/Theme";
import { tokenList, tokenThemes } from "@/shared/lib/reference";
import { SITE_THEME, THEME_IDS } from "@/shared/lib/themes";
import { TokenName } from "../TokenName";
import { CATEGORIES } from "../tokens";
import styles from "./Overview.module.scss";

const SECTIONS = [
  { id: "tiers", title: "Three tiers" },
  { id: "names", title: "Names" },
  { id: "themes", title: "Themes and modes" },
  { id: "use", title: "Using tokens" },
  { id: "categories", title: "Categories" },
];

const TIERS = [
  {
    tier: "Tier 1",
    name: "Core primitives",
    pattern: "color.{hue}.{axis}.{step}",
    text: "The raw scales a theme is built from. Internal: never published, never used by a component or a product.",
    tag: "Internal",
  },
  {
    tier: "Tier 2",
    name: "Semantic tokens",
    pattern: "--ds-color-primary-surface-solid-default",
    text: "The public contract. A name says what a value is for, and every theme supplies the same names. This is what you use.",
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

// STD-UIP-TKN-001, "Theme naming": the shipped themes, their owners and their looks.
const THEME_ROWS: Record<string, { owner: string; look: string }> = {
  "scnx-platform": {
    owner: "The Scnehaux platform: IAM, AI runtime, organisation, and this site",
    look: "Scnx Blue, square corners, ring materials",
  },
  "scnx-saas": {
    owner: "The SaaS products",
    look: "Ink, the concentric radius ladder, soft shadows",
  },
};

const ROOT = (theme: string, mode: string) =>
  `<div data-scnx-theme="${theme}" data-scnx-resolved-mode="${mode}">\n  …\n</div>`;

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

/** One name, every theme and mode: the same markup in four theme roots. */
function Specimen({ theme, mode }: { theme: string; mode: "light" | "dark" }) {
  return (
    <figure className={styles.specimenCell}>
      <ThemeRoot theme={theme} mode={mode}>
        <div className={styles.specimen}>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Invoice 2041</p>
            <p className={styles.cardBody}>Due 30 November 2026</p>
            <span className={styles.cardAction}>Pay now</span>
          </div>
        </div>
      </ThemeRoot>
      <figcaption className={styles.caption}>
        {theme} <span>·</span> {mode}
      </figcaption>
    </figure>
  );
}

/** The tokens' front page: what a token is, how it is named, themed and used, and the categories. */
export function OverviewPage() {
  const themes = Object.keys(tokenThemes);
  const standard = tokenThemes[SITE_THEME]?.standard;
  return (
    <DocsLayout aside={<PageToc items={SECTIONS} />}>
      <PageHead
        title="Tokens"
        lead="A token is a design decision with a name. Use the name and the theme supplies the value, in light and in dark, so a product follows every theme without a change to its code."
      />
      <Facts
        label="Tokens"
        items={[
          { term: "Public tokens", value: String(tokenList.length) },
          { term: "Themes", value: String(themes.length) },
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

      <Sheet
        id="themes"
        title="Themes and modes"
        meta={[
          { term: "Default", value: SITE_THEME },
          { term: "Modes", value: "light, dark" },
        ]}
      >
        <Block>
          <p>
            A theme root sets the theme and the mode for everything inside it. The names never
            change; the values do. Below, the same card reads the same tokens in four roots.
          </p>
        </Block>
        <Cells
          columns={2}
          className={styles.specimens}
          aria-label="One card in every theme and mode"
        >
          {THEME_IDS.flatMap((theme) =>
            (["light", "dark"] as const).map((mode) => (
              <Specimen key={`${theme}-${mode}`} theme={theme} mode={mode} />
            )),
          )}
        </Cells>
        <div className={styles.split}>
          <Block title="The root">
            <p>
              <InlineCode>data-scnx-theme</InlineCode> names the theme and{" "}
              <InlineCode>data-scnx-resolved-mode</InlineCode> the mode. A preference such as
              &ldquo;system&rdquo; is resolved to light or dark before it is set. Roots can nest: a
              dark panel on a light page is a root of its own.
            </p>
          </Block>
          <Block title="The default">
            <p>
              <InlineCode>{SITE_THEME}</InlineCode> is the default theme and the one this site uses.
              A product picks the theme that owns its look; a client theme maps the same Tier-2
              names under its own id, never a <InlineCode>scnx-</InlineCode> one.
            </p>
          </Block>
        </div>
        <Block>
          <CodeBlock code={ROOT(SITE_THEME, "light")} title="index.html" language="html" />
        </Block>
        <DataTable
          caption="Shipped themes"
          head={["Theme", "Owner", "Look"]}
          rows={THEME_IDS.map((id) => [
            <InlineCode key="i">{id}</InlineCode>,
            THEME_ROWS[id]?.owner ?? "",
            THEME_ROWS[id]?.look ?? "",
          ])}
        />
      </Sheet>

      <Sheet id="use" title="Using tokens" meta={[{ term: "In", value: "CSS custom properties" }]}>
        <Block title="In your CSS">
          <p>
            Reach for the role the value plays: a raised card, its body text, the gap inside it. The
            theme root above it decides what each resolves to.
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
              value:
                "A hex code or a pixel size skips every theme and mode, and every contrast check.",
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
                "A sidebar width or an avatar size belongs to its component until a theme needs to change it.",
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
