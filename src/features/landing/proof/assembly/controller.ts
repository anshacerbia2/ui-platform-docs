// Drives the assembly (TDD docs-site D19): loads the scene on demand, closes the
// stack as the reader scrolls the hero away, turns it all the way round under a
// horizontal drag (never tilts it), lights a plate and its callout together,
// follows the theme, and lays the
// callouts beside the stack or, where the figure is narrow, lists them under it.
// Where WebGL is missing or lost, the figure keeps its text (data-state="flat").

import { readPalette } from "./palette";
import type { AssemblyScene, Point } from "./scene";

/** The callouts' column, the room their leaders take, and the width it needs. */
const CALLOUT_W = 176;
const LEADER = 40;
const CALLOUTS_FROM = 480;
/** The air between two callouts, and their margin from the stage's top and bottom. */
const CALLOUT_GAP = 14;
const CALLOUT_EDGE = 8;
/**
 * A drag turns the stack about its vertical axis, 0.4° a pixel, all the way round;
 * let go, it runs on at the drag's speed and slows with a 320ms time constant.
 */
const TURN = 0.4;
const TAU_COAST = 320;
/** The fastest coast, in degrees a millisecond: at most about a turn before it stops. */
const SPIN_MAX = 1;
const DROP_MS = 1100;
/** Where in the viewport the stack starts to close, and over how much of it. */
const OPENS_AT = 0.5;
const CLOSES_OVER = 0.22;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Places callouts of heights `sizes` with their centres at `ys` where they fit; where
 * they would touch, they are packed `gap` apart and the group is centred on where it
 * was wanted, then kept between `min` and `max`.
 */
export function spread(
  ys: number[],
  sizes: number[],
  gap: number,
  min: number,
  max: number,
): number[] {
  const order = ys.map((y, i) => ({ y, i, h: sizes[i] ?? 0 })).toSorted((a, b) => a.y - b.y);
  let bottom = -Infinity;
  for (const o of order) {
    o.y = Math.max(o.y, bottom + gap + o.h / 2);
    bottom = o.y + o.h / 2;
  }
  const first = order[0];
  const last = order.at(-1);
  if (!first || !last) return [...ys];
  let move = order.reduce((sum, o) => sum + ((ys[o.i] ?? o.y) - o.y), 0) / order.length;
  move = Math.min(move, max - (last.y + last.h / 2));
  move = Math.max(move, min - (first.y - first.h / 2));
  const out = [...ys];
  for (const o of order) out[o.i] = o.y + move;
  return out;
}

const written = new WeakMap<Element, Record<string, string>>();
// write a style only when it changes
const put = (node: HTMLElement | SVGElement, prop: string, value: string) => {
  const seen = written.get(node) ?? {};
  if (seen[prop] === value) return;
  seen[prop] = value;
  written.set(node, seen);
  node.style.setProperty(prop, value);
};

