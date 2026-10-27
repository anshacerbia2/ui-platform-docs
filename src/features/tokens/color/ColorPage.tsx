import { Block } from "@/components/docs/Block";
import { Cells } from "@/components/docs/Cells";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DataTable } from "@/components/docs/DataTable";
import { FactGrid } from "@/components/docs/FactGrid";
import { Facts } from "@/components/docs/Facts";
import { InlineCode } from "@/components/docs/InlineCode";
import { PageHead } from "@/components/docs/PageHead";
import { Sheet } from "@/components/docs/Sheet";
import { TextLink } from "@/components/docs/TextLink";
import { ThemeChoice } from "@/components/docs/ThemeChoice";
import { DocsLayout } from "@/components/shell/DocsLayout";
import { PageToc } from "@/components/shell/PageToc";
import { colorPage, type TokenRow } from "@/shared/lib/reference";
import { THEME_IDS } from "@/shared/lib/themes";
import { TokenName } from "../TokenName";
import { colorTokens, EMPHASES, ROLES, SCHEMES, STATES } from "../tokens";
import { ChoiceBar, ChoiceRatio, ColorRoot, TokenValue } from "./Choice";
import { Sample } from "./Sample";
import { SchemeExplorer } from "./SchemeExplorer";
import styles from "./Color.module.scss";

const SECTIONS = [
  { id: "anatomy", title: "Anatomy" },
  { id: "neutral", title: "Neutral" },
  { id: "schemes", title: "Schemes" },
  { id: "emphasis", title: "Emphasis" },
  { id: "states", title: "States" },
  { id: "contrast", title: "Contrast" },
  { id: "domain", title: "Domain states" },
];

const byName = new Map(colorTokens.map((t) => [t.name, t]));
const token = (name: string) => byName.get(name) as TokenRow;

// The neutral roles, each emphasis with what it is for (STD-UIP-TKN-001, "Semantic
// Usage Doctrine"), in the order a page stacks them.
const NEUTRAL: { role: string; note?: string; items: [string, string][] }[] = [
  {
    role: "Surface",
    items: [
      ["canvas", "The page background."],
      ["sunken", "An inset well, below the canvas."],
      ["subtle", "A passive section, a row on hover."],
      ["default", "A standard control or section."],
      ["strong", "A pronounced fill: a selected row, a loading skeleton."],
      ["raised", "A card, above the canvas."],
      ["floating", "A popover, a menu."],
      ["solid", "The neutral filled action."],
      ["stage", "The ground that shows work. Never product data."],
    ],
  },
  {
    role: "Text",
    items: [
      ["subtle", "Secondary text: descriptions, metadata."],
      ["default", "Body copy."],
      ["strong", "Headings and emphasis."],
      ["contrast", "Text on a neutral solid fill."],
    ],
  },
  {
    role: "Icon",
    items: [
      ["subtle", "Secondary icons."],
      ["default", "Main icons."],
      ["strong", "Emphasised icons."],
      ["contrast", "Icons on a neutral solid fill."],
    ],
  },
  {
    role: "Border",
    items: [
      ["subtle", "Dividers and card edges."],
      ["default", "Standard outlines."],
      ["strong", "A control's boundary, tested at 3:1."],
      ["stage", "The dots of the stage's 22px grid."],
    ],
  },
  {
    role: "Shadow",
    note: "The layers materials are made of. Draw a raised or floating surface with its effect.material token, not with these.",
    items: [
      ["subtle", "The lightest layer."],
      ["default", "The standard layer."],
      ["strong", "The deepest layer."],
      ["contrast", "A layer under a solid fill."],
    ],
  },
];

// The scheme overview's columns: the tokens a scheme is most often used through.
const OVERVIEW = [
  ["surface.subtle", "Surface subtle"],
  ["surface.default", "Surface"],
  ["surface.strong", "Surface strong"],
  ["surface.solid", "Solid"],
  ["border.default", "Border"],
  ["text.default", "Text"],
  ["text.contrast", "On solid"],
] as const;

