"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import styles from "./Install.module.scss";

export type MoveLine = { step: 0 | 1 | 2 | 3; text: string; kind?: "comment" };

const MOVES = [
  { step: 1, label: "Load CSS once" },
  { step: 2, label: "Scope a theme root" },
  { step: 3, label: "Import by entry" },
] as const;

/**
 * Up in three moves: a tab per move highlights its lines in one listing (APG Tabs,
 * arrow keys between the moves). The listing is the site's own setup, from the
 * pinned theme id.
 */
export function Moves({ lines }: { lines: MoveLine[] }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const key = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + MOVES.length) % MOVES.length;
    setStep(MOVES[next]!.step);
    tabs.current[next]?.focus();
  };
  return (
    <div className={styles.moves}>
      <div className={styles.movesBar}>
        <h3>Up in three moves</h3>
        <p>CSS once at the composition root</p>
      </div>
      <div className={styles.steps} role="tablist" aria-label="Moves">
        {MOVES.map((move, index) => (
          <button
            key={move.step}
            ref={(node) => {
              tabs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`move-${move.step}`}
            aria-selected={step === move.step}
            aria-controls="moves-code"
            tabIndex={step === move.step ? 0 : -1}
            onClick={() => setStep(move.step)}
            onKeyDown={(event) => key(event, index)}
          >
            <span>{move.step}</span>
            {move.label}
          </button>
        ))}
      </div>
      <pre id="moves-code" role="tabpanel" aria-labelledby={`move-${step}`} className={styles.code}>
        {lines.map((line, index) => (
          <span
            // Lines are positional within the listing.
            // oxlint-disable-next-line react/no-array-index-key
            key={index}
            className={styles.row}
            data-on={line.step === step || undefined}
            data-dim={(line.step !== 0 && line.step !== step) || undefined}
            data-kind={line.kind}
          >
            <span className={styles.ln}>{index + 1}</span>
            {line.text}
          </span>
        ))}
      </pre>
    </div>
  );
}
