import type { ReactNode } from "react";
import { Check } from "@/components/docs/Icons";
import { Lead } from "@/components/docs/Lead";
import { Sheet } from "@/components/docs/Sheet";
import { Body, Subtitle, Title } from "@/components/docs/Type";
import { Button } from "@/components/system/Button";
import { ThemeRoot } from "@/components/system/Theme";
import { hex, hslToSrgb, oklchToSrgb } from "@/shared/lib/color";
import { THEME_IDS } from "@/shared/lib/themes";
import { evidence, type Evidence } from "../data";
import { MotionSpecimen, RtlSpecimen } from "./Specimens";
import styles from "./Guarantees.module.scss";

const HUES = [25, 80, 130, 200, 259, 310];
const LUMINANCE_ROWS = [
  { name: "HSL", colors: [0, 45, 90, 180, 230, 280].map((h) => hex(hslToSrgb(h, 0.8, 0.55))) },
  { name: "OKLCH", colors: HUES.map((h) => hex(oklchToSrgb(0.65, 0.15, h))) },
];

/** Same HSL lightness, very different brightness; the same OKLCH lightness stays even. */
function ColorSpecimen() {
  return (
    <svg
      className={styles.lum}
      viewBox="0 0 196 40"
      role="img"
      aria-label="Six HSL colours at one lightness vary widely in brightness; six OKLCH colours at one lightness stay even."
    >
      {LUMINANCE_ROWS.map((row, r) => (
        <g key={row.name} transform={`translate(0 ${r * 22})`}>
          <text x="0" y="11" className={styles.lumLabel}>
            {row.name}
          </text>
          {row.colors.map((color, i) => (
            <rect key={color} x={44 + i * 25} width="22" height="14" fill={color} />
          ))}
        </g>
      ))}
    </svg>
  );
}

const ROWS: { title: string; text: string; specimen: ReactNode; proof: Evidence }[] = [
  {
    title: "Keyboard first",
    text: "A visible focus ring on every interactive part, APG keyboard maps per widget, and focus returned when a dialog closes.",
    specimen: (
      <div className={styles.keys} inert>
        <Button variant="primary" size="small">
          Save
        </Button>
        <span className={styles.focused}>
          <Button variant="secondary" size="small">
            Cancel
          </Button>
        </span>
        <kbd className={styles.kbd}>Tab</kbd>
      </div>
    ),
    proof: evidence.keyboard,
  },
  {
    title: "Perceptual color",
    text: "Same HSL lightness, very different brightness. OKLCH keeps every hue on the same visual step.",
    specimen: <ColorSpecimen />,
    proof: evidence.color,
  },
  {
    title: "Right-to-left, verified",
    text: "Layout and arrow keys mirror together. Tested as its own keyboard scenario, not assumed.",
    specimen: <RtlSpecimen />,
    proof: evidence.rtl,
  },
  {
    title: "Strict CSP, no exceptions",
    text: "Static CSS and no style or script injected at run time, so a security team never loosens its policy. This page runs under it.",
    specimen: (
      <p className={styles.csp}>
        script-src <b>&apos;nonce-…&apos; &apos;strict-dynamic&apos;</b>; style-src{" "}
        <b>&apos;self&apos; &apos;nonce-…&apos;</b>
        <br />
        no unsafe-inline, no unsafe-eval
      </p>
    ),
    proof: evidence.csp,
  },
  {
    title: "Motion with manners",
    text: "Five semantic motion roles. Reduced motion settles transitions at once; the state still changes.",
    specimen: <MotionSpecimen />,
    proof: evidence.motion,
  },
  {
    title: "Brands that never collide",
    text: "Scoped theme roots let micro-frontends with different brands share one page. Portals inherit the root they come from.",
    specimen: (
      <div className={styles.brands} inert>
        {THEME_IDS.slice(0, 2).map((theme, i) => (
          <ThemeRoot key={theme} theme={theme} mode={i === 0 ? "light" : "dark"}>
            <div className={styles.brandRoot}>
              <code>data-scnx-theme=&quot;{theme}&quot;</code>
              <Button variant="primary" size="small">
                Continue
              </Button>
            </div>
          </ThemeRoot>
        ))}
      </div>
    ),
    proof: evidence.roots,
  },
];

/** Sheet 04: the guarantees as a schedule, each with its specimen and where it is verified. */
export function GuaranteesSheet() {
  return (
    <Sheet
      id="guarantees"
      title="Guarantees"
      label="Schedule of guarantees"
      labelledBy="guarantees-title"
      meta={[
        { term: "Kept across", value: "minor versions" },
        { term: "Tested from", value: "packed tarball" },
      ]}
    >
      <Lead>
        <Title id="guarantees-title">The details you would otherwise build yourself.</Title>
      </Lead>
      <div className={styles.head} aria-hidden="true">
        <span>Guarantee</span>
        <span>Specimen</span>
        <span>Verified by</span>
      </div>
      <ul className={styles.schedule}>
        {ROWS.map((row) => (
          <li key={row.title}>
            <div>
              <Subtitle>{row.title}</Subtitle>
              <Body>{row.text}</Body>
            </div>
            <div className={styles.specimen}>{row.specimen}</div>
            <a className={styles.proof} href={row.proof.href}>
              <b>
                <Check size={16} />
                {row.proof.name}
              </b>
              {row.proof.detail}
            </a>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
