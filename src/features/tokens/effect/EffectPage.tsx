import { Block } from "@/components/docs/Block";
import { FactGrid } from "@/components/docs/FactGrid";
import { Facts } from "@/components/docs/Facts";
import { InlineCode } from "@/components/docs/InlineCode";
import { PageHead } from "@/components/docs/PageHead";
import { Sheet } from "@/components/docs/Sheet";
import { ThemeChoice } from "@/components/docs/ThemeChoice";
import { DocsLayout } from "@/components/shell/DocsLayout";
import { tokenList } from "@/shared/lib/reference";
import { SITE_THEME } from "@/shared/lib/themes";
import { ChoiceBar, ColorRoot, TokenValue } from "../Choice";
import { TokenName } from "../TokenName";
import { exampleValues, tokenOf } from "../tokens";
import styles from "./Effect.module.scss";

// STD-UIP-TKN-001, "Effect contract": the materials a surface is drawn in, and the
// shadow levels.
const MATERIALS: { name: string; floating: boolean; note: string }[] = [
  { name: "flat", floating: false, note: "A surface on the page with only its edge." },
  { name: "raised", floating: false, note: "A card, raised from the page." },
  { name: "panel", floating: false, note: "A panel on the page." },
  { name: "tooltip", floating: true, note: "A tooltip: shadow, no ring." },
  { name: "menu", floating: true, note: "A menu or a popover." },
  { name: "modal", floating: true, note: "A dialog over the page." },
  { name: "sheet", floating: true, note: "A sheet from an edge of the page." },
];

const SHADOWS: [string, string][] = [
  ["low", "The lightest lift."],
  ["medium", "A lift a reader notices."],
  ["high", "Clearly above the page."],
  ["overlay", "Above everything the page holds."],
  ["focus", "An inset shadow that can join a focus outline, never replace it."],
];

// A material's value is several layers long, so its tile shows the property only; the full
// value is in All tokens.
function Tile({
  name,
  note,
  floating,
  value = true,
}: {
  name: string;
  note: string;
  floating?: boolean;
  value?: boolean;
}) {
  const t = tokenOf(name);
  return (
    <li className={styles.tile}>
      <span className={styles.stage}>
        <span className={styles.card} data-token={name} data-floating={floating || undefined} />
      </span>
      <code className={styles.name}>{name.split(".").slice(1).join(".")}</code>
      <span className={styles.note}>{note}</span>
      <code className={styles.css}>{t.cssName}</code>
      {value ? <TokenValue values={exampleValues(t)} /> : null}
    </li>
  );
}

/** The effect guide: materials, shadow levels, and how a surface takes them. */
export function EffectPage() {
  const tokens = tokenList.filter((t) => t.name.startsWith("effect."));
  return (
    <ThemeChoice themes={[SITE_THEME]}>
      <DocsLayout
        toc={[
          { id: "anatomy", title: "Anatomy" },
          { id: "materials", title: "Materials" },
          { id: "shadows", title: "Shadows" },
          { id: "rules", title: "Rules" },
        ]}
      >
        <PageHead
          crumbs={[{ label: "Tokens", href: "/tokens" }, { label: "Effect" }]}
          title="Effect"
          lead="A surface is drawn in a material: its edge and its shadow as one value. Pick the material for what the surface is, a card on the page or a menu above it, and the mode supplies the rest."
        />
        <Facts
          label="Effect tokens"
          items={[
            { term: "Tokens", value: String(tokens.length) },
            { term: "Materials", value: String(MATERIALS.length) },
            { term: "Shadows", value: String(SHADOWS.length) },
          ]}
        />
        <ChoiceBar />

        <Sheet id="anatomy" title="Anatomy" label="Anatomy of an effect token">
          <TokenName
            label="The effect token effect.material.raised and the values each segment takes"
            segments={[
              { code: "effect", part: "Domain" },
              { code: "material", part: "Kind", values: ["material", "shadow"] },
              { code: "raised", part: "Name", values: MATERIALS.map((m) => m.name) },
            ]}
          />
          <Block>
            <p>
              A material is a <InlineCode>box-shadow</InlineCode> value: a 1px ring for the edge,
              then the layers of its shadow. Use it as the surface&apos;s only edge, with the
              surface colour of its elevation.
            </p>
          </Block>
        </Sheet>

        <Sheet
          id="materials"
          title="Materials"
          meta={[{ term: "Tokens", value: String(MATERIALS.length) }]}
        >
          <ColorRoot>
            {[false, true].map((floating) => (
              <div key={String(floating)} className={styles.group}>
                <h3 className={styles.groupTitle}>{floating ? "Floating" : "On the page"}</h3>
                <ul
                  className={styles.tiles}
                  data-columns={floating ? 4 : 3}
                  aria-label={floating ? "Floating materials" : "On-page materials"}
                >
                  {MATERIALS.filter((m) => m.floating === floating).map((m) => (
                    <Tile
                      key={m.name}
                      name={`effect.material.${m.name}`}
                      note={m.note}
                      floating={floating}
                      value={false}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </ColorRoot>
        </Sheet>

        <Sheet
          id="shadows"
          title="Shadows"
          meta={[{ term: "Tokens", value: String(SHADOWS.length) }]}
        >
          <Block>
            <p>
              Shadow levels on their own, for an element that needs a lift but is not a surface of
              its own. A surface takes its material instead.
            </p>
          </Block>
          <ColorRoot>
            <ul className={styles.tiles} data-columns={5} aria-label="Shadows">
              {SHADOWS.map(([level, note]) => (
                <Tile key={level} name={`effect.shadow.${level}`} note={note} />
              ))}
            </ul>
          </ColorRoot>
        </Sheet>

        <Sheet id="rules" title="Rules" meta={[{ term: "Source", value: "STD-UIP-TKN-001" }]}>
          <FactGrid
            label="Effect rules"
            items={[
              {
                term: "One material per surface",
                value:
                  "A surface draws its edge and shadow with its material token, never a border plus a separate shadow.",
              },
              {
                term: "Focus is an outline",
                value:
                  "The focus indicator is an outline; shadow.focus may join it as an enhancement, never stand in for it.",
              },
              {
                term: "Dark mode adds an edge",
                value:
                  "Shadows read weakly on dark grounds, so in dark mode menus, modals and sheets add a 1px top edge.",
              },
              {
                term: "Colours come from tokens",
                value:
                  "Every layer of a material is a token's colour; never mix a shadow colour of your own.",
              },
            ]}
          />
        </Sheet>
      </DocsLayout>
    </ThemeChoice>
  );
}
