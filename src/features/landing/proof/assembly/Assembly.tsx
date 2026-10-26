"use client";

import { useEffect, useRef, useState } from "react";
import { Dim } from "@/components/docs/Dim";
import { ArrowLeft, ArrowRight, Orbit, Reset } from "@/components/docs/Icons";
import { ToggleGroup } from "@/components/docs/ToggleGroup";
import { ToolButton } from "@/components/docs/ToolButton";
import { Button } from "@/components/system/Button";
import styles from "./Assembly.module.scss";
import { type AssemblyHandle, type AssemblyState, mountAssembly } from "./controller";

const SHAPES = [
  { value: "apart", label: "Apart" },
  { value: "assembled", label: "Assembled" },
] as const;

/**
 * The four contracts of a component, bottom plate first, in the order they build on
 * each other: native behaviour, the tokens it is bound to, the styled component with
 * the behaviour it adds for the user, and the release that proves it (the owner,
 * 2026-10-27). The plates' faces follow the same order (faces.ts).
 */
const PARTS = [
  { no: "01", step: "Primitive", claim: "Native behavior", note: "keyboard, focus, ARIA" },
  { no: "02", step: "Tokens", claim: "Bound to roles", note: "scheme · role · emphasis · state" },
  {
    no: "03",
    step: "Component",
    claim: "Styled, plus behavior",
    note: "static CSS · loading state",
  },
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
  const handle = useRef<AssemblyHandle | null>(null);
  const [state, setState] = useState<AssemblyState>({
    assembled: false,
    held: false,
    spinning: false,
  });

  useEffect(() => {
    if (!figure.current) return;
    const mounted = mountAssembly(figure.current, setState);
    handle.current = mounted;
    return () => {
      mounted.dispose();
      handle.current = null;
    };
  }, []);

  return (
    <figure ref={figure} className={styles.asm}>
      <div className={styles.hud} aria-hidden="true">
        <span>
          Assembly <b data-readout>00%</b>
          <i className={styles.meter} />
        </span>
        <span>
          Iso <b data-view>045°</b> · drag to turn 360°
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
        {/* right under the stack: play with it without scrolling it out of view */}
        <div className={styles.controls}>
          <ToggleGroup
            label="Assembly"
            options={SHAPES}
            value={state.assembled ? "assembled" : "apart"}
            onChange={(shape) => handle.current?.hold(shape === "assembled" ? 1 : 0)}
          />
          <div role="group" aria-label="View" className={styles.tools}>
            <ToolButton
              label="Turn left a quarter"
              icon={<ArrowLeft size={14} />}
              onClick={() => handle.current?.turn(-90)}
            />
            <ToolButton
              label="Turn right a quarter"
              icon={<ArrowRight size={14} />}
              onClick={() => handle.current?.turn(90)}
            />
            <span className={styles.turntable}>
              <ToolButton
                label="Turntable"
                icon={<Orbit size={14} />}
                pressed={state.spinning}
                onClick={() => handle.current?.spin(!state.spinning)}
              />
            </span>
            <ToolButton
              label="Reset the view"
              icon={<Reset size={14} />}
              onClick={() => handle.current?.reset()}
            />
          </div>
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
