// The ruler scrollbar and its section titles (TDD docs-site D15), as
// TDD docs-site annex A describes them (first ported from scnehaux-design scnx-platform
// square.js). A page-position ruler replaces the native scrollbar on
// the right edge, kept as an evidence ledger; the page's section titles stand
// beside it, letter by letter. The numbers below are the reference's
// expression-local values (guidance, ADR-UIP-VIS-002).
//
// No layout reads while scrolling: positions are measured on resize and
// cached, and a style is written only when it changes, through the CSSOM (the
// site's Content-Security-Policy allows no style attribute in HTML).

import { JUMP_LINE, NAV_LINE, RULER_MIN_WIDTH } from "@/shared/lib/chrome";
import { glideTo, onGlideWrite } from "@/shared/lib/glide";
import { currentSection } from "@/shared/lib/useHere";

const RAIL = 60;
const TOP = 60;
const BOTTOM = 14;
const NAV = NAV_LINE;
const SMALL = 16 / 34;
const UPRIGHT = SMALL * 1.12;
const TAU_MODE = 170;
const TAU_WHEEL = 120;
const TAU_DRAG = 80; // a drag glides too, closer behind the pointer
const SPREAD = 0.55; // share of a title's move spent staggering its letters
const DIM = 0.68; // a title not current: text at 68% still reads 4.5:1 or more in both modes
const DECODE_LEAD = 120;
const DECODE_STEP = 45; // a hovered title: hash for 120ms, then a letter resolves every 45ms
const HEX = "0123456789ABCDEF";
const CHECK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="square" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>';

/** The CSS Module class names the ruler's parts take. */
export type RulerClasses = Record<
  | "ruler"
  | "scale"
  | "tick"
  | "mark"
  | "window"
  | "now"
  | "cursor"
  | "labels"
  | "verified"
  | "jumps",
  string
>;

type Letter = { span: HTMLSpanElement; real: string; shown: string; w: number; c: number };
type Label = {
  sheet: HTMLElement;
  i: number;
  name: string;
  letters: Letter[];
  link: HTMLAnchorElement;
  mark: HTMLSpanElement;
  W: number;
  v: number;
  top: number;
  /** The scroll position a jump to the section lands at (see measureLayout). */
  jump: number;
  end: number;
  sBig: number;
  curY: number;
  span: number;
  limit: number;
  hang: number;
  stand: number;
  box: string;
  decode: number;
  settled: boolean;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const blend = (a: number[], b: number[], t: number) => a.map((v, j) => mix(v, b[j] ?? v, t));
const noop = () => {};
const ty = (y: number) => `translate3d(0, ${y.toFixed(1)}px, 0)`;
const written = new WeakMap<HTMLElement, Record<string, string>>();
// write a style only when it changes
const put = (node: HTMLElement, prop: string, value: string) => {
  const seen = written.get(node) ?? {};
  if (seen[prop] === value) return;
  seen[prop] = value;
  written.set(node, seen);
  node.style.setProperty(prop, value);
};
const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  attrs: Record<string, string> = {},
) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
};
/**
 * Where the capitals' centre sits relative to the centre of a letter's line box, in px
 * at `size`: the title letters are centred on their line box (line-height 1), which
 * also holds the room below the baseline, so a mark centred on the box sits low.
 * Measured from the face the letters render in.
 */
const capCentre = (sample: HTMLElement | undefined, size: number) => {
  if (!sample) return 0;
  const cs = getComputedStyle(sample);
  const g = document.createElement("canvas").getContext("2d");
  if (!g) return 0;
  g.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
  const m = g.measureText("H");
  const ascent = m.fontBoundingBoxAscent;
  const descent = m.fontBoundingBoxDescent;
  if (!Number.isFinite(ascent) || !Number.isFinite(descent)) return 0;
  // line-height 1: the content area is centred in a line box `size` tall
  const baseline = (size - (ascent + descent)) / 2 + ascent;
  return baseline - m.actualBoundingBoxAscent / 2 - size / 2;
};
const hash = (a: number, b: number, c: number) => {
  let h = (a * 73856093) ^ (b * 19349663) ^ (c * 83492791);
  h = (h ^ (h >>> 13)) * 1274126177;
  return (h ^ (h >>> 16)) & 15;
};

