"use client";

import { useEffect, useRef, useState } from "react";

const HEX = "0123456789ABCDEF";
// A label reads as hash characters for 120ms, then a letter resolves every 45ms
// (scnehaux-design scnx-platform square.js, "Shuffle").
const LEAD = 120;
const STEP = 45;

/**
 * A nav link's or a call to action's label, verified on hover and on keyboard
 * focus: its letters read as hash characters, then resolve left to right. The
 * accessible name stays the real label (the shuffled copy is hidden from
 * assistive technology), and under reduced motion nothing shuffles.
 */
export function Shuffle({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(children);
  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let start = 0;
    const step = (frameT: number) => {
      // a frame's timestamp can precede the hover that started the run
      const t = Math.max(frameT, start);
      const tick = Math.floor((t - start) / 50);
      let done = true;
      const out = [...children]
        .map((ch, k) => {
          if (ch.trim() && t < start + LEAD + k * STEP) {
            done = false;
            return HEX[(k * 7 + tick * 13 + ((k * tick) % 5)) & 15];
          }
          return ch;
        })
        .join("");
      setShown(out);
      raf = done ? 0 : requestAnimationFrame(step);
    };
    const run = () => {
      if (raf || reduce.matches) return;
      start = performance.now();
      raf = requestAnimationFrame(step);
    };
    const onFocus = () => {
      if (host.matches(":focus-visible")) run();
    };
    host.addEventListener("pointerenter", run);
    host.addEventListener("focus", onFocus);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      host.removeEventListener("pointerenter", run);
      host.removeEventListener("focus", onFocus);
    };
  }, [children]);
  return (
    <span ref={ref}>
      <span aria-hidden="true">{shown}</span>
      <span className="u-visually-hidden">{children}</span>
    </span>
  );
}
