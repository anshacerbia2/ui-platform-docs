"use client";

import { useSheets } from "@/components/shell/Here";
import { DarkRoot } from "@/components/system/Theme";
import { TableOfContents } from "@/components/system/TableOfContents";
import { JUMP_LINE, NAV_LINE } from "@/shared/lib/chrome";
import { useHere } from "@/shared/lib/useHere";
import styles from "./PageToc.module.scss";

/**
 * "On this page" (scnx-platform Docs-Button.html, the contents rail), with the
 * system's own TableOfContents, controlled (ui-platform TDD primitives P27): its
 * current link is the page's "here" (the HereProvider, TDD docs-site D14), so it
 * switches with the section bars, the nav readout, and the ruler. Each link carries its
 * sheet's number; the current one is marked by a signal bar, as the sidebar marks the
 * current page. A sheet's parts (a domain's groups) nest under it, unnumbered. A
 * followed link scrolls its section's line onto the nav's own line (JUMP_LINE). Under
 * it, the note that agents read the same docs.
 */
export type TocItem = { id: string; title: string; children?: { id: string; title: string }[] };

export function PageToc({ items }: { items: TocItem[] }) {
  const sheets = useSheets();
  // Outside a HereProvider the contents decide here on their own, with the same rule.
  const own = useHere(sheets ? [] : items.map((i) => i.id), NAV_LINE);
  const here = sheets ? sheets.here : own;
  return (
    <div className={styles.toc}>
      <TableOfContents
        label="On this page"
        items={items.map((i) => ({ ...i, url: `#${i.id}` }))}
        navbarOffset={JUMP_LINE}
        scrollOffsetExtended={0}
        activeId={here}
      >
        <TableOfContents.List className={styles.list}>
          {items.map((item, i) => (
            <TableOfContents.Item key={item.id} className={styles.item}>
              <TableOfContents.Link targetId={item.id} className={styles.link}>
                <span className={styles.no}>{String(i + 1).padStart(2, "0")}</span>
                {item.title}
              </TableOfContents.Link>
              {item.children?.length ? (
                <TableOfContents.List className={styles.sub}>
                  {item.children.map((child) => (
                    <TableOfContents.Item key={child.id} className={styles.item}>
                      <TableOfContents.Link targetId={child.id} className={styles.subLink}>
                        {child.title}
                      </TableOfContents.Link>
                    </TableOfContents.Item>
                  ))}
                </TableOfContents.List>
              ) : null}
            </TableOfContents.Item>
          ))}
        </TableOfContents.List>
      </TableOfContents>
      <DarkRoot>
        <div className={styles.agents}>
          <p className={styles.eyebrow}>Agent-ready</p>
          <p className={styles.body}>
            Coding agents read these same docs as plain text, so they build with the real
            components.
          </p>
          {/* /llms.txt is a route handler, not a page, so it is a plain link. */}
          {/* oxlint-disable-next-line nextjs/no-html-link-for-pages */}
          <a href="/llms.txt" className={styles.code}>
            /llms.txt
          </a>
        </div>
      </DarkRoot>
    </div>
  );
}
