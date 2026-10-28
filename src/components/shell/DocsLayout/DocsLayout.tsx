import type { Route } from "next";
import type { ReactNode } from "react";
import { entries, titleOf } from "@/shared/lib/reference";
import { DocsSidebar, SidebarGroups, type SidebarGroup } from "./DocsSidebar";
import { ScrollArea } from "@/components/docs/ScrollArea";
import { HereProvider } from "@/components/shell/Here";
import { PageToc, type TocItem } from "@/components/shell/PageToc";
import { RulerScrollbar } from "@/components/shell/RulerScrollbar";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { SiteHeader } from "@/components/shell/SiteHeader";
import styles from "./DocsLayout.module.scss";

const tag = (stability: string) => (stability === "stable" ? undefined : stability);

const byKind = (kind: string) =>
  entries.filter((e) => e.kind === kind && e.page).toSorted((a, b) => a.slug.localeCompare(b.slug));

// The sidebar shows the pages of the area the reader is in, the area the nav strip
// marks (the owner, 2026-10-28); a page outside every area gets the areas themselves.
function groups(): SidebarGroup[] {
  return [
    {
      title: "Components",
      area: "/components",
      items: [
        { href: "/components", label: "Overview" },
        ...byKind("styled").map((e) => ({
          href: e.page as Route,
          label: titleOf(e.slug),
          tag: tag(e.stability),
        })),
      ],
    },
    {
      title: "Primitives",
      area: "/primitives",
      items: [
        { href: "/primitives", label: "Overview" },
        ...byKind("primitive").map((e) => ({
          href: e.page as Route,
          label: titleOf(e.slug),
          tag: tag(e.stability),
        })),
      ],
    },
    {
      title: "Tokens",
      area: "/tokens",
      items: [
        { href: "/tokens", label: "Overview" },
        { href: "/tokens/color", label: "Colour" },
        { href: "/tokens/typography", label: "Typography" },
        { href: "/tokens/dimension", label: "Dimension" },
        { href: "/tokens/effect", label: "Effect" },
        { href: "/tokens/motion", label: "Motion" },
        { href: "/tokens/all", label: "All tokens" },
        { href: "/tokens/figma", label: "Tokens in Figma" },
      ],
    },
    {
      title: "Overview",
      items: [
        { href: "/components", label: "Components" },
        { href: "/primitives", label: "Primitives" },
        { href: "/tokens", label: "Tokens" },
        { href: "/releases", label: "Releases" },
      ],
    },
  ];
}

/**
 * The nav strip, then the docs column (TDD docs-site D14): sidebar, the page,
 * and its contents, drawn on the column's lines. The page's sheets feed the one
 * "here", the reveal, and the ruler scrollbar. Without a sidebar (the not-found page,
 * which App Router sends with every page's payload), no list of pages is sent.
 * `toc` is the page's sheets, one item each: the layout draws the contents from it,
 * and the strip's readout takes its count from the first paint.
 */
export function DocsLayout({
  children,
  toc,
  sidebar = true,
}: {
  children: ReactNode;
  toc?: TocItem[];
  sidebar?: boolean;
}) {
  return (
    <HereProvider>
      <SiteHeader sheets={toc?.length ?? 0} />
      <SidebarGroups groups={sidebar ? groups() : []}>
        <div className={styles.frame} data-sq-col="">
          <div
            className={styles.columns}
            data-aside={toc ? "" : undefined}
            data-bare={sidebar ? undefined : ""}
          >
            {sidebar ? <DocsSidebar /> : null}
            <main id="main" className={styles.main}>
              {children}
            </main>
            {toc ? (
              <aside className={styles.aside}>
                <ScrollArea className={styles.asideScroll}>
                  <PageToc items={toc} />
                </ScrollArea>
              </aside>
            ) : null}
          </div>
        </div>
      </SidebarGroups>
      <SiteFooter />
      <RulerScrollbar />
    </HereProvider>
  );
}
