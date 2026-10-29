"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, type ReactNode } from "react";
import { ScrollArea } from "@/components/docs/ScrollArea";
import styles from "./DocsLayout.module.scss";

export type SidebarGroup = {
  title: string;
  /** The path the group's pages live under; a group without one lists the areas. */
  area?: string;
  items: { href: Route; label: string; tag?: string }[];
};

const inArea = (pathname: string, area?: string) =>
  !!area && (pathname === area || pathname.startsWith(`${area}/`));

// The groups reach the page once, through this provider, and the sidebar reads them here.
const Groups = createContext<SidebarGroup[]>([]);

/** Hands the sidebar's groups to every DocsSidebar inside it. */
export function SidebarGroups({
  groups,
  children,
}: {
  groups: SidebarGroup[];
  children: ReactNode;
}) {
  return <Groups value={groups}>{children}</Groups>;
}

/**
 * The pages of the reader's area, or, outside every area, the areas themselves. From
 * the lg breakpoint; below it the menu lists the same pages (TDD docs-site D22).
 */
export function DocsSidebar() {
  const groups = useContext(Groups);
  const pathname = usePathname();
  const own = groups.filter((g) => inArea(pathname, g.area));
  const shown = own.length ? own : groups.filter((g) => !g.area);
  return (
    <ScrollArea className={styles.sidebarFrame}>
      <nav aria-label="Pages" className={styles.sidebar}>
        {shown.map((group) => (
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
    </ScrollArea>
  );
}
