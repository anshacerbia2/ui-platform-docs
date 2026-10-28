import type { Route } from "next";
import { colorPage, tokenList, type TokenRow } from "@/shared/lib/reference";
import { SITE_THEME } from "@/shared/lib/themes";

/** A token's values in the example: the site's own theme, light and dark. */
export type ModeValues = Partial<Record<"light" | "dark", string>>;

// The token pages document names, so they show one set of values, the site's
// own, as the example, and never name or offer a theme. Only these values reach
// the client.
export const exampleValues = (token: TokenRow): ModeValues =>
  (token.values[SITE_THEME] ?? {}) as ModeValues;

const byName = new Map(tokenList.map((t) => [t.name, t]));
/** A token by its path; every path the pages name is a published token. */
export const tokenOf = (name: string) => byName.get(name) as TokenRow;
/** A token's example value in light mode, for a domain whose values do not change with the mode. */
export const valueOf = (name: string) => exampleValues(tokenOf(name)).light ?? "";

/** Each scheme's `contrast` text on its `solid` surface, in the example, per mode. */
export const onSolid = colorPage.onSolid.map((row) => ({
  ...row,
  results: row.results
    .filter((r) => r.theme === SITE_THEME)
    .map(({ mode, ratio, pass }) => ({ mode, ratio, pass })),
}));

/** The token groups of the All tokens page: a token's first two segments. */
export const GROUPS = [...new Set(tokenList.map((t) => t.name.split(".").slice(0, 2).join(".")))];
export const groupId = (group: string) => group.replaceAll(".", "-");

const inDomain = (domain: string) => tokenList.filter((t) => t.name.startsWith(`${domain}.`));
const firstGroup = (domain: string) =>
  groupId(GROUPS.find((g) => g.startsWith(`${domain}.`)) ?? "");

// The Tier-2 domains of STD-UIP-TKN-001 ("Canonical grammar per domain"), in its order.
// A domain with its own page links there; the others open their rows of All tokens.
const DOMAINS: { domain: string; title: string; pattern: string; use: string; page?: Route }[] = [
  {
    domain: "color",
    title: "Colour",
    pattern: "color.{scheme}.{role}.{emphasis}.{state}",
    use: "Fills, text, icons, borders and shadow colours, by the role they play.",
    page: "/tokens/color",
  },
  {
    domain: "effect",
    title: "Effect",
    pattern: "effect.shadow.{level}, effect.material.{material}",
    use: "Shadows and the materials a surface is drawn in.",
    page: "/tokens/effect",
  },
  {
    domain: "dimension",
    title: "Dimension",
    pattern: "dimension.{property}.{intent}",
    use: "Spacing, control sizes, radius, border width and stacking.",
    page: "/tokens/dimension",
  },
  {
    domain: "typography",
    title: "Typography",
    pattern: "typography.{context}.{variant}",
    use: "Type set by reading context: body, label, heading, code, data.",
    page: "/tokens/typography",
  },
  {
    domain: "motion",
    title: "Motion",
    pattern: "motion.{action}.{duration|easing}",
    use: "How long a change takes and how it moves.",
    page: "/tokens/motion",
  },
];

export const CATEGORIES = DOMAINS.map((d) => {
  const tokens = inDomain(d.domain);
  return {
    ...d,
    count: tokens.length,
    example: tokens[0]?.name ?? "",
    href: d.page ?? (`/tokens/all#${firstGroup(d.domain)}` as Route),
  };
});

// The color vocabularies of STD-UIP-TKN-001 ("Color vocabularies").
export const SCHEMES = ["primary", "neutral", "info", "success", "warning", "danger"] as const;
export const ROLES = ["surface", "border", "text", "icon", "shadow"] as const;
export const EMPHASES = [
  "subtle",
  "default",
  "strong",
  "solid",
  "contrast",
  "canvas",
  "sunken",
  "raised",
  "floating",
  "stage",
] as const;
export const STATES = ["default", "hover", "pressed", "selected", "focus", "disabled"] as const;

/** A color token's path segments: `color.primary.surface.solid.hover`. */
export const partsOf = (token: TokenRow) => {
  const [, scheme = "", role = "", emphasis = "", state = ""] = token.name.split(".");
  return { scheme, role, emphasis, state };
};

export const colorTokens = tokenList.filter((t) => t.type === "color");
