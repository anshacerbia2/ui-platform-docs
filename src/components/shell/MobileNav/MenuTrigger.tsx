"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { loadIndex } from "@/shared/lib/search";
import styles from "./MobileNav.module.scss";

// The menu loads the first time it opens, never with the page.
const MenuDialog = dynamic(() => import("./MenuDialog").then((m) => m.MenuDialog), {
  ssr: false,
});

// A touch on the cell starts loading the menu and its index.
const warm = () => {
  void import("./MenuDialog");
  void loadIndex().catch(() => {});
};

/**
 * The nav strip's menu cell, on a narrow screen where the strip's links have left (TDD
 * docs-site D22). A touch on it starts loading the menu and the index it lists pages from.
 */
export function MenuTrigger({ version }: { version: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        onPointerDown={warm}
        onPointerEnter={warm}
        onFocus={warm}
      >
        <span className={styles.lines} aria-hidden="true">
          <i />
          <i />
        </span>
        <span className="u-visually-hidden">Menu</span>
      </button>
      {open ? <MenuDialog version={version} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
