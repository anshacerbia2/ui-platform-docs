import Link from "next/link";
import { Cells } from "@/components/docs/Cells";
import { Sheet } from "@/components/docs/Sheet";
import { Body, Eyebrow, Subtitle } from "@/components/docs/Type";
import { DarkRoot } from "@/components/system/Theme";
import { landing } from "@/shared/lib/reference";
import styles from "./Color.module.scss";

/** Sheet 05: one scheme's roles, generated per mode, and the same contracts as plain text. */
export function ColorSheet() {
  const swatches = landing.swatches;
  return (
    <Sheet
      id="color"
      title="Color and agents"
      label="Tokens, color"
      labelledBy="color-title"
      meta={[
        { term: "Roles", value: `${swatches.length} shown` },
        { term: "Modes", value: "light, dark" },
      ]}
    >
      <Cells className={styles.last}>
        <div className={styles.color}>
          <div className={styles.copy}>
            <Subtitle as="h2" id="color-title" size="large">
              Perceptual by design
            </Subtitle>
            <Body>
              Every scale is generated in OKLCH for light and dark, and every declared foreground
              and background pair is contrast-checked in every theme before release.
            </Body>
            <Link href="/tokens" className={styles.link}>
              Explore the tokens
            </Link>
          </div>
          <div>
            <div className={styles.ramp} aria-hidden="true">
              {swatches.map((token) => (
                <i key={token} data-swatch={token} />
              ))}
            </div>
            <ol className={styles.names}>
              {swatches.map((token) => (
                <li key={token}>{token.replace(/^color\.primary\./, "")}</li>
              ))}
            </ol>
          </div>
        </div>
        <DarkRoot>
          <div className={styles.agents}>
            <Eyebrow>For humans and agents</Eyebrow>
            <Subtitle as="h2" size="large">
              Your coding agents read the same contracts you do.
            </Subtitle>
            <Body>
              Generated from the packed specifications and API reports. Never from prose that can
              drift.
            </Body>
            {/* /llms.txt is a route handler, not a page, so it is a plain link. */}
            {/* oxlint-disable-next-line nextjs/no-html-link-for-pages */}
            <a href="/llms.txt" className={styles.chip}>
              /llms.txt
            </a>
          </div>
        </DarkRoot>
      </Cells>
    </Sheet>
  );
}
