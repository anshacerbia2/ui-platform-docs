"use client";

import { useEffect, useState } from "react";

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

/** The id of the section that is here, following scroll, resize, and the URL hash. */
export function useHere(ids: string[], line: number): string | null {
  const [here, setHere] = useState<string | null>(ids[0] ?? null);
  const key = ids.join(" ");
  useEffect(() => {
    const list = key ? key.split(" ") : [];
    let frame = 0;
    const measure = () => {
      frame = 0;
      const elements = list.map((id) => document.getElementById(id));
      if (elements.some((e) => !e)) return;
      const tops = elements.map(
        (e) => (e as HTMLElement).getBoundingClientRect().top + window.scrollY,
      );
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      setHere(list[currentSection(tops, window.scrollY, maxScroll, line)] ?? null);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
    };
  }, [key, line]);
  return here;
}
