import type { Route } from "next";
import Link from "next/link";
import { Cells } from "@/components/docs/Cells";
import { PageHead } from "@/components/docs/PageHead";
import { StabilityBadge } from "@/components/docs/StabilityBadge";
import { DocsLayout } from "@/components/shell/DocsLayout";
import { entries, titleOf } from "@/shared/lib/reference";
import styles from "./Reference.module.scss";

const COPY = {
  styled: {
    title: "Components",
    lead: "Primitives dressed in static CSS: scoped themes, token-bound states, and a contrast check for every pair they render. Each page is generated from the component's specification.",
  },
  primitive: {
    title: "Primitives",
    lead: "Headless behavior with semantic HTML and no styles: keyboard maps, focus management, and ARIA, each verified in Chromium, Firefox, and WebKit.",
  },
} as const;

/** Every page of one kind, as cells: its name, its lifecycle, and its entry. */
export function IndexPage({ kind }: { kind: "styled" | "primitive" }) {
  const rows = entries
    .filter((e) => e.kind === kind)
    .toSorted((a, b) => a.slug.localeCompare(b.slug));
  const copy = COPY[kind];
  return (
    <DocsLayout>
      <PageHead title={copy.title} lead={copy.lead} />
      <Cells as="ul" columns={3} className={styles.index} aria-label={copy.title}>
        {rows.map((row) => (
          <li key={row.entry}>
            <Link href={row.page as Route} className={styles.tile}>
              <span className={styles.tileHead}>
                <strong>{titleOf(row.slug)}</strong>
                <StabilityBadge stability={row.stability} />
              </span>
              <code>{row.entry}</code>
              {row.primitive ? <code>styles {row.primitive}</code> : null}
            </Link>
          </li>
        ))}
      </Cells>
    </DocsLayout>
  );
}
