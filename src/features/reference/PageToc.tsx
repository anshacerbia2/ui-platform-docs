"use client";

import { TableOfContents } from "@scnx/system/components/table-of-contents";
import { useHere } from "@/shared/lib/useHere";
import styles from "./reference.module.scss";

/** The fixed header's height: the line a section's top reaches when it becomes here. */
const HEADER_LINE = 104;

/**
 * "On this page", with the system's own TableOfContents, controlled (ui-platform
 * TDD primitives P27): its current link is the page's "here" (useHere), so it
 * agrees with every other indicator of the current section. A followed link
 * scrolls its section's line to the header line exactly (no extra offset), where
 * it becomes here.
 */
export function PageToc({ items }: { items: { id: string; title: string }[] }) {
  const here = useHere(
    items.map((i) => i.id),
    HEADER_LINE,
  );
  return (
    <div className={styles.toc}>
      <TableOfContents
        label="On this page"
        items={items.map((i) => ({ ...i, url: `#${i.id}` }))}
        navbarOffset={HEADER_LINE}
        scrollOffsetExtended={0}
        activeId={here}
      />
    </div>
  );
}
