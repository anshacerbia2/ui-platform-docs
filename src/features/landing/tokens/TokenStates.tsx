"use client";

import { useState } from "react";
import { useStyleVars } from "@/shared/lib/useStyleVars";
import { DarkRoot } from "@/shared/ui/DarkRoot";
import styles from "./TokenStates.module.scss";

// The surface states the token grammar allows (STD-UIP-TKN-001); focus is not one.
const STATES = ["default", "hover", "pressed", "selected", "disabled"] as const;
type State = (typeof STATES)[number];

/** Pick a state: the preview reads the real published token for it. */
export function TokenStates() {
  const [state, setState] = useState<State>("default");
  const preview = useStyleVars<HTMLSpanElement>({
    "--bg": `var(--ds-color-primary-surface-solid-${state})`,
    "--fg": `var(--ds-color-primary-text-contrast-${state === "disabled" ? "disabled" : "default"})`,
  });
  return (
    <DarkRoot>
      <div className={styles.editor}>
        <div className={styles.titlebar}>
          <span className={styles.dots} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>checkout.css</span>
        </div>
        <div className={styles.body}>
          <div className={styles.code}>
            <div className={styles.codeLine}>
              <span className={styles.gutter}>1</span>
              <span className={styles.selector}>.cta</span>
              <span className={styles.punct}>&nbsp;{"{"}</span>
            </div>
            <div className={styles.codeLine} data-active="">
              <span className={styles.gutter}>2</span>
              <span className={styles.property}>&nbsp;&nbsp;background</span>
              <span className={styles.punct}>: </span>
              <span className={styles.fn}>var</span>
              <span className={styles.punct}>(</span>
              <span className={styles.token}>--ds-color-primary-surface-solid-{state}</span>
              <span className={styles.caret} aria-hidden="true" />
              <span className={styles.punct}>);</span>
            </div>
            <div className={styles.codeLine}>
              <span className={styles.gutter}>3</span>
              <span className={styles.punct}>{"}"}</span>
            </div>
            <div role="group" aria-label="Surface state" className={styles.listbox}>
              {STATES.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={state === s}
                  className={styles.option}
                  onClick={() => setState(s)}
                >
                  {s}
                  <span className={styles.optionNote}>{state === s ? "selected" : ""}</span>
                </button>
              ))}
              <button type="button" aria-disabled="true" className={styles.option} data-invalid="">
                focus
                <span className={styles.optionNote}>not a surface state</span>
              </button>
            </div>
          </div>
          <div className={styles.result}>
            <span className={styles.resultLabel}>rendered</span>
            <span ref={preview} className={styles.preview} data-state={state}>
              Pay now
            </span>
            <span className={styles.resultLabel}>color.primary.surface.solid.{state}</span>
          </div>
        </div>
      </div>
    </DarkRoot>
  );
}
