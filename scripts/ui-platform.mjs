#!/usr/bin/env node
// The pinned ui-platform release the site documents (TDD docs-site D2).
//
//   node scripts/ui-platform.mjs pin --packs <dir> --commit <sha> --run <url>
//        copy the tarballs of a ui-platform CI run on main (byte-identical to a
//        local pack of that commit; ui-platform builds reproducibly), update
//        package.json and vendor/ui-platform/pin.json
//   node scripts/ui-platform.mjs check
//        every vendored tarball matches the pin, and package.json installs exactly them
//   node scripts/ui-platform.mjs verify
//        check, then verify each tarball's SLSA provenance with the GitHub CLI:
//        signed by ui-platform's CI workflow, built from the pinned commit on main

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VENDOR = path.join(root, "vendor/ui-platform");
const PIN = path.join(VENDOR, "pin.json");
const REPOSITORY = "anshacerbia2/ui-platform";
const SIGNER = `${REPOSITORY}/.github/workflows/ci.yml`;

const arg = (name) => {
  const index = process.argv.indexOf(name);
  return index > -1 ? process.argv[index + 1] : undefined;
};
const sha256 = (file) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

/** Findings for a pin, the vendored files, and the manifest, independent of the file system. */
export function pinFindings(pin, files, manifest) {
  const findings = [];
  if (!/^[0-9a-f]{40}$/.test(pin.commit ?? "")) findings.push("pin.commit must be a full commit SHA");
  for (const pkg of pin.packages ?? []) {
    const actual = files[pkg.tarball];
    if (actual === undefined) findings.push(`${pkg.tarball} is pinned but not vendored`);
    else if (actual !== pkg.sha256) findings.push(`${pkg.tarball} has sha256 ${actual}, pinned ${pkg.sha256}`);
    const spec = manifest.dependencies?.[pkg.name];
    if (spec !== `file:vendor/ui-platform/${pkg.tarball}`)
      findings.push(`package.json must install ${pkg.name} from file:vendor/ui-platform/${pkg.tarball}, not ${spec}`);
  }
  for (const file of Object.keys(files)) if (!(pin.packages ?? []).some((p) => p.tarball === file)) findings.push(`${file} is vendored but not pinned`);
  return findings;
}

function vendoredFiles() {
  return Object.fromEntries(
    fs
      .readdirSync(VENDOR)
      .filter((f) => f.endsWith(".tgz"))
      .map((f) => [f, sha256(path.join(VENDOR, f))]),
  );
}

function check() {
  const findings = pinFindings(readJson(PIN), vendoredFiles(), readJson(path.join(root, "package.json")));
  if (findings.length) {
    console.error(findings.join("\n"));
    process.exit(1);
  }
  const pin = readJson(PIN);
  console.log(`Pinned ui-platform ${pin.commit.slice(0, 7)}: ${pin.packages.map((p) => `${p.name}@${p.version}`).join(", ")} match`);
  return pin;
}

function verify() {
  const pin = check();
  for (const pkg of pin.packages) {
    execFileSync(
      "gh",
      [
        "attestation",
        "verify",
        path.join(VENDOR, pkg.tarball),
        "--repo",
        REPOSITORY,
        "--signer-workflow",
        SIGNER,
        "--source-ref",
        "refs/heads/main",
        "--source-digest",
        pin.commit,
        "--deny-self-hosted-runners",
      ],
      { stdio: "inherit" },
    );
  }
  console.log(`Provenance verified: every tarball was built by ${SIGNER} from ${pin.commit.slice(0, 7)} on main`);
}

function pinFrom() {
  const packs = path.resolve(arg("--packs") ?? "");
  const commit = arg("--commit");
  const run = arg("--run");
  if (!fs.existsSync(path.join(packs, "pack-report.json")) || !commit || !run) {
    console.error("usage: node scripts/ui-platform.mjs pin --packs <inspect-packages output> --commit <sha> --run <CI run URL>");
    process.exit(2);
  }
  const report = readJson(path.join(packs, "pack-report.json"));
  for (const file of fs.readdirSync(VENDOR).filter((f) => f.endsWith(".tgz"))) fs.rmSync(path.join(VENDOR, file));
  const manifest = readJson(path.join(root, "package.json"));
  const packages = report.packages.map((pkg) => {
    fs.copyFileSync(path.join(packs, pkg.tarball), path.join(VENDOR, pkg.tarball));
    const digest = sha256(path.join(VENDOR, pkg.tarball));
    if (digest !== pkg.tarballSha256) throw new Error(`${pkg.tarball}: copied sha256 ${digest} differs from the pack report`);
    manifest.dependencies[pkg.name] = `file:vendor/ui-platform/${pkg.tarball}`;
    return { name: pkg.name, version: pkg.version, tarball: pkg.tarball, sha256: digest };
  });
  writeJson(path.join(root, "package.json"), manifest);
  writeJson(PIN, {
    $comment:
      "The ui-platform release this site documents (TDD docs-site D2). Written by scripts/ui-platform.mjs pin; verified in CI by scripts/ui-platform.mjs verify.",
    repository: REPOSITORY,
    commit,
    ref: "refs/heads/main",
    run,
    signerWorkflow: SIGNER,
    packages,
  });
  console.log(`Pinned ${packages.map((p) => `${p.name}@${p.version}`).join(", ")} from ${commit.slice(0, 7)}; run pnpm install`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const command = process.argv[2];
  if (command === "check") check();
  else if (command === "verify") verify();
  else if (command === "pin") pinFrom();
  else {
    console.error("usage: node scripts/ui-platform.mjs <pin|check|verify>");
    process.exit(2);
  }
}
