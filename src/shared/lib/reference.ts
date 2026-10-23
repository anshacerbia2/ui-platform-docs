import "server-only";
import data from "@/generated/reference.json";

// The generated reference (scripts/reference.mjs): the only source of
// normative facts on the site (ADR-UIP-CMP-001 item 9; TDD docs-site D3).

export type Stability = "experimental" | "candidate" | "stable" | "deprecated";

export type EntryRow = {
  entry: string;
  package: string;
  version: string;
  slug: string;
  kind: "styled" | "primitive" | "entry";
  stability: Stability;
  entryKind: string | null;
  primitive: string | null;
  page: string | null;
};

export type ApiProp = {
  name: string;
  type: string;
  optional: boolean;
  description: string;
  default: string | null;
  deprecated: string | boolean | null;
  modes: number | null;
};

export type ApiExport = {
  name: string;
  kind: "component" | "function" | "value" | "type";
  description: string;
  props?: ApiProp[];
  extendsNative?: boolean;
  modes?: number | null;
  parts?: ApiExport[];
  type?: string;
  signature?: string;
};

export type Binding = { part: string; option?: Record<string, string>; state?: string; declarations: Record<string, string> };

export type StyledSpec = {
  entry: string;
  entryKind: string;
  stability: Stability;
  primitive: string | null;
  anatomy: { name: string; selector: string; primitivePart?: string; extends?: string }[];
  options: Record<string, { values: string[]; default: string | null; selector: string }>;
  states: { name: string; selectors: string[]; enter: Record<string, unknown>; on?: string }[];
  fixture: { props?: Record<string, unknown>; tree?: FixtureNode; activate?: "showModal" };
  bindings: Binding[];
};

export type FixtureNode = { type: string; props?: Record<string, unknown>; children?: (string | FixtureNode)[] };

export type PrimitiveSpec = {
  name: string;
  entry: string;
  stability: Stability;
  root: string;
  parts: { name: string; element: string; selector: string }[];
  controlledProps: string[];
  states: string[];
  keys: { key: string; part: string; condition: string; effect: string }[];
  focus: { initial: string; movement: string; restoration: string };
  accessibleName: string;
  dataHooks: string[];
};

export type ContrastRow = {
  part: string;
  option: Record<string, string>;
  state: string;
  fg: string;
  bg: string;
  minimum: number;
  results: { theme: string; mode: string; ratio: number; path: string; pass: boolean }[];
};

export type ComponentReference = {
  spec: StyledSpec;
  primitive: PrimitiveSpec | null;
  api: ApiExport[];
  primitiveApi: ApiExport[] | null;
  contrast: ContrastRow[];
};

export type PrimitiveReference = { spec: PrimitiveSpec; api: ApiExport[]; styledBy: string[] };

export type Pin = {
  repository: string;
  commit: string;
  ref: string;
  run: string;
  signerWorkflow: string;
  packages: { name: string; version: string; tarball: string; sha256: string }[];
};

export type LabCheck = { label: string; fg: string; bg: string; minimum: number; ratio: number; pass: boolean };
export type Lab = Record<string, Record<string, LabCheck[]>>;

type Reference = {
  pin: Pin;
  entries: EntryRow[];
  components: Record<string, ComponentReference>;
  primitives: Record<string, PrimitiveReference>;
  tokens: Record<string, { standard: { id: string; version: string; commit: string }; modes: string[]; count: number }>;
  landing: { lab: Lab; swatches: string[] };
  tokenList: TokenRow[];
  figma: FigmaFile[];
};

/** A Figma profile file of the pinned @scnx/system (ui-platform TDD tokens FG1-FG6). */
export type FigmaFile = { file: string; subpath: string; theme: string; mode: string | null; kind: "color" | "dimension"; tokens: number };

export type TokenRow = { name: string; cssName: string; type: string; tier: number; lifecycle: string; values: Record<string, Record<string, string> | null> };

const reference = data as unknown as Reference;

export const pin = reference.pin;
export const entries = reference.entries;
export const tokenThemes = reference.tokens;
export const landing = reference.landing;
export const tokenList = reference.tokenList;
export const figmaFiles = reference.figma;
export const componentSlugs = Object.keys(reference.components);
export const primitiveSlugs = Object.keys(reference.primitives);
export const getComponent = (slug: string): ComponentReference | undefined => reference.components[slug];
export const getPrimitive = (slug: string): PrimitiveReference | undefined => reference.primitives[slug];

/** A token's CSS custom property: `color.primary.text` -> `--ds-color-primary-text`. */
export const cssVar = (token: string) => `--ds-${token.replaceAll(".", "-")}`;

/** A component's display name from its slug: `text-field` -> `Text field`. */
export const titleOf = (slug: string) => {
  const words = slug.replace(/-base$/, "").split("-");
  return [words[0]!.charAt(0).toUpperCase() + words[0]!.slice(1), ...words.slice(1)].join(" ");
};

/** The source of a file in ui-platform at the pinned commit. */
export const sourceUrl = (file: string) => `https://github.com/${pin.repository}/blob/${pin.commit}/${file}`;
