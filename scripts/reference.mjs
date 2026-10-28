#!/usr/bin/env node
// Generates the normative data of the documentation site from the installed,
// pinned packages (ADR-UIP-CMP-001 item 9; TDD docs-site D3): every
// specification, the public API read from the published declarations, and the
// contrast of every rendered pair per theme and mode. Nothing here is written
// by hand, and nothing is read from outside the two tarballs and the pin.
//
//   node scripts/reference.mjs   write src/generated/ (ignored by git; every
//                                 dev, build, and typecheck run regenerates it)

import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import { contrastRatio, parseColor } from "./contrast.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "package.json"));
const PACKAGES = ["@scnx/core-ui", "@scnx/system"];
const OUT = path.join(root, "src/generated");

// The site's own look: the documentation belongs to scnx-platform (STD-UIP-TKN-001
// 2.8.0, theme naming; TDD docs-site D16). The one place the docs name a theme id;
// generation fails if the pinned package does not ship it, and every page takes
// the ids from src/generated/themes.json.
export const SITE_THEME = "scnx-platform";

const packageDir = (name) => path.dirname(require.resolve(`${name}/package.json`));
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const slugOf = (entry) => entry.split("/").pop();

// ---------------------------------------------------------------------------
// Specifications (published under ./specs of each package).

function loadSpecs() {
  const specs = [];
  for (const name of PACKAGES) {
    const dir = packageDir(name);
    const index = readJson(path.join(dir, "dist/specs/index.json"));
    for (const row of index.specs) {
      const spec = readJson(path.join(dir, "dist", row.path));
      specs.push({
        package: name,
        version: readJson(path.join(dir, "package.json")).version,
        spec,
      });
    }
  }
  return specs;
}

// ---------------------------------------------------------------------------
// Tokens: every published theme, both modes.

function loadThemes() {
  const dir = packageDir("@scnx/system");
  const manifest = readJson(path.join(dir, "package.json"));
  const themes = {};
  for (const [subpath, target] of Object.entries(manifest.exports)) {
    const match = /^\.\/tokens\/json\/([a-z0-9-]+)\.json$/.exec(subpath);
    if (match) themes[match[1]] = readJson(path.join(dir, target));
  }
  if (!themes[SITE_THEME])
    throw new Error(
      `the pinned @scnx/system ships no theme "${SITE_THEME}" (it ships ${Object.keys(themes).join(", ")})`,
    );
  // The site's theme first, then the others by name.
  return Object.fromEntries(
    Object.entries(themes).toSorted(([a], [b]) =>
      a === SITE_THEME ? -1 : b === SITE_THEME ? 1 : a.localeCompare(b),
    ),
  );
}

// ---------------------------------------------------------------------------
// Bindings: the declarations a part has in one option combination and state.
// Mirrors the spec gate (TDD styled CS3, CS5): options vary one at a time from
// the defaults, jointly where one binding names several; a more specific
// binding (more options, then a state) wins, then spec order.

const comboKey = (combo) =>
  JSON.stringify(Object.entries(combo).toSorted(([a], [b]) => a.localeCompare(b)));
const bindingWeight = (b) => Object.keys(b.option ?? {}).length + (b.state ? 10 : 0);
const ownDeclaration = (declaration) =>
  /[\\/]@scnx[\\/]/.test(declaration.getSourceFile().fileName);
const spelled = (types) => {
  const kept = types.filter((t) => t !== "undefined" && t !== "never");
  return kept.length === 2 && kept.includes("true") && kept.includes("false")
    ? "boolean"
    : kept.join(" | ");
};

export function combinations(spec) {
  const defaults = Object.fromEntries(
    Object.entries(spec.options)
      .filter(([, o]) => o.default !== null)
      .map(([k, o]) => [k, o.default]),
  );
  const out = new Map([[comboKey(defaults), defaults]]);
  const add = (combo) => out.set(comboKey(combo), combo);
  for (const [option, { values }] of Object.entries(spec.options))
    for (const value of values) add({ ...defaults, [option]: value });
  for (const binding of spec.bindings) {
    const joint = Object.keys(binding.option ?? {});
    if (joint.length < 2) continue;
    joint
      .reduce(
        (acc, option) =>
          acc.flatMap((combo) =>
            spec.options[option].values.map((value) => ({ ...combo, [option]: value })),
          ),
        [defaults],
      )
      .forEach(add);
  }
  return [...out.values()];
}

