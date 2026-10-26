import type { Route } from "next";
import Link from "next/link";
import styles from "./Pager.module.scss";

type Page = { href: Route; title: string };

/** Previous and next: two cells that share their lines. */
export function Pager({ label, previous, next }: { label: string; previous?: Page; next?: Page }) {
  return (
    <nav aria-label={label} className={styles.pager}>
      {previous ? (
        <Link href={previous.href}>
          <span>← Previous</span>
          <strong>{previous.title}</strong>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} data-next="">
          <span>Next →</span>
          <strong>{next.title}</strong>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
