import type { Route } from "next";
import type { ComponentType } from "react";
import { Block } from "@/components/docs/Block";
import { Facts } from "@/components/docs/Facts";
import { InlineCode } from "@/components/docs/InlineCode";
import { PageHead } from "@/components/docs/PageHead";
import { Pager } from "@/components/docs/Pager";
import { Sheet } from "@/components/docs/Sheet";
import { DocsLayout } from "@/components/shell/DocsLayout";
import {
  entries,
  pin,
  tokenList,
  tokenThemes,
  titleOf,
  type ComponentReference,
  type EntryRow,
  type StyledSpec,
} from "@/shared/lib/reference";
import { Accessibility } from "./Accessibility";
import { Api } from "./Api";
import { Hooks, type HookRow } from "./Hooks";
import { Preview } from "./Preview";
import { ContrastTable, Specification } from "./Specification";
import { Status } from "./Status";
import { ThemeChoice } from "@/components/docs/ThemeChoice";
import styles from "./Reference.module.scss";

// The page order of ADR-UIP-CMP-001 item 9 (TDD docs-site R3); Hooks follow Anatomy (D11).
const SECTIONS = [
  { id: "overview", title: "Overview" },
  { id: "usage", title: "Usage" },
  { id: "specification", title: "Anatomy and specification" },
  { id: "hooks", title: "Hooks" },
  { id: "api", title: "API" },
  { id: "accessibility", title: "Accessibility" },
  { id: "status", title: "Status" },
];

const DOCS_SOURCE = "https://github.com/anshacerbia2/ui-platform-docs/blob/main";
const tokenValues = new Map(tokenList.map((t) => [t.name, t.values]));

/** Each hook with its fallbacks' values in every published theme and mode. */
function hookRows(spec: StyledSpec): HookRow[] {
  return (spec.hooks ?? []).map((h) => {
    const values: HookRow["values"] = {};
    for (const [theme, { modes }] of Object.entries(tokenThemes)) {
      values[theme] = Object.fromEntries(
        modes.map((mode) => [
          mode,
          h.fallbacks.map((f) =>
            f.replace(
              /\{([a-z0-9.-]+)\}/g,
              (_, name: string) => tokenValues.get(name)?.[theme]?.[mode] ?? name,
            ),
          ),
        ]),
      );
    }
    return {
      hook: h.hook,
      parts: h.parts,
      properties: h.properties,
      fallbacks: h.fallbacks,
      floor: h.floor,
      purpose: h.purpose,
      values,
    };
  });
}

const firstParagraph = (text?: string) => text?.split("\n\n")[0]?.replace(/\n/g, " ");

/**
 * A Components page (ADR-UIP-CMP-001 item 9), drawn as sheets (scnx-platform
 * Docs-Button.html): every section but Usage is generated from the styled
 * specification, its primitive, and the published declarations; Usage is
 * informative MDX and never restates a generated fact.
 */
