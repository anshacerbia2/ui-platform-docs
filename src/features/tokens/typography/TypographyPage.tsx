import { Block } from "@/components/docs/Block";
import { FactGrid } from "@/components/docs/FactGrid";
import { Facts } from "@/components/docs/Facts";
import { InlineCode } from "@/components/docs/InlineCode";
import { PageHead } from "@/components/docs/PageHead";
import { Sheet } from "@/components/docs/Sheet";
import { DocsLayout } from "@/components/shell/DocsLayout";
import { tokenList } from "@/shared/lib/reference";
import { TokenName } from "../TokenName";
import { TokenRows } from "../TokenRows";
import { tokenOf, valueOf } from "../tokens";
import styles from "./Typography.module.scss";

const MEMBERS = ["font-family", "font-size", "font-weight", "line-height", "letter-spacing"];

// STD-UIP-TKN-001, "Semantic Reading Density": each group, its reading context, and a
// line of the kind of text it sets.
const GROUPS: { id: string; title: string; context: string; variants: string[]; sample: string }[] =
  [
    {
      id: "heading",
      title: "Heading",
      context: "Titles. The size is chosen for the page, not by the heading's level.",
      variants: ["xxlarge", "xlarge", "large", "medium", "small", "xsmall"],
      sample: "Quarterly payroll",
    },
    {
      id: "body",
      title: "Body",
      context: "Running text in components and pages.",
      variants: ["large", "default", "small"],
      sample: "Invoices are sent on the first business day of each month.",
    },
    {
      id: "label",
      title: "Label",
      context: "Control labels, captions and metadata.",
      variants: ["default", "small"],
      sample: "Work email",
    },
    {
      id: "data",
      title: "Data",
      context: "Dense grids, tabular controls and dashboard summaries.",
      variants: ["compact"],
      sample: "INV-2041   30 Nov 2026   AUD 1,280.00",
    },
    {
      id: "article",
      title: "Article",
      context: "Sustained reading: long prose and documentation.",
      variants: ["readable"],
      sample:
        "Every invoice is checked against its purchase order before it is paid, and the result is recorded in the audit log.",
    },
    {
      id: "metric",
      title: "Metric",
      context: "A standalone number: a KPI, a score, an indicator.",
      variants: ["display"],
      sample: "98.6%",
    },
    {
      id: "code",
      title: "Code",
      context: "Inline and block code.",
      variants: ["default", "small"],
      sample: "pnpm add @scnx/system",
    },
  ];

const WEIGHTS = ["regular", "medium", "semibold", "bold"];

const composite = (group: string, variant: string) => `typography.${group}.${variant}`;
const summary = (c: string) => {
  const tracking = valueOf(`${c}.letter-spacing`);
  return (
    <>
      <span className={styles.line}>
        {valueOf(`${c}.font-size`)} / {valueOf(`${c}.line-height`)}
      </span>
      <span className={styles.line}>
        {valueOf(`${c}.font-weight`)}
        {tracking !== "0em" ? ` · ${tracking}` : ""}
      </span>
    </>
  );
};

/** The typography guide: the composite and its five members, every reading context, the weights. */
export function TypographyPage() {
  const tokens = tokenList.filter((t) => t.name.startsWith("typography."));
  const composites = GROUPS.flatMap((g) => g.variants).length;
  return (
    <DocsLayout
      toc={[
        { id: "anatomy", title: "Anatomy" },
        ...GROUPS.map((g) => ({ id: g.id, title: g.title })),
        { id: "weights", title: "Weights" },
        { id: "rules", title: "Rules" },
      ]}
    >
      <PageHead
        crumbs={[{ label: "Tokens", href: "/tokens" }, { label: "Typography" }]}
        title="Typography"
        lead="Type is chosen by what the reader is doing, not from a scale of sizes: reading a paragraph, scanning a table, finding a label. Each token sets the five properties of a line of text together."
      />
      <Facts
        label="Typography tokens"
        items={[
          { term: "Tokens", value: String(tokens.length) },
          { term: "Composites", value: String(composites) },
          { term: "Members each", value: String(MEMBERS.length) },
          { term: "Weights", value: String(WEIGHTS.length) },
        ]}
      />

      <Sheet id="anatomy" title="Anatomy" label="Anatomy of a typography token">
        <TokenName
          label="The typography token typography.body.default.font-size and the values each segment takes"
          segments={[
            { code: "typography", part: "Domain" },
            { code: "body", part: "Context", values: GROUPS.map((g) => g.id) },
            { code: "default", part: "Variant" },
            { code: "font-size", part: "Member", values: MEMBERS },
          ]}
        />
        <Block>
          <p>
            A composite such as <InlineCode>typography.body.default</InlineCode> is five custom
            properties, one per member:{" "}
            <InlineCode>--ds-typography-body-default-font-size</InlineCode> and its four siblings.
            Set all five together, so the size, the leading and the tracking stay the pair they were
            made as.
          </p>
        </Block>
      </Sheet>

      {GROUPS.map((group) => (
        <Sheet
          key={group.id}
          id={group.id}
          title={group.title}
          meta={[{ term: "Variants", value: String(group.variants.length) }]}
        >
          <Block>
            <p>{group.context}</p>
          </Block>
          <TokenRows
            wide
            label={`${group.title} composites`}
            rows={group.variants.map((variant) => {
              const c = composite(group.id, variant);
              return {
                name: c,
                cssName: `${tokenOf(`${c}.font-size`).cssName.replace(/-font-size$/, "")}-*`,
                specimen: (
                  <span className={styles.specimen} data-type-token={c}>
                    {group.sample}
                  </span>
                ),
                value: summary(c),
              };
            })}
          />
        </Sheet>
      ))}

      <Sheet
        id="weights"
        title="Weights"
        meta={[{ term: "Tokens", value: String(WEIGHTS.length) }]}
      >
        <Block>
          <p>
            When a component changes only the weight of a composite, it takes a weight token rather
            than a second composite.
          </p>
        </Block>
        <TokenRows
          label="Weights"
          rows={WEIGHTS.map((w) => {
            const t = tokenOf(`typography.weight.${w}`);
            return {
              name: t.name,
              cssName: t.cssName,
              specimen: (
                <span className={styles.weight} data-token={t.name}>
                  Aa
                </span>
              ),
              value: valueOf(t.name),
            };
          })}
        />
      </Sheet>

      <Sheet id="rules" title="Rules" meta={[{ term: "Source", value: "STD-UIP-TKN-001" }]}>
        <FactGrid
          label="Typography rules"
          items={[
            {
              term: "Choose by context",
              value:
                "A table takes data.compact and a help article takes article.readable, even where another size would fit.",
            },
            {
              term: "Level is not size",
              value:
                "An h2 can be heading.small. The element carries the outline; the token carries the look.",
            },
            {
              term: "Keep the five together",
              value:
                "Never pair one composite's size with another's line height; change the composite instead.",
            },
            {
              term: "Headings descend",
              value: "From xxlarge to xsmall, every heading is smaller than the one before it.",
            },
          ]}
        />
      </Sheet>
    </DocsLayout>
  );
}
