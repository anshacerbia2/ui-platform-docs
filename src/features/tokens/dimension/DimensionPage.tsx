import { Block } from "@/components/docs/Block";
import { FactGrid } from "@/components/docs/FactGrid";
import { Facts } from "@/components/docs/Facts";
import { InlineCode } from "@/components/docs/InlineCode";
import { PageHead } from "@/components/docs/PageHead";
import { Sheet } from "@/components/docs/Sheet";
import { DocsLayout } from "@/components/shell/DocsLayout";
import { tokenList } from "@/shared/lib/reference";
import { TokenName } from "../TokenName";
import { TokenRows, type TokenRowItem } from "../TokenRows";
import { tokenOf, valueOf } from "../tokens";
import styles from "./Dimension.module.scss";

// STD-UIP-TKN-001, "Dimension vocabulary": each relationship and what it spaces.
const SPACING: { id: string; title: string; note: string; intents: string[] }[] = [
  {
    id: "inset",
    title: "Inset",
    note: "Padding between a container's edge and its content.",
    intents: ["inset-compact", "inset-default", "inset-comfortable"],
  },
  {
    id: "stack",
    title: "Stack",
    note: "The gap between siblings on the block axis, one above the other.",
    intents: ["stack-compact", "stack-default", "stack-comfortable"],
  },
  {
    id: "inline",
    title: "Inline",
    note: "The gap between siblings on the inline axis, side by side.",
    intents: ["inline-compact", "inline-default", "inline-comfortable"],
  },
  {
    id: "control",
    title: "Control",
    note: "A control's inline padding around its label, value or icon; compact, default and comfortable go with small, medium and large controls.",
    intents: ["control-compact", "control-default", "control-comfortable"],
  },
  {
    id: "layout",
    title: "Section and page",
    note: "The gap between major regions of a page, and the gutter between the viewport's edge and the content.",
    intents: ["section", "page"],
  },
];

const RADIUS: [string, string][] = [
  ["mark", "Marks: a checkbox, inline code."],
  ["element", "Elements: a badge, a tooltip, a small control."],
  ["control", "Controls and rows."],
  ["container", "Containers: a card, a menu, a popover."],
  ["panel", "Panels and dialogs."],
  ["pill", "Fully rounded, for the shapes whose roundness carries meaning."],
];

const LAYERS = ["base", "dropdown", "sticky", "overlay", "modal", "popover", "tooltip", "toast"];

const row = (name: string, specimen: TokenRowItem["specimen"], note?: string): TokenRowItem => ({
  name,
  cssName: tokenOf(name).cssName,
  note,
  specimen,
  value: valueOf(name),
});

