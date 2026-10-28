#!/usr/bin/env node
// The ruler's titles and the page's "here" (TDD docs-site D15;
// TDD docs-site annex A 6, first checked in scnehaux-design #28). Starts `next start`, then, for every page that has sheets and at
// several viewport sizes:
// 1. scrolls the page in small steps, has the ruler draw each position, and fails
//    if a letter of one title overlaps a letter of another title (their drawn
//    boxes, shrunk by half a pixel, so titles that only touch do not count), or if
//    a letter has no finite position (it would be left undrawn);
// 2. scrolls each section's line to the nav line, and to 2px short of it, and fails
//    unless the section bar's number, the nav readout, the ruler's readout, and the
//    contents' current link name the same section, the one annex A 6.9 makes here.
//
//   node scripts/ruler-check.mjs [--step 8] [--sizes 1440x900,1920x1080,1280x720,1024x640] [--routes /a,/b]

import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index > -1 ? process.argv[index + 1] : fallback;
};
const STEP = Number(arg("--step", "8"));
const SIZES = arg("--sizes", "1440x900,1920x1080,1280x720,1024x640")
  .split(",")
  .map((s) => s.split("x").map(Number));
const reference = JSON.parse(
  fs.readFileSync(path.join(root, "src/generated/reference.json"), "utf8"),
);
const ROUTES = arg("--routes", "")
  ? arg("--routes").split(",")
  : [
      "/tokens",
      "/tokens/color",
      "/tokens/typography",
      "/tokens/dimension",
      "/tokens/effect",
      "/tokens/motion",
      "/tokens/all",
      "/tokens/figma",
      "/releases",
      ...reference.entries.filter((e) => e.page).map((e) => e.page),
    ];
const NAV = 48;

const port = await new Promise((resolve) => {
  const server = net.createServer().listen(0, () => {
    const { port: free } = server.address();
    server.close(() => resolve(free));
  });
});
const server = spawn(
  process.execPath,
  [path.join(root, "node_modules/next/dist/bin/next"), "start", "-p", String(port)],
  {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  },
);
const origin = `http://127.0.0.1:${port}`;
for (let i = 0; i < 100; i++) {
  try {
    await fetch(origin);
    break;
  } catch {
    await new Promise((r) => setTimeout(r, 200));
  }
}

// 1. In the page: scroll from top to bottom in steps; after each step have the ruler draw
// that position at once (`sq:draw`, the frame function it runs on scroll), then read
// every letter. Returns the positions checked and the first findings.
const sweep = (step) => {
  const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
  const findings = [];
  let positions = 0;
  for (let y = 0; ; y = Math.min(max, y + step)) {
    window.scrollTo({ top: y, behavior: "instant" });
    window.dispatchEvent(new Event("sq:draw"));
    positions++;
    const letters = [...document.querySelectorAll("[data-title]")].filter(
      (s) => s.textContent.trim() && !s.closest("[hidden]"),
    );
    const boxes = [];
    for (const s of letters) {
      const r = s.getBoundingClientRect();
      if (
        !s.style.transform ||
        /NaN|Infinity/.test(s.style.transform) ||
        ![r.left, r.top, r.right, r.bottom].every(Number.isFinite)
      ) {
        findings.push({ y, kind: "undrawn", a: `${s.dataset.title}:${s.textContent}` });
        continue;
      }
      boxes.push({ t: s.dataset.title, ch: s.textContent, r });
    }
    outer: for (let a = 0; a < boxes.length; a++) {
      for (let b = a + 1; b < boxes.length; b++) {
        const A = boxes[a];
        const B = boxes[b];
        if (A.t === B.t) continue;
        const x = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left);
        const yy = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
        if (x > 0.5 && yy > 0.5) {
          findings.push({ y, kind: "overlap", a: `${A.t}:${A.ch}`, b: `${B.t}:${B.ch}` });
          break outer;
        }
      }
    }
    if (findings.length >= 20 || y >= max) break;
  }
  return { positions, findings, ruler: document.documentElement.dataset.ruler };
};

