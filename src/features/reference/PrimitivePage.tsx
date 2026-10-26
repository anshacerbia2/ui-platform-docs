import type { Route } from "next";
import Link from "next/link";
import { DocsLayout } from "@/components/shell/DocsLayout";
import { titleOf, type EntryRow, type PrimitiveReference } from "@/shared/lib/reference";
import { Accessibility } from "./Accessibility";
import { Api } from "./Api";
import { PageToc } from "./PageToc";
import { Code, Section } from "./Section";
import { StabilityBadge, Status } from "./Status";
import styles from "./reference.module.scss";

const SECTIONS = [
  { id: "accessibility", title: "Behavior and accessibility" },
  { id: "api", title: "API" },
  { id: "status", title: "Status" },
];

/** A Primitives page (ADR-UIP-CMP-001 item 9), generated from the primitive specification. */
export function PrimitivePage({
  row,
  reference,
}: {
  row: EntryRow;
  reference: PrimitiveReference;
}) {
  const main = reference.api.find((a) => a.kind === "component");
  return (
    <DocsLayout aside={<PageToc items={SECTIONS} />}>
      <header className={styles.header}>
        <ol className={styles.crumbs}>
          <li>
            <Link href="/primitives">Primitives</Link>
          </li>
          <li aria-current="page">{titleOf(row.slug)}</li>
        </ol>
        <h1 className={styles.title}>{reference.spec.name}</h1>
        {main?.description ? (
          <p className={styles.lead}>{main.description.split("\n\n")[0]?.replace(/\n/g, " ")}</p>
        ) : null}
        <ul className={styles.chips} aria-label="Facts">
          <li>
            <StabilityBadge stability={row.stability} />
          </li>
          <li className={styles.chip}>headless · no styles</li>
          <li className={styles.chip}>
            {row.package}@{row.version}
          </li>
          {reference.styledBy.map((slug) => (
            <li key={slug} className={styles.chip}>
              styled by <Link href={`/components/${slug}` as Route}>{titleOf(slug)}</Link>
            </li>
          ))}
        </ul>
      </header>
      <Section
        id="accessibility"
        title="Behavior and accessibility"
        source={
          <>
            Generated from <Code>{`${row.package}/specs/${row.slug}.json`}</Code>
          </>
        }
      >
        <Accessibility spec={reference.spec} />
      </Section>
      <Section id="api" title="API" source="Read from the published declarations">
        <Api entry={reference.spec.entry} api={reference.api} />
      </Section>
      <Section id="status" title="Status">
        <Status row={row} />
      </Section>
    </DocsLayout>
  );
}
