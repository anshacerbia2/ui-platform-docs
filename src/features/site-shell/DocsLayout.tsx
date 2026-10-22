import type { Route } from "next";
import type { ReactNode } from "react";
import { entries, titleOf } from "@/shared/lib/reference";
import { DocsSidebar, type SidebarGroup } from "./DocsSidebar";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import styles from "./DocsLayout.module.scss";

const tag = (stability: string) => (stability === "stable" ? undefined : stability);

const byKind = (kind: string) => entries.filter((e) => e.kind === kind && e.page).toSorted((a, b) => a.slug.localeCompare(b.slug));

function groups(): SidebarGroup[] {
  return [
    {
      title: "Overview",
      items: [
        { href: "/components", label: "Components" },
        { href: "/primitives", label: "Primitives" },
        { href: "/tokens", label: "Tokens" },
        { href: "/releases", label: "Releases" },
      ],
    },
    { title: "Components", items: byKind("styled").map((e) => ({ href: e.page as Route, label: titleOf(e.slug), tag: tag(e.stability) })) },
    { title: "Primitives", items: byKind("primitive").map((e) => ({ href: e.page as Route, label: titleOf(e.slug), tag: tag(e.stability) })) },
  ];
}

/** Header, page navigation, the page, and its table of contents. */
export function DocsLayout({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <>
      <div className={`o-container ${styles.frame}`}>
        <SiteHeader />
        <DocsSidebar groups={groups()} compact />
        <div className={styles.columns}>
          <DocsSidebar groups={groups()} />
          <main id="main" className={styles.main}>
            {children}
          </main>
          {aside ? <aside className={styles.aside}>{aside}</aside> : null}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
