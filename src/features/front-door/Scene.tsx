"use client";

import {
  type AnimationEvent,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Shuffle } from "@/components/docs/Shuffle";
import styles from "./FrontDoor.module.scss";

export type SceneTab = { id: string; no: string; name: string; package: string; status: string };

type Dir = "forward" | "back";
type Side = "left" | "right";
/**
 * The stage as one edge (the owner, 2026-10-30): `top` is the world coming in on one side
 * of the edge, `under` the world laid whole beneath it on the other. `side` is the top
 * world's side: "left" for a world coming in from the left, the edge running left to
 * right (the next world, one number on), "right" for one coming in from the right, the
 * edge running right to left (any other: a world before, the first after the last, the
 * last straight from the first; `sideFor`), and for a drag, the way the pointer goes. Going forward the edge runs until `top` fills the stage; turned back it runs
 * the other way until `under` does. The side is fixed when a wipe starts and kept for
 * all of it, so a turn never jumps the edge. The current world is the one the edge runs
 * toward; `from` is where the edge starts, when it does not go on from where it is.
 */
type View = {
  current: number;
  top: number;
  under: number;
  dir: Dir;
  side: Side;
  from: number | null;
};

/**
 * Only the next world, one number on, comes in from the left, the edge running left to
 * right; any other comes in from the right, the edge running right to left: a world
 * before, the first after the last, the last straight from the first (the owner,
 * 2026-10-30). A drag is the exception: its edge runs the way the pointer goes.
 */
const sideFor = (target: number, from: number): Side => (target === from + 1 ? "left" : "right");

const LG = "(width >= 64rem)";
// A drag past this share of the stage's width goes to the next world; less springs back.
const COMMIT = 0.18;
// A flick commits whatever its length: px per ms over the drag's last FLICK_WINDOW ms.
const FLICK = 0.5;
const FLICK_WINDOW = 90;
// The wheel steps once per gesture: a gesture ends after this long without a wheel event.
const WHEEL_QUIET = 260;
const WHEEL_STEP = 40;
// A turn the worlds could not take yet is tried again this often, this many times.
const TURN_RETRY = 160;
const TURN_TRIES = 25;
// a wipe's length, as the stylesheet has it (FrontDoor.module.scss, .panel)
const WIPE = 1050;

/**
 * Puts a panel's edges somewhere at once, with no wipe, then lets its stylesheet take
 * them again from there: one style read between, no layout.
 */
function reset(panel: HTMLElement, edges: Record<string, string>) {
  panel.style.setProperty("transition", "none");
  for (const [name, value] of Object.entries(edges)) panel.style.setProperty(name, value);
  getComputedStyle(panel).getPropertyValue("--reveal");
  for (const name of Object.keys(edges)) panel.style.removeProperty(name);
  panel.style.removeProperty("transition");
}

/** The edge where it is now: its top world's `--reveal`, 0 (all drawn) to 1 (none). */
const edgeOf = (panel: Element | undefined) =>
  panel ? Number(getComputedStyle(panel).getPropertyValue("--reveal")) : 1;

/** A mode being wiped in (ModeSwitch): the worlds hold still until it is done. */
const modeWiping = () => document.documentElement.hasAttribute("data-sq-wipe");

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/**
 * The front door's worlds as one stage that turns on its own and never ends (the owner,
 * 2026-10-30): a stack of panels and one edge between two of them, a scan line on it.
 * A world comes in over the current from its side (`sideFor`): the next from the left, any
 * other from the right; after the last comes the first. Changed again mid-wipe, the edge
 * never starts over: it goes on, or turns, from where it is (View). The wipe is CSS, a
 * registered `--reveal` on the world coming in (FrontDoor.module.scss); this island says which worlds are either
 * side of it, which way it runs and, when it must, where it starts, and while a drag
 * holds it, where it is.
 *
 * The worlds turn by themselves: the current tab's bar fills over its dwell, and when it
 * is full the next world comes on (the bar's own animation ends it, so the two never
 * drift). It holds while the keyboard is in the stage or a drag is under way, stops at
 * the rail's pause, and never runs under reduced motion (the bar does not fill there).
 *
 * The rail is a tab list (APG tabs, manual activation: arrows move, the tab under the
 * focus is current). Anywhere else on the page the arrow keys and 1 to 3 change the
 * world, the wheel steps once per gesture where the page does not scroll, and a drag
 * across the stage draws a world in or out by hand.
 */
