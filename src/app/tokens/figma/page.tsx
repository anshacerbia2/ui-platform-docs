import type { Metadata } from "next";
import { DocsLayout } from "@/components/shell/DocsLayout";
import { PageToc } from "@/features/reference/PageToc";
import { Code, Section, Table } from "@/features/reference/Section";
import styles from "@/features/reference/reference.module.scss";
import { figmaFiles, pin, sourceUrl } from "@/shared/lib/reference";
import { SITE_THEME } from "@/shared/lib/themes";
import { CodeBlock } from "@/components/docs/CodeBlock";

export const metadata: Metadata = { title: "Tokens in Figma" };

// The mode names the plugin writes (ui-platform TDD tokens FG7): the default theme's
// color modes by mode alone, every other theme and every dimension mode by its id.
const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const modeName = (theme: string, mode: string) =>
  theme === SITE_THEME ? title(mode) : `${theme} ${mode}`;

export default function Page() {
  const colors = figmaFiles.filter((f) => f.kind === "color");
  const dimensions = figmaFiles.filter((f) => f.kind === "dimension");
  return (
    <DocsLayout
      aside={
        <PageToc
          items={[
            { id: "files", title: "Files" },
            { id: "import", title: "Native import" },
            { id: "plugin", title: "Plugin" },
            { id: "rules", title: "Rules" },
          ]}
        />
      }
    >
      <header className={styles.header}>
        <h1 className={styles.title}>Tokens in Figma</h1>
        <p className={styles.lead}>
          Figma gets the tokens from the build, one way: the package publishes them as Design Tokens
          Format Module 2025.10 files, and a change made in Figma reaches the product only as a
          change to the token source. These files are the ones in the pinned build, ui-platform{" "}
          {pin.commit.slice(0, 7)}.
        </p>
      </header>

      <Section id="files" title="Files" source="@scnx/system/tokens/figma, as published">
        <Table
          caption="Figma profile files"
          head={["File", "Collection", "Mode", "Tokens"]}
          rows={[...colors, ...dimensions].map((f) => [
            <a key="f" className={styles.link} href={`/downloads/figma/${f.file}`} download>
              {f.file}
            </a>,
            f.kind === "color" ? "Scnehaux / Color" : "Scnehaux / Dimension",
            f.kind === "color" ? modeName(f.theme, f.mode ?? "") : f.theme,
            String(f.tokens),
          ])}
        />
        <p className={styles.lead}>
          Colors are sRGB (Figma imports no wider gamut): a value outside sRGB is clipped, the
          rendering the contrast gate measures. Dimensions are pixels. Every token carries its CSS
          custom property, which the plugin sets as the variable&apos;s code syntax.
        </p>
      </Section>

      <Section id="import" title="Native import" source="Figma variables panel">
        <ol className={styles.steps}>
          <li>
            In a design file, open the local variables and create a collection named{" "}
            <Code>Scnehaux / Color</Code>.
          </li>
          <li>
            Drop the color files into it. Figma creates one mode per file; on a plan without modes,
            drop only <Code>{`${SITE_THEME}.light.color.tokens.json`}</Code>.
          </li>
          <li>
            Create <Code>Scnehaux / Dimension</Code> and drop the dimension file of each theme.
          </li>
        </ol>
        <p className={styles.lead}>
          The import sets values only; scopes, code syntax, and styles come from the plugin.
        </p>
      </Section>

      <Section
        id="plugin"
        title="Plugin"
        source={
          <a
            className={styles.link}
            href={sourceUrl("packages/design-system/figma-plugin/runtime.js")}
          >
            packages/design-system/figma-plugin
          </a>
        }
      >
        <p className={styles.lead}>
          The repository&apos;s Figma plugin writes the collections with every theme and mode,
          scopes from the token grammar, code syntax, a text style per typography composite, and an
          effect style per shadow with its colors bound to the variables. It updates by name, never
          deletes, and lists modes your Figma plan refuses. Build it from a checkout of ui-platform:
        </p>
        <CodeBlock
          code={
            "pnpm install\npnpm --filter @scnx/core-ui build && pnpm --filter @scnx/system build\npnpm --filter @scnx/system figma-plugin"
          }
          language="shell"
        />
        <ol className={styles.steps}>
          <li>
            In the Figma desktop app: Plugins → Development → Import plugin from manifest, and pick{" "}
            <Code>packages/design-system/figma-plugin/manifest.json</Code>.
          </li>
          <li>
            Open a design file and run Plugins → Development → Scnehaux UI tokens. A report lists
            what was created, updated, and skipped.
          </li>
          <li>Run it again after every token change.</li>
        </ol>
      </Section>

      <Section
        id="rules"
        title="Rules"
        source={
          <a
            className={styles.link}
            href="https://github.com/anshacerbia2/scnehaux-architecture/blob/main/05-decisions/ui-platform/ADR-UIP-TKN-004-design-tool-interchange.md"
          >
            ADR-UIP-TKN-004
          </a>
        }
      >
        <ol className={styles.steps}>
          <li>The repository is the only source. Nothing is synchronized back from Figma.</li>
          <li>Never type a token value into a design file; import or run the plugin instead.</li>
          <li>
            Bind fills, strokes, radii, and spacing to variables, so a frame follows its mode.
          </li>
        </ol>
      </Section>
    </DocsLayout>
  );
}
