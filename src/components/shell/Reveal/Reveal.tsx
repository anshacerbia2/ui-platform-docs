"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import { installGlide } from "@/shared/lib/glide";

// The finest blocks of a documentation page (annex A 3.2): the page head's
// parts and every block of a sheet's body. Sticky elements never rise.
const BLOCKS = "main > header > *, main [data-sheet-body] > *, main > nav, main > p";
const SHEETS = "main [data-sheet]";
const STAGGER = 80;
const MAX_STEPS = 8;
const REST = 1100;

/** One page's reveal: before paint, mark its blocks, then let the page show. */
function PageReveal() {
  useLayoutEffect(() => {
    const doc = document.documentElement;
    const booted = () => doc.setAttribute("data-sq-booted", "");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      doc.removeAttribute("data-sq-draw");
      booted();
      return;
    }
    doc.setAttribute("data-sq-draw", "");
    let found = [...document.querySelectorAll<HTMLElement>(BLOCKS)];
    // keep the finest blocks: drop any block that holds another
    found = found.filter((a) => !found.some((b) => b !== a && a.contains(b)));
    found = found.filter((n) => getComputedStyle(n).position !== "sticky");
    for (const n of found) n.setAttribute("data-sq-reveal", "");
    booted();

    const timers: number[] = [];
    const rise = new IntersectionObserver(
      (entries) => {
        const shown = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .toSorted((a, b) =>
            a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
          );
        shown.forEach((n, i) => {
          rise.unobserve(n);
          const delay = Math.min(i, MAX_STEPS) * STAGGER;
          n.style.setProperty("--sq-d", `${delay}ms`);
          n.setAttribute("data-sq-reveal", "in");
          // clear every trace once risen (a block still lowered lengthens the page, so the ruler measures again)
          timers.push(
            window.setTimeout(() => {
              n.removeAttribute("data-sq-reveal");
              n.style.removeProperty("--sq-d");
              window.dispatchEvent(new Event("sq:layout"));
            }, REST + delay),
          );
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.12 },
    );
    found.forEach((n) => rise.observe(n));

    // Each sheet's rule draws in once, when 12% of the sheet shows above the bottom 18%.
    const draw = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-drawn", "");
          draw.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -18% 0px", threshold: 0.12 },
    );
    document.querySelectorAll(SHEETS).forEach((s) => draw.observe(s));

    return () => {
      rise.disconnect();
      draw.disconnect();
      for (const t of timers) window.clearTimeout(t);
      for (const n of found) {
        n.removeAttribute("data-sq-reveal");
        n.style.removeProperty("--sq-d");
      }
    };
  }, []);

  return null;
}

/**
 * The chrome's motion on every route (TDD docs-site D14): the wheel glide
 * (installed once), the page's blocks rising into place as they first enter the
 * view (annex A 3.1-3.4), and each sheet's rule drawing in once (2.2). It runs
 * again after each App Router navigation. Under reduced motion nothing rises or
 * draws, and the page is never held hidden.
 */
export function Reveal() {
  useEffect(() => {
    installGlide();
  }, []);
  return <PageReveal key={usePathname()} />;
}
