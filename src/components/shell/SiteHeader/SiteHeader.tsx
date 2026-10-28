import { headers } from "next/headers";
import Link from "next/link";
import { shortcutFor } from "@/shared/lib/platform";
import { pin } from "@/shared/lib/reference";
import { GitHub } from "@/components/docs/Icons";
import { Logo } from "@/components/docs/Logo";
import { MenuTrigger } from "@/components/shell/MobileNav";
import { SearchTrigger } from "@/components/shell/Search";
import { ModeSwitch } from "./ModeSwitch";
import { NavReadout } from "./NavReadout";
import { REPOSITORY_URL } from "@/shared/lib/site";
import { SiteNav } from "./SiteNav";
import styles from "./SiteHeader.module.scss";

const system = pin.packages.find((p) => p.name === "@scnx/system");

/**
 * The nav strip (TDD docs-site D14; annex A 2.1): a full-width row of 48px
 * cells with one line between any two, held at the top above everything.
 * By the strip's own width: the sheet readout leaves at 1085px and below, the links and
 * the mode at 1023px, where the menu cell stands in for them and for the sidebar (TDD
 * docs-site D22), the GitHub icon and the search's shortcut at 640px (the menu holds
 * GitHub), and the brand's name at 480px (the mark stays). The search cell stays at
 * every width, its icon and shortcut with its word hidden. Get started is a link of the
 * strip, and the version is the menu's, the hero's and the footer's, not the strip's
 * (the owner, 2026-10-29).
 *
 * Everything in it is drawn by the server, so the first paint is the strip as it stays:
 * the search's shortcut is named from the request, and the readout takes the page's
 * sheet count, `sheets`, until the page's own scan has run (no cell fills in after
 * hydration; the owner, 2026-10-29).
 */
export async function SiteHeader({ sheets = 0 }: { sheets?: number }) {
  const shortcut = shortcutFor(await headers());
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <Logo size={24} />
        <span>Scnehaux UI</span>
      </Link>
      <SiteNav />
      <span className={styles.spacer} />
      <SearchTrigger shortcut={shortcut} />
      <span className={`${styles.cell} ${styles.withLinks}`}>
        <ModeSwitch />
      </span>
      <a href={REPOSITORY_URL} className={`${styles.iconCell} ${styles.wide}`} aria-label="GitHub">
        <GitHub size={18} />
      </a>
      {/* the sheet readout closes the strip, by the ruler it repeats (the owner, 2026-10-29) */}
      <NavReadout total={sheets} />
      <MenuTrigger version={system?.version ?? ""} />
    </header>
  );
}
