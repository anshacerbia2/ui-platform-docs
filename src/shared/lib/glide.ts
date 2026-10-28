// Wheel glide (TDD docs-site D14; TDD docs-site annex A
// 4): every wheel input, mouse or trackpad, moves a target and the page
// eases toward it with a 120ms time constant, landing within 0.5px. Left to the
// browser: ctrl or pinch zoom, a mostly horizontal swipe, an element under the
// pointer that can still scroll that way, an event another handler took, and
// reduced motion. Keys, anchors, find, and the native scrollbar move the page
// directly, and a glide in progress yields to them. One instance for the site.
//
// The page moves in the scroll phase of the site's one frame (shared/lib/frame.ts),
// first, while layout is clean, and those that draw from the scroll position draw in
// that frame's write phase.

import { schedule, scrolledTo, scrollTop } from "./frame";

const TAU_WHEEL = 120;

type Listener = (t: number) => void;

let installed = false;
let target = 0;
let current = 0;
let written = -1;
let running = false;
let last = 0;
let tau = TAU_WHEEL;
// the page's last scroll position, measured when a glide is aimed, not on every step
let limit = 0;
const listeners = new Set<Listener>();

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const max = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function write(y: number, t: number) {
  // where the page will be: a target past either end is held there
  written = clamp(y, 0, limit);
  window.scrollTo({ top: y, behavior: "instant" });
  scrolledTo(y);
  for (const fn of listeners) fn(t);
}

function step(t: number) {
  // another mover (keys, anchors, find, a route change, the native scrollbar) moved the
  // page since the last step: it takes over
  const at = scrollTop();
  if (Math.abs(at - written) > 1.5) {
    running = false;
    target = current = at;
    return;
  }
  // a frame's timestamp can be a little earlier than the moment the glide began
  const dt = clamp(t - last, 0, 64);
  last = Math.max(last, t);
  current += (target - current) * (1 - Math.exp(-dt / tau));
  if (Math.abs(target - current) < 0.5) current = target;
  write(current, t);
  if (current !== target) schedule("scroll", step);
  else running = false;
}

/** Glide to `y`; under reduced motion, jump. `ease` is the time constant in ms. */
export function glideTo(y: number, ease = TAU_WHEEL) {
  limit = max();
  target = clamp(y, 0, limit);
  tau = ease;
  if (reduced()) {
    running = false;
    current = target;
    write(target, performance.now());
    return;
  }
  if (!running) {
    running = true;
    current = written = window.scrollY;
    last = performance.now();
    schedule("scroll", step);
  }
}

/** Called in the frame a glide moves the page, so the ruler is drawn in that frame. */
export function onGlideWrite(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Whether an element's overflow lets it scroll vertically. Its computed overflow is read
// once and kept: reading it on every wheel event recalculated style each time.
const scrollable = new WeakMap<Element, boolean>();
const canScroll = (n: Element) => {
  let v = scrollable.get(n);
  if (v === undefined) {
    const oy = getComputedStyle(n).overflowY;
    v = oy === "auto" || oy === "scroll";
    scrollable.set(n, v);
  }
  return v;
};

// An element that can still scroll this way keeps the wheel. Only the ancestors whose
// overflow scrolls are measured.
function scrollsItself(node: EventTarget | null, dy: number) {
  for (
    let n = node instanceof Element ? node : null;
    n && n !== document.body && n !== document.documentElement;
    n = n.parentElement
  ) {
    if (!canScroll(n) || n.scrollHeight <= n.clientHeight + 1) continue;
    if (dy > 0 ? n.scrollTop + n.clientHeight < n.scrollHeight - 1 : n.scrollTop > 0) return true;
  }
  return false;
}

/** Install the site's glide once; later calls do nothing. */
export function installGlide() {
  if (installed) return;
  installed = true;
  target = current = window.scrollY;
  window.addEventListener(
    "wheel",
    (e) => {
      if (reduced() || e.ctrlKey || e.defaultPrevented) return;
      // a dialog open over the page (the search, the menu) scrolls itself
      if (e.target instanceof Element && e.target.closest("dialog[open]")) return;
      let dy = e.deltaY;
      let dx = e.deltaX;
      if (e.deltaMode === 1) {
        dy *= 16;
        dx *= 16;
      } else if (e.deltaMode === 2) {
        dy *= window.innerHeight;
        dx *= window.innerHeight;
      }
      if (dy === 0 || Math.abs(dx) > Math.abs(dy) || scrollsItself(e.target, dy)) return;
      e.preventDefault();
      glideTo((running ? target : window.scrollY) + dy);
    },
    { passive: false },
  );
}
