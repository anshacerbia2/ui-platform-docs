import {
  componentSlugs,
  entries,
  getComponent,
  getPrimitive,
  pin,
  primitiveSlugs,
  titleOf,
} from "@/shared/lib/reference";
import { SITE_THEME, themeStylesheet } from "@/shared/lib/themes";

export const dynamic = "force-static";

// The llms.txt convention (https://llmstxt.org): a plain-text map of the
// documentation for coding agents, generated from the same reference as the pages.
export function GET() {
  const lines = [
    "# Scnehaux UI",
    "",
    `> An accessible React design system: @scnx/core-ui (headless primitives) and @scnx/system (styled components, tokens). Documents ${pin.packages.map((p) => `${p.name}@${p.version}`).join(", ")} built from ${pin.repository}@${pin.commit.slice(0, 7)}.`,
    "",
    'Import each component from its own entry, for example `import { Button } from "@scnx/system/components/button"`, and load `@scnx/system/styles/components.css` plus one theme stylesheet such as `' +
      themeStylesheet(SITE_THEME) +
      "`. Wrap the app in `ThemeProvider` from `@scnx/core-ui/providers/theme-provider-base`.",
    "",
    "## Components",
    "",
    ...componentSlugs.map((slug) => {
      const ref = getComponent(slug)!;
      const main = ref.api.find((a) => a.kind === "component");
      const props = (main?.props ?? [])
        .map((p) => `${p.name}${p.optional ? "?" : ""}: ${p.type}`)
        .join("; ");
      return `- [${titleOf(slug)}](/components/${slug}): \`${ref.spec.entry}\` (${ref.spec.stability}). Props: ${props || "none"}.`;
    }),
    "",
    "## Primitives",
    "",
    ...primitiveSlugs.map((slug) => {
      const ref = getPrimitive(slug)!;
      return `- [${ref.spec.name}](/primitives/${slug}): \`${ref.spec.entry}\` (${ref.spec.stability}). Keys: ${ref.spec.keys.map((k) => `${k.key} on ${k.part} ${k.effect}`).join("; ") || "native"}.`;
    }),
    "",
    "## Optional",
    "",
    "- [Tokens](/tokens): what a token is, its tiers, names and modes",
    "- [Colour](/tokens/color): the colour roles, schemes, emphasis, states and contrast",
    "- [Typography](/tokens/typography): type by reading context, composites and weights",
    "- [Dimension](/tokens/dimension): spacing by relationship, control sizes, radius, border width, stacking",
    "- [Effect](/tokens/effect): materials and shadow levels",
    "- [Motion](/tokens/motion): durations and easings by action",
    "- [All tokens](/tokens/all): every canonical token in light and dark",
    `- [Releases](/releases): stability of all ${entries.length} entries and provenance verification`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
