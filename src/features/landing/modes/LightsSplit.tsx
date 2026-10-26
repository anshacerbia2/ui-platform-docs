"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Split } from "@/components/docs/Icons";
import { ThemeRoot } from "@/components/system/Theme";
import { useStyleVars } from "@/shared/lib/useStyleVars";
import { MiniDashboard } from "./MiniDashboard";
import styles from "./Modes.module.scss";

const clamp = (value: number) => Math.max(0, Math.min(100, value));
const STEPS: Record<string, number> = {
  ArrowLeft: -5,
  ArrowDown: -5,
  ArrowRight: 5,
  ArrowUp: 5,
  PageDown: -25,
  PageUp: 25,
};

/**
 * One markup, two theme roots: the light root fills the frame and the dark root is
 * clipped from the seam to the right edge. Drag the frame, or move the seam's
 * slider with the arrow, Page, Home and End keys.
 */
export function LightsSplit() {
  const [split, setSplit] = useState(50);
  const frame = useStyleVars<HTMLDivElement>({ "--split": `${split}%` });
  const dragging = useRef(false);

  const setFromX = useCallback(
    (x: number) => {
      const rect = frame.current?.getBoundingClientRect();
      if (!rect) return;
      let pct = ((x - rect.left) / rect.width) * 100;
      if (pct < 1) pct = 0;
      if (pct > 99) pct = 100;
      setSplit(clamp(pct));
    },
    [frame],
  );

  useEffect(() => {
    const move = (event: globalThis.PointerEvent) => {
      if (!dragging.current) return;
      if (event.buttons === 0) {
        dragging.current = false;
        return;
      }
      event.preventDefault();
      setFromX(event.clientX);
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("blur", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("blur", up);
    };
  }, [setFromX]);

  const down = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragging.current = true;
    setFromX(event.clientX);
  };
  const key = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = STEPS[event.key];
    if (step !== undefined) {
      event.preventDefault();
      setSplit((s) => clamp(s + step));
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setSplit(event.key === "Home" ? 0 : 100);
    }
  };

  const rounded = Math.round(split);
  return (
    <div ref={frame} className={styles.split} onPointerDown={down}>
      <div className={styles.pane}>
        <ThemeRoot mode="light">
          <MiniDashboard />
          <span className={styles.tag} data-side="light">
            Light
          </span>
        </ThemeRoot>
      </div>
      <div className={`${styles.pane} ${styles.dark}`}>
        <ThemeRoot mode="dark">
          <MiniDashboard hidden />
          <span className={styles.tag} data-side="dark">
            Dark
          </span>
        </ThemeRoot>
      </div>
      <span className={styles.seam} aria-hidden="true" />
      <button
        type="button"
        role="slider"
        className={styles.knob}
        aria-label="Light and dark split"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rounded}
        aria-valuetext={`${rounded}% light`}
        onKeyDown={key}
      >
        <Split size={16} />
      </button>
    </div>
  );
}
