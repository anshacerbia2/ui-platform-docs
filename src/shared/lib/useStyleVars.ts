"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Sets custom properties on an element through the CSSOM after render. The
 * site's Content-Security-Policy allows no style attribute in server HTML
 * (TDD docs-site D5), so every dynamic style goes through here.
 */
export function useStyleVars<T extends HTMLElement | SVGElement>(vars: Record<`--${string}`, string>) {
  const ref = useRef<T>(null);
  const serialized = JSON.stringify(vars);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    for (const [name, value] of Object.entries(JSON.parse(serialized) as Record<string, string>)) element.style.setProperty(name, value);
  }, [serialized]);
  return ref;
}
