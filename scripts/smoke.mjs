#!/usr/bin/env node
// Browser smoke test of the built site (TDD docs-site D7). Starts `next start`
// and loads every route in each engine; fails on a page error, a console
// error, a Content-Security-Policy violation, a failed request, or a response
// without the policy. With --shots <dir> it also saves full-page screenshots.
//
//   node scripts/smoke.mjs [--browsers chromium,firefox,webkit] [--shots <dir>]

import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, firefox, webkit } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index > -1 ? process.argv[index + 1] : fallback;
};
const ENGINES = { chromium, firefox, webkit };
const browsers = arg("--browsers", process.env.SMOKE_BROWSERS ?? "chromium,firefox,webkit").split(",");
const shots = arg("--shots");

const reference = JSON.parse(fs.readFileSync(path.join(root, "src/generated/reference.json"), "utf8"));
const ROUTES = ["/", "/components", "/primitives", "/tokens", "/releases", ...reference.entries.filter((e) => e.page).map((e) => e.page)];

const escapeAnnotation = (text) => text.replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A");

const port = await new Promise((resolve) => {
  const server = net.createServer().listen(0, () => {
    const { port: free } = server.address();
    server.close(() => resolve(free));
  });
});
const server = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "start", "-p", String(port)], {
  cwd: root,
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
});
// 127.0.0.1 is a potentially trustworthy origin in every engine; Playwright's WebKit
// on Linux does not store a cookie that a page on http://localhost writes.
const origin = `http://127.0.0.1:${port}`;
for (let i = 0; i < 100; i++) {
  try {
    await fetch(origin);
    break;
  } catch {
    await new Promise((r) => setTimeout(r, 200));
  }
}

const failures = [];
try {
  // Every document carries a fresh nonce policy.
  const [a, b] = await Promise.all([fetch(origin), fetch(origin)]);
  const policy = a.headers.get("content-security-policy") ?? "";
  if (!/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/.test(policy) || /unsafe-inline|unsafe-eval/.test(policy))
    failures.push(`policy is not strict: ${policy}`);
  if (policy === b.headers.get("content-security-policy")) failures.push("two responses share one nonce");
  const llms = await fetch(`${origin}/llms.txt`);
  if (!llms.ok || !(await llms.text()).startsWith("# Scnehaux UI")) failures.push("/llms.txt is missing");

  for (const name of browsers) {
    const browser = await ENGINES[name].launch(
      name === "chromium" && fs.existsSync("/opt/pw-browsers/chromium") && process.env.CI !== "true" ? { executablePath: "/opt/pw-browsers/chromium" } : {},
    );
    for (const mode of ["light", "dark"]) {
      // The system preference is the opposite mode, so a page that renders `mode`
      // proves the server read the preference the site itself stored.
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: mode === "dark" ? "light" : "dark" });
      // Report every CSP violation to the console, where it is collected below.
      await context.addInitScript(() => {
        document.addEventListener("securitypolicyviolation", (e) =>
          console.error(`CSP violation: ${e.violatedDirective} ${e.blockedURI} ${e.sourceFile}:${e.lineNumber}`),
        );
      });
      const chooser = await context.newPage();
      await chooser.goto(origin, { waitUntil: "networkidle" });
      // A click before hydration does nothing, so press until the site has stored the choice.
      const control = chooser.getByRole("button", { name: mode === "dark" ? "Dark mode" : "Light mode" });
      let stored = false;
      for (let attempt = 0; attempt < 40 && !stored; attempt++) {
        await control.click();
        stored = await chooser.evaluate((m) => document.cookie.includes(`scnx-theme-mode=${m}`), mode);
        if (!stored) await chooser.waitForTimeout(250);
      }
      if (!stored) throw new Error(`${name}: the mode switch did not store ${mode}`);
      await chooser.close();
      for (const route of ROUTES) {
        const page = await context.newPage();
        const problems = [];
        page.on("pageerror", (e) => problems.push(`page error: ${e.message}`));
        page.on("console", (m) => {
          if (m.type() === "error") problems.push(`console: ${m.text()}`);
        });
        // A prefetch the page cancels when it closes is aborted, not failed.
        page.on("requestfailed", (r) => {
          const error = r.failure()?.errorText ?? "";
          if (!/ERR_ABORTED|NS_BINDING_ABORTED|cancelled/i.test(error)) problems.push(`request failed: ${r.url()} ${error}`);
        });
        const response = await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
        if (!response?.ok()) problems.push(`status ${response?.status()}`);
        const resolved = await page.locator("[data-scnx-theme]").first().getAttribute("data-scnx-resolved-mode");
        if (resolved !== mode) problems.push(`rendered ${resolved} for a ${mode} preference`);
        await page.waitForTimeout(300);
        if (shots && name === "chromium") {
          fs.mkdirSync(shots, { recursive: true });
          await page.screenshot({ path: path.join(shots, `${route === "/" ? "landing" : route.slice(1).replaceAll("/", "-")}-${mode}.png`), fullPage: true });
        }
        for (const p of problems) failures.push(`${name} ${mode} ${route}: ${p}`);
        await page.close();
      }
      await context.close();
    }
    await browser.close();
    console.log(`${name}: ${ROUTES.length} routes × 2 modes`);
  }
} catch (error) {
  // An exception (a control the test drives is missing, a browser that does not start) is a failure too.
  failures.push(`smoke test stopped: ${error?.stack ?? error}`);
} finally {
  server.kill();
}

if (failures.length) {
  console.error(failures.join("\n"));
  // In GitHub Actions, each distinct failure is also an annotation on the check.
  if (process.env.GITHUB_ACTIONS === "true") {
    for (const failure of [...new Set(failures)].slice(0, 40)) console.log(`::error title=Smoke test::${escapeAnnotation(failure.slice(0, 900))}`);
  }
  process.exit(1);
}
console.log(`Smoke test passed: ${ROUTES.length} routes in ${browsers.join(", ")}, light and dark, with zero errors and zero CSP violations`);
