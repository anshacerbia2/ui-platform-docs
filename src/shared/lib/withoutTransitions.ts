"use client";

const ATTRIBUTE = "data-sq-switching";
// a switch that changes nothing (the mode already chosen) ends here
const FALLBACK_MS = 400;
let pending = 0;

/**
 * Runs `change` (a theme or mode switch) with every transition off, and turns them
 * back on two frames after a theme root has taken its new theme or mode: by then the
 * new values have painted. Without it each part eases from the old theme's colours to
 * the new ones at its own duration, and the page flickers through a mix of both
 * (utilities/_switching.scss holds the rule).
 */
export function withoutTransitions(change: () => void) {
  const root = document.documentElement;
  const id = ++pending;
  root.setAttribute(ATTRIBUTE, "");
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    observer.disconnect();
    window.clearTimeout(fallback);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (id === pending) root.removeAttribute(ATTRIBUTE);
      }),
    );
  };
  const observer = new MutationObserver(finish);
  observer.observe(root, {
    subtree: true,
    attributes: true,
    attributeFilter: ["data-scnx-theme", "data-scnx-resolved-mode"],
  });
  const fallback = window.setTimeout(finish, FALLBACK_MS);
  change();
}
