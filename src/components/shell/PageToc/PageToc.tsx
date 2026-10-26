"use client";

import { useSheets } from "@/components/shell/Here";
import { TableOfContents } from "@/components/system/TableOfContents";
import { NAV_LINE } from "@/shared/lib/chrome";
import { useHere } from "@/shared/lib/useHere";
import styles from "./PageToc.module.scss";

/**
 * "On this page", with the system's own TableOfContents, controlled (ui-platform
 * TDD primitives P27): its current link is the page's "here" (the HereProvider,
 * TDD docs-site D14), so it switches with the section bars, the nav readout, and
 * the ruler. A followed link scrolls its section's line to the nav line exactly
 * (no extra offset), where it becomes here.
 */
export function PageToc({ items }: { items: { id: string; title: string }[] }) {
  const sheets = useSheets();
  // Outside a HereProvider the contents decide here on their own, with the same rule.
  const own = useHere(sheets ? [] : items.map((i) => i.id), NAV_LINE);
  const here = sheets ? sheets.here : own;
  return (
    <div className={styles.toc}>
      <TableOfContents
        label="On this page"
        items={items.map((i) => ({ ...i, url: `#${i.id}` }))}
        navbarOffset={NAV_LINE}
        scrollOffsetExtended={0}
        activeId={here}
      />
    </div>
  );
}
