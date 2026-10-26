"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { NAV_LINE, SHEET_SELECTOR } from "@/shared/lib/chrome";
import { useHere } from "@/shared/lib/useHere";

type Found = { ids: string[]; names: string[] };
type Sheets = Found & { here: string | null; index: number };

const HereContext = createContext<Sheets | null>(null);
const NONE: Found = { ids: [], names: [] };

/** Reads one page's sheets from the DOM once it has mounted (the DOM is the source). */
function SheetScan({ onFound }: { onFound: (found: Found) => void }) {
  useEffect(() => {
    const found = [...document.querySelectorAll<HTMLElement>(SHEET_SELECTOR)].filter((s) => s.id);
    onFound({ ids: found.map((s) => s.id), names: found.map((s) => s.dataset.sheet ?? s.id) });
  }, [onFound]);
  return null;
}

/**
 * The page's one "here" (SCROLL.md 6.9; TDD docs-site D12, D14): it finds the
 * page's sheets (`main [data-sheet]`) after each navigation, decides the
 * current one with useHere, and marks it `data-here` for its section bar. The
 * contents, the nav readout, and the section bars read this provider; the ruler
 * runs the same `currentSection` in the frame it draws.
 */
export function HereProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sheets, setSheets] = useState<Found>(NONE);
  const here = useHere(sheets.ids, NAV_LINE);
  useEffect(() => {
    for (const id of sheets.ids) {
      const sheet = document.getElementById(id);
      if (!sheet) continue;
      if (id === here) sheet.setAttribute("data-here", "");
      else sheet.removeAttribute("data-here");
    }
  }, [here, sheets.ids]);
  const index = here ? sheets.ids.indexOf(here) : -1;
  return (
    <HereContext value={{ ...sheets, here, index }}>
      <SheetScan key={pathname} onFound={setSheets} />
      {children}
    </HereContext>
  );
}

/** The page's sheets and the one that is here, or null outside a HereProvider. */
export function useSheets(): Sheets | null {
  return useContext(HereContext);
}
