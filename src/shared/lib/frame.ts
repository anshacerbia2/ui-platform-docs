// One frame for the whole site (the owner, 2026-10-28: no layout thrashing). Every
// module that moves the page, measures it or draws on it schedules here instead of
// calling requestAnimationFrame itself, and each frame runs in three phases:
//
//   scroll  the page is moved (the wheel glide), while layout is still clean;
//   read    every measurement, against that one layout;
//   write   every style and attribute change, after all reads.
//
// So no read follows a write within a frame, and the browser lays the page out once,
// when it renders, instead of synchronously in the middle of a script. A task added
// while the frame runs joins a later phase of the same frame, or the next frame if its
// phase has already run. The scroll position is read at most once a frame (or taken from
// the glide that set it), and shared.

export type Phase = "scroll" | "read" | "write";
type Task = (t: number) => void;

const ORDER: Phase[] = ["scroll", "read", "write"];
const queues: Record<Phase, Set<Task>> = { scroll: new Set(), read: new Set(), write: new Set() };
let raf = 0;
let running: Phase | null = null;
let y: number | null = null;

function flush(t: number) {
  raf = 0;
  y = null;
  for (const phase of ORDER) {
    running = phase;
    const tasks = [...queues[phase]];
    queues[phase].clear();
    for (const task of tasks) task(t);
  }
  running = null;
  if (!raf && ORDER.some((p) => queues[p].size)) raf = requestAnimationFrame(flush);
}

/** Runs `task` in `phase` of the next frame, or of this one if that phase is still ahead. */
export function schedule(phase: Phase, task: Task) {
  queues[phase].add(task);
  if (running && ORDER.indexOf(phase) > ORDER.indexOf(running)) return;
  if (!raf) raf = requestAnimationFrame(flush);
}

/** Takes `task` back out of `phase` before it runs. */
export function unschedule(phase: Phase, task: Task) {
  queues[phase].delete(task);
}

/**
 * The page's scroll position this frame: as the glide set it, or read once, the first
 * time a task asks, and shared by every task after it. Outside a frame, read directly.
 */
export function scrollTop() {
  if (!running) return window.scrollY;
  y ??= window.scrollY;
  return y;
}

/** The glide moved the page to `top` in this frame's scroll phase. */
export function scrolledTo(top: number) {
  y = top;
}
