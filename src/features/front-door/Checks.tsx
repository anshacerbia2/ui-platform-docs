"use client";

import { useEffect, useRef, useState } from "react";
import { Progress } from "@/components/system/Progress";

const TOTAL = 12;
// The panel's cycle in the motion world: its content goes out, comes back in (the body,
// then the foot), the checks run from none to all, and it holds; then again.
const OUT = 260;
const SETTLE = 480;
const RUN = 1200;
const HOLD = 2400;

/** Slow off the mark, slow into the end: the run reads as one movement. */
const ease = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/**
 * The specimen's checks (the owner, 2026-10-30). Full and still in every world but
 * motion, where, while motion is the world on show, they keep the panel's cycle: the
 * panel's content is marked out and fades, then in again, its body at once and its foot
 * just after (FrontDoor.module.scss); then the checks run from none to all. The bar and
 * its count are one clock, a frame at a time: the bar fills by the eased share and the
 * count is the checks that share has passed, so "12 of 12" lands as the bar does. (The
 * Progress's own transition is off here, so it never trails the count.) Without a
 * script, or under reduced motion, everything stays in and full.
 */
export function Checks() {
  const [share, setShare] = useState(1);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = root.current;
    const world = node?.closest<HTMLElement>("[data-world]");
    const panel = node?.closest<HTMLElement>("[role='tabpanel']");
    const card = node?.closest<HTMLElement>("[inert]");
    if (!node || world?.dataset.world !== "motion" || !panel || !card) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    let frame = 0;
    const later = (ms: number, next: () => void) => {
      timer = window.setTimeout(next, ms);
    };
    const onShow = () => !panel.inert;

    // off show: in and full, and the cycle starts afresh when it is back
    const rest = () => {
      card.removeAttribute("data-out");
      setShare(1);
      later(400, () => (onShow() ? out() : rest()));
    };
    const out = () => {
      card.setAttribute("data-out", "");
      later(OUT, () => {
        setShare(0);
        card.removeAttribute("data-out");
        later(SETTLE, run);
      });
    };
    const run = () => {
      let start = 0;
      const step = (t: number) => {
        if (!onShow()) return rest();
        start ||= t;
        const done = Math.min(1, (t - start) / RUN);
        setShare(ease(done));
        if (done < 1) frame = requestAnimationFrame(step);
        else later(HOLD, () => (onShow() ? out() : rest()));
      };
      frame = requestAnimationFrame(step);
    };

    rest();
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      card.removeAttribute("data-out");
    };
  }, []);

  const passed = Math.floor(share * TOTAL + 1e-9);
  return (
    <div ref={root}>
      <Progress
        label="Checks"
        value={share * TOTAL}
        max={TOTAL}
        valueText={`${passed} of ${TOTAL}`}
        scheme="success"
      />
    </div>
  );
}
