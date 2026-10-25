"use client";

import { useEffect, useRef, useState } from "react";
import { ThemeProvider } from "@scnx/core-ui/providers/theme-provider-base";
import { SITE_THEME } from "@/shared/lib/themes";
import { useStyleVars } from "@/shared/lib/useStyleVars";
import { Orbit, Reset } from "@/shared/ui/icons";
import { hex, maxChroma, oklchToSrgb, startTower, type Step, type Tower } from "./tower";
import styles from "./HueTower.module.scss";

const PRESETS = [
  { name: "Ocean", hue: 257 },
  { name: "Iris", hue: 292 },
  { name: "Jade", hue: 165 },
  { name: "Ember", hue: 42 },
];
const swatch = (h: number, L = 0.6, C = 0.2) => hex(oklchToSrgb(L, Math.min(C, maxChroma(L, h)), h));
const track = `linear-gradient(90deg, ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 359].map((h) => `${swatch(h, 0.68, 0.15)} ${Math.round(h / 3.59)}%`).join(", ")})`;

function Preset({ name, hue, current, onPick }: { name: string; hue: number; current: boolean; onPick: () => void }) {
  const ref = useStyleVars<HTMLButtonElement>({ "--swatch": swatch(hue), "--ring": swatch(hue, 0.8, 0.09) });
  return <button ref={ref} type="button" role="radio" aria-checked={current} aria-label={name} className={styles.preset} onClick={onPick} />;
}

/** The hero stage: the 12-step tower, a brand hue dial, and a tooltip per step. */
export function HueTower() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const tower = useRef<Tower | null>(null);
  const tip = useRef<HTMLDivElement>(null);
  const [hue, setHue] = useState(257);
  const [step, setStep] = useState<Step | null>(null);
  const [failed, setFailed] = useState(false);
  const dial = useStyleVars<HTMLInputElement>({ "--track": track });
  const current = useStyleVars<HTMLSpanElement>({ "--swatch": swatch(hue) });
  const tipSwatch = useStyleVars<HTMLSpanElement>({ "--swatch": step?.hex ?? "transparent" });

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const started = startTower(element, {
      hue: 257,
      reducedMotion,
      onHover: setStep,
      onTrack: (x, y) => tip.current?.style.setProperty("transform", `translate(${Math.round(x + 18)}px, ${Math.round(y - 22)}px)`),
    });
    if (!started) setFailed(true);
    tower.current = started;
    return () => {
      started?.dispose();
      tower.current = null;
    };
  }, []);

  const pick = (next: number) => {
    setHue(next);
    tower.current?.setHue(next);
  };

  // The stage is a dark showroom in either site mode: its own theme root, in dark mode.
  return (
    <ThemeProvider themeId={SITE_THEME} mode="dark" storage={false}>
      <div className={styles.stage}>
        <canvas
          ref={canvas}
          className={styles.canvas}
          role="img"
          aria-label={`Twelve rings, one per lightness step of the ${SITE_THEME} theme's color scale, each sweeping the hue wheel; a bead on every ring marks your brand hue. Drag to orbit.`}
        />
        {failed ? <div className={styles.fallback}>The 3D preview needs WebGL.</div> : null}
        <span className={styles.hint}>
          <Orbit size={13} />
          Drag to orbit · hover your brand
        </span>
        <span className={styles.caption}>
          <span className={styles.captionTitle}>12 steps × every hue</span>
          <span className={styles.captionMeta}>OKLCH · clipped to sRGB per hue</span>
        </span>
        <div className={styles.controls}>
          <div className={styles.legend}>
            <span className={styles.chip}>
              <span className={styles.chipKey}>↕</span>12 lightness steps, light to dark
            </span>
            <span className={styles.chip}>
              <span className={styles.chipKey}>↔</span>width = chroma · around = hue
            </span>
          </div>
          <div className={styles.dialRow}>
            <div className={styles.dial}>
              <div className={styles.dialHead}>
                <label htmlFor="hue-dial">Your brand hue</label>
                <span className={styles.dialValue}>
                  <span ref={current} className={styles.dialSwatch} />
                  {hue}°
                </span>
              </div>
              <input
                ref={dial}
                id="hue-dial"
                className={styles.range}
                type="range"
                min={0}
                max={359}
                step={1}
                value={hue}
                onChange={(e) => pick(Number(e.currentTarget.value))}
              />
              <div role="radiogroup" aria-label="Brand presets" className={styles.presets}>
                <span>Presets</span>
                {PRESETS.map((p) => (
                  <Preset key={p.name} {...p} current={hue === p.hue} onPick={() => pick(p.hue)} />
                ))}
              </div>
            </div>
            <button type="button" className={styles.reset} aria-label="Reset view" onClick={() => tower.current?.reset()}>
              <Reset size={15} />
            </button>
          </div>
        </div>
        <div ref={tip} className={styles.tip} role="status" hidden={!step}>
          {step ? (
            <>
              <span ref={tipSwatch} className={styles.tipSwatch} />
              <span className={styles.tipText}>
                <span className={styles.tipTitle}>step {step.step}</span>
                <span>
                  oklch({step.L.toFixed(2)} {step.C.toFixed(3)} {Math.round(step.h)}) · {step.hex}
                </span>
                <span>best with {step.best}</span>
              </span>
            </>
          ) : null}
        </div>
      </div>
    </ThemeProvider>
  );
}
