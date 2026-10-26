"use client";

import { useState } from "react";
import { Cells } from "@/components/docs/Cells";
import { Dim } from "@/components/docs/Dim";
import { Panel } from "@/components/docs/Panel";
import { DarkRoot } from "@/components/system/Theme";
import { useStyleVars } from "@/shared/lib/useStyleVars";
import styles from "./Tokens.module.scss";

// The states a surface takes in the token grammar (STD-UIP-TKN-001); focus is not one.
const SURFACE_STATES = ["default", "hover", "pressed", "selected", "disabled"] as const;
const STATES = [...SURFACE_STATES, "focus"] as const;
type State = (typeof STATES)[number];

const SEGMENTS = [
  { code: "primary", role: "scheme" },
  { code: "surface", role: "role" },
  { code: "solid", role: "emphasis" },
] as const;

const isSurfaceState = (state: State): state is (typeof SURFACE_STATES)[number] =>
  state !== "focus";

/**
 * Pick a state and compile it: a surface state resolves to the published token and
 * the button takes it; `focus` is not a surface state, so the build stops (the token
 * grammar has no such name).
 */
export function TokenGrammar() {
  const [state, setState] = useState<State>("default");
  const valid = isSurfaceState(state);
  const button = useStyleVars<HTMLSpanElement>({
    "--bg": `var(--ds-color-primary-surface-solid-${valid ? state : "default"})`,
    "--fg": `var(--ds-color-primary-text-contrast-${state === "disabled" ? "disabled" : "default"})`,
  });
  return (
    <Panel framed={false}>
      <div className={styles.grammar}>
        <div
          className={styles.line}
          aria-label="Token name: ds-color-primary-surface-solid, then the state"
        >
          <span className={styles.segment} data-kind="prefix">
            <code>--ds-color-</code>
            <Dim>tier 2</Dim>
          </span>
          {SEGMENTS.map((segment) => (
            <span key={segment.code} className={styles.pair}>
              <span className={styles.segment}>
                <code>{segment.code}</code>
                <Dim>{segment.role}</Dim>
              </span>
              <span className={styles.sep}>-</span>
            </span>
          ))}
          <span className={styles.segment} data-kind="state">
            <code>{state}</code>
            <Dim signal>state</Dim>
          </span>
        </div>
        <div role="group" aria-label="State" className={styles.states}>
          {STATES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={state === s}
              data-invalid={s === "focus" || undefined}
              onClick={() => setState(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <Cells className={styles.compile}>
        <DarkRoot>
          <figure className={styles.term}>
            <figcaption className={styles.termBar}>checkout.css</figcaption>
            <pre aria-live="polite">
              {valid ? (
                <>
                  <span className={styles.k}>.cta</span> {"{\n"}
                  {"  background: var(--ds-color-primary-surface-solid-"}
                  <span className={styles.p}>{state}</span>
                  {");\n}\n\n"}
                  <span className={styles.ok}>✓ compiled</span>
                  <span className={styles.c}> · resolves in light and dark</span>
                </>
              ) : (
                <>
                  {"  background: var(--ds-color-primary-surface-solid-"}
                  <span className={styles.n}>{state}</span>
                  {");\n\n"}
                  <span className={styles.n}>✕ STD-UIP-TKN-001</span>
                  {`  "${state}" is not a surface state.\n`}
                  <span
                    className={styles.c}
                  >{`  surfaces take: ${SURFACE_STATES.join(", ")}\n`}</span>
                  <span className={styles.c}> build stopped, nothing shipped</span>
                </>
              )}
            </pre>
          </figure>
        </DarkRoot>
        <div className={styles.render}>
          <span ref={button} className={styles.pay} data-state={state}>
            Pay now
          </span>
          <code>{valid ? `color.primary.surface.solid.${state}` : "not built"}</code>
        </div>
      </Cells>
    </Panel>
  );
}
