import type { Route } from "next";
import Link from "next/link";
import { DocsLayout } from "@/features/site-shell/DocsLayout";
import { entries, titleOf } from "@/shared/lib/reference";
import { StabilityBadge } from "./Status";
import styles from "./reference.module.scss";

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

export function IndexPage({ kind }: { kind: "styled" | "primitive" }) {
  const rows = entries
    .filter((e) => e.kind === kind)
    .toSorted((a, b) => a.slug.localeCompare(b.slug));
  const copy = COPY[kind];
  return (
    <DocsLayout>
      <header className={styles.header}>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.lead}>{copy.lead}</p>
      </header>
      <div className={styles.grid}>
        {rows.map((row) => (
          <Link key={row.entry} href={row.page as Route} className={styles.tile}>
            <span className={styles.tileHead}>
              <span className={styles.tileTitle}>{titleOf(row.slug)}</span>
              <StabilityBadge stability={row.stability} />
            </span>
            <span className={styles.tileMeta}>{row.entry}</span>
            {row.primitive ? <span className={styles.tileMeta}>styles {row.primitive}</span> : null}
          </Link>
        ))}
      </div>
    </DocsLayout>
  );
}
