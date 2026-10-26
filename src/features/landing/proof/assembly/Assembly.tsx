"use client";

import { useEffect, useRef } from "react";
import { Dim } from "@/components/docs/Dim";
import { Button } from "@/components/system/Button";
import styles from "./Assembly.module.scss";
import { mountAssembly } from "./controller";

/** The four contracts of a component, bottom plate first. */
const PARTS = [
  { no: "01", step: "Primitive", claim: "Native behavior", note: "keyboard, focus, ARIA" },
  { no: "02", step: "Component", claim: "Styled in static CSS", note: "square in scnx-platform" },
  { no: "03", step: "Tokens", claim: "Bound to roles", note: "scheme · role · emphasis · state" },
  { no: "04", step: "Release", claim: "Proven by evidence", note: "provenance, SLSA L2" },
] as const;

/**
 * The four contracts of a component as an exploded view (TDD docs-site D19): four
 * machined plates on four axes, held apart at rest and assembled as the reader
 * scrolls the hero away; a drag turns the stack. The plates are drawn with WebGL
 * (`scene.ts`, loaded on demand) from the page's own tokens and the design
 * system's own Button; the four contracts are this list, as text, whatever draws.
 */
export function Assembly({ swatches, version }: { swatches: string[]; version: string }) {
  const figure = useRef<HTMLElement>(null);

  useEffect(() => (figure.current ? mountAssembly(figure.current) : undefined), []);

  return (
    <figure ref={figure} className={styles.asm}>
      <div className={styles.hud} aria-hidden="true">
        <span>
          Assembly <b data-readout>00%</b>
          <i className={styles.meter} />
        </span>
        <span>
          Iso <b data-view>045°</b> · drag to turn
        </span>
      </div>
      <div className={styles.body}>
        <div className={styles.stage} data-stage>
          <canvas className={styles.canvas} aria-hidden="true" />
          <svg className={styles.leaders} data-leaders aria-hidden="true">
            {PARTS.map((part) => (
              <g key={part.no}>
                <path />
                <circle r="2.5" />
                <text>{part.no}</text>
              </g>
            ))}
          </svg>
        </div>
        <ol className={styles.parts}>
          {PARTS.map((part, i) => (
            <li key={part.no} className={styles.part} data-part={i}>
              <b>
                {part.no} {part.step}
              </b>
              <em>{part.claim}</em>
              <small>{part.note}</small>
            </li>
          ))}
        </ol>
      </div>
      <figcaption className={styles.sum}>
        <Dim>{`one component, four contracts · ${version}`}</Dim>
      </figcaption>
      {/* what the plates are drawn from: the real Button and the token swatches, unseen */}
      <div className={styles.specimen} data-specimen aria-hidden="true" inert>
        <Button variant="primary">Deploy changes</Button>
        {swatches.map((token) => (
          <i key={token} data-swatch={token} />
        ))}
        <span data-probe />
      </div>
    </figure>
  );
}
