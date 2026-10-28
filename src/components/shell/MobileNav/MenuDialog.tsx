"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Close, GitHub, Search } from "@/components/docs/Icons";
import { Logo } from "@/components/docs/Logo";
import { OPEN_SEARCH } from "@/components/shell/Search";
import { ModeSwitch } from "@/components/shell/SiteHeader/ModeSwitch";
import { afterExit } from "@/shared/lib/dialog";
import { loadIndex, type SearchRow } from "@/shared/lib/search";
import { NAV_LINKS, REPOSITORY_URL } from "@/shared/lib/site";
import styles from "./MobileNav.module.scss";

// The pages each area lists, from the search index: no page carries them.
const PAGES: Record<string, (r: SearchRow) => boolean> = {
  "/primitives": (r) => r.k === "Primitive",
  "/components": (r) => r.k === "Component",
  "/tokens": (r) => r.k === "Page" && r.h.startsWith("/tokens"),
};

const inArea = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/**
 * The menu that stands in for the nav strip on a narrow screen (TDD docs-site D22): a
 * native modal dialog over the whole screen, its own bar where the strip was, a search
 * row, the five areas set large and numbered, the current one marked and open, each
 * opening onto its pages, then the mode, the repository and the call to action.
 */
export function MenuDialog({ version, onClose }: { version: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [rows, setRows] = useState<SearchRow[] | null>(null);
  const [open, setOpen] = useState(
    () => NAV_LINKS.find((l) => PAGES[l.href] && inArea(pathname, l.href))?.href ?? null,
  );

  useLayoutEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
    return () => d?.close();
  }, []);

  useEffect(() => {
    let live = true;
    loadIndex().then(
      (r) => live && setRows(r),
      () => {},
    );
    return () => {
      live = false;
    };
  }, []);

  const pages = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(PAGES).map(([href, test]) => [
          href,
          (rows ?? []).filter(test).toSorted((a, b) => a.t.localeCompare(b.t)),
        ]),
      ),
    [rows],
  );

  const close = () => dialog.current?.close();
  // any navigation, whichever link made it, closes the menu
  const opened = useRef(pathname);
  useEffect(() => {
    if (pathname !== opened.current) dialog.current?.close();
  }, [pathname]);
  const search = () => {
    close();
    window.dispatchEvent(new Event(OPEN_SEARCH));
  };

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-label="Menu"
      data-lock=""
      onClose={() => afterExit(dialog.current, onClose)}
    >
      <div className={styles.frame}>
        <div className={styles.bar}>
          <Link href="/" className={styles.brand} onClick={close}>
            <Logo size={24} />
            <span>Scnehaux UI</span>
          </Link>
          <span className={styles.version}>{version}</span>
          <button type="button" className={styles.close} onClick={close}>
            <Close size={18} />
            <span className="u-visually-hidden">Close the menu</span>
          </button>
        </div>

        <button type="button" className={styles.search} onClick={search}>
          <Search size={20} />
          <span>Search the docs</span>
          <span className={styles.searchHint}>pages · components · tokens</span>
        </button>

        <nav aria-label="Documentation" className={styles.nav}>
          <ol className={styles.areas}>
            {NAV_LINKS.map((link, i) => {
              const list = PAGES[link.href] ? pages[link.href] : null;
              const current = inArea(pathname, link.href);
              const expanded = open === link.href;
              const id = `menu-pages-${i}`;
              return (
                <li
                  key={link.href}
                  className={styles.area}
                  data-current={current || undefined}
                  data-open={expanded || undefined}
                >
                  <div className={styles.row}>
                    <span className={styles.no}>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                    </span>
                    <Link
                      href={link.href}
                      className={styles.areaLink}
                      aria-current={pathname === link.href ? "page" : undefined}
                      onClick={close}
                    >
                      {link.label}
                    </Link>
                    {list ? (
                      <button
                        type="button"
                        className={styles.toggle}
                        aria-expanded={expanded}
                        aria-controls={id}
                        onClick={() => setOpen(expanded ? null : link.href)}
                      >
                        <span className={styles.count}>{rows ? `${list.length} pages` : "…"}</span>
                        <span className={styles.plus} aria-hidden="true" />
                        <span className="u-visually-hidden">
                          {expanded ? "Hide" : "Show"} the {link.label.toLowerCase()} pages
                        </span>
                      </button>
                    ) : null}
                  </div>
                  {list ? (
                    <div id={id} className={styles.pages} inert={!expanded}>
                      <ul>
                        {list.map((page) => (
                          <li key={page.h}>
                            <Link
                              href={page.h as Route}
                              className={styles.page}
                              aria-current={pathname === page.h ? "page" : undefined}
                              onClick={close}
                            >
                              {page.t}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className={styles.foot}>
          <a href={REPOSITORY_URL} className={styles.footIcon} aria-label="GitHub">
            <GitHub size={20} />
          </a>
          <ModeSwitch />
        </div>
      </div>
    </dialog>
  );
}
