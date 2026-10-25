---
doc_meta:
  id: TDD-ui-platform-docs-001
  title: UI Platform Documentation Site
  owner: UI Platform Team
  version: 1.0.0
  status: approved
  classification: public
  parent_sad: SAD-003
  review_cycle_days: 30
  created_date: 2026-10-22
  last_reviewed: 2026-10-22
---

# TDD-ui-platform-docs-001: UI Platform Documentation Site

## Purpose

This design defines the documentation site of `@scnx/core-ui` and
`@scnx/system`: the "documentation site repository" of
[SAD-003](https://github.com/anshacerbia2/scnehaux-architecture/blob/main/04-system/scnehaux-ui-platform/scnehaux-ui-platform.sad.md)
section 2.1, which "generates the normative sections of each page from the
published specifications, API reports, and release evidence", as
[ADR-UIP-CMP-001](https://github.com/anshacerbia2/scnehaux-architecture/blob/main/05-decisions/ui-platform/ADR-UIP-CMP-001-component-specification-as-code.md)
item 9 decides. It records how the site pins the release it documents, how
it derives every fact from that release, how it is styled and secured, and how
it is verified before Vercel deploys it.

## Scope

In scope: the landing page, a page per styled component and per primitive,
the token and release pages, `/llms.txt`, the pin of the documented
ui-platform release, the generator of normative data, the site's stylesheet
architecture, its Content-Security-Policy and theme handling, and its CI.

Out of scope: the packages themselves (ui-platform TDDs), the specification
format (ADR-UIP-CMP-001, ui-platform TDD primitives P20–P24 and styled
CS1–CS13), npm publication (ADR-UIP-REL-001), and Vercel account settings.

## Technical Context

The site is a separate repository that installs the published tarballs, as
ADR-UIP-CMP-001 item 9 requires; it never reads ui-platform source. Version
2.0 is in beta: its tarballs carry SLSA provenance from every CI run of
ui-platform's main branch, and the npm release is staged
(TDD packaging RC1–RC7, RL1–RL6). Each component's styled specification, each
primitive's behavior specification, the token JSON of every theme, and the
TypeScript declarations ship inside those tarballs.

### Requirements

| ID  | Requirement                                                                                                                                     |
| :-- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | The site documents exactly one pinned ui-platform build, identified by commit and tarball digest, and verifies its provenance before it builds. |
| R2  | Every normative fact on a page is generated from that build; usage guidance is informative MDX and never restates a generated fact.             |
| R3  | Page order follows ADR-UIP-CMP-001 item 9: Overview, Usage, Anatomy and specification (followed by its Hooks, D11), API, Accessibility, Status. |
| R4  | The site uses the documented components and tokens for its own interface and selects no ui-platform class.                                      |
| R5  | Every document is served under a strict, nonce-based Content-Security-Policy with no `unsafe-inline` or `unsafe-eval` in production.            |
| R6  | The reader's color mode renders on the server without a flash where the browser states its preference.                                          |
| R7  | Every route loads in Chromium, Firefox, and WebKit, in light and dark, with no page error, console error, or policy violation.                  |
| R8  | Every claim on the landing page is true of the pinned build and links to where it is enforced, or is removed.                                   |

## Component Design

```text
vendor/ui-platform/      pinned tarballs + pin.json            (D2)
scripts/ui-platform.mjs  pin | check | verify                   (D2)
scripts/reference.mjs    tarballs -> src/generated/             (D3)
src/app/                 routes only: layout, pages, llms.txt   (D9)
src/features/            landing, reference pages, site shell  (D9)
src/shared/              ui (code block, icons), lib (reference, bindings)
src/content/             informative MDX per component          (D3)
src/styles/              ITCSS settings, tools, global layers   (D4)
src/proxy.ts             per-request nonce policy               (D5)
```

A build runs `scripts/reference.mjs`, then `next build`. The generator reads
only the installed packages and the pin; pages import its JSON through
`src/shared/lib/reference.ts`, which is server-only. Interactive parts
(preview, theme lab, hero) are client components that receive plain data.

#### Decision record: documentation site

| ID  | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Source                                                      | Rationale                                                                                                                                                                                                                                                                              |
| :-- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Next.js 16 App Router with React 19 and TypeScript 5.9, MDX through `@next/mdx`, pnpm 10.23 (as ui-platform), Node.js 24 LTS. No documentation framework (Nextra, Docusaurus): the pages are generated from specifications and rendered with the documented components, which a framework's own theme and page model would replace.                                                                                                                                                                                                                                                                                                                                                                                       | ADR-UIP-CMP-001 item 9; [1]                                 | `@next/mdx` is the framework's own MDX integration [1]. TypeScript 7 is the native port without the compiler API D3 reads declarations with, so the site stays on the latest 5.x; ui-platform's support matrix covers both.                                                            |
| D2  | The site vendors the two tarballs of one ui-platform CI run on main, and `vendor/ui-platform/pin.json` records the commit, the run, and each tarball's sha256; `package.json` installs exactly those files. CI checks the digests and runs `gh attestation verify` on each tarball with the signer workflow, the source ref, and the source commit fixed. `pin` copies a pack of a commit; ui-platform builds reproducibly, so it is byte-identical to that run's attested tarballs.                                                                                                                                                                                                                                      | R1; [2]; [3]                                                | Artifact attestations give SLSA v1.0 Build Level 2 [2]; pinning the signer workflow and commit rejects a tarball from any other build [3]. Rejected: a git link or workspace (documents unreleased source, not what a consumer installs); the npm registry (2.0 is not published yet). |
| D3  | `scripts/reference.mjs` generates every normative fact: the specifications as published; the API from the published declarations through the TypeScript compiler API (each export, each prop with its declared type, default, and description, and every prop shape of a union); the contrast of every pair a part renders per theme and mode with the token gate's method (colorjs.io, lowest ratio over sRGB and Display P3, clipped and mapped); one swatch rule per color token; and a preview registry. Usage guidance is MDX in `src/content/components/`.                                                                                                                                                          | R2, R3; ADR-UIP-CMP-001                                     | One generator over the tarball is the only way a page can never drift from the release. Contrast uses the same algorithm and inputs as ui-platform's gate, so the page and the gate agree.                                                                                             |
| D4  | Styles follow ITCSS [4] mapped onto cascade layers [5]: settings and tools are Sass with no output; `docs.generic`, `docs.elements`, `docs.objects`, `docs.components` (CSS Modules next to each component), and `docs.utilities` are declared after ui-platform's layers. Every color is a published token; the site adds only roles that map tokens per mode, and surfaces that are dark in either mode are theme roots fixed to dark. `scripts/check-styles.mjs` rejects a `.scnx-` selector, a color literal, an unpublished `--ds-*` property, a module outside `docs.components`, and a `style` prop.                                                                                                               | R4, R5; [4]; [5]                                            | Layers make specificity irrelevant between the system and the site; CSS Modules keep the component layer local; the token-only rule makes the site a consumer test of the tokens.                                                                                                      |
| D5  | `src/proxy.ts` sets a fresh nonce policy on every document: `script-src 'self' 'nonce-…' 'strict-dynamic'`, `style-src 'self' 'nonce-…'`, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`, and `upgrade-insecure-requests` when the page is served over HTTPS (on plain HTTP, WebKit upgrades the page's own requests and fails them), plus `nosniff`, a referrer policy, HSTS, and COOP. No component renders a `style` attribute; dynamic values go through the CSSOM (`useStyleVars`) or SVG presentation attributes. Every page is therefore dynamically rendered.                                                                                                                                   | R5; [6]                                                     | Next.js applies the nonce only during server rendering, so nonces require dynamic rendering [6]; the hash-based alternative is experimental [6]. This is the policy ui-platform's Next.js fixture proves the packages run under (TDD packaging S4).                                    |
| D6  | The mode preference is a cookie written by a `ThemePreferenceAdapter`; the layout resolves it, or the `Sec-CH-Prefers-Color-Scheme` client hint requested with `Accept-CH` and `Critical-CH`, into the store's `serverHint`. No inline script is injected.                                                                                                                                                                                                                                                                                                                                                                                                                                                                | R5, R6; [7]                                                 | The server renders the stored or stated mode, and the first client render matches it. A browser without the hint, in system mode, renders light until the store reads the media query: one frame, and no script exception to the policy.                                               |
| D7  | CI runs, on every pull request and push to main: the provenance check (D2); unit tests, Prettier, oxlint, the stylesheet rules, and type checking; `next build`; and `scripts/smoke.mjs`, which loads every route in Chromium, Firefox, and WebKit in light and dark and fails on a page error, a console error, a CSP violation, a failed request, a response without a fresh nonce policy, or a mode the server did not render. The central governance linter checks `docs/designs/`. Vercel builds previews and production from the same commands.                                                                                                                                                                     | R7                                                          | Vercel's build proves only that the site compiles; the smoke test proves it runs under its own policy in every engine ui-platform supports.                                                                                                                                            |
| D8  | The landing page states only what the pinned build does, and each figure links to where ui-platform enforces it at the pinned commit. The design's "open source, Apache-2.0" (the packages are proprietary), `npm audit signatures` (not on npm yet), MCP (none exists), and the hue-to-theme generator (no such API) were replaced by true statements, real components in real theme roots, and `/llms.txt`.                                                                                                                                                                                                                                                                                                             | R8; [8]                                                     | A site whose subject is evidence cannot carry an unverifiable claim.                                                                                                                                                                                                                   |
| D9  | Code is organized by feature (component-driven): `app/` holds routes only; `features/` holds the landing, the reference pages, and the site shell; `shared/` holds reusable UI and libraries; each component keeps its stylesheet beside it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | R4                                                          | A route stays a thin composition, and a feature can be read, tested, and removed as one folder.                                                                                                                                                                                        |
| D10 | `/tokens/figma` documents the Figma path of ADR-UIP-TKN-004. `scripts/reference.mjs` copies the pinned `@scnx/system/tokens/figma/*.tokens.json` exports byte for byte into `public/downloads/figma/` (ignored by git, regenerated on every dev, build, and typecheck run) and lists them with their collection, mode, and token count; the page explains the native import and the repository's plugin, whose source it links at the pinned commit.                                                                                                                                                                                                                                                                      | ADR-UIP-TKN-004; ui-platform TDD tokens FG1-FG11            | A designer downloads exactly the files of the build the site documents, so the design file and the documented release cannot disagree.                                                                                                                                                 |
| D11 | A Components page lists the hooks of its specification (ui-platform TDD styled HK2, HK5) in a Hooks section after Anatomy and specification. Each row gives the hook; the parts and properties it sets; its Tier-2 fallbacks; their values in the theme and mode the preview shows; and the floor that bounds it. The section opens with the specification's `hookScope` sentence, which says how to reach one option value through `[data-<option>]`. The preview and the table share one Theme × Mode choice (`ThemeChoice`). The theme switch lists the published themes, `scnx-platform` and `scnx-saas`, so the preview's shape changes with the theme: square in `scnx-platform`, the radius ladder in `scnx-saas`. | ui-platform TDD styled HK2, HK5; TDD tokens SI9             | The hook list is the package's public styling API, generated with the rest of the page, so it cannot drift from the published stylesheet. Values are resolved at build time from the published tokens, so the table needs no runtime token lookup.                                     |
| D12 | The page's "On this page" is the system's TableOfContents, controlled (`activeId`, ui-platform TDD primitives P27). The page's one "here" decides it (`useHere`): the last section whose line has reached the header line (104px). Where the page ends first, a section counts once its line is as high as it can go (scnehaux-design, scnx-platform SCROLL.md 6.9). A followed link scrolls its section to that line exactly (`scrollOffsetExtended={0}`).                                                                                                                                                                                                                                                               | ui-platform TDD primitives P27; scnx-platform SCROLL.md 6.9 | The TOC's own observer used a band 36px below the header and ignored the page end, so it could disagree with the page about the current section. A single definition lets every "here" indicator of the Instrument · Square migration switch at the same moment.                       |

## Data Model

`vendor/ui-platform/pin.json`: `repository`, `commit` (40 hexadecimal
characters), `ref`, `run`, `signerWorkflow`, and `packages[]` of `name`,
`version`, `tarball`, `sha256`. `pinFindings` rejects a commit that is not a
full SHA, a vendored tarball whose digest differs, a pinned tarball that is
missing, a vendored tarball that is not pinned, and a dependency that does not
install exactly `file:vendor/ui-platform/<tarball>`.

`src/generated/reference.json` (ignored by git, regenerated by every `dev`,
`build`, and `typecheck`): `pin`; `entries[]` (entry, package, version, slug,
kind, stability, entry kind, primitive, page); `components` by slug (styled
specification, primitive specification, API, primitive API, contrast rows);
`primitives` by slug; `tokens` per theme; `tokenList`; and `landing` (theme
lab pairs and swatches). Types live in `src/shared/lib/reference.ts`.

## API / Interface

Routes: `/`, `/components`, `/components/[slug]` (one per styled
specification), `/primitives`, `/primitives/[slug]` (one per primitive
specification), `/tokens`, `/releases`, and `/llms.txt` (static, plain text,
the llms.txt convention [8]). Unknown slugs return 404 (`dynamicParams =
false`).

Commands: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm lint`,
`pnpm typecheck`, `node scripts/ui-platform.mjs pin|check|verify`, and
`node scripts/smoke.mjs [--browsers …] [--shots <dir>]`.

## Algorithms / Logic

Bindings merge as the gate merges them for contrast: the bindings of a part
and every part it refines, filtered to one option combination and state,
ordered by the number of options a binding names (a state counts as ten),
then by specification order; a later declaration replaces an earlier one.
Combinations vary one option at a time from the defaults, jointly where one
binding names several options. A contrast case is a part whose merged `color`
and background are single tokens, per combination and state; disabled states
are exempt.

The preview renders the specification's own fixture the way the conformance
check renders it: a node type is an export, a sub-component, or an element;
option values (booleans for a `false,true` option) and prop-entered states are
props of the root node. A `showModal` fixture is shown non-modally inside the
preview, so the rest of the page stays usable.

## Configuration

`vendor/ui-platform/pin.json` (D2); `next.config.ts` (MDX, security headers,
typed routes); `src/proxy.ts` (D5); `.oxlintrc.json`; `.prettierrc.json`;
`.node-version` (24.11.1). No environment variable is required; Vercel's
`VERCEL_PROJECT_PRODUCTION_URL` sets the metadata base when present.

## Failure Handling

A digest mismatch, an unpinned tarball, or a failed provenance check stops CI
before any build (D2). A specification binding a token the build does not
publish stops the generator. A route that throws, logs an error, or violates
the policy fails the smoke test (D7). In the browser, a missing WebGL context
replaces the hero with a text fallback; the rest of the page does not depend
on it. Blast radius per SAD-003: the site is read-only and documents a
release; an outage or a bad deploy affects documentation readers only, never a
consuming application, and Vercel's instant rollback restores the previous
deployment.

## Observability

CI reports per check, and the smoke test's screenshots of every route in both
modes are uploaded for 14 days. Vercel records build logs and request logs per
deployment. The site sends no analytics and sets no cookie but the mode
preference. SLI: the smoke test passes on main (target: every run); alert:
a failed CI run on main notifies through GitHub's required checks.

## Testing Strategy

Unit tests (`node --test`) cover pin findings, combinations, merging across a
refined part, and contrast-case selection; `check-styles --self-test` covers
each stylesheet rule with a passing and a failing case. Type checking runs
against generated route types. The smoke test is the end-to-end test: every
route, three engines, two modes, with the policy itself checked for a fresh
nonce per response and for the absence of `unsafe-inline` and `unsafe-eval`.
Edge cases covered: a boolean option, a dialog fixture, a union of prop
shapes, a part that refines another, and a reader whose preference is dark.

## Performance Notes

Pages render per request (D5); the generated reference is static JSON read
once per server instance. Client JavaScript is limited to interactive parts;
the documented packages are imported per entry, and the preview registry loads
the styled entries the component pages render.

## Security Notes

Strict nonce policy and headers (D5); no third-party script, font, or request;
provenance-verified dependencies on the documented packages (D2); a cookie
that stores only the mode (`SameSite=Lax; Secure`). The site handles no
personal data.

## Operational Notes

To document a new ui-platform build: pack the commit with ui-platform's
`inspect-packages.mjs`, run `node scripts/ui-platform.mjs pin --packs <dir>
--commit <sha> --run <CI run URL of that commit on main>`, then `pnpm install`,
and open a pull request; CI verifies the provenance. Every ui-platform pull
request that changes a component gets a companion pull request here once it
merges.

## Rollout and Compatibility

Vercel deploys a preview per pull request and production from main. Rollback
is Vercel's instant rollback to the previous production deployment, or a
revert of the pin, which restores the previous tarballs byte for byte. Page
URLs are derived from entry names, so they are stable while an entry exists;
a removed entry's page returns 404.

## Open Questions

1. ADR-UIP-CMP-001 item 9 names release evidence as a source. ui-platform's
   measured contrast and conformance reports are CI artifacts today, not part
   of the attested release, so D3 computes contrast from the published tokens
   with the gate's method. Once ui-platform attests its evidence packet with the
   tarballs, the site reads the measured values instead and drops the
   computation.
2. The production domain is the Vercel project's default until a Scnehaux
   domain is assigned; HSTS stays without `preload` until then.

## Traceability

| Requirement | Decisions | Verified by                                                  |
| :---------- | :-------- | :----------------------------------------------------------- |
| R1          | D2        | `ui-platform.mjs verify`; `ui-platform.test.mjs`             |
| R2, R3      | D3        | `reference.test.mjs`; the generator's token check            |
| R4          | D4, D9    | `check-styles.mjs` and its self-test                         |
| R5          | D5, D6    | `smoke.mjs` policy and violation checks                      |
| R6          | D6        | `smoke.mjs` mode check per route                             |
| R7          | D7        | `smoke.mjs` in Chromium, Firefox, and WebKit                 |
| R8          | D8        | Review; each figure links to its source at the pinned commit |

## References

1. Next.js, "How to use markdown and MDX in Next.js":
   <https://nextjs.org/docs/app/guides/mdx> (retrieved 2026-10-22).
2. GitHub Docs, "Artifact attestations":
   <https://docs.github.com/en/actions/concepts/security/artifact-attestations>
   (retrieved 2026-10-22). "Artifact attestations by itself provides SLSA v1.0
   Build Level 2."
3. GitHub CLI manual, `gh attestation verify`:
   <https://cli.github.com/manual/gh_attestation_verify> (retrieved
   2026-10-22); flags `--signer-workflow`, `--source-ref`, `--source-digest`.
4. Harry Roberts, ITCSS (Inverted Triangle CSS), as described in
   <https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/>.
5. MDN, `@layer`: <https://developer.mozilla.org/en-US/docs/Web/CSS/@layer>.
6. Next.js, "How to set a Content Security Policy (CSP)":
   <https://nextjs.org/docs/app/guides/content-security-policy> (retrieved
   2026-10-22). "you **must use dynamic rendering to add nonces**"; subresource
   integrity "is experimental".
7. web.dev, "User preference media features client hints headers":
   <https://web.dev/articles/user-preference-media-features-headers>.
8. llms.txt proposal: <https://llmstxt.org>.
