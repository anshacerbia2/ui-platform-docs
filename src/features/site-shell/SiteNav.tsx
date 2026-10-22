"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentMark, PrimitiveMark, ReleaseMark, TokenMark } from "@/shared/ui/icons";
import { SECTIONS } from "./nav";
import styles from "./SiteHeader.module.scss";

const MARKS = { primitive: PrimitiveMark, component: ComponentMark, token: TokenMark, release: ReleaseMark };

export function SiteNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Documentation" className={styles.nav}>
      {SECTIONS.map(({ href, label, mark }) => {
        const Mark = MARKS[mark];
        const current = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} className={styles.navLink} aria-current={current ? "page" : undefined}>
            <Mark size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
