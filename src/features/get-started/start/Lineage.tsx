"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SegmentedControl } from "@/components/system/SegmentedControl";
import type { Lineage as LineageData } from "../data";
import styles from "./Start.module.scss";

const RELATIONS = ["styled by", "bound to", "proven by"];
const DURATION = 1100;
const ease = (k: number) => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2);

/**
 * One component, four contracts (scnx-platform Docs-Home.html, sheet 01): pick a
 * component and a signal runs down its primitive, tokens, component and release.
 * The run is drawn through the CSSOM; under reduced motion the chain only changes.
 */
export function Lineage({ lineages }: { lineages: LineageData[] }) {
  const [slug, setSlug] = useState(lineages[0]?.slug ?? "");
  const [hit, setHit] = useState<number | null>(null);
  const chain = useRef<HTMLDivElement>(null);
  const run = useRef(0);
  const current = lineages.find((l) => l.slug === slug) ?? lineages[0];

  const trace = useCallback(() => {
    const node = chain.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = ++run.current;
    const start = performance.now();
    node.style.setProperty("--sig-on", "1");
    const step = (now: number) => {
      if (id !== run.current) return;
      const k = Math.min(1, (now - start) / DURATION);
      const e = ease(k);
      node.style.setProperty("--sig", e.toFixed(4));
      const near = [0, 1, 2, 3].find((i) => Math.abs(e - i / 3) < 0.07);
      setHit(near ?? null);
      if (k < 1) requestAnimationFrame(step);
      else
        window.setTimeout(() => {
          if (id !== run.current) return;
          node.style.setProperty("--sig-on", "0");
          setHit(null);
        }, 500);
    };
    requestAnimationFrame(step);
  }, []);

  // the first run, once the chain is in view
  useEffect(() => {
    const node = chain.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (seen) => {
        if (!seen[0]?.isIntersecting) return;
        window.setTimeout(trace, 600);
        observer.disconnect();
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [trace]);

  if (!current) return null;
  return (
    <div className={styles.lineage}>
      <div className={styles.lineageHead}>
        <div>
          <strong>One component, four contracts</strong>
          <p>Every page links all four. Pick one to trace it.</p>
        </div>
        <SegmentedControl
          aria-label="Component"
          size="small"
          value={slug}
          onValueChange={(value) => {
            setSlug(value);
            trace();
          }}
        >
          {lineages.map((l) => (
            <SegmentedControl.Item key={l.slug} value={l.slug}>
              {l.title}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl>
      </div>
      <div ref={chain} className={styles.chain} aria-live="polite">
        {current.contracts.map((contract, i) => (
          <div key={contract.title} className={styles.link}>
            {i > 0 ? (
              <span className={styles.relation} aria-hidden="true">
                {RELATIONS[i - 1]}
              </span>
            ) : null}
            <div className={styles.node} data-hit={hit === i || undefined}>
              <span className={styles.nodeNo}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <div className={styles.nodeTop}>
                  <strong>
                    {contract.title} <span>{contract.name}</span>
                  </strong>
                </div>
                {contract.code ? <pre>{contract.code}</pre> : null}
                {contract.note ? <p>{contract.note}</p> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
