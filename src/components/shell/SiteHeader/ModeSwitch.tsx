"use client";

import { useEffect, useRef } from "react";
import { useTheme, type ThemeMode } from "@/components/system/Theme";
import { Monitor, Moon, Sun } from "@/components/docs/Icons";
import { withoutTransitions } from "@/shared/lib/withoutTransitions";
import styles from "./ModeSwitch.module.scss";

const MODES: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { mode: "light", label: "Light mode", Icon: Sun },
  { mode: "dark", label: "Dark mode", Icon: Moon },
  { mode: "system", label: "Match the system", Icon: Monitor },
];

// On the root while a mode is wiped in (utilities/_switching.scss): "old" from the start,
// so the old page is taken without anything else in motion (the front door hides its
// world's scan line and holds its worlds), then "new", which brings the mode's own scan
// line in. A switch that changes nothing on the page (system, matching what shows) is
// waited for no longer than WIPE_WAIT.
const WIPE_ATTRIBUTE = "data-sq-wipe";
// Which way it runs (the owner, 2026-10-30): into dark from the left ("ltr"), into light
// from the right ("rtl"); system runs the way of the mode it resolves to.
const WIPE_DIR = "data-sq-wipe-dir";
const intoDark = (value: ThemeMode) =>
  value === "dark" ||
  (value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
const WIPE_WAIT = 150;
// A world's wipe under way on the front door (Scene.tsx sets it): the mode waits for it
// to land, so there is one edge on the stage at a time, never longer than this.
const WORLD_ATTRIBUTE = "data-sq-wiping";
const WORLD_WAIT = 1300;

/** Runs `next` once no world is wiping on the front door: at once, or when it lands. */
function whenWorldsStill(next: () => void) {
  const root = document.documentElement;
  if (!root.hasAttribute(WORLD_ATTRIBUTE)) return next();
  const landed = () => {
    watch.disconnect();
    window.clearTimeout(wait);
    next();
  };
  const watch = new MutationObserver(() => {
    if (!root.hasAttribute(WORLD_ATTRIBUTE)) landed();
  });
  watch.observe(root, { attributes: true, attributeFilter: [WORLD_ATTRIBUTE] });
  const wait = window.setTimeout(landed, WORLD_WAIT);
}

/**
 * Light, dark, or system: three toggle buttons, one pressed. The page switches with no
 * transition; with `wipe` (the front door), the new mode is drawn over the old one by a
 * scan line, as a world is (a view transition, where the browser has them and motion is
 * allowed; otherwise it switches at once).
 *
 * A wipe is one at a time (the owner, 2026-10-30): a choice made while one runs, or waits
 * for a world to land, starts nothing; it is kept, the last one only, and wiped in after,
 * if it is not what shows by then. A second wipe begun over the first would cut that one
 * short, and the page would jump to its end under the scan line still running.
 */
export function ModeSwitch({ wipe = false }: { wipe?: boolean }) {
  const { mode, setMode } = useTheme();
  const shown = useRef(mode);
  const busy = useRef(false);
  const queued = useRef<ThemeMode | null>(null);
  const group = useRef<HTMLDivElement>(null);
  useEffect(() => {
    shown.current = mode;
  }, [mode]);

  const change = (value: ThemeMode) => withoutTransitions(() => setMode(value));

  const wipeTo = (value: ThemeMode) => {
    const root = document.documentElement;
    // While the wipe runs, a click lands on the root, not on what is under it (the
    // browser hit-tests the transition's picture as the root): a click within one of these
    // buttons is that button's choice, kept for after the wipe.
    const onClickThrough = (event: MouseEvent) => {
      if (event.target !== root) return;
      for (const button of group.current?.querySelectorAll<HTMLButtonElement>("button") ?? []) {
        const box = button.getBoundingClientRect();
        const inside =
          event.clientX >= box.left &&
          event.clientX <= box.right &&
          event.clientY >= box.top &&
          event.clientY <= box.bottom;
        if (inside) queued.current = button.dataset.mode as ThemeMode;
      }
    };
    document.addEventListener("click", onClickThrough, true);
    root.setAttribute(WIPE_DIR, intoDark(value) ? "ltr" : "rtl");
    root.setAttribute(WIPE_ATTRIBUTE, "old");
    const transition = document.startViewTransition(
      () =>
        new Promise<void>((done) => {
          root.setAttribute(WIPE_ATTRIBUTE, "new");
          // the new snapshot is taken once a theme root has its new mode
          const settle = () => {
            observer.disconnect();
            window.clearTimeout(wait);
            done();
          };
          const observer = new MutationObserver(settle);
          observer.observe(root, {
            subtree: true,
            attributes: true,
            attributeFilter: ["data-scnx-resolved-mode"],
          });
          const wait = window.setTimeout(settle, WIPE_WAIT);
          change(value);
        }),
    );
    // one cut short (by another view transition, whatever started it) rejects these with
    // an AbortError; its page is already the new one, and finished still settles
    transition.ready.catch(() => {});
    transition.updateCallbackDone.catch(() => {});
    void transition.finished.finally(() => {
      document.removeEventListener("click", onClickThrough, true);
      root.removeAttribute(WIPE_ATTRIBUTE);
      root.removeAttribute(WIPE_DIR);
      busy.current = false;
      const next = queued.current;
      queued.current = null;
      if (next !== null) choose(next);
    });
  };

  const choose = (value: ThemeMode) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!wipe || reduce || !document.startViewTransition) {
      if (value !== mode) change(value);
      return;
    }
    if (busy.current) {
      queued.current = value;
      return;
    }
    if (value === shown.current) return;
    busy.current = true;
    whenWorldsStill(() => wipeTo(value));
  };

  return (
    <div ref={group} role="group" aria-label="Color mode" className={styles.group}>
      {MODES.map(({ mode: value, label, Icon }) => (
        <button
          key={value}
          type="button"
          className={styles.button}
          data-mode={value}
          aria-pressed={mode === value}
          aria-label={label}
          title={label}
          onClick={() => choose(value)}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
