import { Block } from "@/components/docs/Block";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DataTable } from "@/components/docs/DataTable";
import { InlineCode } from "@/components/docs/InlineCode";
import { PageHead } from "@/components/docs/PageHead";
import { Sheet } from "@/components/docs/Sheet";
import { TextLink } from "@/components/docs/TextLink";
import { DocsLayout } from "@/components/shell/DocsLayout";
import { figmaFiles, pin, sourceUrl } from "@/shared/lib/reference";
import { SITE_THEME } from "@/shared/lib/themes";

const ADR =
  "https://github.com/anshacerbia2/scnehaux-architecture/blob/main/05-decisions/ui-platform/ADR-UIP-TKN-004-design-tool-interchange.md";

// The mode names the plugin writes (ui-platform TDD tokens FG7): the site theme's
// color modes by mode alone, every other theme and every dimension mode by its id.
const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const modeName = (theme: string, mode: string) =>
  theme === SITE_THEME ? title(mode) : `${theme} ${mode}`;

/** The Figma path of ADR-UIP-TKN-004: the pinned build's token files and how to load them. */
export function FigmaPage() {
  const files = [
    ...figmaFiles.filter((f) => f.kind === "color"),
    ...figmaFiles.filter((f) => f.kind === "dimension"),
  ];
  return (
    <DocsLayout
      toc={[
        { id: "files", title: "Files" },
        { id: "import", title: "Native import" },
        { id: "plugin", title: "Plugin" },
        { id: "rules", title: "Rules" },
      ]}
    >
      <PageHead
        crumbs={[{ label: "Tokens", href: "/tokens" }, { label: "Tokens in Figma" }]}
        title="Tokens in Figma"
        lead={`Figma gets the tokens from the build, one way: the package publishes them as Design Tokens Format Module 2025.10 files, and a change made in Figma reaches the product only as a change to the token source. These files are the ones in the pinned build, ui-platform ${pin.commit.slice(0, 7)}.`}
      />

      <Sheet id="files" title="Files" meta={[{ term: "From", value: "@scnx/system/tokens/figma" }]}>
        <DataTable
          caption="Figma profile files"
          head={["File", "Collection", "Mode", "Tokens"]}
          rows={files.map((f) => [
            <TextLink key="f" href={`/downloads/figma/${f.file}`} download>
              {f.file}
            </TextLink>,
            f.kind === "color" ? "Scnehaux / Color" : "Scnehaux / Dimension",
            f.kind === "color" ? modeName(f.theme, f.mode ?? "") : f.theme,
            String(f.tokens),
          ])}
        />
        <Block>
          <p>
            Colors are sRGB (Figma imports no wider gamut): a value outside sRGB is clipped, the
            rendering the contrast gate measures. Dimensions are pixels. Every token carries its CSS
            custom property, which the plugin sets as the variable&apos;s code syntax.
          </p>
        </Block>
      </Sheet>

      <Sheet id="import" title="Native import" meta={[{ term: "In", value: "Figma variables" }]}>
        <Block>
          <ol>
            <li>
              In a design file, open the local variables and create a collection named{" "}
              <InlineCode>Scnehaux / Color</InlineCode>.
            </li>
            <li>
              Drop the color files into it. Figma creates one mode per file; on a plan without
              modes, drop only <InlineCode>{`${SITE_THEME}.light.color.tokens.json`}</InlineCode>.
            </li>
            <li>
              Create <InlineCode>Scnehaux / Dimension</InlineCode> and drop the dimension file of
              each theme.
            </li>
          </ol>
          <p>The import sets values only; scopes, code syntax, and styles come from the plugin.</p>
        </Block>
      </Sheet>

      <Sheet id="plugin" title="Plugin" meta={[{ term: "Source", value: "ui-platform" }]}>
        <Block>
          <p>
            The repository&apos;s{" "}
            <TextLink href={sourceUrl("packages/design-system/figma-plugin/runtime.js")}>
              Figma plugin
            </TextLink>{" "}
            writes the collections with every theme and mode, scopes from the token grammar, code
            syntax, a text style per typography composite, and an effect style per shadow with its
            colors bound to the variables. It updates by name, never deletes, and lists modes your
            Figma plan refuses. Build it from a checkout of ui-platform:
          </p>
          <CodeBlock
            code={
              "pnpm install\npnpm --filter @scnx/core-ui build && pnpm --filter @scnx/system build\npnpm --filter @scnx/system figma-plugin"
            }
            title="terminal"
            language="shell"
          />
          <ol>
            <li>
              In the Figma desktop app: Plugins → Development → Import plugin from manifest, and
              pick <InlineCode>packages/design-system/figma-plugin/manifest.json</InlineCode>.
            </li>
            <li>
              Open a design file and run Plugins → Development → Scnehaux UI tokens. A report lists
              what was created, updated, and skipped.
            </li>
            <li>Run it again after every token change.</li>
          </ol>
        </Block>
      </Sheet>

      <Sheet id="rules" title="Rules" meta={[{ term: "Authority", value: "ADR-UIP-TKN-004" }]}>
        <Block>
          <ol>
            <li>The repository is the only source. Nothing is synchronized back from Figma.</li>
            <li>Never type a token value into a design file; import or run the plugin instead.</li>
            <li>
              Bind fills, strokes, radii, and spacing to variables, so a frame follows its mode.
            </li>
          </ol>
          <p>
            The rules are <TextLink href={ADR}>ADR-UIP-TKN-004</TextLink>&apos;s.
          </p>
        </Block>
      </Sheet>
    </DocsLayout>
  );
}