export function effective(spec, part, option, state) {
  const chain = [];
  for (let p = part; p; p = spec.anatomy.find((a) => a.name === p)?.extends) chain.push(p);
  const out = {};
  spec.bindings
    .map((b, index) => ({ b, index }))
    .filter(
      ({ b }) =>
        chain.includes(b.part) &&
        (!b.state || b.state === state) &&
        Object.entries(b.option ?? {}).every(([k, v]) => option[k] === v),
    )
    .toSorted((x, y) => bindingWeight(x.b) - bindingWeight(y.b) || x.index - y.index)
    .forEach(({ b }) => {
      for (const [property, value] of Object.entries(b.declarations)) {
        delete out[property];
        out[property] = value;
      }
    });
  return out;
}

const singleToken = (value) =>
  value && /^\{[a-z0-9.-]+\}$/.test(value) ? value.slice(1, -1) : null;

/** TDD styled CS5: a part's color on its background, per combination and state; disabled is exempt. */
export function contrastCases(spec) {
  const cases = [];
  for (const part of spec.anatomy) {
    for (const option of combinations(spec)) {
      for (const state of ["", ...spec.states.map((s) => s.name)]) {
        if (state === "disabled") continue;
        const d = effective(spec, part.name, option, state);
        const fg = singleToken(d.color);
        const bg = singleToken(d["background-color"] ?? d.background);
        if (fg && bg) cases.push({ part: part.name, option, state: state || "rest", fg, bg });
      }
    }
  }
  // One row per distinct pair and place.
  const seen = new Set();
  return cases.filter((c) => {
    const key = JSON.stringify(c);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function contrastTable(spec, themes, minimum) {
  const rows = [];
  for (const c of contrastCases(spec)) {
    const results = [];
    for (const [themeId, theme] of Object.entries(themes)) {
      const byName = new Map(theme.tokens.map((t) => [t.name, t]));
      const canvasToken = byName.get("color.neutral.surface.canvas.default");
      for (const mode of theme.modes) {
        const value = (name) => parseColor(byName.get(name)?.resolved[themeId]?.[mode] ?? "");
        const fg = value(c.fg);
        const bg = value(c.bg);
        const canvas = parseColor(canvasToken.resolved[themeId][mode]);
        if (!fg || !bg) continue;
        const { ratio, path: worst } = contrastRatio(fg, bg, canvas);
        results.push({
          theme: themeId,
          mode,
          ratio: Math.floor(ratio * 100) / 100,
          path: worst,
          pass: ratio >= minimum,
        });
      }
    }
    rows.push({ ...c, minimum, results });
  }
  return rows;
}

// ---------------------------------------------------------------------------
// API from the published declarations (TypeScript compiler API).

function apiOf(entries) {
  const files = entries.map(({ entry }) => {
    const [scope, pkg, ...rest] = entry.split("/");
    const manifest = readJson(path.join(packageDir(`${scope}/${pkg}`), "package.json"));
    const target = manifest.exports[rest.length ? `./${rest.join("/")}` : "."];
    return { entry, file: path.join(packageDir(`${scope}/${pkg}`), target.types) };
  });
  const program = ts.createProgram(
    files.map((f) => f.file),
    {
      strict: true,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      skipLibCheck: true,
      noEmit: true,
    },
  );
  const checker = program.getTypeChecker();
  const doc = (symbol) => ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();
  const tags = (symbol) =>
    Object.fromEntries(
      symbol
        .getJsDocTags(checker)
        .map((t) => [t.name, ts.displayPartsToString(t.text ?? []).trim()]),
    );
  const typeText = (type) =>
    checker.typeToString(
      type,
      undefined,
      ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
    );

  // Props of a component. A union of prop shapes (a button, link, or child mode) lists every
  // prop of every member; a prop missing from some members is optional and names its modes.
  const propsOf = (type, at) => {
    const members = type.isUnion() ? type.types : [type];
    const byName = new Map();
    let extendsNative = false;
    members.forEach((member, index) => {
      for (const property of checker.getPropertiesOfType(member)) {
        const declarations = property.getDeclarations() ?? [];
        const declared = declarations.find(ownDeclaration);
        if (!declared) {
          if (/@types[\\/]react/.test(declarations[0]?.getSourceFile().fileName ?? ""))
            extendsNative = true;
          continue;
        }
        const t = tags(property);
        const written =
          declared.type?.getText() ??
          typeText(checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(property, at)));
        const row = byName.get(property.getName()) ?? {
          name: property.getName(),
          types: [],
          optional: false,
          description: "",
          default: null,
          deprecated: null,
          in: [],
        };
        if (!row.types.includes(written)) row.types.push(written);
        row.optional ||= (property.getFlags() & ts.SymbolFlags.Optional) !== 0;
        row.description ||= doc(property);
        row.default ??= t.default ?? null;
        row.deprecated ??= "deprecated" in t ? t.deprecated || true : null;
        row.in.push(index);
        byName.set(property.getName(), row);
      }
    });
    const props = [...byName.values()].map(({ types, in: present, ...row }) => ({
      ...row,
      type: spelled(types),
      optional: row.optional || present.length < members.length,
      modes: present.length < members.length ? present.length : null,
    }));
    return {
      props: props.toSorted(
        (a, b) => Number(a.optional) - Number(b.optional) || a.name.localeCompare(b.name),
      ),
      extendsNative,
      modes: members.length > 1 ? members.length : null,
    };
  };

  const describe = (name, symbol, at, depth = 0) => {
    const type = checker.getTypeOfSymbolAtLocation(symbol, at);
    const signatures = type.getCallSignatures();
    const isComponent = /^[A-Z]/.test(name) && signatures.length > 0;
    const out = {
      name,
      kind: isComponent
        ? "component"
        : signatures.length
          ? "function"
          : symbol.flags & ts.SymbolFlags.TypeAlias || symbol.flags & ts.SymbolFlags.Interface
            ? "type"
            : "value",
      description: doc(symbol),
    };
    if (isComponent) {
      const parameter = signatures[0].getParameters()[0];
      if (parameter)
        Object.assign(out, propsOf(checker.getTypeOfSymbolAtLocation(parameter, at), at));
      if (depth === 0) {
        out.parts = checker
          .getPropertiesOfType(type)
          .filter((p) => /^[A-Z]/.test(p.getName()))
          .map((p) => describe(`${name}.${p.getName()}`, p, at, 1))
          .filter((p) => p.kind === "component");
      }
    } else if (out.kind === "type") {
      // The alias as declared (`type X = A & B`), not the alias's own name.
      const declaration = symbol.getDeclarations()?.[0];
      const written =
        declaration && ts.isTypeAliasDeclaration(declaration)
          ? declaration.type.getText()
          : declaration && ts.isInterfaceDeclaration(declaration)
            ? declaration.getText().replace(/^[^{]*/, "")
            : null;
      out.type = (written ?? typeText(checker.getDeclaredTypeOfSymbol(symbol)))
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\s+/g, " ")
        .trim();
    } else if (out.kind === "function") {
      out.signature = checker.signatureToString(
        signatures[0],
        undefined,
        ts.TypeFormatFlags.NoTruncation,
      );
    }
    return out;
  };

  const api = {};
  for (const { entry, file } of files) {
    const source = program.getSourceFile(file);
    const moduleSymbol = source && checker.getSymbolAtLocation(source);
    if (!moduleSymbol) throw new Error(`no declarations for ${entry} at ${file}`);
    const exports = checker.getExportsOfModule(moduleSymbol).map((s) => {
      const target = s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s;
      return describe(s.getName(), target, source);
    });
    api[entry] = exports.toSorted(
      (a, b) =>
        ["component", "function", "value", "type"].indexOf(a.kind) -
          ["component", "function", "value", "type"].indexOf(b.kind) ||
        a.name.localeCompare(b.name),
    );
  }
  return api;
}

// ---------------------------------------------------------------------------

function generate() {
  const pin = readJson(path.join(root, "vendor/ui-platform/pin.json"));
  const rows = loadSpecs();
  const themes = loadThemes();
  const defaultTheme = themes[SITE_THEME];
  // WCAG 2.2 success criterion 1.4.3 (AA): text needs 4.5:1, as the token gate requires.
  const TEXT_MINIMUM = 4.5;
  const tokenNames = new Set(defaultTheme.tokens.map((t) => t.name));

  const api = apiOf(rows.map(({ spec }) => ({ entry: spec.entry })));

  const primitives = Object.fromEntries(
    rows.filter((r) => r.spec.kind === "primitive").map((r) => [r.spec.name, r.spec]),
  );
  const entries = rows.map(({ package: pkg, version, spec }) => ({
    entry: spec.entry,
    package: pkg,
    version,
    slug: slugOf(spec.entry),
    kind: spec.kind,
    stability: spec.stability,
    entryKind: spec.entryKind ?? null,
    primitive: spec.kind === "styled" ? spec.primitive : null,
    page:
      spec.kind === "styled"
        ? `/components/${slugOf(spec.entry)}`
        : spec.kind === "primitive"
          ? `/primitives/${slugOf(spec.entry)}`
          : null,
  }));

  const components = {};
  for (const { spec } of rows.filter((r) => r.spec.kind === "styled")) {
    const unknownTokens = spec.bindings
      .flatMap((b) =>
        Object.values(b.declarations).flatMap((v) =>
          [...v.matchAll(/\{([a-z0-9.-]+)\}/g)].map((m) => m[1]),
        ),
      )
      .filter((t) => !tokenNames.has(t));
    if (unknownTokens.length)
      throw new Error(
        `${spec.entry}: bindings name unpublished tokens ${unknownTokens.join(", ")}`,
      );
    components[slugOf(spec.entry)] = {
      spec,
      primitive: spec.primitive ? (primitives[spec.primitive] ?? null) : null,
      api: api[spec.entry],
      primitiveApi: spec.primitive ? (api[primitives[spec.primitive]?.entry] ?? null) : null,
      contrast: contrastTable(spec, themes, TEXT_MINIMUM),
    };
  }
  const primitivePages = {};
  for (const spec of Object.values(primitives))
    primitivePages[slugOf(spec.entry)] = {
      spec,
      api: api[spec.entry],
      styledBy: rows
        .filter((r) => r.spec.kind === "styled" && r.spec.primitive === spec.name)
        .map((r) => slugOf(r.spec.entry)),
    };

  const tokens = Object.fromEntries(
    Object.entries(themes).map(([id, theme]) => [
      id,
      {
        standard: theme.standard,
        modes: theme.modes,
        count: theme.tokens.filter((t) => t.canonical).length,
      },
    ]),
  );
  // The token list for the Tokens page: canonical tokens with every theme's value per mode.
  const tokenList = defaultTheme.tokens
    .filter((t) => t.canonical)
    .map((t) => ({
      name: t.name,
      cssName: t.cssName,
      type: t.type,
      tier: t.tier,
      lifecycle: t.lifecycle,
      values: Object.fromEntries(
        Object.entries(themes).map(([id, theme]) => [
          id,
          theme.tokens.find((x) => x.name === t.name)?.resolved[id] ?? null,
        ]),
      ),
    }));
  // The landing page's theme lab: what its sample form renders (TextField and Button bindings).
  // The form sits on the site's ground, as a page on the theme would: surface.default in
  // light, surface.sunken in dark (src/styles/generic/_roles.scss, --sq-ground). A pair
  // whose background is "ground" is measured there, and every pair is composited over it.
  const GROUND = {
    light: "color.neutral.surface.default.default",
    dark: "color.neutral.surface.sunken.default",
  };
  const LAB_PAIRS = [
    {
      label: "Label on brand fill",
      fg: "color.primary.text.contrast.default",
      bg: "color.primary.surface.solid.default",
      minimum: 4.5,
    },
    {
      label: "Field text",
      fg: "color.neutral.text.default.default",
      bg: "color.neutral.surface.raised.default",
      minimum: 4.5,
    },
    {
      label: "Description",
      fg: "color.neutral.text.subtle.default",
      bg: "ground",
      minimum: 4.5,
    },
    {
      label: "Field boundary",
      fg: "color.neutral.border.strong.default",
      bg: "color.neutral.surface.raised.default",
      minimum: 3,
    },
  ];
  const lab = Object.fromEntries(
    Object.entries(themes).map(([themeId, theme]) => {
      const byName = new Map(theme.tokens.map((t) => [t.name, t]));
      return [
        themeId,
        Object.fromEntries(
          theme.modes.map((mode) => {
            const value = (name) => parseColor(byName.get(name).resolved[themeId][mode]);
            const ground = value(GROUND[mode] ?? GROUND.light);
            return [
              mode,
              LAB_PAIRS.map((pair) => {
                const bg = pair.bg === "ground" ? ground : value(pair.bg);
                const { ratio } = contrastRatio(value(pair.fg), bg, ground);
                return { ...pair, ratio: Math.floor(ratio * 10) / 10, pass: ratio >= pair.minimum };
              }),
            ];
          }),
        ),
      ];
    }),
  );
  // The color page's contrast table: each scheme's `contrast` text on its `solid` surface at
  // rest, the pair STD-UIP-TKN-001 tests for every scheme, per theme and mode, measured on the
  // ground as the lab's pairs are.
  const SCHEMES = ["primary", "neutral", "info", "success", "warning", "danger"];
  const onSolid = SCHEMES.map((scheme) => ({
    scheme,
    fg: `color.${scheme}.text.contrast.default`,
    bg: `color.${scheme}.surface.solid.default`,
    results: Object.entries(themes).flatMap(([themeId, theme]) => {
      const byName = new Map(theme.tokens.map((t) => [t.name, t]));
      return theme.modes.map((mode) => {
        const value = (name) => parseColor(byName.get(name).resolved[themeId][mode]);
        const { ratio } = contrastRatio(
          value(`color.${scheme}.text.contrast.default`),
          value(`color.${scheme}.surface.solid.default`),
          value(GROUND[mode] ?? GROUND.light),
        );
        return { theme: themeId, mode, ratio: Math.floor(ratio * 10) / 10, pass: ratio >= 4.5 };
      });
    }),
  }));
  const swatches = ["subtle", "default", "strong"]
    .map((e) => `color.primary.surface.${e}.default`)
    .concat([
      "color.primary.border.subtle.default",
      "color.primary.border.default.default",
      "color.primary.surface.solid.default",
      "color.primary.surface.solid.hover",
      "color.primary.text.default.default",
    ]);
  const figma = figmaFiles().map(({ content: _content, ...row }) => row);
  const reference = {
    schemaVersion: 1,
    pin,
    entries,
    components,
    primitives: primitivePages,
    tokens,
    tokenList,
    figma,
    landing: { lab, swatches },
    color: { onSolid },
  };

  // The previews' specimens: one `next/dynamic` per styled entry, so a component page loads
  // its own component's chunk, not every component's (each is rendered on the server and
  // its chunk preloaded for hydration).
  const styled = entries.filter((e) => e.kind === "styled");
  const specimens = `// Generated by scripts/reference.mjs. Do not edit.
"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { Fixture, type FixtureProps } from "@/features/reference/Fixture";

export const specimens: Record<string, ComponentType<FixtureProps>> = {
${styled
  .map(
    (e) =>
      `  ${JSON.stringify(e.slug)}: dynamic(() =>\n    import(${JSON.stringify(e.entry)}).then((mod) => (props: FixtureProps) => <Fixture mod={mod} {...props} />),\n  ),`,
  )
  .join("\n")}
};
`; // Samples of the token pages, as static CSS under the site's CSP. A color token has two
  // rules: `data-swatch="<token>"` paints its background, and `data-color-token="<token>"`
  // sets `--token-color` for a sample that draws it as text, an icon or a border. Every
  // other token sets `--token-value` under `data-token="<token>"`, and a typography
  // composite applies its five members under `data-type-token="<composite>"`.
  const canonical = defaultTheme.tokens.filter((t) => t.canonical);
  const colorTokens = canonical.filter((t) => t.type === "color");
  const MEMBERS = ["font-family", "font-size", "font-weight", "line-height", "letter-spacing"];
  const composites = [
    ...new Set(
      canonical
        .map((t) => /^(typography\.[a-z]+\.[a-z]+)\.font-size$/.exec(t.name)?.[1])
        .filter(Boolean),
    ),
  ];
  const rules = [
    ...colorTokens.map((t) => `  [data-swatch="${t.name}"] { background: var(${t.cssName}); }`),
    ...colorTokens.map(
      (t) => `  [data-color-token="${t.name}"] { --token-color: var(${t.cssName}); }`,
    ),
    ...canonical
      .filter((t) => t.type !== "color")
      .map((t) => `  [data-token="${t.name}"] { --token-value: var(${t.cssName}); }`),
    ...composites.map(
      (c) =>
        `  [data-type-token="${c}"] { ${MEMBERS.map((m) => `${m}: var(--ds-${c.replaceAll(".", "-")}-${m});`).join(" ")} }`,
    ),
  ];
  const swatchCss = `/* Generated by scripts/reference.mjs. Do not edit. */\n@layer docs.utilities {\n${rules.join("\n")}\n}\n`;
  // The theme ids, small enough for client modules: the site's theme, then every shipped one.
  const themeIds = { site: SITE_THEME, ids: Object.keys(themes) };
  return {
    "reference.json": `${JSON.stringify(reference, null, 2)}\n`,
    "specimens.tsx": specimens,
    "swatches.css": swatchCss,
    "themes.json": `${JSON.stringify(themeIds, null, 2)}\n`,
  };
}

// ---------------------------------------------------------------------------
// Figma profile (ui-platform TDD tokens FG1-FG6; ADR-UIP-TKN-004): the package's
// tokens/figma exports, served as downloads exactly as published.

const DOWNLOADS = path.join(root, "public/downloads/figma");
const themeOrder = (t) => (t === SITE_THEME ? "" : t);
const modeOrder = (m) => ({ light: 0, dark: 1 })[m] ?? 2;

export function figmaFiles() {
  const dir = packageDir("@scnx/system");
  const manifest = readJson(path.join(dir, "package.json"));
  const count = (node) =>
    Object.entries(node).reduce(
      (n, [key, value]) =>
        n +
        (key.startsWith("$") || !value || typeof value !== "object"
          ? 0
          : "$value" in value
            ? 1
            : count(value)),
      0,
    );
  const files = [];
  for (const [subpath, target] of Object.entries(manifest.exports)) {
    const match =
      /^\.\/tokens\/figma\/([a-z0-9-]+)\.(?:([a-z0-9-]+)\.color|dimension)\.tokens\.json$/.exec(
        subpath,
      );
    if (!match) continue;
    const content = fs.readFileSync(path.join(dir, target), "utf8");
    const file = subpath.slice("./tokens/figma/".length);
    files.push({
      file,
      subpath: `@scnx/system${subpath.slice(1)}`,
      theme: match[1],
      mode: match[2] ?? null,
      kind: match[2] ? "color" : "dimension",
      tokens: count(JSON.parse(content)),
      content,
    });
  }
  // The site's theme first, colors before dimensions, light before dark.
  return files.toSorted(
    (a, b) =>
      themeOrder(a.theme).localeCompare(themeOrder(b.theme)) ||
      a.kind.localeCompare(b.kind) ||
      modeOrder(a.mode) - modeOrder(b.mode),
  );
}

// ---------------------------------------------------------------------------
// Search index: every page the site has, each documented entry, and every token, as
// `public/search.json`. The search fetches it the first time it opens, so no page carries
// it. Each row: t title, h link, k kind, d a line about it.

const SEARCH_PAGES = [
  ["Home", "/", "Build interfaces you can prove: the system, its contracts, its evidence."],
  [
    "Get started",
    "/get-started",
    "Install the packages, set a theme root, and render a component.",
  ],
  ["Components", "/components", "Every styled component, its status and its page."],
  ["Primitives", "/primitives", "Every headless primitive, its status and its page."],
  ["Tokens", "/tokens", "What a token is: its tiers, its name, light and dark, how to use it."],
  ["Colour", "/tokens/color", "Colour by role: schemes, emphasis, states and contrast."],
  ["Typography", "/tokens/typography", "Type by reading context: composites and weights."],
  [
    "Dimension",
    "/tokens/dimension",
    "Spacing by relationship, control sizes, radius, borders, stacking.",
  ],
  ["Effect", "/tokens/effect", "Materials and shadow levels."],
  ["Motion", "/tokens/motion", "Durations and easings by action."],
  ["All tokens", "/tokens/all", "Every token with its value in light and dark."],
  ["Tokens in Figma", "/tokens/figma", "The token files for Figma and how to load them."],
  ["Releases", "/releases", "Status of every entry, the pinned build and its provenance."],
];

const searchTitle = (slug) => {
  const words = slug.replace(/-base$/, "").split("-");
  return [words[0].charAt(0).toUpperCase() + words[0].slice(1), ...words.slice(1)].join(" ");
};
// the first sentence of a description, without a leading "Name - "
const firstSentence = (text = "") =>
  (text.split(/\n\s*\n/)[0] ?? "")
    .replace(/\s+/g, " ")
    .replace(/^[\w.]+ - /, "")
    .replace(/(\.)\s.*$/, "$1")
    .slice(0, 160);

export function searchIndex(reference) {
  const describe = (e) =>
    firstSentence(
      (e.kind === "styled" ? reference.components : reference.primitives)[e.slug]?.api?.[0]
        ?.description,
    );
  return [
    ...SEARCH_PAGES.map(([t, h, d]) => ({ t, h, k: "Page", d })),
    ...reference.entries
      .filter((e) => e.page)
      .map((e) => ({
        t: searchTitle(e.slug),
        h: e.page,
        k: e.kind === "styled" ? "Component" : "Primitive",
        d: describe(e) || `${e.entry}, ${e.stability}.`,
      })),
    ...reference.tokenList.map((t) => ({
      t: t.name,
      h: `/tokens/all#${t.name.split(".").slice(0, 2).join("-")}`,
      k: "Token",
      d: t.cssName,
    })),
  ];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const outputs = generate();
  fs.mkdirSync(OUT, { recursive: true });
  for (const [file, text] of Object.entries(outputs)) fs.writeFileSync(path.join(OUT, file), text);
  fs.rmSync(DOWNLOADS, { recursive: true, force: true });
  fs.mkdirSync(DOWNLOADS, { recursive: true });
  for (const { file, content } of figmaFiles())
    fs.writeFileSync(path.join(DOWNLOADS, file), content);
  const data = JSON.parse(outputs["reference.json"]);
  fs.writeFileSync(path.join(root, "public/search.json"), JSON.stringify(searchIndex(data)));
  console.log(
    `Reference generated from ${data.pin.packages.map((p) => `${p.name}@${p.version}`).join(", ")} (ui-platform ${data.pin.commit.slice(0, 7)}): ${data.entries.length} entries, ${Object.keys(data.components).length} component pages, ${Object.keys(data.primitives).length} primitive pages`,
  );
}