/** The dimension guide: spacing by relationship, control sizes, radius, border width, stacking. */
export function DimensionPage() {
  const tokens = tokenList.filter((t) => t.name.startsWith("dimension."));
  const count = (property: string) =>
    tokens.filter((t) => t.name.startsWith(`dimension.${property}.`)).length;
  return (
    <DocsLayout
      toc={[
        { id: "anatomy", title: "Anatomy" },
        {
          id: "spacing",
          title: "Spacing",
          children: SPACING.map((s) => ({ id: `spacing-${s.id}`, title: s.title })),
        },
        { id: "size", title: "Control size" },
        { id: "radius", title: "Radius" },
        { id: "border", title: "Border width" },
        { id: "z-index", title: "Stacking" },
        { id: "rules", title: "Rules" },
      ]}
    >
      <PageHead
        crumbs={[{ label: "Tokens", href: "/tokens" }, { label: "Dimension" }]}
        title="Dimension"
        lead="Space is named by the relationship it holds, not by its size: the padding inside a card, the gap between two fields, the room around a label. Pick the relationship, then how dense it is."
      />
      <Facts
        label="Dimension tokens"
        items={[
          { term: "Tokens", value: String(tokens.length) },
          { term: "Spacing", value: String(count("spacing")) },
          { term: "Radius", value: String(count("radius")) },
          { term: "Layers", value: String(count("z-index")) },
        ]}
      />

      <Sheet id="anatomy" title="Anatomy" label="Anatomy of a dimension token">
        <TokenName
          label="The dimension token dimension.spacing.inset-default and the values each segment takes"
          segments={[
            { code: "dimension", part: "Domain" },
            {
              code: "spacing",
              part: "Property",
              values: ["spacing", "size", "radius", "border-width", "z-index"],
            },
            { code: "inset-default", part: "Intent" },
          ]}
        />
        <Block>
          <p>
            An intent is one segment: its relationship, then its density, joined by a hyphen.{" "}
            <InlineCode>inset-default</InlineCode> is the default padding of a container;{" "}
            <InlineCode>stack-compact</InlineCode> is the tight gap between stacked siblings.
          </p>
        </Block>
      </Sheet>

      <Sheet
        id="spacing"
        title="Spacing"
        meta={[{ term: "Tokens", value: String(count("spacing")) }]}
      >
        {SPACING.map((s) => (
          <div key={s.id} className={styles.group}>
            <span id={`spacing-${s.id}`} className={styles.anchor} />
            <h3 className={styles.head}>
              <code className={styles.path}>
                <span>dimension.spacing.</span>
                {s.id === "layout" ? "section, page" : `${s.id}-*`}
              </code>
              <span className={styles.count}>{s.title}</span>
            </h3>
            <Block>
              <p>{s.note}</p>
            </Block>
            <TokenRows
              label={`${s.title} spacing`}
              rows={s.intents.map((intent) => {
                const name = `dimension.spacing.${intent}`;
                return row(name, <span className={styles.bar} data-token={name} />);
              })}
            />
          </div>
        ))}
      </Sheet>

      <Sheet
        id="size"
        title="Control size"
        meta={[{ term: "Tokens", value: String(count("size")) }]}
      >
        <Block>
          <p>
            The block size of a small, medium and large control: a button, a field, a tab. A
            component never lets its interactive box fall under 24 by 24 pixels, whatever this says.
          </p>
        </Block>
        <TokenRows
          label="Control sizes"
          rows={["control-compact", "control-default", "control-comfortable"].map((intent) => {
            const name = `dimension.size.${intent}`;
            return row(
              name,
              <span className={styles.control} data-token={name}>
                Label
              </span>,
            );
          })}
        />
      </Sheet>

      <Sheet id="radius" title="Radius" meta={[{ term: "Tokens", value: String(count("radius")) }]}>
        <Block>
          <p>
            A radius is named for what it rounds, so a component binds the intent of its role and a
            theme sets how round each role is. Below, the example&apos;s values: square, with pill
            for the shapes whose roundness means something.
          </p>
        </Block>
        <TokenRows
          label="Radius"
          rows={RADIUS.map(([intent, note]) => {
            const name = `dimension.radius.${intent}`;
            return row(name, <span className={styles.shape} data-token={name} />, note);
          })}
        />
      </Sheet>

      <Sheet
        id="border"
        title="Border width"
        meta={[{ term: "Tokens", value: String(count("border-width")) }]}
      >
        <TokenRows
          label="Border width"
          rows={[
            ["default", "Dividers and outlines."],
            ["strong", "Emphasised indicators, such as the marker of an active item."],
          ].map(([intent, note]) => {
            const name = `dimension.border-width.${intent}`;
            return row(name, <span className={styles.rule} data-token={name} />, note);
          })}
        />
      </Sheet>

      <Sheet
        id="z-index"
        title="Stacking"
        meta={[{ term: "Layers", value: String(LAYERS.length) }]}
      >
        <Block>
          <p>
            The stacking layers, lowest first. Each layer is above every one listed before it, so a
            toast is above a tooltip, and a tooltip above a modal.
          </p>
        </Block>
        <TokenRows
          label="Stacking layers"
          rows={LAYERS.map((layer, i) => {
            const name = `dimension.z-index.${layer}`;
            return row(
              name,
              <span className={styles.layers} aria-hidden="true">
                {LAYERS.map((l, k) => (
                  <i key={l} data-on={k <= i || undefined} />
                ))}
              </span>,
            );
          })}
        />
      </Sheet>

      <Sheet id="rules" title="Rules" meta={[{ term: "Source", value: "STD-UIP-TKN-001" }]}>
        <FactGrid
          label="Dimension rules"
          items={[
            {
              term: "Pick the relationship",
              value:
                "Padding inside a card is inset, the gap between two cards is stack or inline, even when the two happen to share a value.",
            },
            {
              term: "Density ascends",
              value:
                "Within a relationship, compact is never larger than default, and default never larger than comfortable.",
            },
            {
              term: "Layers ascend",
              value:
                "Stacking values strictly ascend in the order above; never type a z-index between two of them.",
            },
            {
              term: "Not tokens",
              value:
                "Breakpoints cannot be custom properties in a media query, and a component's own geometry (a sidebar width, an avatar size) is its own.",
            },
          ]}
        />
      </Sheet>
    </DocsLayout>
  );
}
