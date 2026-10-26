import type { ReactNode } from "react";
import { HereProvider } from "@/components/shell/Here";
import { RulerScrollbar } from "@/components/shell/RulerScrollbar";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { SiteHeader } from "@/components/shell/SiteHeader";
import styles from "./SheetLayout.module.scss";

/**
 * A page drawn as a set of sheets, without the docs column (scnx-platform
 * Docs-Landing.html, Docs-Home.html): the nav strip, the sheets in the centre
 * column with a rule across the whole viewport at each, the footer, and the ruler
 * scrollbar. The sheets feed the one "here", the reveal and the ruler.
 */
export function SheetLayout({ children }: { children: ReactNode }) {
  return (
    <HereProvider>
      <SiteHeader />
      <main id="main" className={styles.main} data-layout="sheets">
        {children}
      </main>
      <SiteFooter />
      <RulerScrollbar />
    </HereProvider>
  );
}