const DOCTRINE = [
  [
    "subtle",
    "Passive accents and quiet sections.",
    "Alert banners, passive cards, table row hover, static badge fills",
  ],
  [
    "default",
    "Standard surfaces, outlines and readable copy.",
    "Button surfaces, dividers, body copy, main icons",
  ],
  [
    "strong",
    "Active priority and emphasis.",
    "Text-input boundaries, active indicators, bold headings, warning borders",
  ],
  [
    "solid",
    "An opaque fill that carries the scheme. Surface only.",
    "Filled primary buttons, filled badges, a selected segment",
  ],
  [
    "contrast",
    "Text, icon or shadow on a solid fill of the same scheme.",
    "The label of a filled button, the icon on a filled badge",
  ],
  ["canvas", "The page background. Neutral only.", "The application page"],
  [
    "sunken, raised, floating",
    "Elevation below or above the canvas. Neutral only.",
    "Inset wells; cards; popovers and menus",
  ],
  [
    "stage",
    "The ground that shows work. Neutral only.",
    "Component previews, examples, empty states, marketing sections",
  ],
] as const;

// STD-UIP-TKN-001, "Role × Emphasis Compatibility" and "The State Compatibility Invariant".
const EMPHASIS_BY_ROLE: Record<string, readonly string[]> = {
  surface: [
    "subtle",
    "default",
    "strong",
    "solid",
    "canvas",
    "sunken",
    "raised",
    "floating",
    "stage",
  ],
  border: ["subtle", "default", "strong", "stage"],
  text: ["subtle", "default", "strong", "contrast"],
  icon: ["subtle", "default", "strong", "contrast"],
  shadow: ["subtle", "default", "strong", "contrast"],
};
const STATES_BY_ROLE: Record<string, readonly string[]> = {
  surface: ["default", "hover", "pressed", "selected", "disabled"],
  border: ["default", "selected", "focus", "disabled"],
  text: ["default", "hover", "disabled"],
  icon: ["default", "hover", "disabled"],
  shadow: ["default", "hover", "pressed"],
};
const NEUTRAL_ONLY = new Set(["canvas", "sunken", "raised", "floating", "stage"]);
const yes = (ok: boolean, note?: string) => (
  <span className={styles.mark} data-yes={ok || undefined}>
    {ok ? (note ?? "Yes") : "—"}
  </span>
);

const DOMAIN = `/* A product's own states, mapped once to scheme tokens */
.payments {
  --state-approved: var(--ds-color-success-surface-solid-default);
  --state-pending: var(--ds-color-warning-surface-subtle-default);
  --state-fraud: var(--ds-color-danger-surface-solid-default);
  --state-archived: var(--ds-color-neutral-surface-strong-default);
}

.payment[data-state="fraud"] {
  background: var(--state-fraud);
  color: var(--ds-color-danger-text-contrast-default);
}`;

function Tile({ name, note }: { name: string; note: string }) {
  const t = token(name);
  const [, , role = "", emphasis = ""] = name.split(".");
  return (
    <li className={styles.tile}>
      <Sample token={name} />
      <span className={styles.tileName}>
        {role} <span>·</span> {emphasis}
      </span>
      <span className={styles.tileNote}>{note}</span>
      <code className={styles.tileVar}>{t.cssName}</code>
      <TokenValue values={t.values} />
    </li>
  );
}

