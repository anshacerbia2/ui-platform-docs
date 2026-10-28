"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { schedule, unschedule } from "@/shared/lib/frame";
import styles from "./ScrollArea.module.scss";

type ScrollAreaProps = {
  /** The frame: where the area sits and how tall it may be. */
  className?: string;
  /** The scrolling viewport, which holds the content. */
  viewportClassName?: string;
  /** Draws the site's own bar: a square-cornered thumb on the area's end (annex B 3). */
  bar?: boolean;
  children: ReactNode;
};

// the thumb never shrinks below this, however long the content
const MIN_THUMB = 32;

/**
 * A scroll area with no native scrollbar (TDD docs-site annex A 1.6). The viewport
 * scrolls natively, so keys, touch, momentum, find and assistive technology work as
 * anywhere; the native scrollbar is hidden, and edge fades say there is more above or
 * below. With `bar`, the site's own bar stands in for it: the thumb follows the scroll
 * by a translate, and drags or pages it (annex B 3).
 */
export function ScrollArea({ className, viewportClassName, bar, children }: ScrollAreaProps) {
  const area = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLElement>(null);
  // the travel a pointer drag maps onto: content overflow per pixel of rail
  const scale = useRef(0);
  const drag = useRef<{ y: number; top: number } | null>(null);

  useEffect(() => {
    const root = area.current;
    const view = viewport.current;
    if (!root || !view) return;
    // read in the read phase of the site's one frame, written in its write phase
    let above = false;
    let below = false;
    let size = -1;
    let at = -1;
    let measured = false;
    let next = { above, below, size, at };
    const write = () => {
      if (next.above !== above || next.below !== below || !measured) {
        root.toggleAttribute("data-more-above", next.above);
        root.toggleAttribute("data-more-below", next.below);
        root.toggleAttribute("data-overflow", next.above || next.below);
      }
      const t = thumb.current;
      if (t && next.size !== size) t.style.blockSize = `${next.size}px`;
      if (t && next.at !== at) t.style.translate = `0 ${next.at}px`;
      ({ above, below, size, at } = next);
      measured = true;
    };
    const read = () => {
      const rail = view.clientHeight;
      const overflow = view.scrollHeight - rail;
      const top = view.scrollTop;
      const s =
        overflow > 1 ? Math.max(MIN_THUMB, Math.round((rail * rail) / view.scrollHeight)) : 0;
      const travel = rail - s;
      const a = top > 1;
      const b = top < overflow - 1;
      const y = overflow > 1 ? Math.round((top / overflow) * travel) : 0;
      scale.current = travel > 0 ? overflow / travel : 0;
      if (measured && a === above && b === below && s === size && y === at) return;
      next = { above: a, below: b, size: s, at: y };
      schedule("write", write);
    };
    const onChange = () => schedule("read", read);
    onChange();
    view.addEventListener("scroll", onChange, { passive: true });
    const observer = new ResizeObserver(onChange);
    observer.observe(view);
    for (const child of view.children) observer.observe(child);
    return () => {
      unschedule("read", read);
      unschedule("write", write);
      observer.disconnect();
      view.removeEventListener("scroll", onChange);
    };
  }, []);

  // the thumb drags the content; the rail around it pages toward the pointer
  const onThumbDown = (e: PointerEvent<HTMLElement>) => {
    const view = viewport.current;
    if (!view || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, top: view.scrollTop };
    area.current?.setAttribute("data-dragging", "");
  };
  const onThumbMove = (e: PointerEvent<HTMLElement>) => {
    const view = viewport.current;
    if (!view || !drag.current) return;
    view.scrollTop = drag.current.top + (e.clientY - drag.current.y) * scale.current;
  };
  const onThumbUp = () => {
    drag.current = null;
    area.current?.removeAttribute("data-dragging");
  };
  const onRailDown = (e: PointerEvent<HTMLElement>) => {
    const view = viewport.current;
    const t = thumb.current;
    if (!view || !t || e.button !== 0) return;
    const below = e.clientY > t.getBoundingClientRect().bottom;
    view.scrollBy({ top: (below ? 1 : -1) * view.clientHeight * 0.9, behavior: "smooth" });
  };

  return (
    <div ref={area} className={className ? `${styles.area} ${className}` : styles.area}>
      <div
        ref={viewport}
        className={viewportClassName ? `${styles.viewport} ${viewportClassName}` : styles.viewport}
      >
        {children}
      </div>
      {bar ? (
        <span className={styles.rail} aria-hidden="true" onPointerDown={onRailDown}>
          <i
            ref={thumb}
            className={styles.thumb}
            onPointerDown={onThumbDown}
            onPointerMove={onThumbMove}
            onPointerUp={onThumbUp}
            onPointerCancel={onThumbUp}
          />
        </span>
      ) : null}
    </div>
  );
}
