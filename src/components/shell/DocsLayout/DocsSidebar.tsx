"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./DocsLayout.module.scss";

export type SidebarGroup = { title: string; items: { href: Route; label: string; tag?: string }[] };

export function DocsSidebar({
  groups,
  compact = false,
}: {
  groups: SidebarGroup[];
  compact?: boolean;
}) {
  const pathname = usePathname();
  const nav = (
    <nav aria-label="Pages" className={compact ? styles.compactNav : styles.sidebar}>
      {groups.map((group) => (
        <div key={group.title} className={styles.group}>
          <h2 className={styles.groupTitle}>{group.title}</h2>
          <ul className={styles.groupList}>
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.sideLink}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                  {item.tag ? <span className={styles.sideTag}>{item.tag}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
  // Below the large breakpoint the same list sits in a disclosure above the page.
  return compact ? (
    <details className={styles.mobileNav}>
      <summary className={styles.mobileSummary}>Browse pages</summary>
      {nav}
    </details>
  ) : (
    nav
  );
}
