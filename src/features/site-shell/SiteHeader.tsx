import Link from "next/link";
import { Code } from "@/shared/ui/icons";
import { Logo } from "./Logo";
import { ModeSwitch } from "./ModeSwitch";
import { REPOSITORY_URL } from "./nav";
import { SiteNav } from "./SiteNav";
import styles from "./SiteHeader.module.scss";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <Logo />
        <span>Scnehaux UI</span>
      </Link>
      <SiteNav />
      <div className={styles.actions}>
        <ModeSwitch />
        <a href={REPOSITORY_URL} className={styles.ghost}>
          <Code size={18} />
          GitHub
        </a>
        <Link href="/components/button" className={styles.primary}>
          Get started
        </Link>
      </div>
    </header>
  );
}
