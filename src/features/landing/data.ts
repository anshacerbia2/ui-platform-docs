import "server-only";
import type { Fact } from "@/components/docs/Facts";
import type { TapeEntry } from "@/components/docs/Tape";
import {
  componentSlugs,
  getComponent,
  pin,
  primitiveSlugs,
  sourceUrl,
  tokenList,
  tokenThemes,
} from "@/shared/lib/reference";
import { THEME_IDS } from "@/shared/lib/themes";

// Every figure on the landing page is true of the pinned build and links to where
// ui-platform enforces it (TDD docs-site D8, R8). Counts come from the generated
// reference, so they change with the pin.

const system = pin.packages.find((p) => p.name === "@scnx/system");
const short = (sha: string) => `sha256:${sha.slice(0, 4)}…${sha.slice(-4)}`;
const runId = pin.run.split("/").pop() ?? pin.run;

const contrastRows = componentSlugs.flatMap((slug) => getComponent(slug)?.contrast ?? []);
const contrastChecks = contrastRows.reduce((sum, row) => sum + row.results.length, 0);

export const version = system?.version ?? "";
/** `2.0.0-beta.0` -> `2.0 BETA` */
export const versionTag = version
  .replace(/^(\d+\.\d+).*-(beta|alpha|rc).*$/, "$1 $2")
  .toUpperCase();

export const INSTALL = "pnpm add @scnx/system @scnx/core-ui";

export const releaseFacts: Fact[] = [
  { term: "Set", value: "Scnehaux UI" },
  { term: "Rev", value: version },
  { term: "Packages", value: "core-ui, system" },
  { term: "Provenance", value: "SLSA L2" },
  { term: "Build", value: pin.commit.slice(0, 7), ok: true },
];

export const tape: TapeEntry[] = [
  ...pin.packages.map((p) => ({
    subject: `${p.name} ${p.version}`,
    detail: "provenance signed by ui-platform CI",
    ref: short(p.sha256),
  })),
  {
    subject: "contrast",
    detail: `${contrastChecks} checks over ${contrastRows.length} pairs, ${THEME_IDS.length} themes, light and dark`,
    ref: "token gate method",
  },
  {
    subject: "tokens",
    detail: `${tokenList.length} tokens in ${Object.keys(tokenThemes).length} themes`,
    ref: Object.values(tokenThemes)[0]?.standard.id ?? "STD-UIP-TKN-001",
  },
  {
    subject: "reference",
    detail: `${componentSlugs.length} component and ${primitiveSlugs.length} primitive pages generated`,
    ref: `commit ${pin.commit.slice(0, 7)}`,
  },
  { subject: "build", detail: "pinned from ui-platform's CI on main", ref: `run ${runId}` },
];

export type Evidence = { name: string; detail: string; href: string };

/** Where each guarantee is enforced, at the pinned commit. */
export const evidence = {
  keyboard: {
    name: "browser-components.mjs",
    detail: "focus outline on every part, 3 engines",
    href: sourceUrl("scripts/browser-components.mjs"),
  },
  color: {
    name: "palette.test.mjs",
    detail: "the palette engine's ramps",
    href: sourceUrl("packages/design-system/scripts/palette/palette.test.mjs"),
  },
  rtl: {
    name: "TabsBase.test.tsx",
    detail: "arrow keys mirror under dir=rtl",
    href: sourceUrl("packages/core-ui/src/components/tabs-base/TabsBase.test.tsx"),
  },
  csp: {
    name: "browser-theme.mjs",
    detail: "0 CSP violations, 3 engines",
    href: sourceUrl("scripts/browser-theme.mjs"),
  },
  motion: {
    name: "TransitionBase.test.tsx",
    detail: "settles at once under reduced motion",
    href: sourceUrl("packages/core-ui/src/components/transition-base/TransitionBase.test.tsx"),
  },
  roots: {
    name: "ThemeProvider.test.tsx",
    detail: "nested roots and portals",
    href: sourceUrl("packages/core-ui/src/providers/theme-provider-base/ThemeProvider.test.tsx"),
  },
} satisfies Record<string, Evidence>;

/** The four gauges: each figure links to where it is enforced. */
export const gauges = [
  {
    value: "0",
    level: 0,
    text: "styles injected at run time. Static CSS that runs under a strict CSP.",
    href: sourceUrl("scripts/nextjs-consumer.mjs"),
  },
  {
    value: "13",
    level: 1,
    text: "evidence rows every release must pass, from clean install to strict CSP.",
    href: sourceUrl("scripts/evidence.mjs"),
  },
  {
    value: "AA",
    level: 0.66,
    text: "contrast for every pair a component renders, in every theme and mode.",
    href: sourceUrl("packages/design-system/scripts/tokens/check.mjs"),
  },
  {
    value: "L2",
    level: 0.5,
    text: "SLSA build provenance, signed through Sigstore and publicly logged.",
    href: sourceUrl(".github/workflows/ci.yml"),
  },
] as const;

/** The check a reader runs on the tarball they installed. */
export const verifyCommand = [
  `$ gh attestation verify ${system?.tarball ?? "scnx-system.tgz"} \\`,
  `    --repo ${pin.repository} \\`,
  `    --signer-workflow ${pin.signerWorkflow} \\`,
  "    --source-ref refs/heads/main",
  "✓ Verification succeeded",
].join("\n");
