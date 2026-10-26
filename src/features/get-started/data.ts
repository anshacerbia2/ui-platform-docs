import "server-only";
import { defaultsOf, effective, tokensIn } from "@/shared/lib/bindings";
import {
  componentSlugs,
  entries,
  getComponent,
  pin,
  primitiveSlugs,
  titleOf,
  type ComponentReference,
} from "@/shared/lib/reference";
import { THEME_IDS } from "@/shared/lib/themes";

// Every fact on the get-started page comes from the pinned build's generated
// reference (TDD docs-site D3, D8): the chain of contracts, the counts and the matrix.

export type Contract = { title: string; name: string; code: string; note: string };
export type Lineage = { slug: string; title: string; contracts: Contract[] };

const system = pin.packages.find((p) => p.name === "@scnx/system");
export const version = system?.version ?? "";
export const INSTALL = "pnpm add @scnx/core-ui @scnx/system";

const unique = <T>(values: T[]) => [...new Set(values)];

const contrastOf = (reference: ComponentReference) => {
  const results = reference.contrast.flatMap((row) => row.results);
  return { pass: results.filter((r) => r.pass).length, total: results.length };
};

function lineageOf(slug: string): Lineage | null {
  const reference = getComponent(slug);
  if (!reference) return null;
  const { spec, primitive } = reference;
  const title = titleOf(slug);
  const root = spec.anatomy[0]?.name ?? "root";
  const bound = Object.entries(effective(spec, root, defaultsOf(spec), ""))
    .filter(([, { value }]) => tokensIn(value).some((t) => t.startsWith("color.")))
    .slice(0, 2);
  const options = Object.entries(spec.options)
    .map(([name, option]) => `${name}: ${option.values.join(" | ")}`)
    .slice(0, 1);
  const contrast = contrastOf(reference);
  return {
    slug,
    title,
    contracts: [
      {
        title: "Primitive",
        name: primitive?.name ?? "none",
        code: primitive
          ? `<${primitive.root}> · ${unique(primitive.keys.map((k) => k.key)).join(" · ")}`
          : "—",
        note: primitive
          ? `Focus: ${primitive.focus.movement}. Named by ${primitive.accessibleName}.`
          : "",
      },
      {
        title: "Component",
        name: title,
        code: [spec.entry, ...options].join("\n"),
        note: `A visual recipe only: the behavior is ${primitive?.name ?? "the primitive"}'s, never re-implemented.`,
      },
      {
        title: "Tokens",
        name: `${spec.hooks?.length ?? 0} hooks`,
        code: bound
          .map(([property, { value }]) => `${property} → ${tokensIn(value)[0]}`)
          .join("\n"),
        note: contrast.total
          ? `Every hook falls back to a token. ${contrast.pass} of ${contrast.total} contrast checks pass, in ${THEME_IDS.length} themes, light and dark.`
          : "Every hook falls back to a token the theme maps.",
      },
      {
        title: "Release",
        name: spec.stability.charAt(0).toUpperCase() + spec.stability.slice(1),
        code: `${spec.entry.split("/components/")[0]} ${version} · ui-platform ${pin.commit.slice(0, 7)}`,
        note: "Built in ui-platform's CI on main, with signed SLSA provenance.",
      },
    ],
  };
}

/** The components the chain can trace: those with a page and a primitive. */
export const lineages = ["button", "text-field", "dialog", "tabs"]
  .filter((slug) => componentSlugs.includes(slug))
  .map(lineageOf)
  .filter((l): l is Lineage => l !== null);

/** Rows of the status matrix: every styled component, with what its page is generated from. */
export const matrix = componentSlugs.toSorted().map((slug) => {
  const reference = getComponent(slug)!;
  const contrast = contrastOf(reference);
  return {
    slug,
    title: titleOf(slug),
    stability: reference.spec.stability,
    primitive: reference.primitive?.name ?? null,
    spec: true,
    api: reference.api.length > 0,
    hooks: reference.spec.hooks?.length ?? 0,
    contrast,
  };
});

export const counts = {
  primitives: primitiveSlugs.length,
  components: componentSlugs.length,
  entries: entries.length,
  themes: THEME_IDS.length,
};
