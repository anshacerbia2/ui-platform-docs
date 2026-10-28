"use client";

import { useSheets } from "@/components/shell/Here";
import styles from "./SiteHeader.module.scss";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "Sheet NN/MM": the nav's readout of the page's one "here" (annex A 2.7).
 * It is decoration for sighted readers; the contents and the section bars
 * carry the same fact accessibly. A page without sheets shows none. Until the page's
 * scan has found its sheets, it reads the count the server gave (`total`) and the
 * first sheet, so the server draws it whole and it never appears after hydration.
 */
export function NavReadout({ total }: { total: number }) {
  const sheets = useSheets();
  const found = sheets?.ids.length ?? 0;
  const count = found || total;
  if (!count) return null;
  const index = found && sheets ? Math.max(0, sheets.index) : 0;
  return (
    <span className={styles.readout} aria-hidden="true">
      <i />
      Sheet <b>{pad(index + 1)}</b>/{pad(count)}
    </span>
  );
}