export function Scene({ tabs, panels }: { tabs: SceneTab[]; panels: ReactNode[] }) {
  const [view, setView] = useState<View>({
    current: 0,
    top: 0,
    under: -1,
    dir: "forward",
    side: "left",
    from: null,
  });
  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(false);
  // a wipe under way: only the two worlds on the stage can be gone to until it is done
  const [wiping, setWiping] = useState(false);
  const wipeTimer = useRef(0);
  const lens = useRef<HTMLDivElement>(null);
  const lensed = useRef<HTMLElement | null>(null);
  const lensFrame = useRef(0);
  const closeLens = useCallback(() => {
    cancelAnimationFrame(lensFrame.current);
    lensFrame.current = 0;
    if (!lens.current?.hasAttribute("data-on")) return;
    lensed.current?.removeAttribute("data-lens");
    lensed.current = null;
    lens.current.removeAttribute("data-on");
    lens.current.removeAttribute("data-empty");
    setHeld(false);
  }, []);
  // gone with the page
  useEffect(() => closeLens, [closeLens]);

  // The world's wipe, flagged on the root for the mode switch (ModeSwitch `wipe`), which
  // waits for it to land: a mode wiped in over a world mid-wipe would freeze that world's
  // edge in its picture of the old page. The mode's own wipe is data-sq-wipe.
  useEffect(() => {
    const root = document.documentElement;
    root.toggleAttribute("data-sq-wiping", wiping);
    return () => root.removeAttribute("data-sq-wiping");
  }, [wiping]);

  /**
   * A wipe starts: the lens closes, and the third world waits until the edge lands, never
   * longer than a wipe.
   */
  const startWipe = useCallback(() => {
    closeLens();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setWiping(true);
    window.clearTimeout(wipeTimer.current);
    wipeTimer.current = window.setTimeout(() => setWiping(false), WIPE + 150);
  }, [closeLens]);
  const scene = useRef<HTMLDivElement>(null);
  const stack = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const latest = useRef(view);
  const count = tabs.length;
  const { current } = view;
  /** A world's index round the ring: after the last comes the first. */
  const ring = (i: number) => (i + count) % count;

  // The X-ray lens (the owner, 2026-10-30): over the current world's bench, a mouse
  // opens a square onto the world before it at the same place, the specimen as it was a
  // step back; over the first world there is none before, and the square is empty. The
  // world before's panel is clipped to the square and lifted over the current; nothing is
  // laid out, the lens and the clip follow the pointer a frame at a time, and while it is
  // open the worlds do not turn by themselves.
  const onLens = (event: ReactPointerEvent<HTMLDivElement>) => {
    const node = stack.current;
    const bench = (event.target as Element).closest("[data-bench]");
    const open =
      event.pointerType === "mouse" &&
      !wiping &&
      node &&
      bench &&
      node.children[current]?.contains(bench) &&
      !scene.current?.hasAttribute("data-scrub") &&
      !modeWiping() &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!open) return closeLens();
    const { clientX, clientY } = event;
    if (lensFrame.current) return;
    lensFrame.current = requestAnimationFrame(() => {
      lensFrame.current = 0;
      const box = node.getBoundingClientRect();
      const x = `${clientX - box.left}px`;
      const y = `${clientY - box.top}px`;
      // the world before; the first world has none, and its lens scans an empty square
      const before = current - 1;
      const panel = before >= 0 ? (node.children[before] as HTMLElement) : null;
      if (!lens.current?.hasAttribute("data-on") || lensed.current !== panel) {
        lensed.current?.removeAttribute("data-lens");
        lensed.current = panel;
        panel?.setAttribute("data-lens", "");
        lens.current?.setAttribute("data-on", "");
        lens.current?.toggleAttribute("data-empty", !panel);
        lens.current?.setAttribute(
          "data-label",
          panel ? `${tabs[before]!.no} · ${tabs[before]!.name}` : "00 · Nothing before",
        );
        setHeld(true);
      }
      panel?.style.setProperty("--lx", x);
      panel?.style.setProperty("--ly", y);
      lens.current?.style.setProperty("translate", `${x} ${y}`);
    });
  };

  // The edge starts where the move says, at once, then runs on as the stylesheet has it.
  // Any other world is where its role puts it at once: a wipe it had under way, as the
  // top world before, is stopped, so only the edge ever moves.
  useLayoutEffect(() => {
    latest.current = view;
    const worlds = stack.current?.children;
    if (!worlds) return;
    for (const [i, world] of [...worlds].entries())
      if (i !== view.top) for (const a of world.getAnimations()) a.cancel();
    if (view.from !== null)
      reset(worlds[view.top] as HTMLElement, { "--reveal": String(view.from) });
  }, [view]);

  /**
   * To a world. At rest, the world comes in over the current from its side (`sideFor`):
   * from the left when it is the next world, from the right for any other (the owner,
   * 2026-10-30). Mid-wipe only the two worlds on the stage, either
   * side of the edge, can be gone to: the one the edge runs for, again, or the one on its
   * other side, so the edge turns; either way it goes on from where it is. A third world
   * waits until the wipe is done, so no world ever appears on the stage at once (the
   * owner, 2026-10-30).
   */
  const move = useCallback(
    (target: number): boolean => {
      if (modeWiping()) return false;
      const v = latest.current;
      const edge = edgeOf(stack.current?.children[v.top]);
      const mid = edge > 0.001 && edge < 0.999;
      let next: View;
      if (mid) {
        if (target === v.top) next = { ...v, current: target, dir: "forward", from: null };
        else if (target === v.under) next = { ...v, current: target, dir: "back", from: null };
        else return false;
      } else if (target === v.current) return false;
      else
        next = {
          current: target,
          top: target,
          under: v.current,
          dir: "forward",
          side: sideFor(target, v.current),
          from: 1,
        };
      latest.current = next;
      setView(next);
      startWipe();
      return true;
    },
    [startWipe],
  );
  /** To a world by its index. */
  const go = useCallback((index: number) => move(index), [move]);

  /** One world on or back, round the ring: after the last comes the first. */
  const step = useCallback(
    (delta: 1 | -1) => move((latest.current.current + delta + count) % count),
    [count, move],
  );
  // the arrow keys and the world's number, anywhere but a field or the rail itself
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (typing(event.target) || document.querySelector("dialog[open]")) return;
      if ((event.target as HTMLElement | null)?.closest?.("[role='tablist']")) return;
      if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
      else if (/^[1-9]$/.test(event.key) && Number(event.key) <= count) go(Number(event.key) - 1);
      else return;
      event.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [count, go, step]);

  // one step per wheel gesture, only where the stage is the whole page and nothing scrolls
  useEffect(() => {
    const node = scene.current;
    if (!node) return;
    const wide = window.matchMedia(LG);
    let sum = 0;
    let stepped = false;
    let quiet = 0;
    const onWheel = (event: WheelEvent) => {
      if (!wide.matches || event.ctrlKey) return;
      window.clearTimeout(quiet);
      quiet = window.setTimeout(() => {
        sum = 0;
        stepped = false;
      }, WHEEL_QUIET);
      if (stepped) return;
      sum += Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(sum) < WHEEL_STEP) return;
      stepped = true;
      step(sum > 0 ? 1 : -1);
    };
    node.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      node.removeEventListener("wheel", onWheel);
      window.clearTimeout(quiet);
    };
  }, [step]);

  // A drag across the stage, the edge under the pointer: to the right, the next world
  // drawn in from the left over the current; to the left, the world before drawn in from
  // the right. It goes round the ring (the owner, 2026-10-30): right from the last world
  // is the first, left from the first is the last; its edge runs the way the pointer
  // goes, whichever the world. Let go past COMMIT (or with a flick) and the edge runs on
  // the way it was dragged; short of it, it runs back; either way from where the pointer
  // let it go. While it lasts the two panels and the stage's side are set by hand.
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !stack.current || !scene.current || wiping || modeWiping()) return;
    closeLens();
    const root = scene.current;
    const node = stack.current;
    const x0 = event.clientX;
    const y0 = event.clientY;
    // the drag's recent path, for its speed as it is let go
    const trail: { x: number; t: number }[] = [];
    const width = node.clientWidth;
    const panelAt = (i: number) => node.children[ring(i)] as HTMLElement;
    let moving: HTMLElement | null = null;
    let under: HTMLElement | null = null;
    let target = current;
    let side: Side = "left";
    let share = 0;
    let dragging = false;

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - x0;
      trail.push({ x: e.clientX, t: e.timeStamp });
      while (trail.length > 2 && e.timeStamp - trail[0]!.t > FLICK_WINDOW) trail.shift();
      if (!dragging) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - y0)) return;
        // round the ring: right from the last is the first, left from the first the last
        side = dx > 0 ? "left" : "right";
        target = ring(side === "left" ? current + 1 : current - 1);
        moving = panelAt(target);
        under = panelAt(current);
        root.setAttribute("data-side", side);
        moving.style.setProperty("z-index", "3");
        under.style.setProperty("z-index", "2");
        under.style.setProperty("--reveal", "0");
        dragging = true;
        node.setPointerCapture(event.pointerId);
        root.setAttribute("data-scrub", "");
        setHeld(true);
      }
      share = Math.min(1, Math.max(0, (side === "left" ? dx : -dx) / width));
      moving?.style.setProperty("--reveal", String(1 - share));
    };
    const up = (e: PointerEvent) => {
      if (dragging && moving && under) {
        const from = trail[0] ?? { x: x0, t: e.timeStamp - 1 };
        const speed = Math.abs(e.clientX - from.x) / Math.max(1, e.timeStamp - from.t);
        const stays = share > COMMIT || speed > FLICK;
        // the click that ends a drag never follows the world's link
        node.addEventListener("click", (c) => c.preventDefault(), { capture: true, once: true });
        root.removeAttribute("data-scrub");
        for (const p of [moving, under]) {
          p.style.removeProperty("z-index");
          p.style.removeProperty("--reveal");
        }
        // past COMMIT the edge runs on the way it was dragged; short of it, back
        const next: View = {
          current: stays ? target : current,
          top: target,
          under: current,
          dir: stays ? "forward" : "back",
          side,
          from: 1 - share,
        };
        latest.current = next;
        setView(next);
        startWipe();
        setHeld(false);
      }
      end();
    };
    const end = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const next =
      event.key === "ArrowRight"
        ? current + 1
        : event.key === "ArrowLeft"
          ? current - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? count - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    if (next === current + 1 || next === current - 1) step(next > current ? 1 : -1);
    else go(next);
    tabRefs.current[(next + count) % count]?.focus();
  };

  // the edge has landed: every world can be gone to again (a wipe turned midway ends
  // once, when the turned one lands)
  const onWiped = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "--reveal") return;
    if (event.target === stack.current?.children[latest.current.top]) setWiping(false);
  };

  // the current tab's bar is full: the next world comes on
  const onDwell = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.pseudoElement !== "::before" || !event.animationName.includes("dwell")) return;
    if ((event.target as HTMLElement).getAttribute("aria-selected") !== "true") return;
    // The worlds held (a mode being wiped in) do not lose the turn: it is taken as soon as
    // they are free, unless a reader has moved them meanwhile (the owner, 2026-10-30).
    const from = latest.current.current;
    const attempt = (tries: number) => {
      if (latest.current.current !== from) return;
      if (!step(1) && tries < TURN_TRIES) window.setTimeout(() => attempt(tries + 1), TURN_RETRY);
    };
    attempt(0);
  };

  // the keyboard in the stage holds it, so what a reader moves to stays put
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).matches(":focus-visible")) setHeld(true);
  };
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHeld(false);
  };

  return (
    <div
      ref={scene}
      className={styles.scene}
      data-dir={view.dir}
      data-side={view.side}
      data-playing={playing ? "" : undefined}
      data-held={held ? "" : undefined}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <div
        ref={stack}
        className={styles.stack}
        onPointerDown={onPointerDown}
        onPointerMove={onLens}
        onPointerLeave={closeLens}
        onTransitionEnd={onWiped}
      >
        {panels.map((panel, i) => {
          const tab = tabs[i]!;
          return (
            <section
              key={tab.id}
              id={`world-${tab.id}`}
              role="tabpanel"
              aria-labelledby={`world-tab-${tab.id}`}
              className={styles.panel}
              data-sq-wipes=""
              data-state={i === view.top ? "top" : i === view.under ? "under" : "idle"}
              data-label={`${tab.no} · ${tab.name}`}
              inert={i !== current}
            >
              {panel}
            </section>
          );
        })}
        <div ref={lens} className={styles.lens} aria-hidden="true" />
      </div>
      <div className={styles.rail}>
        <div
          role="tablist"
          aria-label="Scnehaux UI"
          className={styles.tabs}
          onAnimationEnd={onDwell}
        >
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`world-tab-${tab.id}`}
              aria-selected={i === current}
              aria-controls={`world-${tab.id}`}
              tabIndex={i === current ? 0 : -1}
              aria-disabled={wiping && i !== view.top && i !== view.under ? true : undefined}
              className={styles.tab}
              onClick={() => go(i)}
              onKeyDown={onTabKey}
            >
              <b>{tab.no}</b>
              {/* the name verified on hover and focus, as the calls to action are */}
              <Shuffle>{tab.name}</Shuffle>
              <span className={styles.tabPackage}>
                {tab.package} <i>{tab.status}</i>
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.play}
          aria-label={playing ? "Pause the worlds" : "Play the worlds"}
          title={playing ? "Pause" : "Play"}
          data-playing={playing ? "" : undefined}
          onClick={() => setPlaying((p) => !p)}
        >
          <i />
        </button>
      </div>
    </div>
  );
}
