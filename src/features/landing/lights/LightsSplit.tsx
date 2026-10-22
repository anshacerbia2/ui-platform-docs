"use client";

import { ThemeProvider } from "@scnx/core-ui/providers/theme-provider-base";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useStyleVars } from "@/shared/lib/useStyleVars";
import { Split } from "@/shared/ui/icons";
import { MiniDashboard } from "./MiniDashboard";
import styles from "./Lights.module.scss";

const clamp = (value: number) => Math.max(0, Math.min(100, value));

/**
 * One markup, two theme roots: the light root fills the frame and the dark
 * root is clipped from the split to the right edge. Drag or use the slider.
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
    const steps: Record<string, number> = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -25, PageUp: 25 };
    const step = steps[event.key];
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
    <div ref={frame} className={styles.frame} onPointerDown={down} data-edge={rounded === 0 || rounded === 100 || undefined}>
      <div className={styles.pane}>
        <ThemeProvider themeId="default" mode="light" storage={false}>
          <MiniDashboard />
        </ThemeProvider>
      </div>
      <div className={`${styles.pane} ${styles.dark}`}>
        <ThemeProvider themeId="default" mode="dark" storage={false}>
          <MiniDashboard hidden />
        </ThemeProvider>
      </div>
      <span className={styles.label} data-side="light">
        Light
      </span>
      <span className={styles.label} data-side="dark">
        Dark
      </span>
      <span className={styles.line} aria-hidden="true" />
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
        <Split size={20} />
      </button>
    </div>
  );
}