/**
 * Build the ruler for the page's sheets inside `host` and run it until the
 * returned function is called. `column` is the page column, whose right edge
 * bounds the free margin the titles may use.
 */
export function mountRuler(
  host: HTMLElement,
  sheets: HTMLElement[],
  column: HTMLElement | null,
  cls: RulerClasses,
): () => void {
  if (!sheets.length) return noop;
  const doc = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const wide = window.matchMedia(`(min-width: ${RULER_MIN_WIDTH}px)`);
  const cleanups: (() => void)[] = [];
  const listen = <T extends EventTarget>(
    target: T,
    type: string,
    fn: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions,
  ) => {
    target.addEventListener(type, fn, options);
    cleanups.push(() => target.removeEventListener(type, fn, options));
  };

  /* ---------- DOM ---------- */
  const rail = el("div", cls.ruler, {
    role: "scrollbar",
    tabindex: "0",
    "aria-controls": document.querySelector("main")?.id ?? "",
    "aria-orientation": "vertical",
    "aria-valuemin": "0",
    "aria-valuemax": "100",
    "aria-valuenow": "0",
    "aria-label": "Page position",
  });
  const scale = el("div", cls.scale, { "aria-hidden": "true" });
  const items: { n: HTMLElement; v: () => number }[] = [];
  for (let v = 0; v <= 100; v++) {
    const t = el("span", cls.tick);
    if (v % 5 === 0) {
      t.setAttribute("data-major", "");
      const b = el("b");
      b.textContent = String(v);
      t.append(el("i"), b);
    } else t.append(el("i"));
    scale.append(t);
    items.push({ n: t, v: () => v });
  }
  const win = el("div", cls.window, { "aria-hidden": "true" });
  const now = el("div", cls.now, { "aria-hidden": "true" });
  const pct = el("span");
  now.append(pct);
  rail.append(scale, win, now);
  const cursor = el("div", cls.cursor, { "aria-hidden": "true" });
  const layer = el("div", cls.labels, { "aria-hidden": "true" });
  const verified = el("div", cls.verified, { "aria-hidden": "true" });
  verified.innerHTML = CHECK;
  const jumps = el("nav", cls.jumps, { "aria-label": "Sections" });

  let request: () => void = noop;
  const labels: Label[] = sheets.map((s, i) => {
    const name = (s.dataset.sheet || s.id).toUpperCase();
    const letters = [...name].map((ch) => {
      // each letter names its title, so scripts/ruler-check.mjs can tell titles apart
      const span = el("span", "", { "data-title": String(i) });
      span.textContent = ch;
      layer.append(span);
      return { span, real: ch, shown: ch, w: 0, c: 0 };
    });
    const a = el("a", "", { href: `#${s.id}`, "aria-label": `Jump to ${s.dataset.sheet || s.id}` });
    jumps.append(a);
    const mark = el("span", cls.mark, { "data-state": "ahead" });
    mark.innerHTML = `<i></i>${CHECK}`;
    scale.append(mark);
    const L: Label = {
      sheet: s,
      i,
      name,
      letters,
      link: a,
      mark,
      W: 0,
      v: 0,
      top: 0,
      jump: 0,
      end: 0,
      sBig: 1,
      curY: 0,
      span: 12,
      limit: 0,
      hang: 0,
      stand: 0,
      box: "",
      decode: 0,
      settled: false,
    };
    // hovering or focusing a title at rest verifies it again, once per entry, never while it moves
    const verify = () => {
      if (reduce.matches || L.decode || !L.settled) return;
      L.decode = performance.now();
      request();
    };
    listen(a, "click", (event) => {
      const e = event as MouseEvent;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      history.replaceState(history.state, "", `#${s.id}`);
      // its section's line lands on the nav's line (annex A 6.12); glideTo jumps under reduced motion
      glideTo(L.jump);
    });
    listen(a, "pointerenter", verify);
    listen(a, "focus", verify);
    items.push({ n: mark, v: () => L.v });
    return L;
  });
  const last = labels.length - 1;
  host.append(layer, verified, jumps, rail, cursor);

  /* ---------- measure: on resize only, never while scrolling ---------- */
  let vw = 0;
  let vh = 0;
  let docH = 1;
  let maxScroll = 1;
  let H = 1;
  let big = 34;
  // a row of either stack: the small title size plus a quarter (annex A 6.1)
  let pitch = 20;
  let room = 0;
  // how far the capitals' centre sits from the line box's centre, at the base size
  let capShift = 0;
  let scaleState = "";
  let tops: number[] = [];
  const measureLetters = () => {
    big = clamp(Math.round(vw * 0.0177), 22, 34);
    pitch = big * SMALL * 1.25;
    layer.style.setProperty("--sq-label-size", `${big}px`);
    capShift = capCentre(labels[0]?.letters[0]?.span, big);
    for (const L of labels) {
      let c = 0;
      // offsetWidth is the laid-out width at the base size, before scale and rotation
      for (const l of L.letters) {
        if (l.shown !== l.real) l.span.textContent = l.shown = l.real;
        l.w = l.span.offsetWidth;
        l.c = c;
        c += l.w;
      }
      L.W = c;
    }
  };
  const measureLayout = () => {
    vw = doc.clientWidth;
    vh = window.innerHeight;
    docH = Math.max(1, doc.scrollHeight);
    maxScroll = Math.max(1, docH - vh);
    H = Math.max(1, vh - TOP - BOTTOM);
    for (const L of labels) {
      L.top = L.sheet.getBoundingClientRect().top + window.scrollY;
      // a jump lands the section's line on the nav's own line (JUMP_LINE), less the
      // sheet's scroll-margin: the stylesheet's, so the ruler, the contents and a #hash
      // land alike (a first sheet with no rule of its own takes 1px and lands at the top)
      L.jump = L.top - JUMP_LINE - (parseFloat(getComputedStyle(L.sheet).scrollMarginTop) || 0);
      // its place on the scale: where its line sits in the document
      L.v = L.i === 0 ? 0 : clamp((L.top / docH) * 100, 0, 100);
      // the highest its line gets on screen: under the nav, or where the page ends
      L.end = L.i === 0 ? -Infinity : Math.max(NAV, L.top - maxScroll);
    }
    tops = labels.map((L) => L.top);
    // the free margin between the column and the ruler
    room = vw - RAIL - (column ? column.getBoundingClientRect().right : vw - RAIL) - 16;
    for (const L of labels) {
      // the large title shrinks toward the free margin, never below 80%; where the margin
      // is narrower it overlaps the page
      L.sBig = clamp(room / Math.max(1, L.W), 0.8, 1);
      L.curY = 66 + L.i * pitch + big * L.sBig;
      // the lowest a standing title's foot may go: 8px above the next title waiting in the
      // stack (annex A 6.2), and the line at which it hangs clear of that limit. The first
      // title is current from the start and never stands, but every title needs a finite
      // limit: a NaN in any one place leaves its letters undrawn.
      L.limit =
        (L.i < last ? vh - 37 - (last - L.i - 1) * pitch - (big * SMALL) / 2 : vh - BOTTOM) - 8;
      L.hang = L.limit - L.W * UPRIGHT - 8;
      L.stand = 0;
      if (L.i === 0) continue;
      // a title lies down from a little below its current place until its line reaches the
      // nav; it never starts until 24px after the previous section's line has reached the nav
      const P = labels[L.i - 1]!;
      const before = P.i === 0 ? Infinity : P.end + (L.top - P.top) - L.end - 24;
      L.span = Math.max(12, Math.min(L.curY + big * L.sBig + 140 - NAV, before));
      // annex A 6.5, measured from the bottom stack: scrolling up, the standing title rides
      // down with its line until its foot meets the limit, waits there, and lies into its
      // place while its line runs on down its own standing length to the limit; scrolling
      // down, the reverse. If the line at which it hangs clear is below where 6.7 starts, the
      // title skips standing and goes from the stack to the current place directly.
      L.stand = L.hang >= L.end + L.span ? L.limit - L.hang : 0;
    }
    scaleState = "";
  };
  const measure = () => {
    vw = doc.clientWidth;
    measureLetters();
    measureLayout();
  };

  /* ---------- state ---------- */
  let mode = 0;
  let modeTarget = 0;
  let pointerY = -1;
  let dragging = false;
  let focused = false;
  let lastT = performance.now();
  let shownCur = -1;
  let lastY = -1;
  let lastMode = -1;
  const hoverY = (v: number) => TOP + (v / 100) * H;
  const progress = () => clamp((window.scrollY / maxScroll) * 100, 0, 100);
  // the page's one "here" (annex A 6.9), with the same rule and line as the HereProvider
  const currentIndex = () => currentSection(tops, window.scrollY, maxScroll, NAV);

  /* Where letter k of a title sits in each place it can be: [x, y, rotation, scale, tone]. */
  const across = (L: Label, k: number, y: number, s: number, t: number) => [
    vw - RAIL - L.W * s + (L.letters[k]!.c + L.letters[k]!.w / 2) * s,
    y,
    0,
    s,
    t,
  ];
  const upright = (L: Label, k: number, y: number, t: number) => [
    vw - 32,
    y + (L.W * UPRIGHT) / 2 - (L.letters[k]!.c + L.letters[k]!.w / 2) * UPRIGHT,
    -90,
    UPRIGHT,
    t,
  ];
  // letter k's share of a move: the last letter leaves first. Under reduced motion a title
  // does not fly letter by letter: each letter switches place at the move's midpoint.
  const stagger = (P: number, k: number, n: number) => {
    if (reduce.matches) return P >= 0.5 ? 1 : 0;
    const idx = n - 1 - k;
    const off = n > 1 ? (SPREAD * idx) / (n - 1) : 0;
    return ease(clamp((P - off) / (1 - SPREAD), 0, 1));
  };

  const frame = (t: number) => {
    const dt = Math.min(64, t - lastT);
    lastT = t;
    const kMode = reduce.matches ? 1 : 1 - Math.exp(-dt / TAU_MODE);
    mode = Math.abs(modeTarget - mode) < 0.002 ? modeTarget : mix(mode, modeTarget, kMode);
    const y = window.scrollY;
    const decoding = labels.some((L) => L.decode);
    if (y === lastY && mode === lastMode && !decoding) return mode !== modeTarget;
    lastY = y;
    lastMode = mode;
    const p = progress();
    const lineY = hoverY(p);
    const cur = currentIndex();

    // the scale: one transform at rest, placed once when folded, mixed only while folding
    const offset = lineY - (p / 100) * docH;
    if (mode === 0) {
      if (scaleState !== "rest") {
        for (const it of items) it.n.style.setProperty("transform", ty((it.v() / 100) * docH));
        scaleState = "rest";
      }
      put(scale, "transform", ty(offset));
    } else if (mode === 1) {
      if (scaleState !== "fold") {
        for (const it of items) it.n.style.setProperty("transform", ty(hoverY(it.v())));
        scaleState = "fold";
      }
      put(scale, "transform", "none");
    } else {
      scaleState = "mix";
      put(scale, "transform", "none");
      for (const it of items)
        it.n.style.setProperty(
          "transform",
          ty(mix((it.v() / 100) * docH + offset, hoverY(it.v()), mode)),
        );
    }
    // the ledger: read sections are verified, the one being read is ink
    if (cur !== shownCur || p >= 99.5) {
      const end = p >= 99.5;
      for (const L of labels)
        L.mark.dataset.state = L.i < cur || end ? "read" : L.i === cur ? "here" : "ahead";
      shownCur = cur;
    }
    const a = hoverY((y / docH) * 100);
    const b = hoverY(((y + vh) / docH) * 100);
    put(win, "transform", ty(a));
    put(win, "height", `${(b - a).toFixed(1)}px`);
    put(win, "opacity", mode.toFixed(3));
    put(now, "transform", ty(lineY));
    const readout = `${String(cur + 1).padStart(2, "0")} · ${String(Math.round(p)).padStart(3, "0")}%`;
    if (pct.textContent !== readout) {
      pct.textContent = readout;
      rail.setAttribute("aria-valuenow", String(Math.round(p)));
      rail.setAttribute(
        "aria-valuetext",
        `${Math.round(p)}%, ${labels[cur]!.sheet.dataset.sheet || labels[cur]!.sheet.id}`,
      );
    }
    put(cursor, "opacity", pointerY < 0 ? "0" : mode.toFixed(3));
    if (pointerY >= 0) put(cursor, "transform", ty(pointerY));

    /* Titles: every letter is placed from its section's line on screen (annex A 6). */
    const moveIn = labels.map((L) => ({
      sBig: L.sBig,
      curY: L.curY,
      C: L.i === 0 ? 1 : clamp((L.end + L.span - (L.top - y) + 0.5) / L.span, 0, 1),
    }));
    let check: { L: Label; y: number; s: number } | null = null;
    // the lowest point the previous title reaches on screen, letter by letter, this frame
    let tail = -Infinity;
    for (const L of labels) {
      const n = L.letters.length;
      const { sBig, curY, C } = moveIn[L.i]!;
      const stackY = vh - 37 - (last - L.i) * pitch;
      const pastY = 66 + pitch * 0.45 + L.i * pitch;
      const half = (L.W * UPRIGHT) / 2;
      const line = L.top - y;
      // standing, the title hangs from its line (top at line + 8), its foot stays at least 8px
      // above the next title waiting (limit), and its top at least 8px under its own current
      // place (annex A 6.2). The docs add one rule (TDD docs-site D15): a title also hangs
      // 8px under the previous title's lowest letter, and stands up only once that letter is
      // above its own hang line, so its whole standing place, foot on the limit, fits under
      // it. Where a section is shorter than the previous title standing (the docs' short
      // Status sheets, the Tokens page's many groups), the two would otherwise cross.
      const hangLine = Math.max(line, tail);
      const standY = clamp(hangLine + 8, curY + (big * sBig) / 2 + 8, L.limit - 2 * half) + half;
      const U = L.stand
        ? Math.min(clamp((L.limit - line) / L.stand, 0, 1), clamp((L.hang - tail) / L.stand, 0, 1))
        : 0;
      let lowest = -Infinity;
      // the current title leaves within the first 1 − SPREAD of the next title's move (6.8)
      const Q = labels[L.i + 1] ? clamp(moveIn[L.i + 1]!.C / (1 - SPREAD), 0, 1) : 0;
      const opening = modeTarget === 1;
      let whole = true;
      let settled = opening || mode === 0;
      if (L.decode && t > L.decode + DECODE_LEAD + (n - 1) * DECODE_STEP) L.decode = 0;
      for (let k = 0; k < n; k++) {
        const l = L.letters[k]!;
        const u = stagger(U, k, n);
        const c = stagger(C, k, n);
        const q = stagger(Q, k, n);
        let at = across(L, k, stackY, SMALL, DIM);
        at = blend(at, upright(L, k, standY, DIM), u);
        at = blend(at, across(L, k, curY, sBig, 1), c);
        at = blend(at, across(L, k, pastY, SMALL, DIM), q);
        // folded: every title lies at the point its section begins
        const mk = ease(clamp(mode * 1.4 - (0.4 * k) / Math.max(1, n - 1), 0, 1));
        if (mk > 0) at = blend(at, across(L, k, hoverY(L.v), SMALL, L.i === cur ? 1 : 0.86), mk);
        if (!opening && ((u > 0 && u < 1) || (c > 0 && c < 1) || (q > 0 && q < 1))) settled = false;
        let ch = l.real;
        if (L.decode && l.real !== " " && t < L.decode + DECODE_LEAD + k * DECODE_STEP)
          ch = HEX[hash(L.i, k, Math.floor((t - L.decode) / 50))]!;
        if (ch !== l.shown) l.span.textContent = l.shown = ch;
        if (c < 1 || q > 0 || L.decode) whole = false;
        const [x = 0, top = 0, turn = 0, size = 1, tone = 1] = at;
        put(
          l.span,
          "transform",
          `translate3d(${x.toFixed(1)}px, ${top.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${turn.toFixed(1)}deg) scale(${size.toFixed(3)})`,
        );
        put(
          l.span,
          "color",
          `color-mix(in oklab, var(--sq-text) ${(tone * 100).toFixed(0)}%, var(--sq-ground))`,
        );
        // how far the letter reaches below its centre: its width when turned upright
        lowest = Math.max(lowest, top + ((Math.abs(turn) > 45 ? l.w : big) * size) / 2);
      }
      tail = lowest;
      L.settled = settled;
      if (whole && mode < 0.05) check = { L, y: curY, s: sBig };
      // the jump link covers the title where it mostly is
      const place =
        mode > 0.5
          ? "hover"
          : Q > 0.5
            ? "past"
            : C > 0.5
              ? "current"
              : U > 0.5
                ? "upright"
                : "stack";
      const box =
        place === "hover"
          ? [vw - RAIL - L.W * SMALL, hoverY(L.v) - (big * SMALL) / 2, L.W * SMALL, big * SMALL]
          : place === "upright"
            ? [vw - 32 - (big * UPRIGHT) / 2, standY - half, big * UPRIGHT, half * 2]
            : place === "current"
              ? [vw - RAIL - L.W * sBig, curY - (big * sBig) / 2, L.W * sBig, big * sBig]
              : // in a stack the link is one row tall, so neighbouring links never overlap and
                // a click always reaches the title under the pointer
                [
                  vw - RAIL - L.W * SMALL,
                  (place === "past" ? pastY : stackY) - pitch / 2,
                  L.W * SMALL,
                  pitch,
                ];
      const key = box.map((v) => v.toFixed(0)).join(",");
      if (key !== L.box) {
        L.box = key;
        L.link.style.setProperty("transform", `translate(${box[0]}px, ${box[1]}px)`);
        L.link.style.setProperty("width", `${box[2]}px`);
        L.link.style.setProperty("height", `${box[3]}px`);
      }
    }
    // the check beside the current title, once it stands whole
    if (check) {
      const size = big * check.s * 0.62;
      const x = vw - RAIL - check.L.W * check.s - size * 1.25;
      put(
        verified,
        "transform",
        // centred on the capitals, not on the line box, which holds the descender's room too
        `translate3d(${x.toFixed(1)}px, ${(check.y + capShift * check.s - size / 2).toFixed(1)}px, 0)`,
      );
      put(verified, "width", `${size.toFixed(1)}px`);
      put(verified, "height", `${size.toFixed(1)}px`);
    }
    if (check && !verified.hasAttribute("data-on")) verified.setAttribute("data-on", "");
    else if (!check && verified.hasAttribute("data-on")) verified.removeAttribute("data-on");
    return mode !== modeTarget || labels.some((L) => L.decode);
  };
  // one loop, only while the fold animates; scrolling redraws in the frame it moves
  let looping = false;
  let raf = 0;
  const loop = (t: number) => {
    looping = false;
    if (frame(t)) request();
  };
  request = () => {
    if (!looping) {
      looping = true;
      raf = requestAnimationFrame(loop);
    }
  };
  cleanups.push(onGlideWrite((t) => wide.matches && frame(t)));
  const invalidate = () => {
    lastY = -1;
    request();
  };

  /* ---------- pointer ---------- */
  const toScroll = (yy: number, tau: number) =>
    glideTo(clamp((yy - TOP) / H, 0, 1) * maxScroll, tau);
  const enter = () => {
    modeTarget = 1;
    request();
  };
  const leave = () => {
    if (!dragging && !focused) {
      modeTarget = 0;
      pointerY = -1;
      invalidate();
    }
  };
  listen(rail, "pointerenter", enter);
  // moving from the ruler onto a title keeps it open, so the title can be read and verified
  listen(rail, "pointerleave", ((e: PointerEvent) => {
    pointerY = -1;
    if (jumps.contains(e.relatedTarget as Node)) invalidate();
    else leave();
  }) as EventListener);
  listen(jumps, "pointerover", ((e: PointerEvent) => {
    if ((e.target as Element).closest("a") && modeTarget > 0.5) enter();
  }) as EventListener);
  listen(jumps, "pointerout", ((e: PointerEvent) => {
    if (!rail.contains(e.relatedTarget as Node) && !jumps.contains(e.relatedTarget as Node))
      leave();
  }) as EventListener);
  listen(rail, "pointermove", ((e: PointerEvent) => {
    pointerY = e.clientY;
    if (dragging) toScroll(e.clientY, TAU_DRAG);
    invalidate();
  }) as EventListener);
  listen(rail, "pointerdown", ((e: PointerEvent) => {
    dragging = true;
    rail.setPointerCapture(e.pointerId);
    toScroll(e.clientY, TAU_WHEEL);
    enter();
  }) as EventListener);
  const up = () => {
    dragging = false;
  };
  listen(rail, "pointerup", up);
  listen(rail, "pointercancel", up);
  listen(rail, "lostpointercapture", () => {
    up();
    if (!rail.matches(":hover")) leave();
  });

  /* ---------- keyboard ---------- */
  listen(rail, "focus", () => {
    focused = true;
    enter();
  });
  listen(rail, "blur", () => {
    focused = false;
    leave();
  });
  listen(rail, "keydown", ((e: KeyboardEvent) => {
    const p = progress();
    const cur = currentIndex();
    let top: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight")
      top = ((p + (e.shiftKey ? 5 : 1)) / 100) * maxScroll;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft")
      top = ((p - (e.shiftKey ? 5 : 1)) / 100) * maxScroll;
    else if (e.key === "PageDown") top = labels[cur + 1]?.jump ?? maxScroll;
    else if (e.key === "PageUp")
      top =
        window.scrollY > labels[cur]!.jump + 4 ? labels[cur]!.jump : (labels[cur - 1]?.jump ?? 0);
    else if (e.key === "Home") top = 0;
    else if (e.key === "End") top = maxScroll;
    if (top === null) return;
    e.preventDefault();
    glideTo(top);
  }) as EventListener);

  /* ---------- lifecycle ---------- */
  const on = () => {
    const active = wide.matches;
    doc.dataset.ruler = active ? "on" : "off";
    for (const n of [rail, cursor, layer, verified, jumps]) n.hidden = !active;
    if (!active) return;
    measure();
    invalidate();
  };
  // a native scroll (keys, anchors, find) redraws on the next frame; a glide already redrew
  listen(window, "scroll", request, { passive: true });
  listen(window, "resize", () => {
    measure();
    invalidate();
  });
  listen(wide, "change", on);
  // content that grows (a font swap, a block still rising) moves the sections
  const resize = new ResizeObserver(() => {
    if (!wide.matches) return;
    measureLayout();
    invalidate();
  });
  resize.observe(document.body);
  cleanups.push(() => resize.disconnect());
  let relayout = 0;
  listen(window, "sq:layout", () => {
    cancelAnimationFrame(relayout);
    relayout = requestAnimationFrame(() => {
      if (wide.matches) {
        measureLayout();
        invalidate();
      }
    });
  });
  // `sq:draw` draws the current scroll position now, in this task: the overlap check
  // (scripts/ruler-check.mjs) scrolls and reads the titles without waiting for frames.
  listen(window, "sq:draw", () => {
    if (!wide.matches) return;
    lastY = -1;
    frame(performance.now());
  });
  on();
  void document.fonts?.ready.then(() => {
    if (host.isConnected) on();
  });

  return () => {
    cancelAnimationFrame(raf);
    cancelAnimationFrame(relayout);
    for (const fn of cleanups) fn();
    host.replaceChildren();
    delete doc.dataset.ruler;
  };
}
