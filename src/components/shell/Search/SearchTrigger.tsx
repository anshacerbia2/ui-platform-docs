"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Search } from "@/components/docs/Icons";
import { loadIndex } from "@/shared/lib/search";
import styles from "./Search.module.scss";

// The dialog and its index load the first time the search is wanted, never with the page.
const SearchDialog = dynamic(() => import("./SearchDialog").then((m) => m.SearchDialog), {
  ssr: false,
});

/** Opens the search from anywhere: the menu dispatches it. */
export const OPEN_SEARCH = "sq:search";

// Pointing at the cell or focusing it starts loading the dialog and the index.
const warm = () => {
  void import("./SearchDialog");
  void loadIndex().catch(() => {});
};

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/**
 * The nav strip's search cell (TDD docs-site D22): the icon and its shortcut, ⌘K on a
 * Mac and Ctrl K elsewhere, or "/" outside a field; the word is its name. The server
 * names the shortcut from the request (`shortcutFor`), so the cell is whole in the first
 * paint, never filled after hydration. Pointing at it or focusing it starts loading the
 * dialog and the index, so they are ready on the click.
 */
export function SearchTrigger({ shortcut }: { shortcut: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "/" && !e.metaKey && !e.ctrlKey && !typing(e.target)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH, onOpen);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        onPointerEnter={warm}
        onFocus={warm}
      >
        <Search size={16} />
        <span className={styles.label}>Search</span>
        <kbd>{shortcut}</kbd>
      </button>
      {open ? <SearchDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}
