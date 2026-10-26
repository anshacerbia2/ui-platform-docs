"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { SHEET_SELECTOR } from "@/shared/lib/chrome";
import { mountRuler, type RulerClasses } from "./ruler";
import styles from "./RulerScrollbar.module.scss";

/** One page's ruler: built from its sheets when the page mounts, removed with it. */
function PageRuler() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    const sheets = [...document.querySelectorAll<HTMLElement>(SHEET_SELECTOR)].filter((s) => s.id);
    return mountRuler(
      host.current,
      sheets,
      document.querySelector<HTMLElement>("[data-sq-col]"),
      styles as unknown as RulerClasses,
    );
  }, []);
  return <div ref={host} className={styles.host} />;
}

/**
 * The ruler scrollbar and its section titles (TDD docs-site D15;
 * docs/designs/SCROLL.md 4-8): docs chrome, not a @scnx/system component. It
 * reads the page's sheets (`main [data-sheet]`) and is rebuilt after each App
 * Router navigation; it replaces the native scrollbar from 1024px up, and below
 * that, and without JavaScript, the native scrollbar stays.
 */
export function RulerScrollbar() {
  return <PageRuler key={usePathname()} />;
}
