import { Badge } from "@/components/system/Badge";
import Link from "next/link";
import { pin } from "@/shared/lib/reference";
import { Cta } from "@/shared/ui/Cta";
import { Logo } from "./Logo";
import { ModeSwitch } from "./ModeSwitch";
import { NavReadout } from "./NavReadout";
import { REPOSITORY_URL } from "./nav";
import { SiteNav } from "./SiteNav";
import styles from "./SiteHeader.module.scss";

const system = pin.packages.find((p) => p.name === "@scnx/system");

/**
 * The nav strip (TDD docs-site D14; SCROLL.md 2.1): a full-width row of 48px
 * cells with one line between any two, held at the top above everything.
 * The sheet readout leaves at 1240px and below, the GitHub cell at 1180px,
 * and the links below 980px (the docs column keeps its page list).
 */
export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <Logo size={24} />
        <span>Scnehaux UI</span>
      </Link>
      {system ? (
        <span className={styles.tag}>
          <Badge size="small">{system.version}</Badge>
        </span>
      ) : null}
      <SiteNav />
      <span className={styles.spacer} />
      <NavReadout />
      <span className={styles.cell}>
        <ModeSwitch />
      </span>
      <Cta href={REPOSITORY_URL} variant="ghost" className={styles.optional}>
        GitHub
      </Cta>
      <Cta href="/components/button" variant="primary">
        Get started
      </Cta>
    </header>
  );
}
