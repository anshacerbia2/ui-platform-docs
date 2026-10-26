// Wheel glide (TDD docs-site D14; docs/designs/SCROLL.md
// 4): every wheel input, mouse or trackpad, moves a target and the page
// eases toward it with a 120ms time constant, landing within 0.5px. Left to the
// browser: ctrl or pinch zoom, a mostly horizontal swipe, an element under the
// pointer that can still scroll that way, an event another handler took, and
// reduced motion. Keys, anchors, find, and the native scrollbar move the page
// directly, and a glide in progress yields to them. One instance for the site.

const TAU_WHEEL = 120;

type Listener = (t: number) => void;

let installed = false;
let target = 0;
let current = 0;
let written = -1;
let running = false;
let last = 0;
let tau = TAU_WHEEL;
const listeners = new Set<Listener>();

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const max = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function write(y: number, t: number) {
  written = y;
  window.scrollTo({ top: y, behavior: "instant" });
  for (const fn of listeners) fn(t);
}

function step(t: number) {
  const dt = Math.min(64, t - last);
  last = t;
  current += (target - current) * (1 - Math.exp(-dt / tau));
  if (Math.abs(target - current) < 0.5) current = target;
  write(current, t);
  if (current !== target) requestAnimationFrame(step);
  else running = false;
}

/** Glide to `y`; under reduced motion, jump. `ease` is the time constant in ms. */
export function glideTo(y: number, ease = TAU_WHEEL) {
  target = clamp(y, 0, max());
  tau = ease;
  if (reduced()) {
    running = false;
    current = target;
    write(target, performance.now());
    return;
  }
  if (!running) {
    running = true;
    current = window.scrollY;
    last = performance.now();
    requestAnimationFrame(step);
  }
}

/** Called in the frame a glide moves the page, so the ruler is drawn in that frame. */
export function onGlideWrite(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// An element that can still scroll this way keeps the wheel.
function scrollsItself(node: EventTarget | null, dy: number) {
  for (
    let n = node instanceof Element ? node : null;
    n && n !== document.body && n !== document.documentElement;
    n = n.parentElement
  ) {
    const oy = getComputedStyle(n).overflowY;
    if ((oy === "auto" || oy === "scroll") && n.scrollHeight > n.clientHeight + 1) {
      if (dy > 0 ? n.scrollTop + n.clientHeight < n.scrollHeight - 1 : n.scrollTop > 0) return true;
    }
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
  // Any other mover (keys, anchors, find, a route change, the native scrollbar) takes over.
  window.addEventListener(
    "scroll",
    () => {
      if (Math.abs(window.scrollY - written) <= 1.5) return;
      running = false;
      target = current = window.scrollY;
    },
    { passive: true },
  );
}
