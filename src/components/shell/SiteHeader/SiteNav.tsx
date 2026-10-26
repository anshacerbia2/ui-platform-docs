"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shuffle } from "@/components/docs/Shuffle";
import { NAV_LINKS } from "@/shared/lib/site";
import styles from "./SiteHeader.module.scss";

/** The nav strip's links: one cell, a link per area, the current one in ink (square.css .ix-nav-links). */
export function SiteNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Documentation" className={styles.nav}>
      {NAV_LINKS.map(({ href, label, echo }) => {
        const current = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={styles.navLink}
            data-echo={echo}
            aria-current={current ? "page" : undefined}
          >
            <Shuffle>{label}</Shuffle>
          </Link>
        );
      })}
    </nav>
  );
}
