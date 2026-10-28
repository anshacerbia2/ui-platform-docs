"use client";

import { useEffect, useState } from "react";
import { schedule, scrollTop, unschedule } from "./frame";

/**
 * The page's one "here" (TDD docs-site annex A 6.9): the last
 * section whose top line has reached the line under the fixed header. Where the
 * page ends first, a section counts once its line is as high as it can go. Before
 * any section has reached the line, the first section is here.
 *
 * Half a pixel is a threshold, not rounding: section tops are often fractional.
 */
export function currentSection(
  tops: number[],
  scrollY: number,
  maxScroll: number,
  line: number,
): number {
  let here = 0;
  tops.forEach((top, index) => {
    // The highest point this section's line reaches on screen: the header line, or
    // where it stops when the page cannot scroll further.
    const highest = Math.max(line, top - maxScroll);
    if (top - scrollY <= highest + 0.5) here = index;
  });
  return here;
}

/**
 * The id of the section that is here, following scroll, resize, and the URL hash.
 * The sections' places in the document are measured only when the layout can have
 * changed (a resize of the page, a font, a block that finished rising); a scroll
 * reads nothing from the DOM and decides from those places and the frame's scroll
 * position, in the read phase of the site's one frame (shared/lib/frame.ts).
 */
export function useHere(ids: string[], line: number): string | null {
  const [here, setHere] = useState<string | null>(ids[0] ?? null);
  const key = ids.join(" ");
  useEffect(() => {
    const list = key ? key.split(" ") : [];
    let tops: number[] | null = null;
    let maxScroll = 0;
    const measure = () => {
      const elements = list.map((id) => document.getElementById(id));
      if (elements.some((e) => !e)) {
        tops = null;
        return;
      }
      const y = scrollTop();
      tops = elements.map((e) => (e as HTMLElement).getBoundingClientRect().top + y);
      maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    };
    const decide = () => {
      if (!tops) measure();
      if (!tops) return;
      setHere(list[currentSection(tops, scrollTop(), maxScroll, line)] ?? null);
    };
    const onScroll = () => schedule("read", decide);
    const onLayout = () => {
      tops = null;
      schedule("read", decide);
    };
    decide();
    const resize = new ResizeObserver(onLayout);
    resize.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onLayout);
    window.addEventListener("hashchange", onScroll);
    window.addEventListener("sq:layout", onLayout);
    void document.fonts?.ready.then(onLayout);
    return () => {
      unschedule("read", decide);
      resize.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("hashchange", onScroll);
      window.removeEventListener("sq:layout", onLayout);
    };
  }, [key, line]);
  return here;
}