export function ComponentPage({
  row,
  reference,
  Usage,
}: {
  row: EntryRow;
  reference: ComponentReference;
  Usage: ComponentType | null;
}) {
  const { spec, primitive } = reference;
  const main = reference.api.find((a) => a.kind === "component");
  const styled = entries
    .filter((e) => e.kind === "styled")
    .toSorted((a, b) => a.slug.localeCompare(b.slug));
  const index = styled.findIndex((e) => e.slug === row.slug);
  const [previous, next] = [styled[index - 1], styled[index + 1]];
  const results = reference.contrast.flatMap((r) => r.results);
  const hooks = hookRows(spec);
  const sections = SECTIONS.filter((s) => s.id !== "hooks" || hooks.length > 0);
  const themes = Object.keys(tokenThemes);
  const specFile = `${row.package}/specs/${row.slug}.json`;
  const title = titleOf(row.slug);
  return (
    <ThemeChoice themes={themes}>
      <DocsLayout toc={sections}>
        <PageHead
          crumbs={[{ label: "Components", href: "/components" }, { label: title }]}
          title={main?.name ?? title}
          lead={firstParagraph(main?.description)}
        />
        <Facts
          label="Component"
          items={[
            {
              term: "Lifecycle",
              value: row.stability.charAt(0).toUpperCase() + row.stability.slice(1),
            },
            { term: "Primitive", value: primitive?.name ?? "none" },
            { term: "Entry", value: spec.entryKind },
            { term: "Hooks", value: String(hooks.length) },
            {
              term: "Contrast",
              value: results.length
                ? `${results.filter((r) => r.pass).length} of ${results.length}`
                : "no pair",
              ok: results.length > 0 && results.every((r) => r.pass),
            },
          ]}
        />

        <Sheet
          id="overview"
          title="Overview"
          meta={[{ term: "Rendered from", value: "the specification's fixture" }]}
        >
          <Preview slug={row.slug} spec={spec} themes={themes} />
        </Sheet>

        <Sheet id="usage" title="Usage" meta={[{ term: "Guidance", value: "informative" }]}>
          <div className={styles.usage}>
            {Usage ? (
              <Usage />
            ) : (
              <p>
                Usage guidance for {title.toLowerCase()} is not written yet. Everything else on this
                page is generated from the published package.{" "}
                <a className={styles.link} href={`${DOCS_SOURCE}/src/content/components`}>
                  Contribute it
                </a>
                .
              </p>
            )}
          </div>
        </Sheet>

        <Sheet
          id="specification"
          title="Anatomy and specification"
          meta={[{ term: "Generated from", value: specFile }]}
        >
          <Specification reference={reference} />
          <Block title="Contrast">
            <p>
              Each pair a part renders, per option and state, in every published theme and mode: the
              lowest WCAG 2.2 ratio over sRGB and Display P3, clipped and gamut-mapped, computed
              from the published token values with the token gate&apos;s method. Disabled states are
              exempt (WCAG 2.2, 1.4.3).
            </p>
          </Block>
          <ContrastTable rows={reference.contrast} />
        </Sheet>

        {hooks.length > 0 ? (
          <Sheet id="hooks" title="Hooks" meta={[{ term: "Generated from", value: specFile }]}>
            <Hooks rows={hooks} hookScope={spec.hookScope} themes={themes} />
          </Sheet>
        ) : null}

        <Sheet
          id="api"
          title="API"
          meta={[{ term: "Read from", value: "the published declarations" }]}
        >
          <Api entry={spec.entry} api={reference.api} />
        </Sheet>

        <Sheet
          id="accessibility"
          title="Accessibility"
          meta={
            primitive
              ? [
                  {
                    term: "Generated from",
                    value: `@scnx/core-ui/specs/${primitive.entry.split("/").pop()}.json`,
                  },
                ]
              : undefined
          }
        >
          {primitive ? (
            <Accessibility spec={primitive} inherited />
          ) : (
            <Block>
              <p>
                This component styles no primitive: it renders its element with the platform&apos;s
                semantics and no behavior of its own.
              </p>
            </Block>
          )}
        </Sheet>

        <Sheet id="status" title="Status">
          <Status row={row} />
        </Sheet>

        <Pager
          label="Components"
          previous={
            previous ? { href: previous.page as Route, title: titleOf(previous.slug) } : undefined
          }
          next={next ? { href: next.page as Route, title: titleOf(next.slug) } : undefined}
        />
        <p className={styles.generated}>
          <span>
            Generated from {pin.packages.map((p) => `${p.name}@${p.version}`).join(" · ")} at
            ui-platform <InlineCode>{pin.commit.slice(0, 7)}</InlineCode>
          </span>
          <a href={`${DOCS_SOURCE}/src/content/components`}>Edit usage guidance</a>
        </p>
      </DocsLayout>
    </ThemeChoice>
  );
}
