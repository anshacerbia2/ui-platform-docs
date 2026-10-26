"use client";

import { useEffect, useRef, useState } from "react";
import { Dim } from "@/components/docs/Dim";
import { Check } from "@/components/docs/Icons";
import { Button } from "@/components/system/Button";
import styles from "./Proof.module.scss";

const LABELS = [
  { i: 3, step: "04 Release", claim: "Proven by evidence", note: "provenance, SLSA L2" },
  { i: 2, step: "03 Tokens", claim: "Bound to roles", note: "scheme · role · emphasis · state" },
  { i: 1, step: "02 Component", claim: "Styled in static CSS", note: "square in scnx-platform" },
  { i: 0, step: "01 Primitive", claim: "Native behavior", note: "keyboard, focus, ARIA" },
] as const;

/**
 * The four contracts of a component drawn as stacked plates (scnx-platform
 * Docs-Landing.html, sheet 01): exploded at rest, assembled as the reader scrolls
 * the hero away. The progress is a custom property set through the CSSOM (TDD
 * docs-site D5); under reduced motion the plates stay apart and still.
 */
export function Assembly({ swatches, version }: { swatches: string[]; version: string }) {
  const figure = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [lit, setLit] = useState<number | null>(null);

  useEffect(() => {
    const node = figure.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (48 - rect.top) / (rect.height * 0.9)));
      node.style.setProperty("--p", p.toFixed(3));
      setProgress(Math.round(p * 100));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <figure
      ref={figure}
      className={styles.asm}
      aria-label="The four contracts of a component, drawn as stacked plates: primitive, component, tokens and release. Scrolling assembles them into one."
    >
      <div className={styles.stage} aria-hidden="true">
        <div className={styles.plate} data-i="0" data-lit={lit === 0 || undefined}>
          <div className={styles.plateIn}>&lt;button&gt;</div>
        </div>
        <div className={styles.plate} data-i="1" data-lit={lit === 1 || undefined}>
          <div className={styles.plateIn} inert>
            <Button variant="primary">Deploy changes</Button>
          </div>
        </div>
        <div className={styles.plate} data-i="2" data-lit={lit === 2 || undefined}>
          <div className={styles.plateIn}>
            {swatches.map((token) => (
              <i key={token} data-swatch={token} />
            ))}
          </div>
        </div>
        <div className={styles.plate} data-i="3" data-lit={lit === 3 || undefined}>
          <div className={styles.plateIn}>
            <span className={styles.seal}>
              <Check size={40} />
            </span>
          </div>
        </div>
      </div>
      <div className={styles.labels}>
        {LABELS.map((label) => (
          <div
            key={label.i}
            className={styles.label}
            data-i={label.i}
            onPointerEnter={() => setLit(label.i)}
            onPointerLeave={() => setLit(null)}
          >
            <span>
              <b>{label.step}</b>
              <em>{label.claim}</em>
              <small>{label.note}</small>
            </span>
          </div>
        ))}
      </div>
      <p className={styles.assembled} aria-hidden="true">
        Assembly <b>{String(progress).padStart(2, "0")}%</b>
        <span className={styles.meter} />
      </p>
      <div className={styles.sum}>
        <Dim>{`one component, four contracts · ${version}`}</Dim>
      </div>
    </figure>
  );
}
