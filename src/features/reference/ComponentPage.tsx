import type { Route } from "next";
import Link from "next/link";
import type { ComponentType } from "react";
import { DocsLayout } from "@/features/site-shell/DocsLayout";
import { entries, pin, tokenThemes, titleOf, type ComponentReference, type EntryRow } from "@/shared/lib/reference";
import { Accessibility } from "./Accessibility";
import { Api } from "./Api";
import { PageToc } from "./PageToc";
import { Preview } from "./Preview";
import { Code, Section } from "./Section";
import { ContrastTable, Specification } from "./Specification";
import { StabilityBadge, Status } from "./Status";
import styles from "./reference.module.scss";

const SECTIONS = [
  { id: "overview", title: "Overview" },
  { id: "usage", title: "Usage" },
  { id: "specification", title: "Anatomy and specification" },
  { id: "api", title: "API" },
  { id: "accessibility", title: "Accessibility" },
  { id: "status", title: "Status" },
];

const DOCS_SOURCE = "https://github.com/anshacerbia2/ui-platform-docs/blob/main";

/**
 * A Components page (ADR-UIP-CMP-001 item 9): every section but Usage is
 * generated from the styled specification, its primitive, and the published
 * declarations; Usage is informative MDX and never restates a generated fact.
 */
export function ComponentPage({ row, reference, Usage }: { row: EntryRow; reference: ComponentReference; Usage: ComponentType | null }) {
  const { spec, primitive } = reference;
  const main = reference.api.find((a) => a.kind === "component");
  const styled = entries.filter((e) => e.kind === "styled").toSorted((a, b) => a.slug.localeCompare(b.slug));
  const index = styled.findIndex((e) => e.slug === row.slug);
  const [previous, next] = [styled[index - 1], styled[index + 1]];
  const allPass = reference.contrast.length > 0 && reference.contrast.every((r) => r.results.every((x) => x.pass));
  return (
    <DocsLayout aside={<PageToc items={SECTIONS} />}>
      <header className={styles.header}>
        <ol className={styles.crumbs}>
          <li>
            <Link href="/components">Components</Link>
          </li>
          <li aria-current="page">{titleOf(row.slug)}</li>
        </ol>
        <h1 className={styles.title}>{main?.name ?? titleOf(row.slug)}</h1>
        {main?.description ? <p className={styles.lead}>{main.description.split("\n\n")[0]?.replace(/\n/g, " ")}</p> : null}
        <ul className={styles.chips} aria-label="Facts">
          <li>
            <StabilityBadge stability={row.stability} />
          </li>
          <li className={styles.chip}>{spec.entryKind}</li>
          <li className={styles.chip}>
            {row.package}@{row.version}
          </li>
          {primitive ? (
            <li className={styles.chip}>
              styles <Link href={`/primitives/${primitive.entry.split("/").pop()}` as Route}>{primitive.name}</Link>
            </li>
          ) : null}
          {allPass ? <li className={styles.chip}>WCAG 2.2 AA contrast · {Object.keys(tokenThemes).length} themes × 2 modes</li> : null}
        </ul>
      </header>

      <Section id="overview" title="Overview" source="Rendered from the specification's fixture">
        <Preview slug={row.slug} spec={spec} themes={Object.keys(tokenThemes)} />
      </Section>

      <Section id="usage" title="Usage" source="Informative">
        {Usage ? (
          <Usage />
        ) : (
          <p className={styles.lead}>
            Usage guidance for {titleOf(row.slug).toLowerCase()} is not written yet. Everything else on this page is generated from the published package.{" "}
            <a className={styles.link} href={`${DOCS_SOURCE}/src/content/components`}>
              Contribute it
            </a>
            .
          </p>
        )}
      </Section>

      <Section
        id="specification"
        title="Anatomy and specification"
        source={
          <>
            Generated from <Code>{`${row.package}/specs/${row.slug}.json`}</Code>
          </>
        }
      >
        <Specification reference={reference} />
        <h3 className={styles.subHeading}>Contrast</h3>
        <p className={styles.lead}>
          Each pair a part renders, per option and state, in every published theme and mode: the lowest WCAG 2.2 ratio over sRGB and Display P3, clipped and
          gamut-mapped, computed from the published token values with the token gate&apos;s method. Disabled states are exempt (WCAG 2.2, 1.4.3).
        </p>
        <ContrastTable rows={reference.contrast} />
      </Section>

      <Section id="api" title="API" source="Read from the published declarations">
        <Api entry={spec.entry} api={reference.api} />
      </Section>

      <Section
        id="accessibility"
        title="Accessibility"
        source={
          primitive ? (
            <>
              Generated from <Code>{`@scnx/core-ui/specs/${primitive.entry.split("/").pop()}.json`}</Code>
            </>
          ) : undefined
        }
      >
        {primitive ? (
          <Accessibility spec={primitive} inherited />
        ) : (
          <p className={styles.lead}>
            This component styles no primitive: it renders its element with the platform&apos;s semantics and no behavior of its own.
          </p>
        )}
      </Section>

      <Section id="status" title="Status">
        <Status row={row} />
      </Section>

      <nav aria-label="Components" className={styles.pager}>
        {previous ? (
          <Link href={previous.page as Route}>
            <span>← Previous</span>
            <strong>{titleOf(previous.slug)}</strong>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={next.page as Route} data-next="">
            <span>Next →</span>
            <strong>{titleOf(next.slug)}</strong>
          </Link>
        ) : null}
      </nav>
      <p className={styles.generated}>
        <span>
          Generated from {pin.packages.map((p) => `${p.name}@${p.version}`).join(" · ")} at ui-platform {pin.commit.slice(0, 7)}
        </span>
        <a href={`${DOCS_SOURCE}/src/content/components`}>Edit usage guidance</a>
      </p>
    </DocsLayout>
  );
}
