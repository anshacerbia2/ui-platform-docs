import { Cells } from "@/components/docs/Cells";
import { Sheet } from "@/components/docs/Sheet";
import { Body, Subtitle } from "@/components/docs/Type";
import { DarkRoot } from "@/components/system/Theme";
import { SITE_THEME, themeStylesheet } from "@/shared/lib/themes";
import { Moves, type MoveLine } from "./Moves";
import { PackageChoice } from "./PackageChoice";
import styles from "./Install.module.scss";

const LINES: MoveLine[] = [
  { step: 1, text: "// 1 · app/layout.tsx: load CSS once", kind: "comment" },
  { step: 1, text: 'import "@scnx/system/styles/components.css";' },
  { step: 1, text: `import "${themeStylesheet(SITE_THEME)}";` },
  { step: 0, text: "" },
  { step: 2, text: "// 2 · scope a theme root; portals inherit it", kind: "comment" },
  { step: 2, text: `<div data-scnx-theme="${SITE_THEME}" data-scnx-resolved-mode="light">` },
  { step: 2, text: "  {children}" },
  { step: 2, text: "</div>" },
  { step: 0, text: "" },
  { step: 3, text: "// 3 · import by explicit entry: no barrels, no wildcards", kind: "comment" },
  { step: 3, text: 'import { Button } from "@scnx/system/components/button";' },
];

/** Sheet 03: which package, and the three moves of a setup. */
export function InstallSheet() {
  return (
    <Sheet
      id="install"
      title="Install"
      labelledBy="install-title"
      meta={[
        { term: "Side effects", value: "none on import" },
        { term: "Entries", value: "explicit" },
      ]}
    >
      <Cells className={styles.install}>
        <div className={styles.which}>
          <Subtitle as="h2" id="install-title" size="large">
            Which package do I need?
          </Subtitle>
          <Body>Two packages, one direction of dependency. Behavior never depends on style.</Body>
          <PackageChoice />
        </div>
        <DarkRoot>
          <Moves lines={LINES} />
        </DarkRoot>
      </Cells>
    </Sheet>
  );
}
