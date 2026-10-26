import Link from "next/link";
import { pin, sourceUrl } from "@/shared/lib/reference";
import { DarkRoot } from "@/components/system/Theme";
import { ARCHITECTURE_URL, REPOSITORY_URL } from "./nav";
import styles from "./SiteFooter.module.scss";

const COLUMNS = [
  {
    title: "Docs",
    links: [
      { label: "Components", href: "/components" },
      { label: "Primitives", href: "/primitives" },
      { label: "Tokens", href: "/tokens" },
      { label: "Releases", href: "/releases" },
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

export function SiteFooter() {
  return (
    <DarkRoot>
      <footer className={styles.footer}>
        <div className={`o-container ${styles.inner}`}>
          <div className={styles.columns}>
            <div className={styles.about}>
              <span className={styles.name}>Scnehaux UI</span>
              <p className={styles.blurb}>
                The design system you can verify. Built in public CI, released with evidence.
              </p>
            </div>
            {COLUMNS.map((column) => (
              <div key={column.title} className={styles.column}>
                <h2 className={styles.title}>{column.title}</h2>
                <ul className={styles.list}>
                  {column.links.map((link) =>
                    link.href.startsWith("/") ? (
                      <li key={link.label}>
                        <Link href={link.href as "/components"} className={styles.link}>
                          {link.label}
                        </Link>
                      </li>
                    ) : (
                      <li key={link.label}>
                        <a href={link.href} className={styles.link}>
                          {link.label}
                        </a>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ))}
          </div>
          <div className={styles.legal}>
            <span>© 2026 Scnehaux · proprietary</span>
            <span>
              Documents {pin.packages.map((p) => `${p.name}@${p.version}`).join(" · ")} ·
              ui-platform{" "}
              <a
                href={`https://github.com/${pin.repository}/commit/${pin.commit}`}
                className={styles.link}
              >
                {pin.commit.slice(0, 7)}
              </a>
            </span>
          </div>
        </div>
      </footer>
    </DarkRoot>
  );
}