/** The color guide: the grammar, the neutral ground, the schemes, and when to use each emphasis and state. */
export function ColorPage() {
  const explorer = colorTokens.map(({ name, cssName, values }) => ({ name, cssName, values }));
  return (
    <ThemeChoice themes={THEME_IDS}>
      <DocsLayout aside={<PageToc items={SECTIONS} />}>
        <PageHead
          crumbs={[{ label: "Tokens", href: "/tokens" }, { label: "Colour" }]}
          title="Colour"
          lead="Pick a colour by the role it plays, never by how it looks. Six schemes share one grammar, so a warning border and a primary border are found the same way, and every theme fills in the values for light and dark."
        />
        <Facts
          label="Colour tokens"
          items={[
            { term: "Tokens", value: String(colorTokens.length) },
            { term: "Schemes", value: String(SCHEMES.length) },
            { term: "Roles", value: String(ROLES.length) },
            {
              term: "On-solid contrast",
              value: `${colorPage.onSolid.flatMap((r) => r.results).filter((r) => r.pass).length} of ${colorPage.onSolid.flatMap((r) => r.results).length} pass`,
              ok: colorPage.onSolid.every((r) => r.results.every((x) => x.pass)),
            },
          ]}
        />
        <ChoiceBar />

        <Sheet id="anatomy" title="Anatomy" label="Anatomy of a colour token">
          <TokenName
            label="The colour token name color.primary.surface.solid.default and the values each segment takes"
            segments={[
              { code: "color", part: "Domain" },
              { code: "primary", part: "Scheme", values: SCHEMES },
              { code: "surface", part: "Role", values: ROLES },
              { code: "solid", part: "Emphasis", values: EMPHASES },
              { code: "default", part: "State", values: STATES },
            ]}
          />
          <Block>
            <p>
              Read a name from left to right: which family of colour, what it paints, how loud it
              is, and in which state. Not every combination exists: a border has no{" "}
              <InlineCode>solid</InlineCode>, text has no <InlineCode>pressed</InlineCode>, and the
              elevation surfaces are neutral only. <TextLink href="#emphasis">Emphasis</TextLink>{" "}
              and <TextLink href="#states">States</TextLink> list what each role takes.
            </p>
          </Block>
        </Sheet>

        <Sheet
          id="neutral"
          title="Neutral"
          label="Neutral, the ground of everything"
          meta={[
            {
              term: "Tokens",
              value: String(colorTokens.filter((t) => t.name.startsWith("color.neutral.")).length),
            },
          ]}
        >
          <Block>
            <p>
              Most of an interface is neutral: the page, its cards, its text and its lines. Neutral
              also has the elevation surfaces, which stack from a sunken well up to a floating menu,
              and the stage, the ground this site shows its examples on.
            </p>
          </Block>
          <ColorRoot>
            <figure
              className={styles.elevation}
              aria-label="The neutral surfaces stacked: canvas, sunken, raised, floating, and the stage"
            >
              <div className={styles.canvas}>
                <span className={styles.tag}>canvas</span>
                <div className={styles.well}>
                  <span className={styles.tag}>sunken</span>
                </div>
                <div className={styles.raised}>
                  <span className={styles.tag}>raised</span>
                  <span className={styles.lineLong} />
                  <span className={styles.lineShort} />
                </div>
                <div className={styles.floating}>
                  <span className={styles.tag}>floating</span>
                  <span className={styles.lineShort} />
                  <span className={styles.lineShort} />
                </div>
              </div>
              <div className={styles.stage}>
                <span className={styles.tag}>stage</span>
              </div>
            </figure>
            {NEUTRAL.map((group) => (
              <div key={group.role} className={styles.group}>
                <div className={styles.groupHead}>
                  <h3 className={styles.groupTitle}>{group.role}</h3>
                  {group.note ? <p className={styles.groupNote}>{group.note}</p> : null}
                </div>
                <ul
                  className={styles.tiles}
                  data-columns={group.items.length === 4 ? 4 : 3}
                  aria-label={`Neutral ${group.role.toLowerCase()}`}
                >
                  {group.items.map(([emphasis, note]) => (
                    <Tile
                      key={emphasis}
                      name={`color.neutral.${group.role.toLowerCase()}.${emphasis}.default`}
                      note={note}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </ColorRoot>
        </Sheet>

        <Sheet
          id="schemes"
          title="Schemes"
          label="Six schemes, one grammar"
          meta={[{ term: "Per scheme", value: "68 tokens" }]}
        >
          <Block>
            <p>
              A scheme is a family of colour with a meaning. <InlineCode>primary</InlineCode> is the
              brand and the main action; <InlineCode>info</InlineCode>,{" "}
              <InlineCode>success</InlineCode>, <InlineCode>warning</InlineCode> and{" "}
              <InlineCode>danger</InlineCode> carry status; <InlineCode>neutral</InlineCode> is
              everything else. Every scheme has the same roles, so switching a badge from success to
              danger changes one word of each name.
            </p>
          </Block>
          <ColorRoot>
            <div className={styles.matrixWrap}>
              <table className={styles.matrix}>
                <caption className="u-visually-hidden">The main tokens of each scheme</caption>
                <thead>
                  <tr>
                    <th scope="col">Scheme</th>
                    {OVERVIEW.map(([, label]) => (
                      <th key={label} scope="col">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SCHEMES.map((scheme) => (
                    <tr key={scheme}>
                      <th scope="row">{scheme}</th>
                      {OVERVIEW.map(([path, label]) => (
                        <td key={label}>
                          <span title={`color.${scheme}.${path}.default`}>
                            <Sample token={`color.${scheme}.${path}.default`} />
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ColorRoot>
          <Block title="Every token of a scheme">
            <p>Pick a scheme and a role, then a cell, to read its custom property and value.</p>
          </Block>
          <SchemeExplorer
            schemes={SCHEMES}
            roles={ROLES}
            emphases={EMPHASES}
            states={STATES}
            tokens={explorer}
          />
        </Sheet>

        <Sheet
          id="emphasis"
          title="Emphasis"
          label="Emphasis: how loud"
          meta={[{ term: "Values", value: String(EMPHASES.length) }]}
        >
          <DataTable
            caption="What each emphasis is for"
            head={["Emphasis", "Use it for", "Typical places"]}
            rows={DOCTRINE.map(([emphasis, use, where]) => [
              <InlineCode key="e">{emphasis}</InlineCode>,
              use,
              where,
            ])}
          />
          <Block title="Which role takes which emphasis" />
          <DataTable
            caption="Emphasis and role compatibility"
            head={["Emphasis", ...ROLES]}
            rows={EMPHASES.map((e) => [
              <InlineCode key="e">{e}</InlineCode>,
              ...ROLES.map((role) =>
                yes(
                  EMPHASIS_BY_ROLE[role]?.includes(e) ?? false,
                  NEUTRAL_ONLY.has(e) ? "Neutral" : undefined,
                ),
              ),
            ])}
          />
          <ColorRoot>
            <Cells columns={2} className={styles.rules} aria-label="Emphasis, done and not done">
              <figure className={styles.rule}>
                <div className={styles.ruleArt}>
                  <span className={styles.button} data-swatch="color.primary.surface.solid.default">
                    <span data-color-token="color.primary.text.contrast.default">Send invite</span>
                  </span>
                  <p className={styles.copy} data-color-token="color.neutral.text.default.default">
                    They will get access to 3 workspaces.
                  </p>
                </div>
                <figcaption>
                  <span className={styles.do}>Do · contrast on solid</span>
                  <InlineCode>contrast</InlineCode> labels a solid fill; body copy is{" "}
                  <InlineCode>text.default</InlineCode>.
                </figcaption>
              </figure>
              <figure className={styles.rule}>
                <div className={styles.ruleArt}>
                  <p className={styles.copy} data-color-token="color.primary.text.contrast.default">
                    They will get access to 3 workspaces.
                  </p>
                </div>
                <figcaption>
                  <span className={styles.dont}>Don&apos;t · contrast as copy</span>
                  <InlineCode>contrast</InlineCode> is made for one ground, its solid fill. On the
                  page it can disappear.
                </figcaption>
              </figure>
              <figure className={styles.rule}>
                <div className={styles.ruleArt} data-ground="canvas">
                  <span className={styles.row}>Invoice 2041 · AUD 1,280.00</span>
                  <span className={styles.row}>Invoice 2042 · AUD 640.00</span>
                </div>
                <figcaption>
                  <span className={styles.do}>Do · data on the canvas</span>
                  Product data sits on the canvas, or on a raised card above it.
                </figcaption>
              </figure>
              <figure className={styles.rule}>
                <div className={styles.ruleArt} data-ground="stage">
                  <span className={styles.row}>Invoice 2041 · AUD 1,280.00</span>
                  <span className={styles.row}>Invoice 2042 · AUD 640.00</span>
                </div>
                <figcaption>
                  <span className={styles.dont}>Don&apos;t · data on the stage</span>
                  The stage shows work, such as a preview or an example. It is never behind product
                  data.
                </figcaption>
              </figure>
            </Cells>
          </ColorRoot>
        </Sheet>

        <Sheet
          id="states"
          title="States"
          label="States: how it reacts"
          meta={[{ term: "Values", value: String(STATES.length) }]}
        >
          <Block>
            <p>
              A state token is the same colour after an interaction. Use the one your component is
              in; never darken or fade a value yourself, so every state stays inside the contrast
              checks.
            </p>
          </Block>
          <ColorRoot>
            <ul className={styles.states} aria-label="color.primary.surface.solid in each state">
              {STATES_BY_ROLE.surface?.map((state) => (
                <li key={state} className={styles.state}>
                  <span
                    className={styles.stateFill}
                    data-swatch={`color.primary.surface.solid.${state}`}
                  >
                    <span
                      data-color-token={`color.primary.text.contrast.${state === "disabled" ? "disabled" : "default"}`}
                    >
                      Pay now
                    </span>
                  </span>
                  <code className={styles.stateName}>{state}</code>
                </li>
              ))}
            </ul>
          </ColorRoot>
          <DataTable
            caption="Role and state compatibility"
            head={["Role", ...STATES]}
            rows={ROLES.map((role) => [
              role,
              ...STATES.map((s) => yes(STATES_BY_ROLE[role]?.includes(s) ?? false)),
            ])}
          />
          <Block>
            <p>
              <InlineCode>focus</InlineCode> is a border state only: the focus indicator is an
              outline in <InlineCode>border.default.focus</InlineCode>, never a fill.
            </p>
          </Block>
        </Sheet>

        <Sheet id="contrast" title="Contrast" meta={[{ term: "Standard", value: "WCAG 2.2" }]}>
          <FactGrid
            label="What is tested"
            items={[
              {
                term: "On solid",
                aside: "4.5 : 1",
                value:
                  "Every contrast token against the solid surface of its scheme, in each theme and state.",
              },
              {
                term: "Text and icons",
                aside: "4.5 : 1",
                value:
                  "Subtle, default and strong text and icons against the neutral surfaces they are declared for.",
              },
              {
                term: "Control boundary",
                aside: "3 : 1",
                value:
                  "The neutral strong border, the edge of a control with no other indicator such as a text input, against every declared neutral surface.",
              },
              {
                term: "Every display",
                aside: "lowest ratio",
                value:
                  "A colour outside sRGB is measured in sRGB and Display P3, clipped and gamut-mapped, and the lowest ratio counts.",
              },
            ]}
          />
          <Block title="Contrast on solid, in the theme and mode shown" />
          <ColorRoot>
            <DataTable
              caption="Each scheme's contrast text on its solid surface"
              head={["Scheme", "Sample", "Pair", "Ratio"]}
              rows={colorPage.onSolid.map((row) => [
                row.scheme,
                <Sample key="s" token={row.fg} />,
                <span key="p" className={styles.pair}>
                  <InlineCode>text.contrast</InlineCode> on <InlineCode>surface.solid</InlineCode>
                </span>,
                <ChoiceRatio key="r" results={row.results} />,
              ])}
            />
          </ColorRoot>
          <Block>
            <p>
              Scheme borders such as <InlineCode>danger.border</InlineCode> are not tested at 3:1:
              they mark a state that text or another cue also carries. Each component page lists the
              pairs that component renders.
            </p>
          </Block>
        </Sheet>

        <Sheet
          id="domain"
          title="Domain states"
          meta={[{ term: "Lives in", value: "your product" }]}
        >
          <Block>
            <p>
              Your product has states of its own: approved, pending, fraud, archived. Do not ask for
              a token per state. Name them once in your product, map each to a scheme token, and use
              your names everywhere else. The global schemes stay small, and a new state is one
              line.
            </p>
            <CodeBlock code={DOMAIN} title="payments.css" language="css" />
          </Block>
        </Sheet>
      </DocsLayout>
    </ThemeChoice>
  );
}
