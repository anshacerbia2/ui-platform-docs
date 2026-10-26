#!/usr/bin/env node
// Stylesheet rules of the site (TDD docs-site D4):
// 1. The site never selects a ui-platform class: components are styled through
//    their public API (props, tokens), never by reaching into `.scnx-*`.
// 2. Every color is a ui-platform token: no hex, rgb(), hsl(), oklch(), lab(),
//    or lch() literal, except inside a mask, where only alpha matters.
// 3. Every `--ds-*` property the site reads is published by @scnx/system.
// 4. Every component stylesheet is a CSS Module in `@layer docs.components`.
// 5. No component passes a `style` prop: a style attribute in server HTML
//    violates the site's Content-Security-Policy (TDD docs-site D5).
// 6. Every colour mix is made in OKLab (`color-mix(in oklab, …)`): the neutral
//    tokens have so little chroma that their OKLCH hue is powerless, a mix in
//    OKLCH takes hue `none` (read as 0°, red), and a grey turns warm.

import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { SITE_THEME } from "./reference.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function styleFindings(file, text, published) {
  const findings = [];
  if (file.endsWith(".tsx")) {
    text.split("\n").forEach((line, index) => {
      if (/\sstyle=\{/.test(line))
        findings.push(`${file}:${index + 1}: style prop; set dynamic styles through useStyleVars`);
    });
    return findings;
  }
  const lines = text.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " ")).split("\n");
  lines.forEach((raw, index) => {
    const line = raw.replace(/\/\/.*$/, "");
    const at = `${file}:${index + 1}`;
    if (/\.scnx-[a-z]/.test(line)) findings.push(`${at}: selects a ui-platform class`);
    if (
      !/\bmask(-image)?\s*:/.test(line) &&
      /(#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?|oklch|oklab|lab|lch)\()/.test(line)
    )
      findings.push(`${at}: color literal; use a token`);
    for (const [, name] of line.matchAll(/var\((--ds-[a-z0-9-]+)/g))
      if (!published.has(name)) findings.push(`${at}: ${name} is not a published token`);
  });
  // across lines: a formatter may break `color-mix(` from its space
  for (const match of text.matchAll(/color-mix\(\s*in\s+([a-z-]+)/g))
    if (match[1] !== "oklab") {
      const line = text.slice(0, match.index).split("\n").length;
      findings.push(`${file}:${line}: color-mix in ${match[1]}; mix in oklab`);
    }
  if (file.endsWith(".module.scss") && !/@layer docs\.components\s*\{/.test(text))
    findings.push(`${file}: a component stylesheet must wrap its rules in @layer docs.components`);
  return findings;
}

function walk(dir, out = []) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== "generated") walk(full, out);
    else if (/\.(scss|tsx)$/.test(item.name)) out.push(full);
  }
  return out;
}

function selfTest() {
  const published = new Set(["--ds-a"]);
  const cases = [
    [styleFindings("x.scss", ".a { color: var(--ds-a); }", published).length, 0],
    [styleFindings("x.scss", ".a .scnx-btn { color: red; }", published).length, 1],
    [styleFindings("x.scss", ".a { color: #fff; }", published).length, 1],
    [styleFindings("x.scss", ".a { color: oklch(1 0 0); }", published).length, 1],
    [
      styleFindings("x.scss", ".a { mask-image: linear-gradient(#000, transparent); }", published)
        .length,
      0,
    ],
    [styleFindings("x.scss", ".a { color: var(--ds-b); }", published).length, 1],
    [styleFindings("x.module.scss", ".a { color: var(--ds-a); }", published).length, 1],
    [
      styleFindings(
        "x.module.scss",
        "@layer docs.components { .a { color: var(--ds-a); } }",
        published,
      ).length,
      0,
    ],
    [
      styleFindings(
        "x.scss",
        ".a { color: color-mix(in oklab, var(--ds-a) 5%, transparent); }",
        published,
      ).length,
      0,
    ],
    [
      styleFindings(
        "x.scss",
        ".a { color: color-mix(in oklch, var(--ds-a) 5%, transparent); }",
        published,
      ).length,
      1,
    ],
    [
      styleFindings(
        "x.scss",
        ".a { color: color-mix(\n  in srgb,\n  var(--ds-a) 5%,\n  transparent\n); }",
        published,
      ).length,
      1,
    ],
    [styleFindings("x.tsx", "<div style={{ color: 'red' }} />", published).length, 1],
    [styleFindings("x.tsx", "<div className={styles.a} />", published).length, 0],
  ];
  const failed = cases.filter(([a, w]) => a !== w);
  if (failed.length) {
    console.error(`Stylesheet self-test failed: ${JSON.stringify(failed)}`);
    process.exit(1);
  }
  console.log(`Stylesheet self-test passed: ${cases.length} cases`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes("--self-test")) selfTest();
  else {
    const require = createRequire(path.join(root, "package.json"));
    const tokens = JSON.parse(
      fs.readFileSync(require.resolve(`@scnx/system/tokens/json/${SITE_THEME}.json`), "utf8"),
    ).tokens;
    const published = new Set(tokens.map((t) => t.cssName));
    const files = walk(path.join(root, "src"));
    const findings = files.flatMap((f) =>
      styleFindings(path.relative(root, f), fs.readFileSync(f, "utf8"), published),
    );
    if (findings.length) {
      console.error(findings.join("\n"));
      process.exit(1);
    }
    console.log(
      `Stylesheet rules passed: ${files.filter((f) => f.endsWith(".scss")).length} stylesheets and ${files.filter((f) => f.endsWith(".tsx")).length} components, ${published.size} published tokens`,
    );
  }
}
