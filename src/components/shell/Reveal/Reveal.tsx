"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import { installGlide } from "@/shared/lib/glide";

// The finest blocks of a documentation page (annex A 3.2): the page head's
// parts, each sheet's bar, and every block of a sheet's body. Other sticky
// elements never rise; a sheet's bar rises with its content (the owner, 2026-10-28).
const BLOCKS =
  "main > header > *, main [data-sheet-bar], main [data-sheet-body] > *, main > nav, main > p";
const STAGGER = 80;
const MAX_STEPS = 8;
const REST = 1100;
// The page shows once its fonts have loaded, so no line reflows while it rises (a
// fallback face is narrower: the hero's lede took one more line when Inter arrived),
// but never waits longer than this (the owner, 2026-10-28).
const FONT_WAIT = 800;

/** One page's reveal: before paint, mark its blocks, then let the page show. */
function PageReveal() {
  useLayoutEffect(() => {
    const doc = document.documentElement;
    const booted = () => doc.setAttribute("data-sq-booted", "");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      booted();
      return;
    }
    let found = [...document.querySelectorAll<HTMLElement>(BLOCKS)];
    // keep the finest blocks: drop any block that holds another
    found = found.filter((a) => !found.some((b) => b !== a && a.contains(b)));
    found = found.filter(
      (n) => n.hasAttribute("data-sheet-bar") || getComputedStyle(n).position !== "sticky",
    );
    for (const n of found) n.setAttribute("data-sq-reveal", "");

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
    let live = true;
    void Promise.race([
      document.fonts.ready,
      new Promise((done) => timers.push(window.setTimeout(done, FONT_WAIT))),
    ]).then(() => {
      if (!live) return;
      booted();
      found.forEach((n) => rise.observe(n));
    });

    return () => {
      live = false;
      rise.disconnect();
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
 * view (annex A 3.1-3.4). The rules are drawn from the first paint, never
 * animated (2.2). It runs again after each App Router navigation. Under reduced
 * motion nothing rises, and the page is never held hidden.
 */
export function Reveal() {
  useEffect(() => {
    installGlide();
  }, []);
  return <PageReveal key={usePathname()} />;
}
