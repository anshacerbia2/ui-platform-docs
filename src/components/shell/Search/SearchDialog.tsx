"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ArrowRight, Close } from "@/components/docs/Icons";
import { ScrollArea } from "@/components/docs/ScrollArea";
import { afterExit } from "@/shared/lib/dialog";
import { KINDS, loadIndex, rank, type SearchHit, type SearchRow } from "@/shared/lib/search";
import styles from "./Search.module.scss";

const TRIES = ["button", "tooltip", "surface.raised", "spacing", "motion"];
const JUMPS: { t: string; h: Route }[] = [
  { t: "Get started", h: "/get-started" },
  { t: "Components", h: "/components" },
  { t: "Primitives", h: "/primitives" },
  { t: "Tokens", h: "/tokens" },
  { t: "Releases", h: "/releases" },
];
const PER_KIND: Record<string, number> = { Page: 5, Component: 6, Primitive: 5, Token: 8 };

/** A title with its matched parts marked. */
function Marked({ text, marks }: { text: string; marks: [number, number][] }) {
  if (!marks.length) return text;
  const parts: ReactNode[] = [];
  let at = 0;
  for (const [from, to] of marks.toSorted((a, b) => a[0] - b[0])) {
    if (from < at) continue;
    if (from > at) parts.push(text.slice(at, from));
    parts.push(<mark key={from}>{text.slice(from, to)}</mark>);
    at = to;
  }
  parts.push(text.slice(at));
  return parts;
}

/**
 * The site's search, full screen (TDD docs-site D22): a native modal dialog, so focus,
 * Escape and the inert page behind come from the browser. One large field, the results
 * grouped by kind under it, moved through with the arrows and opened with Enter, and, on
 * a wide screen, the one in hand described beside them. Loaded the first time the
 * search opens, with its index.
 */
export function SearchDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [rows, setRows] = useState<SearchRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  // the row in hand, for the query it was picked in; a new query starts at the first
  const [picked, setPicked] = useState({ q: "", i: 0 });

  useLayoutEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
    field.current?.focus();
    return () => d?.close();
  }, []);

  useEffect(() => {
    let live = true;
    loadIndex().then(
      (r) => live && setRows(r),
      () => live && setFailed(true),
    );
    return () => {
      live = false;
    };
  }, []);

  const groups = useMemo(() => {
    const hits = rows ? rank(rows, deferred) : [];
    return KINDS.map((k) => ({
      k,
      hits: hits.filter((h) => h.row.k === k).slice(0, PER_KIND[k]),
    })).filter((g) => g.hits.length);
  }, [rows, deferred]);
  const flat = useMemo(() => groups.flatMap((g) => g.hits), [groups]);
  const active = picked.q === deferred ? Math.min(picked.i, flat.length - 1) : 0;
  const hit: SearchHit | undefined = flat[active];

  // the row in hand stays in view as the arrows move it
  useEffect(() => {
    document.getElementById(`search-option-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const close = () => dialog.current?.close();
  const open = (row: SearchRow) => {
    router.push(row.h as Route);
    close();
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!flat.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setPicked({ q: deferred, i: (active + step + flat.length) % flat.length });
    } else if (e.key === "Enter" && hit) {
      e.preventDefault();
      open(hit.row);
    }
  };

  let n = -1;
  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-label="Search the documentation"
      data-lock=""
      onClose={() => afterExit(dialog.current, onClose)}
    >
      <div className={styles.frame}>
        <div className={styles.bar}>
          <span className={styles.barLabel}>
            <i aria-hidden="true" />
            Search
            {rows ? <b>{rows.length} entries</b> : null}
          </span>
          <button type="button" className={styles.close} onClick={close}>
            <kbd>Esc</kbd>
            <Close size={18} />
            <span className="u-visually-hidden">Close the search</span>
          </button>
        </div>

        <form
          role="search"
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            if (hit) open(hit.row);
          }}
        >
          <label htmlFor="search-field" className={styles.label}>
            Search the documented release, and press Enter
          </label>
          <input
            ref={field}
            id="search-field"
            className={styles.field}
            type="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            role="combobox"
            aria-expanded={flat.length > 0}
            aria-controls="search-results"
            aria-autocomplete="list"
            aria-activedescendant={hit ? `search-option-${active}` : undefined}
          />
        </form>

        <div className={styles.body}>
          <ScrollArea className={styles.results} viewportClassName={styles.resultsView} bar>
            <div id="search-results" role="listbox" aria-label="Results">
              {failed ? (
                <p className={styles.note}>
                  The index could not load. Close the search and try again.
                </p>
              ) : !rows ? (
                <p className={styles.note}>Loading the index…</p>
              ) : !deferred.trim() ? (
                <div className={styles.start}>
                  <p className={styles.groupTitle}>Jump to</p>
                  <ul className={styles.jumps}>
                    {JUMPS.map((j, i) => (
                      <li key={j.h}>
                        <Link href={j.h} className={styles.jump} onClick={close}>
                          <span className={styles.jumpNo}>{String(i + 1).padStart(2, "0")}</span>
                          {j.t}
                          <ArrowRight size={16} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <p className={styles.groupTitle}>Try</p>
                  <div className={styles.tries}>
                    {TRIES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={styles.try}
                        onClick={() => {
                          setQuery(t);
                          field.current?.focus();
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              ) : !flat.length ? (
                <p className={styles.note}>
                  Nothing matches &ldquo;{deferred.trim()}&rdquo;. Try a component, a token, or a
                  page.
                </p>
              ) : (
                groups.map((g) => (
                  <div key={g.k} role="group" aria-labelledby={`search-group-${g.k}`}>
                    <p id={`search-group-${g.k}`} className={styles.groupTitle}>
                      {g.k === "Page" ? "Pages" : `${g.k}s`}
                      <b>{g.hits.length}</b>
                    </p>
                    {g.hits.map((h) => {
                      n += 1;
                      const i = n;
                      return (
                        <Link
                          key={h.row.h + h.row.t}
                          id={`search-option-${i}`}
                          href={h.row.h as Route}
                          role="option"
                          aria-selected={i === active}
                          className={styles.option}
                          onClick={close}
                          onPointerMove={() => i !== active && setPicked({ q: deferred, i })}
                        >
                          <span className={styles.kind}>{h.row.k}</span>
                          <span className={styles.title}>
                            <Marked text={h.row.t} marks={h.marks} />
                          </span>
                          <span className={styles.desc}>{h.row.d}</span>
                          <ArrowRight size={16} />
                        </Link>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <aside className={styles.preview} aria-hidden="true">
            {hit ? (
              <>
                <span className={styles.kind}>{hit.row.k}</span>
                <span className={styles.previewTitle}>{hit.row.t}</span>
                <span className={styles.previewDesc}>{hit.row.d}</span>
                <code className={styles.previewPath}>{hit.row.h}</code>
                <span className={styles.previewOpen}>
                  <kbd>↵</kbd> Open
                </span>
              </>
            ) : (
              <span className={styles.previewEmpty}>
                Pages, components, primitives and every token of the pinned release.
              </span>
            )}
          </aside>
        </div>

        <div className={styles.foot} aria-hidden="true">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> Move
          </span>
          <span>
            <kbd>↵</kbd> Open
          </span>
          <span>
            <kbd>Esc</kbd> Close
          </span>
        </div>
      </div>
    </dialog>
  );
}
