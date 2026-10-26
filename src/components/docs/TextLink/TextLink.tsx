import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./TextLink.module.scss";

type TextLinkProps = {
  href: string;
  /** Offer the target as a download. */
  download?: boolean;
  children: ReactNode;
};

/** A link in running text, in the signal text role. A site path renders a client link. */
export function TextLink({ href, download, children }: TextLinkProps) {
  return href.startsWith("/") && !download ? (
    <Link href={href as Route} className={styles.link}>
      {children}
    </Link>
  ) : (
    <a href={href} className={styles.link} download={download || undefined}>
      {children}
    </a>
  );
}