// 2. The page's sheets, their lines, and the page's scroll range.
const layout = () => ({
  max: Math.max(0, document.documentElement.scrollHeight - innerHeight),
  sheets: [...document.querySelectorAll("main [data-sheet]")].map((s) => ({
    id: s.id,
    name: s.dataset.sheet,
    top: s.getBoundingClientRect().top + scrollY,
  })),
});
// What each indicator says is here, as a section index (-1 when it says nothing).
const indicators = () => {
  const sheets = [...document.querySelectorAll("main [data-sheet]")];
  const bar = sheets.findIndex((s) => s.hasAttribute("data-here"));
  const nav = Number(document.querySelector("header [aria-hidden='true'] b")?.textContent ?? 0) - 1;
  // the ruler's readout under its now line: "05 · 042%" (the scale's tick numbers are spans too)
  const readout = [...document.querySelectorAll("[role='scrollbar'] span")].find((s) =>
    / · /.test(s.textContent ?? ""),
  );
  const ruler = Number((readout?.textContent ?? "").slice(0, 2)) - 1;
  // the page's own contents, in the aside (a TableOfContents specimen in a preview is not
  // it), matched by the section its link points at: its text also holds the sheet's number
  const current = document.querySelector("aside a[aria-current='location']");
  const toc = current ? sheets.findIndex((s) => current.getAttribute("href") === `#${s.id}`) : -1;
  return { bar, nav, ruler, toc };
};
// annex A 6.9: the last section whose line has reached the nav, or, where the page ends
// first, the highest point its line can reach.
const expected = (tops, y, max) => {
  let here = 0;
  tops.forEach((top, i) => {
    if (top - y <= Math.max(NAV, top - max) + 0.5) here = i;
  });
  return here;
};

const failures = [];
let positions = 0;
let agreements = 0;
const browser = await chromium.launch();
try {
  await Promise.all(
    SIZES.map(async ([width, height]) => {
      const context = await browser.newContext({
        viewport: { width, height },
        reducedMotion: "no-preference",
      });
      const page = await context.newPage();
      for (const route of ROUTES) {
        await page.goto(origin + route, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        if ((await page.locator("main [data-sheet]").count()) < 2) continue;
        // let the reveal settle, so the page's length no longer changes
        await page.waitForTimeout(1500);
        const at = `${route} at ${width}x${height}`;
        const swept = await page.evaluate(sweep, STEP);
        positions += swept.positions;
        if (swept.ruler !== "on") failures.push(`${at}: the ruler is not shown`);
        for (const f of swept.findings)
          failures.push(
            f.kind === "undrawn"
              ? `${at}, scrollY ${f.y}: letter ${f.a} has no finite position`
              : `${at}, scrollY ${f.y}: title ${f.a} overlaps title ${f.b}`,
          );

        const { max, sheets } = await page.evaluate(layout);
        const tops = sheets.map((s) => s.top);
        for (const s of sheets) {
          for (const y of [s.top - NAV, s.top - NAV - 2]) {
            if (y < 0 || y > max) continue;
            await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
            // the provider measures in the frame after a scroll, and React commits after it
            await page.evaluate(
              () =>
                new Promise((r) =>
                  requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 30))),
                ),
            );
            await page.evaluate(() => window.dispatchEvent(new Event("sq:draw")));
            const want = expected(tops, y, max);
            const got = await page.evaluate(indicators);
            agreements++;
            const off = Object.entries(got).filter(([, v]) => v !== want);
            if (off.length)
              failures.push(
                `${at}, scrollY ${Math.round(y)}: here is ${sheets[want]?.name} (${want + 1}), but ${off.map(([k, v]) => `${k} says ${v + 1}`).join(", ")}`,
              );
          }
        }
      }
      await context.close();
    }),
  );
} finally {
  await browser.close();
  server.kill();
}

const summary = `${positions} scroll positions and ${agreements} here checks, ${ROUTES.length} routes, ${SIZES.map((s) => s.join("x")).join(", ")}, step ${STEP}px`;
if (failures.length) {
  console.error(failures.slice(0, 200).join("\n"));
  console.error(`Ruler check failed: ${failures.length} finding(s) over ${summary}`);
  process.exit(1);
}
console.log(
  `Ruler check passed: no title crosses another, every letter drawn, and here agrees, over ${summary}`,
);