/** Mounts the assembly on its figure; returns the clean-up. */
export function mountAssembly(figure: HTMLElement): () => void {
  const stage = figure.querySelector<HTMLElement>("[data-stage]");
  const canvas = figure.querySelector<HTMLCanvasElement>("canvas");
  const specimen = figure.querySelector<HTMLElement>("[data-specimen]");
  const readout = figure.querySelector<HTMLElement>("[data-readout]");
  const view = figure.querySelector<HTMLElement>("[data-view]");
  const svg = figure.querySelector<SVGSVGElement>("[data-leaders]");
  if (!stage || !canvas || !specimen || !svg) return () => {};
  const parts = [...figure.querySelectorAll<HTMLElement>("[data-part]")];
  const leaders = [...svg.querySelectorAll<SVGPathElement>("path")];
  const dots = [...svg.querySelectorAll<SVGCircleElement>("circle")];
  const tags = [...svg.querySelectorAll<SVGTextElement>("text")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let scene: AssemblyScene | null = null;
  let disposed = false;
  let raf = 0;
  let last = 0;
  let width = 0;
  let height = 0;
  let callouts = false;
  let visible = true;
  let progress = 0;
  let yaw = 45;
  // degrees a millisecond: the drag's speed, then the coast's
  let spin = 0;
  let dragging: { x: number; yaw: number; lastX: number; lastT: number } | null = null;
  let dropStart = -1;
  let drop = reduce ? 1 : 0;
  let lit: number | null = null;
  // the callouts' heights, measured with the layout (a note may wrap to two lines)
  let sizes: number[] = [];
  const off: (() => void)[] = [];
  const listen = (
    node: EventTarget,
    type: string,
    fn: (e: Event) => void,
    opts?: AddEventListenerOptions,
  ) => {
    node.addEventListener(type, fn, opts);
    off.push(() => node.removeEventListener(type, fn, opts));
  };

  figure.dataset.state = "loading";

  const flat = () => {
    figure.dataset.state = "flat";
    scene?.dispose();
    scene = null;
  };

  // The stack closes while it is in view: from where its centre passes 50% of the
  // viewport (or the top of the page, if it starts above that), over 22% of the
  // viewport. So it is held apart on arrival and assembled well before it leaves.
  const measure = () => {
    const rect = stage.getBoundingClientRect();
    const vh = window.innerHeight;
    const centre = rect.top + rect.height / 2 + window.scrollY;
    const from = Math.max(0, centre - OPENS_AT * vh);
    const p = clamp((window.scrollY - from) / (CLOSES_OVER * vh), 0, 1);
    progress = reduce ? 0 : p;
    figure.style.setProperty("--p", progress.toFixed(3));
    if (readout) readout.textContent = `${String(Math.round(progress * 100)).padStart(2, "0")}%`;
    if (progress > 0.55) figure.dataset.closed = "";
    else delete figure.dataset.closed;
  };

  const resize = () => {
    if (!scene) return;
    width = stage.clientWidth;
    height = stage.clientHeight;
    callouts = width >= CALLOUTS_FROM;
    figure.dataset.layout = callouts ? "callouts" : "list";
    const room = callouts ? width - CALLOUT_W - LEADER : width;
    scene.layout({ width, height, centreX: room / 2, room });
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    sizes = parts.map((part) => part.offsetHeight);
  };

  // The callouts sit in a column right of the stack, each at its plate's height
  // (spread apart when the stack closes), with a leader from the plate's corner.
  const place = (anchors: Point[]) => {
    const x = width - CALLOUT_W;
    const ys = spread(
      anchors.map((a) => a.y),
      sizes,
      CALLOUT_GAP,
      CALLOUT_EDGE,
      height - CALLOUT_EDGE,
    );
    anchors.forEach((a, i) => {
      const y = ys[i] ?? a.y;
      const part = parts[i];
      if (callouts && part) put(part, "transform", `translate(${x}px, ${y.toFixed(1)}px)`);
      leaders[i]?.setAttribute(
        "d",
        `M${a.x.toFixed(1)} ${a.y.toFixed(1)} H${(a.x + 14).toFixed(1)} L${(x - 14).toFixed(1)} ${y.toFixed(1)} H${x - 4}`,
      );
      dots[i]?.setAttribute("cx", a.x.toFixed(1));
      dots[i]?.setAttribute("cy", a.y.toFixed(1));
      tags[i]?.setAttribute("x", (a.x + 8).toFixed(1));
      tags[i]?.setAttribute("y", a.y.toFixed(1));
    });
  };

  const frame = (t: number) => {
    raf = 0;
    if (!scene) return;
    const dt = Math.min(64, t - (last || t));
    last = t;
    let moving = false;
    if (drop < 1) {
      if (dropStart < 0) dropStart = t;
      drop = clamp((t - dropStart) / DROP_MS, 0, 1);
      moving = true;
    }
    if (!dragging && spin) {
      yaw += spin * dt;
      spin *= Math.exp(-dt / TAU_COAST);
      if (Math.abs(spin) < 0.002) spin = 0;
      moving ||= spin !== 0;
    }
    if (view)
      view.textContent = `${String(Math.round(((yaw % 360) + 360) % 360)).padStart(3, "0")}°`;
    scene.setDrop(drop);
    scene.setProgress(progress);
    scene.setYaw(yaw);
    if (visible) {
      scene.render();
      place(scene.anchors());
    }
    if (moving) request();
    else last = 0;
  };
  const request = () => {
    if (!raf && !disposed) raf = requestAnimationFrame(frame);
  };

  const light = (i: number | null) => {
    if (i === lit) return;
    lit = i;
    scene?.setLit(i);
    parts.forEach((p, k) => p.toggleAttribute("data-lit", k === i));
    leaders.forEach((p, k) => p.toggleAttribute("data-lit", k === i));
    dots.forEach((p, k) => p.toggleAttribute("data-lit", k === i));
    request();
  };

  const local = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const bind = () => {
    listen(
      window,
      "scroll",
      () => {
        measure();
        request();
      },
      { passive: true },
    );
    const resizes = new ResizeObserver(() => {
      resize();
      request();
    });
    resizes.observe(stage);
    off.push(() => resizes.disconnect());
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) request();
    });
    seen.observe(figure);
    off.push(() => seen.disconnect());
    // A theme root around the figure changes its theme or mode: read the palette again.
    // Only the roots that hold the figure are watched, not the islands elsewhere.
    const theme = new MutationObserver(() =>
      requestAnimationFrame(() => {
        if (!scene) return;
        scene.setPalette(readPalette(specimen));
        request();
      }),
    );
    for (let root = figure.closest("[data-scnx-theme]"); root;) {
      theme.observe(root, {
        attributes: true,
        attributeFilter: ["data-scnx-theme", "data-scnx-resolved-mode"],
      });
      root = root.parentElement?.closest("[data-scnx-theme]") ?? null;
    }
    off.push(() => theme.disconnect());

    listen(canvas, "pointerdown", (event) => {
      const e = event as PointerEvent;
      if (e.button !== 0) return;
      spin = 0;
      dragging = { x: e.clientX, yaw, lastX: e.clientX, lastT: e.timeStamp };
      canvas.setPointerCapture(e.pointerId);
      figure.dataset.dragging = "";
    });
    listen(canvas, "pointermove", (event) => {
      const e = event as PointerEvent;
      if (dragging) {
        // horizontal only: the camera's height above the floor never changes
        yaw = dragging.yaw + (e.clientX - dragging.x) * TURN;
        const dt = e.timeStamp - dragging.lastT;
        if (dt > 0) {
          const speed = ((e.clientX - dragging.lastX) * TURN) / dt;
          spin = clamp(spin * 0.5 + speed * 0.5, -SPIN_MAX, SPIN_MAX);
        }
        dragging.lastX = e.clientX;
        dragging.lastT = e.timeStamp;
        request();
        return;
      }
      const { x, y } = local(e);
      light(scene?.pick(x, y) ?? null);
    });
    const release = (event: Event) => {
      if (!dragging) return;
      // a drag that stopped before it let go does not coast; reduced motion never does
      if (reduce || event.timeStamp - dragging.lastT > 80) spin = 0;
      dragging = null;
      delete figure.dataset.dragging;
      request();
    };
    listen(canvas, "pointerup", release);
    listen(canvas, "pointercancel", release);
    listen(canvas, "pointerleave", () => {
      if (!dragging) light(null);
    });
    parts.forEach((part, i) => {
      listen(part, "pointerenter", () => light(i));
      listen(part, "pointerleave", () => light(null));
    });
    listen(canvas, "webglcontextlost", flat);
  };

  void (async () => {
    const { createAssemblyScene, REST_YAW } = await import("./scene");
    await document.fonts.ready;
    if (disposed) return;
    scene = createAssemblyScene(canvas, readPalette(specimen));
    if (!scene) return flat();
    yaw = REST_YAW;
    figure.dataset.state = "live";
    measure();
    resize();
    bind();
    request();
  })().catch(flat);

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    for (const fn of off) fn();
    scene?.dispose();
    scene = null;
  };
}
