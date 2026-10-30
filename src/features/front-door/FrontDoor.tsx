import Link from "next/link";
import { GitHub } from "@/components/docs/Icons";
import { Logo } from "@/components/docs/Logo";
import { ModeSwitch } from "@/components/shell/SiteHeader/ModeSwitch";
import { REPOSITORY_URL } from "@/shared/lib/site";
import { WORLDS } from "./data";
import { Scene } from "./Scene";
import { World } from "./World";
import styles from "./FrontDoor.module.scss";

/**
 * The front door (the owner, 2026-10-30): Scnehaux UI as worlds, one stage the height of
 * the screen, each world one package. The design system and its primitives are open;
 * motion is in fabrication and says so. No nav strip: the mark, the repository and the
 * mode stand on the stage's corners, and each world leads to its own landing, where the
 * strip and the search are.
 */
export function FrontDoor() {
  return (
    <>
      <header className={styles.top}>
        <Link href="/" className={styles.brand}>
          <Logo size={24} />
          <span>Scnehaux UI</span>
        </Link>
        <div className={styles.tools}>
          <a href={REPOSITORY_URL} className={styles.github} aria-label="GitHub">
            <GitHub size={18} />
          </a>
          <ModeSwitch wipe />
        </div>
      </header>
      {/* the scan line of a mode wiped in, shown only inside that view transition */}
      <i className={styles.modeScan} data-mode-scan="" aria-hidden="true" />
      <main id="main" className={styles.main} data-layout="scene">
        <h1 className="u-visually-hidden">Scnehaux UI</h1>
        <Scene
          tabs={WORLDS.map(({ id, no, name, package: pkg, status }) => ({
            id,
            no,
            name,
            package: pkg,
            status,
          }))}
          panels={WORLDS.map((world) => (
            <World key={world.id} world={world} />
          ))}
        />
      </main>
    </>
  );
}
