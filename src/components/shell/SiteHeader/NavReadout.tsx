"use client";

import { useSheets } from "@/components/shell/Here";
import styles from "./SiteHeader.module.scss";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "Sheet NN/MM": the nav's readout of the page's one "here" (SCROLL.md 2.7).
 * It is decoration for sighted readers; the contents and the section bars
 * carry the same fact accessibly. A page without sheets shows none.
 */
export function NavReadout() {
  const sheets = useSheets();
  if (!sheets || sheets.ids.length === 0) return null;
  return (
    <span className={styles.readout} aria-hidden="true">
      <i />
      Sheet <b>{pad(Math.max(0, sheets.index) + 1)}</b>/{pad(sheets.ids.length)}
    </span>
  );
}
