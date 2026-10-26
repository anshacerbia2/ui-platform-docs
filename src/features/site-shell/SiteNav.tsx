"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shuffle } from "@/shared/ui/Shuffle";
import { SECTIONS } from "./nav";
import styles from "./SiteHeader.module.scss";

/** The nav strip's links: one cell, a link per area, the current one in ink (square.css .ix-nav-links). */
export function SiteNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Documentation" className={styles.nav}>
      {SECTIONS.map(({ href, label }) => {
        const current = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} className={styles.navLink} aria-current={current ? "page" : undefined}>
            <Shuffle>{label}</Shuffle>
          </Link>
        );
      })}
    </nav>
  );
}
