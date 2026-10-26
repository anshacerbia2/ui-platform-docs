import Link from "next/link";
import type { Route } from "next";
import { Cta } from "@/components/docs/Cta";
import { Logo } from "@/components/docs/Logo";
import { pin, sourceUrl } from "@/shared/lib/reference";
import { ARCHITECTURE_URL, REPOSITORY_URL } from "@/shared/lib/site";
import styles from "./SiteFooter.module.scss";

const COLUMNS = [
  {
    title: "Docs",
    links: [
      { label: "Get started", href: "/get-started" },
      { label: "Components", href: "/components" },
      { label: "Primitives", href: "/primitives" },
      { label: "Tokens", href: "/tokens" },
    ],
  },
  {
    title: "Releases",
    links: [
      { label: "Status matrix", href: "/releases#status" },
      { label: "Pinned build", href: "/releases#build" },
      { label: "Support matrix", href: sourceUrl("support-matrix.json") },
      { label: "Changelog", href: `${REPOSITORY_URL}/commits/main` },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "GitHub", href: REPOSITORY_URL },
      { label: "Architecture", href: ARCHITECTURE_URL },
      { label: "Documentation source", href: "https://github.com/anshacerbia2/ui-platform-docs" },
      { label: "License", href: sourceUrl("packages/design-system/LICENSE") },
    ],
  },
] as const;

const system = pin.packages.find((p) => p.name === "@scnx/system");

/**
 * The set's closing rows (scnx-platform square.css "Footer"): the brand and the site's
 * links as cells that share their lines, then the set block, the title block of the
 * whole drawing set.
 */
export function SiteFooter() {
  const set = [
    { term: "Drawing set", value: "Scnehaux UI documentation" },
    { term: "Rev", value: system?.version ?? "" },
    {
      term: "Build",
      value: (
        <a href={`https://github.com/${pin.repository}/commit/${pin.commit}`}>
          ui-platform {pin.commit.slice(0, 7)}
        </a>
      ),
    },
    { term: "License", value: "Proprietary" },
    { term: "Authority", value: "SAD-003" },
  ];
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.about}>
          <Link href="/" className={styles.brand}>
            <Logo size={24} />
            Scnehaux UI
          </Link>
          <p className={styles.blurb}>
            The design system you can verify. Built in public CI, released with evidence.
          </p>
          <Cta href="/get-started" variant="secondary">
            Read the docs
          </Cta>
        </div>
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title} className={styles.column}>
            <h2 className={styles.title}>{column.title}</h2>
            <ul className={styles.list}>
              {column.links.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("/") ? (
                    <Link href={link.href as Route} className={styles.link}>
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className={styles.link}>
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <dl className={styles.set} aria-label="Drawing set">
        {set.map((fact) => (
          <div key={fact.term}>
            <dt>{fact.term}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
    </footer>
  );
}
