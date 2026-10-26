import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./PageHead.module.scss";

type Crumb = { label: string; href?: Route };

type PageHeadProps = {
  /** The trail to this page; the last crumb is the page itself. */
  crumbs?: Crumb[];
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
};

/**
 * A documentation page's head (scnx-platform Docs-Button.html): the trail, the title
 * and its lead, drawn on the column's lines. Facts follow it as a row of cells.
 */
export function PageHead({ crumbs, title, lead, children }: PageHeadProps) {
  return (
    <header className={styles.head}>
      {crumbs?.length ? (
        <nav aria-label="Breadcrumb">
          <ol className={styles.crumbs}>
            {crumbs.map((crumb) => (
              <li key={crumb.label}>
                {crumb.href ? (
                  <Link href={crumb.href}>{crumb.label}</Link>
                ) : (
                  <span aria-current="page">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      <h1 className={styles.title}>{title}</h1>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
      {children}
    </header>
  );
}
