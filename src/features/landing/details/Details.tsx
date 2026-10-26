import { ThemeRoot } from "@/components/system/Theme";
import { Button } from "@/components/system/Button";
import { SITE_THEME, THEME_IDS } from "@/shared/lib/themes";
import { DarkRoot } from "@/components/system/Theme";
import { hex, oklchToSrgb } from "../hero/tower";
import { SectionHead } from "../sections/SectionHead";
import sectionStyles from "../sections/sections.module.scss";
import { MotionDemo, RtlDemo } from "./DemoCards";
import styles from "./Details.module.scss";

const hsl = (h: number, s: number, l: number) => {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)] as [number, number, number];
};
const luminance = (c: [number, number, number]) => {
  const v = c.map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0]! + 0.7152 * v[1]! + 0.0722 * v[2]!;
};
const ROWS = [
  { name: "HSL", cells: [0, 45, 90, 135, 180, 225, 270, 315].map((h) => hsl(h, 0.85, 0.55)) },
  {
    name: "OKLCH",
    cells: [25, 70, 110, 150, 195, 240, 285, 330].map((h) => oklchToSrgb(0.72, 0.12, h)),
  },
];

/** Equal HSL lightness vs equal OKLCH lightness; the bar under each swatch is its measured luminance. */
function PerceptDemo() {
  return (
    <svg
      className={styles.percept}
      viewBox="0 0 300 92"
      role="img"
      aria-label="Eight HSL colors at the same lightness vary widely in luminance; eight OKLCH colors at the same lightness stay even."
    >
      {ROWS.map((row, r) => (
        <g key={row.name} transform={`translate(0 ${r * 44})`}>
          <text x="0" y="18" className={styles.perceptLabel}>
            {row.name}
          </text>
          {row.cells.map((c, i) => (
            <g key={i} transform={`translate(${52 + i * 31} 0)`}>
              <rect width="28" height="26" rx="5" fill={hex(c)} />
              <rect
                y="30"
                width={Math.max(1, luminance(c) * 28)}
                height="3"
                rx="1.5"
                className={styles.perceptBar}
              />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

const CARDS = [
  {
    title: "Keyboard first",
    text: "A visible focus ring on every interactive part, APG keyboard maps per widget, and focus returned when a dialog closes.",
    demo: "keyboard",
  },
  {
    title: "Perceptual color",
    text: "Same HSL lightness, very different brightness. OKLCH keeps every hue on the same visual step.",
    demo: "percept",
  },
  {
    title: "Right-to-left, verified",
    text: "Layout and arrow keys mirror together. Tested as its own keyboard scenario, not assumed.",
    demo: "rtl",
  },
  {
    title: "Strict CSP, no exceptions",
    text: "Static CSS and no style or script injected at run time, so a security team never loosens its policy. This page runs under the policy shown.",
    demo: "csp",
  },
  {
    title: "Motion with manners",
    text: "Five semantic motion roles: feedback, enter, exit, disclosure, and attention. Reduced motion settles transitions at once; the state still changes.",
    demo: "motion",
  },
  {
    title: "Brands that never collide",
    text: "Scoped theme roots let micro-frontends with different brands share one page. Portals inherit the root they come from.",
    demo: "brands",
  },
] as const;

function Demo({ kind }: { kind: (typeof CARDS)[number]["demo"] }) {
  switch (kind) {
    case "keyboard":
      return (
        <div className={styles.demoInset} aria-hidden="true">
          <div className={styles.keys}>
            {["Save", "Preview", "Cancel"].map((label, i) => (
              <span
                key={label}
                className={styles.keyTarget}
                data-index={i}
                data-variant={i === 0 ? "solid" : i === 1 ? "tonal" : "ghost"}
              >
                {label}
              </span>
            ))}
          </div>
          <span className={styles.kbd}>Tab</span>
        </div>
      );
    case "percept":
      return (
        <div className={styles.demoInset}>
          <PerceptDemo />
        </div>
      );
    case "rtl":
      return <RtlDemo />;
    case "csp":
      return (
        <DarkRoot>
          <div className={`${styles.demoInset} ${styles.terminal}`}>
            <span className={styles.termMuted}>Content-Security-Policy:</span>
            <span className={styles.termGood}>
              script-src &apos;nonce-…&apos; &apos;strict-dynamic&apos;
            </span>
            <span className={styles.termGood}>style-src &apos;self&apos; &apos;nonce-…&apos;</span>
            <span>✓ no unsafe-inline ✓ no unsafe-eval</span>
          </div>
        </DarkRoot>
      );
    case "motion":
      return <MotionDemo />;
    case "brands":
      return (
        <div className={`${styles.demoInset} ${styles.brands}`}>
          {[
            { theme: THEME_IDS[0] ?? SITE_THEME, mode: "light" as const, name: "Northwind" },
            { theme: THEME_IDS[1] ?? SITE_THEME, mode: "dark" as const, name: "Kirana" },
          ].map((root) => (
            <ThemeRoot key={root.theme} theme={root.theme} mode={root.mode}>
              <div className={styles.brandRoot}>
                <span className={styles.brandAttr}>data-scnx-theme=&quot;{root.theme}&quot;</span>
                <span className={styles.brandName}>{root.name}</span>
                <span className={styles.brandLine} />
                <Button variant="primary" tabIndex={-1}>
                  Continue
                </Button>
              </div>
            </ThemeRoot>
          ))}
        </div>
      );
  }
}

export function Details() {
  return (
    <section className={sectionStyles.stack} aria-labelledby="details-title">
      <SectionHead
        id="details-title"
        title={
          <>
            The details you would
            <br />
            otherwise build yourself.
          </>
        }
        note="Each one is part of the public contract, tested from the packed package, and kept across minor versions."
      />
      <div className={styles.grid}>
        {CARDS.map((card) => (
          <article key={card.title} className={styles.card}>
            <Demo kind={card.demo} />
            <div className={styles.cardText}>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardBody}>{card.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
