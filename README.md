# Scnehaux UI Platform documentation

The documentation site of `@scnx/core-ui` and `@scnx/system`, built from the
published packages of
[anshacerbia2/ui-platform](https://github.com/anshacerbia2/ui-platform).

The architecture authority is the
[Scnehaux Architecture repository](https://github.com/anshacerbia2/scnehaux-architecture);
this site is the documentation site repository of
[SAD-003](https://github.com/anshacerbia2/scnehaux-architecture/blob/main/04-system/scnehaux-ui-platform/scnehaux-ui-platform.sad.md)
and follows
[ADR-UIP-CMP-001](https://github.com/anshacerbia2/scnehaux-architecture/blob/main/05-decisions/ui-platform/ADR-UIP-CMP-001-component-specification-as-code.md).

## Develop

```sh
pnpm install
pnpm dev          # generates src/generated/ from the pinned packages, then starts Next.js
pnpm test && pnpm lint && pnpm typecheck
pnpm build && node scripts/smoke.mjs --browsers chromium
```

The design, its decisions, and its references are in
[TDD-ui-platform-docs-001](docs/designs/TDD-ui-platform-docs-001-documentation-site.md).
To document a newer ui-platform build, follow its Operational Notes.
