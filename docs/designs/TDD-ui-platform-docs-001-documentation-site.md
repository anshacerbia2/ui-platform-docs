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
src/features/            a page's sections: landing, reference  (D9)
src/components/system/   the design system, wrapped; the only @scnx/* importer (D17)
src/components/docs/     the docs' own components: sheets, cells, facts, tables, code (D17, D18)
src/components/shell/    the frame: nav strip, sheet and docs layouts, here, ruler (D17)
src/shared/lib/          libraries: reference, bindings, here, glide, site
src/content/             informative MDX per component          (D3)
src/styles/              ITCSS settings, tools, global layers   (D4)
src/proxy.ts             per-request nonce policy               (D5)
```

A build runs `scripts/reference.mjs`, then `next build`. The generator reads
only the installed packages and the pin; pages import its JSON through
`src/shared/lib/reference.ts`, which is server-only. Interactive parts
(preview, theme lab, hero) are client components that receive plain data.

#### Decision record: documentation site

| ID  | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Source                                                                                                   | Rationale                                                                                                                                                                                                                                                                              |
| :-- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Next.js 16 App Router with React 19 and TypeScript 5.9, MDX through `@next/mdx`, pnpm 10.23 (as ui-platform), Node.js 24 LTS. No documentation framework (Nextra, Docusaurus): the pages are generated from specifications and rendered with the documented components, which a framework's own theme and page model would replace.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | ADR-UIP-CMP-001 item 9; [1]                                                                              | `@next/mdx` is the framework's own MDX integration [1]. TypeScript 7 is the native port without the compiler API D3 reads declarations with, so the site stays on the latest 5.x; ui-platform's support matrix covers both.                                                            |
| D2  | The site vendors the two tarballs of one ui-platform CI run on main, and `vendor/ui-platform/pin.json` records the commit, the run, and each tarball's sha256; `package.json` installs exactly those files. CI checks the digests and runs `gh attestation verify` on each tarball with the signer workflow, the source ref, and the source commit fixed. `pin` copies a pack of a commit; ui-platform builds reproducibly, so it is byte-identical to that run's attested tarballs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | R1; [2]; [3]                                                                                             | Artifact attestations give SLSA v1.0 Build Level 2 [2]; pinning the signer workflow and commit rejects a tarball from any other build [3]. Rejected: a git link or workspace (documents unreleased source, not what a consumer installs); the npm registry (2.0 is not published yet). |
| D3  | `scripts/reference.mjs` generates every normative fact: the specifications as published; the API from the published declarations through the TypeScript compiler API (each export, each prop with its declared type, default, and description, and every prop shape of a union); the contrast of every pair a part renders per theme and mode with the token gate's method (colorjs.io, lowest ratio over sRGB and Display P3, clipped and mapped); one swatch rule per color token; and a preview registry. Usage guidance is MDX in `src/content/components/`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | R2, R3; ADR-UIP-CMP-001                                                                                  | One generator over the tarball is the only way a page can never drift from the release. Contrast uses the same algorithm and inputs as ui-platform's gate, so the page and the gate agree.                                                                                             |
| D4  | Styles follow ITCSS [4] mapped onto cascade layers [5]: settings and tools are Sass with no output; `docs.generic`, `docs.elements`, `docs.objects`, `docs.components` (CSS Modules next to each component), and `docs.utilities` are declared after ui-platform's layers. Every color is a published token; the site adds only roles that map tokens per mode, and surfaces that are dark in either mode are theme roots fixed to dark. `scripts/check-styles.mjs` rejects a `.scnx-` selector, a color literal, an unpublished `--ds-*` property, a module outside `docs.components`, and a `style` prop.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | R4, R5; [4]; [5]                                                                                         | Layers make specificity irrelevant between the system and the site; CSS Modules keep the component layer local; the token-only rule makes the site a consumer test of the tokens.                                                                                                      |
| D5  | `src/proxy.ts` sets a fresh nonce policy on every document: `script-src 'self' 'nonce-…' 'strict-dynamic'`, `style-src 'self' 'nonce-…'`, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`, and `upgrade-insecure-requests` when the page is served over HTTPS (on plain HTTP, WebKit upgrades the page's own requests and fails them), plus `nosniff`, a referrer policy, HSTS, and COOP. No component renders a `style` attribute; dynamic values go through the CSSOM (`useStyleVars`) or SVG presentation attributes. Every page is therefore dynamically rendered.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | R5; [6]                                                                                                  | Next.js applies the nonce only during server rendering, so nonces require dynamic rendering [6]; the hash-based alternative is experimental [6]. This is the policy ui-platform's Next.js fixture proves the packages run under (TDD packaging S4).                                    |
| D6  | The mode preference is a cookie written by a `ThemePreferenceAdapter`; the layout resolves it, or the `Sec-CH-Prefers-Color-Scheme` client hint requested with `Accept-CH` and `Critical-CH`, into the store's `serverHint`. No inline script is injected.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | R5, R6; [7]                                                                                              | The server renders the stored or stated mode, and the first client render matches it. A browser without the hint, in system mode, renders light until the store reads the media query: one frame, and no script exception to the policy.                                               |
| D7  | CI runs, on every pull request and push to main: the provenance check (D2); unit tests, Prettier, oxlint, the stylesheet rules, and type checking; `next build`; and `scripts/smoke.mjs`, which loads every route in Chromium, Firefox, and WebKit in light and dark and fails on a page error, a console error, a CSP violation, a failed request, a response without a fresh nonce policy, or a mode the server did not render; and `scripts/ruler-check.mjs` (D15). The central governance linter checks `docs/designs/`. Vercel builds previews and production from the same commands.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | R7                                                                                                       | Vercel's build proves only that the site compiles; the smoke test proves it runs under its own policy in every engine ui-platform supports.                                                                                                                                            |
| D8  | The landing page states only what the pinned build does, and each figure links to where ui-platform enforces it at the pinned commit. The design's "open source, Apache-2.0" (the packages are proprietary), `npm audit signatures` (not on npm yet), MCP (none exists), and the hue-to-theme generator (no such API) were replaced by true statements, real components in real theme roots, and `/llms.txt`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | R8; [8]                                                                                                  | A site whose subject is evidence cannot carry an unverifiable claim.                                                                                                                                                                                                                   |
| D9  | Code is organized by layer and feature (component-driven): `app/` holds routes only; `features/` holds each page's sections; `components/` holds the reusable components (D17); `shared/lib/` holds libraries; each component keeps its stylesheet beside it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | R4                                                                                                       | A route stays a thin composition, and a feature can be read, tested, and removed as one folder.                                                                                                                                                                                        |
| D10 | `/tokens/figma` documents the Figma path of ADR-UIP-TKN-004. `scripts/reference.mjs` copies the pinned `@scnx/system/tokens/figma/*.tokens.json` exports byte for byte into `public/downloads/figma/` (ignored by git, regenerated on every dev, build, and typecheck run) and lists them with their collection, mode, and token count; the page explains the native import and the repository's plugin, whose source it links at the pinned commit.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ADR-UIP-TKN-004; ui-platform TDD tokens FG1-FG11                                                         | A designer downloads exactly the files of the build the site documents, so the design file and the documented release cannot disagree.                                                                                                                                                 |
| D11 | A Components page lists the hooks of its specification (ui-platform TDD styled HK2, HK5) in a Hooks section after Anatomy and specification. Each row gives the hook; the parts and properties it sets; its Tier-2 fallbacks; their values in the theme and mode the preview shows; and the floor that bounds it. The section opens with the specification's `hookScope` sentence, which says how to reach one option value through `[data-<option>]`. The preview and the table share one Theme × Mode choice (`ThemeChoice`). The theme switch lists the published themes, `scnx-platform` and `scnx-saas`, so the preview's shape changes with the theme: square in `scnx-platform`, the radius ladder in `scnx-saas`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | ui-platform TDD styled HK2, HK5; TDD tokens SI9                                                          | The hook list is the package's public styling API, generated with the rest of the page, so it cannot drift from the published stylesheet. Values are resolved at build time from the published tokens, so the table needs no runtime token lookup.                                     |
| D12 | The page's "On this page" is the system's TableOfContents, controlled (`activeId`, ui-platform TDD primitives P27). The page's one "here" decides it (`useHere`, through the HereProvider of D14): the last section whose line has reached the nav strip's line (48px since D14; 104px under the earlier header). Where the page ends first, a section counts once its line is as high as it can go (scnehaux-design, scnx-platform SCROLL.md 6.9). A followed link scrolls its section to that line exactly (`scrollOffsetExtended={0}`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | ui-platform TDD primitives P27; scnx-platform SCROLL.md 6.9                                              | The TOC's own observer used a band 36px below the header and ignored the page end, so it could disagree with the page about the current section. A single definition lets every "here" indicator of the Instrument · Square migration switch at the same moment.                       |
| D13 | The Square chrome's foundations (scnehaux-design scnx-platform Brand-Book.html section 11, "Adopt"): IBM Plex Mono 400, 500, and 600, with its OFL licence, served from the site's own origin under `font-src 'self'` (`public/fonts/`) as `--sq-mono`, the HUD voice of bars, readouts, the nav, and the ruler; the reference's 550 and 650 weights are drawn at 600. The chrome's roles (`--sq-ground`, `--sq-text`, `--sq-muted`, `--sq-signal`, `--sq-signal-text`, `--sq-line`, `--sq-cross`, `--sq-edge`, `--sq-faint`, `--sq-glass`, `--sq-plus`) are published tokens or `color-mix` of them, declared per mode on every theme root (`generic/_roles.scss`); the sizes (48px nav, 40px padding, 1280px column, 11px HUD) are the reference's expression-local values (`settings/_square.scss`, `tools` `hud`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | scnx-platform square.css, instrument.css; ADR-UIP-VIS-002 (guidance)                                     | The docs write no brand rule and no token; a change to the look lands in scnehaux-design first. The 11px HUD has no typography token, which the brand book lists as a status item.                                                                                                     |
| D14 | The chrome on every documentation page. The nav strip is a full-width row of 48px cells with one line between any two, sticky above everything: brand, the version tag (the system's Badge), the area links in the HUD voice (the current one on an ink bar), the sheet readout (gone at 1240px and below), the mode cell, and the GitHub and Get started calls to action (`Cta`, docs chrome, not the Button component, with the hover shuffle of the reference). The docs column is framed by lines, holding the sidebar, the page, and its contents, and the page draws the dividers. A `Section` is a sheet: its id and `data-sheet` on the section, a rule across the page column that draws in once, a cross on each column line, and a bar held under the nav (`NN / Name ··· source`, counted by CSS) whose number turns blue when the section is here. The HereProvider finds the page's sheets after each navigation and decides here with `useHere` at the 48px line; the contents, the bars, the nav readout, and the ruler (D15) agree. `Reveal` raises the page's blocks into place as they first enter the view (28px, 8px blur, 900ms, 80ms apart) and holds the page hidden below the nav until they are marked (`html.sq-boot`, with a 2.5s CSS failsafe); the wheel glides with a 120ms time constant (`shared/lib/glide.ts`). Under reduced motion nothing rises, draws, or glides, and the page is never held hidden. Both reset after each App Router navigation.                                                                       | scnx-platform square.css, square.js, SCROLL.md 1-4                                                       | Every page is drawn as sheets (D18).                                                                                                                                                                                                                                                   |
| D15 | The ruler scrollbar and its section titles are one docs component, `RulerScrollbar` (`ruler.ts`), not a @scnx/system component: it reads the page's sheets after each navigation and ports scnx-platform square.js and SCROLL.md 4-7 as they read on scnehaux-design main after #28, #32, #33, and #34. Rows of either stack are 1.25 × the small title; a standing title hangs from its line, its foot at least 8px above the next waiting title and its top at least 8px under its own current place, and it moves between the stack and standing at the bottom stack (6.2, 6.5); the current title leaves within the first 45% of the next title's move (6.8). The docs add one rule: a title also hangs 8px under the previous title's lowest letter and stands up only once its whole standing place fits under it, because a sheet shorter than the previous title standing (the Status sheets, the Tokens page's groups) made the reference's rule cross titles. Under reduced motion each letter switches place at a move's midpoint. It runs the HereProvider's `currentSection`, writes styles only through the CSSOM, keeps the native scrollbar below 1024px, and draws a position on demand (`sq:draw`). `scripts/ruler-check.mjs` scrolls every page with sheets in 8px steps at 1440×900, 1920×1080, 1280×720, and 1024×640, and fails when a letter of one title overlaps another title's, when a letter has no finite position, or when the bar's number, the nav readout, the ruler readout, and the contents disagree at a section's line. | scnx-platform square.js, SCROLL.md 4-7, 6.9; scnehaux-design #28 (the check)                             | The added rule is the docs' deviation from the reference until scnehaux-design adopts or replaces it. The check takes about six minutes; it runs in CI after the smoke test.                                                                                                           |
| D16 | Theme ids come from the pinned package: `scripts/reference.mjs` names the site's own theme once (`scnx-platform`, the documentation's look, STD-UIP-TKN-001 2.8.0), fails if the package does not ship it, and writes `src/generated/themes.json`; pages, samples, `llms.txt`, and the Figma page take the ids from it (`shared/lib/themes.ts`). The mark's check and the contract marks' accent part are Scnx Blue (`#0a6cf2`) in every theme, scnx-saas included, because they are artwork, not tokens (scnehaux-design brand/Brand.html, "Name and mark", "Icons"): they are SVG presentation attributes, so the stylesheet rules (D4) still find no colour literal in the site's CSS.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | brand/Brand.html; STD-UIP-TKN-001 2.8.0, theme naming                                                    | A renamed theme fails generation instead of shipping a page with a theme root that resolves no token (the footer's `default` root did until this record).                                                                                                                              |
| D17 | Components are isolated and layered. `components/system/` wraps the design system: one folder per component the site uses (`Badge`, `Button`, `Heading`, `Text`, `Tabs`, `TextField`, `TableOfContents`), the theme roots (`ThemeRoot`, `DarkRoot`, `StoredThemeRoot`), and the package stylesheets (`styles.ts`); it is the only code that imports `@scnx/*`, apart from the generated preview registry, which renders every styled entry as published. `components/docs/` holds the docs' own reusable components (code block, call to action, icons, the mark) and `components/shell/` the site's frame (nav strip, docs column, here, reveal, ruler, the site's theme root). A component is a folder: its file, its CSS Module, and an `index.ts` that is its public import. The dependency runs one way, `app` to `features` to `components` to `shared`: oxlint's `no-restricted-imports` rejects an `@scnx/*` import outside `components/system` and a component that imports a feature or a route. Prettier formats every file at 100 columns.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | The owner, 2026-10-26                                                                                    | One seam per package component: an upgrade, a docs-wide default, or a replaced component changes one file, and no page depends on the package's API directly. A layer that may only import downward keeps each component reusable on any page.                                         |
| D18 | Every page is drawn as a set of sheets from the scnx-platform boards. The landing (Docs-Landing.html) is seven sheets and `/get-started` (Docs-Home.html) five, in `SheetLayout`: the nav strip, the sheets in the centre column with a rule across the viewport at each, the footer, the ruler; the reference pages (Docs-Button.html) are a page head, a facts row and one sheet per section in `DocsLayout`, in the order of R3. The look is built from the docs components (`Sheet`, `Cells`, `Facts`, `Lead`, `Panel`, `Block`, `DataTable`, `FactGrid`, `PageHead`, `Pager`, `Type`, `Chip`, `Install`, `MetaList`, `Dim`, `Tape`, `ToggleGroup`, `CodeBlock`, `InlineCode`, `Keys`, `Swatch`, `StabilityBadge`, `TextLink`); a feature's module only places them. The boards' claims that are not true of the pinned build stay out (D8): an Apache licence, `npm audit signatures`, an MCP server, a hue-to-theme generator, ship dates and milestones, pilot and rollback gates; the tape, the facts, the chain of contracts, the counts and the status matrix are generated from the pin and the reference, and each guarantee links the test that enforces it at the pinned commit. The system ships no segmented control, switch or keycap, so `ToggleGroup`, the motion specimen's switch and `Keys` are the docs' own until it does.                                                                                                                                                                                                            | scnehaux-design scnx-platform Docs-Landing.html, Docs-Home.html, Docs-Button.html; the owner, 2026-10-26 | One component per part of the drawing keeps every page on the same lines, and a change to the look is one component, not a page. The boards are a design reference; the pages state only what the release does.                                                                        |
| D19 | The landing's assembly is an exploded view drawn with WebGL (three.js 0.186.1, pinned): four plates, in the order the contracts build on each other (primitive, tokens, the component styled with the behavior it adds, release; the owner, 2026-10-27), on four axes through their bolt holes, in a true isometric, orthographic view. The plates are painted from the page's own tokens and from a hidden specimen of the system's Button, read again when a theme root around the figure changes mode. They are held apart on arrival and close while the figure is in view, a horizontal drag turns the stack all the way round (never tilts it) and lets it coast, and a plate and its callout light together. The callouts are a text list: beside the stack with leaders from 480px of stage, under it below that, and alone where WebGL is missing or lost or without a script; under reduced motion the stack stays apart and does not coast. `features/landing/proof/assembly/`: `scene.ts` (loaded on demand, in its own chunk), `controller.ts`, `palette.ts`, `faces.ts`, `Assembly.tsx`.                                                                                                                                                                                                                                                                                                                                                                                                                                                        | the owner, 2026-10-26 ("gas cad bro") and 2026-10-27                                                     | The CSS isometric clipped its plates and labels at most widths. A scene drawn to its container fits every width, and the contracts stay readable text whatever draws them.                                                                                                             |

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

Routes: `/`, `/get-started`, `/components`, `/components/[slug]` (one per styled
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

| Requirement | Decisions   | Verified by                                                  |
| :---------- | :---------- | :----------------------------------------------------------- |
| R1          | D2          | `ui-platform.mjs verify`; `ui-platform.test.mjs`             |
| R2, R3      | D3          | `reference.test.mjs`; the generator's token check            |
| R4          | D4, D9, D17 | `check-styles.mjs` and its self-test; oxlint import rules    |
| R5          | D5, D6      | `smoke.mjs` policy and violation checks                      |
| R6          | D6          | `smoke.mjs` mode check per route                             |
| R7          | D7          | `smoke.mjs` in Chromium, Firefox, and WebKit                 |
| R8          | D8          | Review; each figure links to its source at the pinned commit |

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
