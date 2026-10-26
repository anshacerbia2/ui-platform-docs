import { Badge } from "@/components/system/Badge";
import Link from "next/link";
import { pin } from "@/shared/lib/reference";
import { Cta } from "@/components/docs/Cta";
import { Logo } from "@/components/docs/Logo";
import { ModeSwitch } from "./ModeSwitch";
import { NavReadout } from "./NavReadout";
import { GET_STARTED, REPOSITORY_URL } from "@/shared/lib/site";
import { SiteNav } from "./SiteNav";
import styles from "./SiteHeader.module.scss";

const system = pin.packages.find((p) => p.name === "@scnx/system");

/**
 * The nav strip (TDD docs-site D14; SCROLL.md 2.1): a full-width row of 48px
 * cells with one line between any two, held at the top above everything.
 * The sheet readout leaves at 1320px and below, the GitHub cell at 1180px, the
 * Get started link (the call to action repeats it) at 1080px, and the links below
 * 980px (the docs column keeps its page list).
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
      <Cta href={GET_STARTED} variant="primary">
        Get started
      </Cta>
    </header>
  );
}
